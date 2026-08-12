export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');

if (!API_BASE_URL) {
  console.error('VITE_API_BASE_URL is missing in environment variables');
}

export const buildApiUrl = (path: `/${string}`) => `${API_BASE_URL}${path}`;
