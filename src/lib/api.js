export async function apiFetch(path, options = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('maic_token') : null;
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };
  const res = await fetch(path, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || data.error || 'Request failed');
  return data;
}

// Auth
export async function signup(email, password, name, company) {
  const data = await apiFetch('/api/auth/signup', { method: 'POST', body: JSON.stringify({ email, password, name, company }) });
  if (data.token) localStorage.setItem('maic_token', data.token);
  return data;
}
export async function login(email, password) {
  const data = await apiFetch('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
  if (data.token) localStorage.setItem('maic_token', data.token);
  return data;
}
export function logout() { localStorage.removeItem('maic_token'); window.location.href = '/login'; }
export function getToken() { return typeof window !== 'undefined' ? localStorage.getItem('maic_token') : null; }

// Agents
export const getAgents = () => apiFetch('/api/agents');
export const getAgent = (id) => apiFetch(`/api/agents/${id}`);
export const createAgent = (data) => apiFetch('/api/agents', { method: 'POST', body: JSON.stringify(data) });
export const updateAgent = (id, data) => apiFetch(`/api/agents/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteAgent = (id) => apiFetch(`/api/agents/${id}`, { method: 'DELETE' });

// Conversations
export const getConversations = (p = '') => apiFetch(`/api/conversations?${p}`);
export const getConversation = (id) => apiFetch(`/api/conversations/${id}`);
export const deleteConversation = (id) => apiFetch(`/api/conversations/${id}`, { method: 'DELETE' });

// Leads
export const getLeads = (p = '') => apiFetch(`/api/leads?${p}`);
export const deleteLead = (id) => apiFetch(`/api/leads/${id}`, { method: 'DELETE' });

// User
export const getMe = () => apiFetch('/api/auth/me');

// Admin
export const getAdminSettings = () => apiFetch('/api/admin/settings');
export const updateAdminSettings = (data) => apiFetch('/api/admin/settings', { method: 'PUT', body: JSON.stringify(data) });
export const getAdminUsers = () => apiFetch('/api/admin/users');
