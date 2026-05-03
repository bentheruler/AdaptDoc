import axios from 'axios';

const hostname = window.location.hostname;
const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168.');

const API_BASE = isLocalhost
  ? `http://${hostname}:5000`
  : (process.env.REACT_APP_API_URL?.replace('http://', 'https://') || 'https://adaptdoc-production.up.railway.app');

// ─── Keep-alive ping to wake Railway from cold sleep ──────────────────────────
// Railway free tier sleeps after inactivity. The first request triggers a cold
// start (~20-30s). We send a lightweight /health ping first so the server is
// warmed up before the real auth request arrives.
let _serverWarmedAt = 0;
const WARM_TTL_MS = 5 * 60 * 1000; // consider warm for 5 minutes

export const warmServer = async () => {
  if (isLocalhost) return; // no need locally
  if (Date.now() - _serverWarmedAt < WARM_TTL_MS) return; // already warm
  try {
    await axios.get(`${API_BASE}/health`, { timeout: 35000 });
    _serverWarmedAt = Date.now();
  } catch {
    // ignore — server might still be waking up, actual request will wait
  }
};

// ─── Main API instance (documents, AI, etc.) ──────────────────────────────────
const api = axios.create({
  baseURL: `${API_BASE}/api`,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Auth API instance — higher timeout for cold starts + email ops ────────────
const authApi = axios.create({
  baseURL: `${API_BASE}/api`,
  timeout: 60000, // 60s — register/login must survive cold start + bcrypt
  headers: { 'Content-Type': 'application/json' },
});

// ─── Attach JWT to every request ─────────────────────────────────────────────
const attachToken = (config) => {
  const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
};

api.interceptors.request.use(attachToken);
authApi.interceptors.request.use(attachToken);

// ─── Auth endpoints — use authApi so timeouts are generous ───────────────────
export const register = (userData) => authApi.post('/auth/register', userData);
export const login    = (userData) => authApi.post('/auth/login',    userData);

export const googleLogin = (token) => authApi.post('/auth/google-login', { token });

export const verifyEmail       = (token)               => api.get(`/auth/verify-email/${token}`);
export const forgotPassword    = (email)               => authApi.post('/auth/forgot-password',        { email });
export const resetPassword     = (token, newPassword)  => api.post(`/auth/reset-password/${token}`,   { newPassword });
export const resendVerification= (email)               => authApi.post('/auth/resend-verification',    { email });

export const getDocuments = () => api.get('/documents');

export default api;