import { query } from '../../config/database';

export interface DatabaseRecord {
  id: string;
  name: string;
  project_name: string;
  environment: string;
  owner_id: string;
  owner_email?: string;
  container_id: string;
  port: number;
  username: string;
  password: string;
  created_at: Date;
  status: string;
}

export async function create(data: {
  name: string;
  project_name: string;
  environment: string;
  owner_id: string;
  container_id: string;
  port: number;
  username: string;
  password: string;
}): Promise<DatabaseRecord> {
  const result = await query(
    `INSERT INTO databases (name, project_name, environment, owner_id, container_id, port, username, password)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
    [data.name, data.project_name, data.environment, data.owner_id, data.container_id, data.port, data.username, data.password]
  );
  return result.rows[0];
}

export async function findByOwnerId(ownerId: string): Promise<DatabaseRecord[]> {
  const result = await query(
    `SELECT d.*, u.email as owner_email 
     FROM databases d 
     LEFT JOIN users u ON d.owner_id = u.id 
     WHERE d.owner_id = $1 
     ORDER BY d.created_at DESC`,
    [ownerId]
  );
  return result.rows;
}

export async function findAll(): Promise<DatabaseRecord[]> {
  const result = await query(
    `SELECT d.*, u.email as owner_email 
     FROM databases d 
     LEFT JOIN users u ON d.owner_id = u.id 
     ORDER BY d.created_at DESC`
  );
  return result.rows;
}

export async function findById(id: string): Promise<DatabaseRecord | null> {
  const result = await query('SELECT * FROM databases WHERE id = $1', [id]);
  return result.rows[0] || null;
}

export async function deleteById(id: string): Promise<void> {
  await query('DELETE FROM databases WHERE id = $1', [id]);
}

export async function updateStatus(id: string, status: string): Promise<void> {
  await query('UPDATE databases SET status = $1 WHERE id = $2', [status, id]);
}

export async function getUsedPorts(): Promise<number[]> {
  const result = await query('SELECT port FROM databases');
  return result.rows.map((r: any) => r.port);
}

export async function findByName(name: string): Promise<DatabaseRecord | null> {
  const result = await query('SELECT * FROM databases WHERE name = $1', [name]);
  return result.rows[0] || null;
}
