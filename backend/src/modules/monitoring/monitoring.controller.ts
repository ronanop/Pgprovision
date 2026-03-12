import { FastifyRequest, FastifyReply } from 'fastify';
import * as monitoringService from './monitoring.service';

interface UserPayload {
  id: string;
  email: string;
  role: string;
}

export async function getMetrics(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
  try {
    const user = request.user as UserPayload;
    const { id } = request.params;
    const metrics = await monitoringService.getMetrics(id, user.id, user.role);
    return reply.send({ data: metrics });
  } catch (error: any) {
    const status = error.message === 'Database not found' ? 404 : 403;
    return reply.status(status).send({ error: error.message });
  }
}

export async function getSchema(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
  try {
    const user = request.user as UserPayload;
    const { id } = request.params;
    const schema = await monitoringService.getSchema(id, user.id, user.role);
    return reply.send({ data: schema });
  } catch (error: any) {
    const status = error.message === 'Database not found' ? 404
      : error.message.startsWith('Failed to fetch schema') ? 503
      : 403;
    return reply.status(status).send({ error: error.message });
  }
}
