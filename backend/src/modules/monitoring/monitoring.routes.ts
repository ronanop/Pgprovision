import { FastifyInstance } from 'fastify';
import * as monitoringController from './monitoring.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

export async function monitoringRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', authMiddleware);

  fastify.get('/databases/:id/metrics', monitoringController.getMetrics);
  fastify.get('/databases/:id/schema', monitoringController.getSchema);
}
