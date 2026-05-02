import axios from "axios";

const hostname = window.location.hostname;
const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168.');
const API_BASE = isLocalhost ? `http://${hostname}:5000` : (process.env.REACT_APP_API_URL?.replace('http://', 'https://') || 'https://adaptdoc.onrender.com');
const API = `${API_BASE}/api`;

export const generateDocumentAI = async (docType, userData) => {
  const token =
    localStorage.getItem("accessToken") || localStorage.getItem("token");

  const res = await axios.post(
    `${API}/ai/generate`,
    {
      docType,
      userData
    },
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  return res.data;
};