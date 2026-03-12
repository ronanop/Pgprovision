import { query } from '../../config/database';

export interface User {
  id: string;
  email: string;
  password_hash: string;
  role: string;
  created_at: Date;
}

export async function findByEmail(email: string): Promise<User | null> {
  const result = await query('SELECT * FROM users WHERE email = $1', [email]);
  return result.rows[0] || null;
}

export async function findById(id: string): Promise<User | null> {
  const result = await query('SELECT * FROM users WHERE id = $1', [id]);
  return result.rows[0] || null;
}

export async function create(email: string, passwordHash: string, role: string = 'developer'): Promise<User> {
  const result = await query(
    'INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING *',
    [email, passwordHash, role]
  );
  return result.rows[0];
}

export async function findAll(): Promise<User[]> {
  const result = await query('SELECT id, email, role, created_at FROM users ORDER BY created_at DESC');
  return result.rows;
}

export async function deleteById(id: string): Promise<void> {
  await query('DELETE FROM users WHERE id = $1', [id]);
}

export async function countUsers(): Promise<number> {
  const result = await query('SELECT count(*) as count FROM users');
  return parseInt(result.rows[0].count, 10);
}
