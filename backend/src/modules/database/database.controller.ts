import { FastifyRequest, FastifyReply } from 'fastify';
import * as databaseService from './database.service';

interface CreateBody {
  projectName: string;
  environment: string;
}

interface UserPayload {
  id: string;
  email: string;
  role: string;
}

export async function createDatabase(request: FastifyRequest<{ Body: CreateBody }>, reply: FastifyReply) {
  try {
    const user = request.user as UserPayload;
    const { projectName, environment } = request.body;

    if (!projectName || !environment) {
      return reply.status(400).send({ error: 'Project name and environment are required' });
    }

    const validEnvironments = ['dev', 'staging', 'test'];
    if (!validEnvironments.includes(environment)) {
      return reply.status(400).send({ error: `Environment must be one of: ${validEnvironments.join(', ')}` });
    }

    const result = await databaseService.createDatabase(user.id, projectName, environment);
    return reply.status(201).send({ data: result });
  } catch (error: any) {
    return reply.status(400).send({ error: error.message });
  }
}

export async function listDatabases(request: FastifyRequest, reply: FastifyReply) {
  try {
    const user = request.user as UserPayload;
    const databases = await databaseService.listDatabases(user.id, user.role);
    return reply.send({ data: databases });
  } catch (error: any) {
    return reply.status(500).send({ error: error.message });
  }
}

export async function getDatabase(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
  try {
    const user = request.user as UserPayload;
    const { id } = request.params;
    const database = await databaseService.getDatabase(id, user.id, user.role);
    return reply.send({ data: database });
  } catch (error: any) {
    const status = error.message === 'Database not found' ? 404 : 403;
    return reply.status(status).send({ error: error.message });
  }
}

export async function deleteDatabase(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
  try {
    const user = request.user as UserPayload;
    const { id } = request.params;
    const result = await databaseService.deleteDatabase(id, user.id, user.role);
    return reply.send({ data: result });
  } catch (error: any) {
    const status = error.message === 'Database not found' ? 404 : 403;
    return reply.status(status).send({ error: error.message });
  }
}
