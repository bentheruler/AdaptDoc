import axios from 'axios';

const hostname = window.location.hostname;
const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168.');

const API_BASE = isLocalhost
  ? `http://${hostname}:5000`
  : (process.env.REACT_APP_API_URL?.replace('http://', 'https://') || 'https://adaptdoc-production.up.railway.app');

const api = axios.create({
  baseURL: `${API_BASE}/api`,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Longer timeout for auth (Google OAuth UserInfo calls can be slow)
const authApi = axios.create({
  baseURL: `${API_BASE}/api`,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token =
    localStorage.getItem('accessToken') ||
    localStorage.getItem('token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

authApi.interceptors.request.use((config) => {
  const token =
    localStorage.getItem('accessToken') ||
    localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});


export const register = (userData) => api.post('/auth/register', userData);

export const login = (userData) => api.post('/auth/login', userData);

export const googleLogin = (token) => authApi.post('/auth/google-login', { token });

export const verifyEmail = (token) =>
  api.get(`/auth/verify-email/${token}`);

export const forgotPassword = (email) =>
  api.post('/auth/forgot-password', { email });

export const resetPassword = (token, newPassword) =>
  api.post(`/auth/reset-password/${token}`, { newPassword });

export const resendVerification = (email) =>
  api.post('/auth/resend-verification', { email });

export const getDocuments = () => api.get('/documents');


export default api;