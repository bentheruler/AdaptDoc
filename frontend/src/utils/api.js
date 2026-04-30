import axios from 'axios';

const API_BASE =
  process.env.REACT_APP_API_URL ||
  (window.location.hostname === 'localhost'
    ? 'http://localhost:5000'
    : 'https://adaptdoc.onrender.com');

const api = axios.create({
  baseURL: `${API_BASE}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
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

export const register = (userData) => api.post('/auth/register', userData);

export const login = (userData) => api.post('/auth/login', userData);

export const getDocuments = () => api.get('/documents');

export default api;