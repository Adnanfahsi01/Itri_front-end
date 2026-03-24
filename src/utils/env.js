const fallbackApiBase = import.meta.env.DEV
  ? 'http://127.0.0.1:8000/api'
  : 'https://itri-event-api-edd4gmanbfhrgubz.westeurope-01.azurewebsites.net/api';

const rawApiBaseUrl = (import.meta.env.VITE_API_URL || fallbackApiBase).trim();

export const API_BASE_URL = rawApiBaseUrl.replace(/\/$/, '');

export const BACKEND_BASE_URL =
  (import.meta.env.VITE_BACKEND_URL || API_BASE_URL.replace(/\/api$/, '')).replace(/\/$/, '');

export const buildStorageUrl = (path = '') => {
  if (!path) return '';

  const rawPath = String(path).trim();

  // Keep fully qualified URLs untouched.
  if (/^https?:\/\//i.test(rawPath)) {
    return rawPath;
  }

  const normalizedPath = rawPath.replace(/^\/+/, '');

  // Support files stored directly under public/ (e.g. public/speakers/*).
  if (normalizedPath.startsWith('speakers/') || normalizedPath.startsWith('storage/')) {
    return `${BACKEND_BASE_URL}/${normalizedPath}`;
  }

  // Backward compatibility for legacy records stored on the public disk.
  return `${BACKEND_BASE_URL}/storage/${normalizedPath}`;
};
