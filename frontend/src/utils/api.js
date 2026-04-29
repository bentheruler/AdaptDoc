import axios from 'axios';

// Base URL for your backend API
const API_URL = 'http://localhost:5000/api'; // Change this to your backend URL

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if it exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const isNetworkError = (err) => !err.response;

// Fallback authentication when no backend is running (in-memory/localStorage)
const LOCAL_STORAGE_USERS_KEY = 'adaptdoc_users';

const createLocalUser = (userData) => {
  const users = JSON.parse(localStorage.getItem(LOCAL_STORAGE_USERS_KEY) || '[]');
  if (users.some((u) => u.email === userData.email)) {
    const error = new Error('Email already registered');
    error.response = { data: { message: 'Email already registered' }, status: 409 };
    throw error;
  }

  const newUser = { ...userData, id: Date.now().toString() };
  users.push(newUser);
  localStorage.setItem(LOCAL_STORAGE_USERS_KEY, JSON.stringify(users));

  return { user: newUser, accessToken: 'local-token' };
};

const authenticateLocalUser = (userData) => {
  const users = JSON.parse(localStorage.getItem(LOCAL_STORAGE_USERS_KEY) || '[]');
  const user = users.find(
    (u) => u.email === userData.email && u.password === userData.password
  );

  if (!user) {
    const error = new Error('Invalid email or password');
    error.response = { data: { message: 'Invalid email or password' }, status: 401 };
    throw error;
  }

  return { user, accessToken: 'local-token' };
};

// Authentication APIs
export const register = async (userData) => {
  try {
    return await api.post('/auth/register', userData);
  } catch (err) {
    if (isNetworkError(err)) {
      return { data: createLocalUser(userData) };
    }
    throw err;
  }
};

export const login = async (userData) => {
  try {
    return await api.post('/auth/login', userData);
  } catch (err) {
    if (isNetworkError(err)) {
      return { data: authenticateLocalUser(userData) };
    }
    throw err;
  }
};

export const getDocuments = () => api.get('/documents');

export default api;
