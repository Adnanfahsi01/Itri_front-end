const fallbackApiBase = import.meta.env.DEV ? 'http://127.0.0.1:8000/api' : '';

const rawApiBaseUrl = import.meta.env.VITE_API_URL || fallbackApiBase;

if (!rawApiBaseUrl) {
  console.error('Missing VITE_API_URL. Set it in Azure Static Web Apps and redeploy.');
}

export const API_BASE_URL = rawApiBaseUrl.replace(/\/$/, '');

export const BACKEND_BASE_URL =
  (import.meta.env.VITE_BACKEND_URL || API_BASE_URL.replace(/\/api$/, '')).replace(/\/$/, '');

export const buildStorageUrl = (path = '') => {
  if (!path) return '';
  return `${BACKEND_BASE_URL}/storage/${String(path).replace(/^\/+/, '')}`;
};
