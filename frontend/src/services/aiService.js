import api from "../utils/api";

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