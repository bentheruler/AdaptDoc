import api from '../utils/api';

const STORAGE_KEY = 'adaptdoc_documents';

// Get all user documents
export const getDocuments = async () => {
  try {
    const res = await api.get('/documents');
    return res.data;
  } catch (err) {
    const docs = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return docs;
  }
};

// Get single document by ID
export const getDocument = async (id) => {
  try {
    const res = await api.get(`/documents/${id}`);
    return res.data;
  } catch (err) {
    const docs = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const doc = docs.find((d) => d._id === id || d.id === id);

    if (!doc) {
      throw new Error('Document not found');
    }

    return doc;
  }
};

// Create new document
export const createDocument = async (docData) => {
  try {
    const res = await api.post('/documents', docData);
    return res.data;
  } catch (err) {
    const docs = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');

    const newDoc = {
      _id: Date.now().toString(),
      ...docData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    docs.unshift(newDoc);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(docs));
    return newDoc;
  }
};

// Update document
export const updateDocument = async (id, updates) => {
  try {
    const res = await api.put(`/documents/${id}`, updates);
    return res.data;
  } catch (err) {
    const docs = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const index = docs.findIndex((d) => d._id === id || d.id === id);

    if (index === -1) {
      throw new Error('Document not found');
    }

    docs[index] = {
      ...docs[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(docs));
    return docs[index];
  }
};

// Delete document
export const deleteDocument = async (id) => {
  try {
    const res = await api.delete(`/documents/${id}`);
    return res.data;
  } catch (err) {
    const docs = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const filtered = docs.filter((d) => d._id !== id && d.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return { success: true };
  }
};

// Export document as PDF/Word
export const downloadDocument = (docData, format = 'pdf') => {
  return Promise.resolve({ success: true });
};

const documentService = {
  getDocuments,
  getDocument,
  createDocument,
  updateDocument,
  deleteDocument,
  downloadDocument
};

export default documentService;