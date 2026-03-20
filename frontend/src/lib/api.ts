const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface ApiOptions {
  method?: string;
  body?: any;
  token?: string;
}

export async function api<T = any>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const { method = 'GET', body, token } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Something went wrong');
  }

  return data;
}

// Auth APIs
export const authApi = {
  register: (email: string, password: string) =>
    api('/auth/register', { method: 'POST', body: { email, password } }),

  login: (email: string, password: string) =>
    api('/auth/login', { method: 'POST', body: { email, password } }),

  getUsers: (token: string) =>
    api('/auth/users', { token }),

  adminCreateUser: (token: string, email: string, password: string, role: string) =>
    api('/admin/users', { method: 'POST', body: { email, password, role }, token }),
};

// Database APIs
export const databaseApi = {
  list: (token: string) =>
    api('/databases', { token }),

  create: (token: string, projectName: string, environment: string) =>
    api('/databases/create', { method: 'POST', body: { projectName, environment }, token }),

  get: (token: string, id: string) =>
    api(`/databases/${id}`, { token }),

  delete: (token: string, id: string) =>
    api(`/databases/${id}`, { method: 'DELETE', token }),

  metrics: (token: string, id: string) =>
    api(`/databases/${id}/metrics`, { token }),

  schema: (token: string, id: string) =>
    api(`/databases/${id}/schema`, { token }),
};
