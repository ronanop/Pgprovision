import * as dbRepository from './database.repository';
import * as dockerService from '../docker/docker.service';
import { generatePassword } from '../../utils/password';
import { generateDatabaseName, generateDatabaseUser, isValidDatabaseName } from '../../utils/sanitize';
import { config } from '../../config/index';
import net from 'net';

/**
 * Check if a port is actually available on the host.
 */
function isPortFree(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once('error', () => {
      resolve(false);
    });
    server.once('listening', () => {
      server.close();
      resolve(true);
    });
    server.listen(port);
  });
}

/**
 * Find an available port in the configured range.
 */
async function findAvailablePort(): Promise<number> {
  const usedPorts = await dbRepository.getUsedPorts();
  for (let port = config.portRangeStart; port <= config.portRangeEnd; port++) {
    if (!usedPorts.includes(port)) {
      const free = await isPortFree(port);
      if (free) {
        return port;
      }
    }
  }
  throw new Error('No available ports in the configured range');
}

/**
 * Provision a new PostgreSQL database inside a Docker container.
 */
export async function createDatabase(ownerId: string, projectName: string, environment: string) {
  const dbName = generateDatabaseName(projectName, environment);
  const dbUser = generateDatabaseUser(projectName);
  const dbPassword = generatePassword();

  if (!isValidDatabaseName(dbName)) {
    throw new Error('Invalid database name generated. Use only lowercase letters, numbers, and underscores.');
  }

  // Check for duplicate name
  const existing = await dbRepository.findByName(dbName);
  if (existing) {
    throw new Error(`A database named "${dbName}" already exists`);
  }

  const port = await findAvailablePort();

  // Create Docker container
  const containerId = await dockerService.createContainer({
    name: dbName,
    dbName,
    dbUser,
    dbPassword,
    hostPort: port,
  });

  // Store metadata
  const record = await dbRepository.create({
    name: dbName,
    project_name: projectName,
    environment,
    owner_id: ownerId,
    container_id: containerId,
    port,
    username: dbUser,
    password: dbPassword,
  });

  const connectionString = `postgresql://${dbUser}:${dbPassword}@${config.provisionedDbHost}:${port}/${dbName}`;

  return {
    ...record,
    connection_string: connectionString,
  };
}

/**
 * List databases for a user (or all for admins).
 */
export async function listDatabases(userId: string, role: string) {
  let databases;
  if (role === 'admin') {
    databases = await dbRepository.findAll();
  } else {
    databases = await dbRepository.findByOwnerId(userId);
  }

  // Enrich with container status and connection string
  const enriched = await Promise.all(
    databases.map(async (db) => {
      let containerStatus = { status: 'unknown', running: false, startedAt: '' };
      if (db.container_id) {
        containerStatus = await dockerService.inspectContainer(db.container_id);
      }
      const connectionString = `postgresql://${db.username}:${db.password}@${config.provisionedDbHost}:${db.port}/${db.name}`;
      return {
        ...db,
        container_status: containerStatus.status,
        container_running: containerStatus.running,
        connection_string: connectionString,
      };
    })
  );

  return enriched;
}

/**
 * Delete a database: stop container, remove volume, delete metadata.
 */
export async function deleteDatabase(id: string, userId: string, role: string) {
  const db = await dbRepository.findById(id);
  if (!db) {
    throw new Error('Database not found');
  }

  // Only owner or admin can delete
  if (db.owner_id !== userId && role !== 'admin') {
    throw new Error('You do not have permission to delete this database');
  }

  // Remove Docker container
  if (db.container_id) {
    await dockerService.removeContainer(db.container_id);
    // Remove the persistent volume
    await dockerService.removeVolume(`pgprov_${db.name}_data`);
  }

  // Delete metadata
  await dbRepository.deleteById(id);

  return { message: 'Database deleted successfully' };
}

/**
 * Get a single database by ID.
 */
export async function getDatabase(id: string, userId: string, role: string) {
  const db = await dbRepository.findById(id);
  if (!db) {
    throw new Error('Database not found');
  }

  if (db.owner_id !== userId && role !== 'admin') {
    throw new Error('You do not have permission to view this database');
  }

  let containerStatus = { status: 'unknown', running: false, startedAt: '' };
  if (db.container_id) {
    containerStatus = await dockerService.inspectContainer(db.container_id);
  }

  const connectionString = `postgresql://${db.username}:${db.password}@${config.provisionedDbHost}:${db.port}/${db.name}`;

  return {
    ...db,
    container_status: containerStatus.status,
    container_running: containerStatus.running,
    connection_string: connectionString,
  };
}
