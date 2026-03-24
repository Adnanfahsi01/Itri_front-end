import axios from 'axios';
import { API_BASE_URL } from './env';

// Base URL for API
const apiBaseUrl = API_BASE_URL;

// Create axios instance
const api = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

const isPublicEndpoint = (url = '', method = 'get') => {
  const path = String(url).split('?')[0];
  const normalizedMethod = method.toLowerCase();

  if (path === '/admin/login') return true;

  if (path.startsWith('/hackathon/register')) return normalizedMethod === 'post';
  if (path.startsWith('/hackathon/member-invitations/')) return true;

  if (path.startsWith('/speakers')) return normalizedMethod === 'get';
  if (path.startsWith('/programs')) return normalizedMethod === 'get';
  if (path.startsWith('/seats')) return normalizedMethod === 'get';
  if (path === '/waitlist') return normalizedMethod === 'post';
  if (path.startsWith('/tickets/')) return normalizedMethod === 'get';

  if (normalizedMethod === 'post' && ['/reservations', '/reservations/confirm', '/reservations/cancel'].includes(path)) {
    return true;
  }

  return false;
};

// Add auth token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  console.log('API Request:', config.method?.toUpperCase(), config.url);
  console.log('Token found:', token ? 'Yes' : 'No');
  const skipAuth = config.skipAuth === true || isPublicEndpoint(config.url, config.method);

  if (token && !skipAuth) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log('Authorization header set');
  }
  return config;
});

// Public API calls
export const getSpeakers = () => api.get('/speakers');
export const getPrograms = () => api.get('/programs');
export const getSeats = (day = '') => api.get(`/seats${day ? `?day=${day}` : ''}`);
export const createReservation = (data) => api.post('/reservations', data);
export const confirmReservation = (token) => api.post('/reservations/confirm', { token });
export const cancelReservation = (token) => api.post('/reservations/cancel', { token });
export const submitWaitlist = (data) => api.post('/waitlist', data);

// Hackathon
export const registerHackathon = (data) => api.post('/hackathon/register', data, { skipAuth: true });
export const getHackathonMemberInvitation = (token) => api.get(`/hackathon/member-invitations/${token}`, { skipAuth: true });
export const confirmHackathonMemberInvitation = (token, data) => api.post(`/hackathon/member-invitations/${token}/confirm`, data, { skipAuth: true });
export const getHackathonRegistrations = () => api.get('/admin/hackathons');
export const updateHackathonStatus = (id, status) => api.put(`/admin/hackathons/${id}/status`, { status });
export const deleteHackathonRegistration = (id) => api.delete(`/admin/hackathons/${id}`);

// Admin Authentication
export const adminLogin = (credentials) => api.post('/admin/login', credentials);
export const adminLogout = () => api.post('/admin/logout');
export const getAdminProfile = () => api.get('/admin/me');

// Admin Statistics
export const getStatistics = () => api.get('/statistics');

// Admin Reservations Management
export const getReservations = (filters = {}) => {
  // Only include non-empty filter values
  const cleanFilters = {};
  if (filters.day && filters.day.trim()) cleanFilters.day = filters.day;
  if (filters.role && filters.role.trim()) cleanFilters.role = filters.role;
  if (filters.search && filters.search.trim()) cleanFilters.search = filters.search;

  const params = new URLSearchParams(cleanFilters).toString();
  return api.get(`/reservations${params ? `?${params}` : ''}`);
};
export const getReservation = (id) => api.get(`/reservations/${id}`);
export const deleteReservation = (id) => api.delete(`/reservations/${id}`);

// Admin Speakers Management
export const createSpeaker = (data) => {
  const formData = new FormData();
  Object.keys(data).forEach(key => {
    formData.append(key, data[key]);
  });
  return api.post('/speakers', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};
export const updateSpeaker = (id, data) => {
  const formData = new FormData();
  Object.keys(data).forEach(key => {
    if (data[key] !== null && data[key] !== undefined) {
      formData.append(key, data[key]);
    }
  });
  formData.append('_method', 'PUT');
  return api.post(`/speakers/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};
export const deleteSpeaker = (id) => api.delete(`/speakers/${id}`);

// Admin Programs Management
export const createProgram = (data) => api.post('/programs', data);
export const updateProgram = (id, data) => api.put(`/programs/${id}`, data);
export const deleteProgram = (id) => api.delete(`/programs/${id}`);

// QR Validation
export const validateQR = (qrData) => api.post('/reservations/validate-qr', { qr_data: qrData });

export default api;
