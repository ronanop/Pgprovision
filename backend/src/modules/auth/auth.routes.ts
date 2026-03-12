import { FastifyInstance } from 'fastify';
import * as authController from './auth.controller';
import { adminMiddleware } from '../../middleware/auth.middleware';

export async function authRoutes(fastify: FastifyInstance) {
  fastify.post('/auth/register', authController.register);
  fastify.post('/auth/login', authController.login);
  fastify.get('/auth/users', { preHandler: [adminMiddleware] }, authController.getUsers);
  fastify.post('/admin/users', { preHandler: [adminMiddleware] }, authController.adminCreateUser as any);
}
