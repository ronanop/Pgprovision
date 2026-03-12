import { FastifyRequest, FastifyReply } from 'fastify';
import * as authService from './auth.service';

interface RegisterBody {
  email: string;
  password: string;
}

interface LoginBody {
  email: string;
  password: string;
}

export async function register(request: FastifyRequest<{ Body: RegisterBody }>, reply: FastifyReply) {
  try {
    const { email, password } = request.body;

    if (!email || !password) {
      return reply.status(400).send({ error: 'Email and password are required' });
    }

    const user = await authService.registerUser(email, password);
    return reply.status(201).send({ data: user });
  } catch (error: any) {
    return reply.status(400).send({ error: error.message });
  }
}

export async function login(request: FastifyRequest<{ Body: LoginBody }>, reply: FastifyReply) {
  try {
    const { email, password } = request.body;

    if (!email || !password) {
      return reply.status(400).send({ error: 'Email and password are required' });
    }

    const result = await authService.loginUser(email, password, request.server);
    return reply.send({ data: result });
  } catch (error: any) {
    return reply.status(401).send({ error: error.message });
  }
}

export async function getUsers(request: FastifyRequest, reply: FastifyReply) {
  try {
    const users = await authService.getAllUsers();
    return reply.send({ data: users });
  } catch (error: any) {
    return reply.status(500).send({ error: error.message });
  }
}

interface AdminCreateUserBody {
  email: string;
  password: string;
  role: string;
}

export async function adminCreateUser(request: FastifyRequest<{ Body: AdminCreateUserBody }>, reply: FastifyReply) {
  try {
    const { email, password, role } = request.body;
    
    if (!email || !password || !role) {
      return reply.status(400).send({ error: 'Email, password, and role are required' });
    }

    const user = await authService.adminCreateUser(email, password, role);
    return reply.status(201).send({ data: user });
  } catch (error: any) {
    return reply.status(400).send({ error: error.message });
  }
}
