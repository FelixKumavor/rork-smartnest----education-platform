import { API_BASE } from '../config';

export async function apiRequest(path: string, options: RequestInit = {}) {
  const url = `${API_BASE}${path}`;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`API request failed: ${response.status} ${response.statusText} ${errorBody}`);
  }

  return response.json();
}

export function signInWithEmailAndPassword(email: string, password: string) {
  return apiRequest('/users/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}
