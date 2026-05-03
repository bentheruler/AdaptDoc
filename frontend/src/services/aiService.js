import axios from "axios";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";
const API = `${API_BASE}/api`;

export const generateDocumentAI = async (docType, userData) => {
  const res = await api.post("/ai/generate", {
    docType,
    userData
  });
  return res.data;
};

export const chatEditDocument = async (payload) => {
  const res = await api.post("/ai/chat-edit", payload);
  return res.data;
};