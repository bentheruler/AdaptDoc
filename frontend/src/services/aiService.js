import axios from "axios";

const API = "http://localhost:5000/api";

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