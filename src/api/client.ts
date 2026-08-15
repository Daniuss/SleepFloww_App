import type { ManualRecord, Night } from '../types/domain';
import { API_BASE_URL } from './config';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...options.headers },
    });
  } catch {
    throw new Error('Não foi possível conectar ao servidor. Verifique se o backend está rodando e se o celular está na mesma rede Wi-Fi.');
  }

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || `Erro ${response.status}`);
  }

  return response.json();
}

export function login(email: string, password: string) {
  return request<{ token: string; email: string }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export function fetchNights(token: string) {
  return request<Night[]>('/nights', {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function createNight(night: Omit<Night, 'id'>, token: string) {
  return request<Night>('/nights', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(night),
  });
}

export function submitRecord(record: ManualRecord, token: string) {
  return request<ManualRecord>('/records', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(record),
  });
}
