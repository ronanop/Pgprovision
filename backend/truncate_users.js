const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5434, // mapped port for platform_db
  user: 'platform_admin',
  password: 'platform_secret',
  database: 'platform_db'
});

async function run() {
  try {
    await client.connect();
    await client.query('TRUNCATE TABLE users CASCADE');
    console.log('Successfully removed all users from the platform database.');
  } catch (err) {
    console.error('Error truncating users:', err);
  } finally {
    await client.end();
  }
}

run();
