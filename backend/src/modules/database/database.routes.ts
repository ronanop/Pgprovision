import { FastifyInstance } from 'fastify';
import * as databaseController from './database.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

export async function databaseRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', authMiddleware);

  fastify.post('/databases/create', databaseController.createDatabase);
  fastify.get('/databases', databaseController.listDatabases);
  fastify.get('/databases/:id', databaseController.getDatabase);
  fastify.delete('/databases/:id', databaseController.deleteDatabase);
}
