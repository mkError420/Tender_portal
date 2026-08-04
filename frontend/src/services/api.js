import axios from 'axios';

const API_BASE_URL = 'https://rcmctender.free.je/api';
const API_BASE_ORIGIN = new URL(API_BASE_URL).origin;

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token and default JSON header to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Only set JSON content type for non-FormData requests
  if (!(config.data instanceof FormData)) {
    config.headers['Content-Type'] = 'application/json';
  }

  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const getFileUrl = (url) => {
  if (!url || typeof url !== 'string') return '#';
  const trimmedUrl = url.trim();
  if (!trimmedUrl) return '#';
  try {
    if (/^https?:\/\//i.test(trimmedUrl)) {
      return trimmedUrl;
    }
    if (trimmedUrl.startsWith('//')) {
      return `${window.location.protocol}${trimmedUrl}`;
    }
    // Use API_BASE_URL (includes /api) as base so relative paths like
    // "uploads/documents/file.pdf" resolve to "/api/uploads/documents/file.pdf"
    const base = API_BASE_URL.endsWith('/') ? API_BASE_URL : `${API_BASE_URL}/`;
    return new URL(trimmedUrl, base).toString();
  } catch (e) {
    console.warn('Unable to normalize attachment URL:', url, e);
    return '#';
  }
};

export { API_BASE_URL, API_BASE_ORIGIN };
export default api;
