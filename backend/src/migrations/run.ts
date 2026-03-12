import fs from 'fs';
import path from 'path';
import { pool } from '../config/database';

async function runMigrations() {
  console.log('Running migrations...');

  const migrationFile = path.join(__dirname, '001_init.sql');
  const sql = fs.readFileSync(migrationFile, 'utf-8');

  try {
    await pool.query(sql);
    console.log('Migrations completed successfully.');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigrations();
