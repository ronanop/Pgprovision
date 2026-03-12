import Docker from 'dockerode';
import { config } from '../../config/index';

const docker = new Docker({ socketPath: config.dockerSocket });

export interface ContainerConfig {
  name: string;
  dbName: string;
  dbUser: string;
  dbPassword: string;
  hostPort: number;
}

/**
 * Create and start a new PostgreSQL container.
 */
export async function createContainer(cfg: ContainerConfig): Promise<string> {
  // Pull image if not present
  try {
    await docker.getImage(config.postgresImage).inspect();
  } catch {
    console.log(`Pulling image ${config.postgresImage}...`);
    await new Promise<void>((resolve, reject) => {
      docker.pull(config.postgresImage, (err: any, stream: any) => {
        if (err) return reject(err);
        docker.modem.followProgress(stream, (err2: any) => {
          if (err2) return reject(err2);
          resolve();
        });
      });
    });
  }

  const container = await docker.createContainer({
    Image: config.postgresImage,
    name: `pgprov_${cfg.name}`,
    Env: [
      `POSTGRES_DB=${cfg.dbName}`,
      `POSTGRES_USER=${cfg.dbUser}`,
      `POSTGRES_PASSWORD=${cfg.dbPassword}`,
    ],
    HostConfig: {
      PortBindings: {
        '5432/tcp': [{ HostPort: String(cfg.hostPort) }],
      },
      Binds: [
        `pgprov_${cfg.name}_data:/var/lib/postgresql/data`,
      ],
      RestartPolicy: { Name: 'unless-stopped' },
    },
    ExposedPorts: {
      '5432/tcp': {},
    },
  });

  await container.start();
  const info = await container.inspect();
  return info.Id;
}

/**
 * Stop and remove a container by its ID.
 */
export async function removeContainer(containerId: string): Promise<void> {
  try {
    const container = docker.getContainer(containerId);
    try {
      await container.stop();
    } catch {
      // Container may already be stopped
    }
    await container.remove({ v: true }); // v: true removes associated volumes
  } catch (error: any) {
    console.error(`Failed to remove container ${containerId}:`, error.message);
    throw error;
  }
}

/**
 * Get container status info.
 */
export async function inspectContainer(containerId: string): Promise<{
  status: string;
  running: boolean;
  startedAt: string;
}> {
  try {
    const container = docker.getContainer(containerId);
    const info = await container.inspect();
    return {
      status: info.State.Status,
      running: info.State.Running,
      startedAt: info.State.StartedAt,
    };
  } catch {
    return {
      status: 'not_found',
      running: false,
      startedAt: '',
    };
  }
}

/**
 * List all platform-managed containers.
 */
export async function listContainers(): Promise<Docker.ContainerInfo[]> {
  return docker.listContainers({
    all: true,
    filters: { name: ['pgprov_'] },
  });
}

/**
 * Remove a named Docker volume.
 */
export async function removeVolume(volumeName: string): Promise<void> {
  try {
    const volume = docker.getVolume(volumeName);
    await volume.remove();
  } catch (error: any) {
    console.error(`Failed to remove volume ${volumeName}:`, error.message);
  }
}
