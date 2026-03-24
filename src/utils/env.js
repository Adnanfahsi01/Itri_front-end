const fallbackApiBase = import.meta.env.DEV
  ? 'http://127.0.0.1:8000/api'
  : 'https://itri-event-api-edd4gmanbfhrgubz.westeurope-01.azurewebsites.net/api';

const envApiBaseUrl = (import.meta.env.VITE_API_URL ?? '').trim();

const rawApiBaseUrl = (() => {
  if (!envApiBaseUrl) {
    return fallbackApiBase;
  }

  // Accept absolute URLs in all environments. Allow relative proxy paths only in dev.
  if (/^https?:\/\//i.test(envApiBaseUrl) || (import.meta.env.DEV && envApiBaseUrl.startsWith('/'))) {
    return envApiBaseUrl;
  }

  console.warn('Invalid VITE_API_URL detected. Falling back to default API base URL.');
  return fallbackApiBase;
})();

export const API_BASE_URL = rawApiBaseUrl.replace(/\/$/, '');

const envBackendBaseUrl = (import.meta.env.VITE_BACKEND_URL ?? '').trim();
const backendFromApi = API_BASE_URL.replace(/\/api$/, '');

const rawBackendBaseUrl = (() => {
  if (!envBackendBaseUrl) {
    return backendFromApi;
  }

  if (/^https?:\/\//i.test(envBackendBaseUrl) || (import.meta.env.DEV && envBackendBaseUrl.startsWith('/'))) {
    return envBackendBaseUrl;
  }

  console.warn('Invalid VITE_BACKEND_URL detected. Falling back to API-derived backend URL.');
  return backendFromApi;
})();

export const BACKEND_BASE_URL = rawBackendBaseUrl.replace(/\/$/, '');

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
