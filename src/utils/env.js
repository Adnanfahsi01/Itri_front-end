const fallbackApiBase = 'http://127.0.0.1:8000/api';

export const API_BASE_URL =
  (import.meta.env.VITE_API_URL || fallbackApiBase).replace(/\/$/, '');

export const BACKEND_BASE_URL =
  (import.meta.env.VITE_BACKEND_URL || API_BASE_URL.replace(/\/api$/, '')).replace(/\/$/, '');

export const buildStorageUrl = (path = '') => {
  if (!path) return '';
  return `${BACKEND_BASE_URL}/storage/${String(path).replace(/^\/+/, '')}`;
};
