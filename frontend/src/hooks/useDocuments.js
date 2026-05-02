// client/src/hooks/useDocuments.js
import { useCallback, useState } from 'react';
import axios from 'axios';

const hostname = window.location.hostname;
const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168.');
const API_BASE = isLocalhost ? `http://${hostname}:5000` : (process.env.REACT_APP_API_URL?.replace('http://', 'https://') || 'https://adaptdoc.onrender.com');

const getToken = () =>
  localStorage.getItem('accessToken') ||
  localStorage.getItem('token') ||
  sessionStorage.getItem('accessToken');

export const useDocuments = () => {
  const [documents, setDocuments] = useState([]);
  const [loadingDocuments, setLoadingDocuments] = useState(false);

  const loadDocuments = useCallback(async () => {
    try {
      setLoadingDocuments(true);

      const res = await axios.get(`${API_BASE}/api/documents`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });

      const docs = Array.isArray(res.data) ? res.data : [];
      setDocuments(docs);
    } catch (error) {
      if (error.response?.status === 401) {
        // Stale token — clear storage and force re-login
        localStorage.removeItem('token');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return;
      }
      console.error('Failed to load documents:', error.response?.data || error.message);
      setDocuments([]);
    } finally {
      setLoadingDocuments(false);
    }
  }, []);

  const saveDocument = async (payload) => {
    try {
      const res = await axios.post(`${API_BASE}/api/documents`, payload, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
          'Content-Type': 'application/json',
        },
      });

      setDocuments((prev) => [res.data, ...prev]);
      return res.data;
    } catch (error) {
      console.error('Failed to save document:', error.response?.data || error.message);
      alert(error.response?.data?.message || error.response?.data?.error || 'Failed to save document');
      return null;
    }
  };

  const updateDocument = async (id, payload) => {
    try {
      const res = await axios.put(`${API_BASE}/api/documents/${id}`, payload, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
          'Content-Type': 'application/json',
        },
      });

      setDocuments((prev) =>
        prev.map((doc) => ((doc._id || doc.id) === id ? res.data : doc))
      );

      return res.data;
    } catch (error) {
      console.error('Failed to update document:', error.response?.data || error.message);
      alert(error.response?.data?.message || error.response?.data?.error || 'Failed to update document');
      return null;
    }
  };

  const deleteDocument = async (id) => {
    try {
      await axios.delete(`${API_BASE}/api/documents/${id}`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });

      setDocuments((prev) => prev.filter((doc) => (doc._id || doc.id) !== id));
      return true;
    } catch (error) {
      console.error('Failed to delete document:', error.response?.data || error.message);
      alert(error.response?.data?.message || error.response?.data?.error || 'Failed to delete document');
      return false;
    }
  };

  return {
    documents,
    loadingDocuments,
    loadDocuments,
    saveDocument,
    updateDocument,
    deleteDocument,
  };
};