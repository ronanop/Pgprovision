import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  host: process.env.HOST || '0.0.0.0',

  jwtSecret: process.env.JWT_SECRET || 'change-this-secret',

  databaseUrl: process.env.DATABASE_URL || 'postgresql://platform_admin:platform_secret@localhost:5432/platform_db',

  dockerSocket: process.env.DOCKER_SOCKET || '/var/run/docker.sock',
  provisionedDbHost: process.env.PROVISIONED_DB_HOST || 'localhost',

  postgresImage: process.env.POSTGRES_IMAGE || 'postgres:15',

  // Port range for provisioned databases
  portRangeStart: parseInt(process.env.PORT_RANGE_START || '5500', 10),
  portRangeEnd: parseInt(process.env.PORT_RANGE_END || '5700', 10),
};
