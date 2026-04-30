import axios from "axios";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";
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