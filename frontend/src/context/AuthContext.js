import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

const hostname = window.location.hostname;
const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168.');
const API_BASE = isLocalhost
  ? `http://${hostname}:5000`
  : (process.env.REACT_APP_API_URL?.replace('http://', 'https://') || 'https://adaptdoc-production.up.railway.app');

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('accessToken') || localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.clear();
      }
    }
    setLoading(false);
  }, []);

  // Apply theme tokens whenever user settings change
  useEffect(() => {
    if (user?.settings?.appearance) {
      const { theme, accentColor } = user.settings.appearance;
      document.documentElement.setAttribute('data-theme', theme || 'dark');
      // Only apply saved accent if it's a teal-family color, else use default teal
      const tealFamily = /^#(0[0-9a-f]9[0-9a-f]|14b8|2dd4|0d94|0f76)/i;
      const resolvedAccent = (accentColor && tealFamily.test(accentColor)) ? accentColor : '#14b8a6';
      document.documentElement.style.setProperty('--accent-color', resolvedAccent);
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
      document.documentElement.style.setProperty('--accent-color', '#14b8a6');
    }
  }, [user?.settings?.appearance]);

  // Auto-refresh token before it expires
  const refreshAccessToken = useCallback(async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) return null;
    try {
      const res = await axios.post(`${API_BASE}/api/auth/refresh`, { refreshToken });
      const { accessToken } = res.data;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('token', accessToken);
      setToken(accessToken);
      return accessToken;
    } catch {
      // Refresh failed — log out silently
      logoutUser();
      return null;
    }
  }, []); // eslint-disable-line

  // Schedule silent refresh every 6 days (token lasts 7 days)
  useEffect(() => {
    if (!token) return;
    const interval = setInterval(() => {
      refreshAccessToken();
    }, 6 * 24 * 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [token, refreshAccessToken]);

  const loginUser = (userData, tokenData, refreshTokenData) => {
    setUser(userData);
    setToken(tokenData);
    localStorage.setItem('token', tokenData);
    localStorage.setItem('accessToken', tokenData);
    localStorage.setItem('user', JSON.stringify(userData));
    if (refreshTokenData) {
      localStorage.setItem('refreshToken', refreshTokenData);
    }
  };

  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logoutUser = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      loginUser,
      updateUser,
      logoutUser,
      isAuthenticated: !!user,
    }}>
      {children}
    </AuthContext.Provider>
  );
};