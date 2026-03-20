
import { pool } from './src/config/database';
import { hashPassword } from './src/utils/password';

async function reset() {
  try {
    const email = 'admin@cachedigitech.com';
    const newPassword = 'password123';
    const hashed = await hashPassword(newPassword);
    
    const res = await pool.query('UPDATE users SET password_hash = $1 WHERE email = $2', [hashed, email]);
    if (res.rowCount > 0) {
      console.log(`Successfully reset password for ${email} to: ${newPassword}`);
    } else {
      console.log(`User ${email} not found.`);
    }
  } catch (err: any) {
    console.error('Reset failed:', err.message);
  } finally {
    await pool.end();
  }
}

reset();
