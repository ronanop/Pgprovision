import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import { config } from './config/index';
import { authRoutes } from './modules/auth/auth.routes';
import { databaseRoutes } from './modules/database/database.routes';
import { monitoringRoutes } from './modules/monitoring/monitoring.routes';

const fastify = Fastify({
  logger: true,
});

async function start() {
  // Register plugins
  await fastify.register(cors, {
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
  });

  await fastify.register(jwt, {
    secret: config.jwtSecret,
  });

  // Health check
  fastify.get('/health', async () => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  });

  // Register routes
  await fastify.register(authRoutes);
  await fastify.register(databaseRoutes);
  await fastify.register(monitoringRoutes);

  // Start server
  try {
    await fastify.listen({ port: config.port, host: config.host });
    console.log(`Server running at http://${config.host}:${config.port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

start();
