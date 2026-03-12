import { FastifyInstance } from 'fastify';
import * as authRepository from './auth.repository';
import { hashPassword, comparePassword } from '../../utils/password';

export async function registerUser(email: string, password: string) {
  // Check total users to determine if first user or if blocked
  const userCount = await authRepository.countUsers();
  
  if (userCount > 0) {
    throw new Error('Public registration is disabled. Contact your administrator.');
  }

  const existing = await authRepository.findByEmail(email);
  if (existing) {
    throw new Error('User with this email already exists');
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error('Invalid email format');
  }

  if (password.length < 8) {
    throw new Error('Password must be at least 8 characters');
  }

  const passwordHash = await hashPassword(password);
  
  // First user is automatically the admin
  const role = userCount === 0 ? 'admin' : 'developer';
  
  const user = await authRepository.create(email, passwordHash, role);

  return {
    id: user.id,
    email: user.email,
    role: user.role,
    created_at: user.created_at,
  };
}

export async function adminCreateUser(email: string, password: string, role: string) {
  const existing = await authRepository.findByEmail(email);
  if (existing) {
    throw new Error('User with this email already exists');
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error('Invalid email format');
  }

  if (password.length < 8) {
    throw new Error('Password must be at least 8 characters');
  }

  if (role !== 'admin' && role !== 'developer') {
    throw new Error('Invalid role specified');
  }

  const passwordHash = await hashPassword(password);
  const user = await authRepository.create(email, passwordHash, role);

  return {
    id: user.id,
    email: user.email,
    role: user.role,
    created_at: user.created_at,
  };
}

export async function loginUser(email: string, password: string, fastify: FastifyInstance) {
  const user = await authRepository.findByEmail(email);
  if (!user) {
    throw new Error('Invalid email or password');
  }

  const valid = await comparePassword(password, user.password_hash);
  if (!valid) {
    throw new Error('Invalid email or password');
  }

  const token = fastify.jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    { expiresIn: '24h' }
  );

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
    },
  };
}

export async function getAllUsers() {
  return authRepository.findAll();
}
