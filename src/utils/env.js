const fallbackApiBase = import.meta.env.DEV
  ? 'http://127.0.0.1:8000/api'
  : 'https://itri-event-api-edd4gmanbfhrgubz.westeurope-01.azurewebsites.net/api';

const rawApiBaseUrl = (import.meta.env.VITE_API_URL || fallbackApiBase).trim();

export const API_BASE_URL = rawApiBaseUrl.replace(/\/$/, '');

export const BACKEND_BASE_URL =
  (import.meta.env.VITE_BACKEND_URL || API_BASE_URL.replace(/\/api$/, '')).replace(/\/$/, '');

export const buildStorageUrl = (path = '') => {
  if (!path) return '';
  return `${BACKEND_BASE_URL}/storage/${String(path).replace(/^\/+/, '')}`;
};
