
import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function check() {
  try {
    const res = await pool.query('SELECT * FROM databases');
    console.log('Provisioned Databases:', res.rows);
  } catch (err: any) {
    console.error('Connection failed:', err.message);
  } finally {
    await pool.end();
  }
}

check();
