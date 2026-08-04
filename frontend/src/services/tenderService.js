import api from './api';

export const tenderService = {
  getTenders: (params) => api.get('/tenders/index.php', { params }),
  getTender: (id) => api.get(`/tenders/show.php?id=${id}`),
  createTender: (data) => api.post('/tenders/create.php', data),
  updateTender: (data) => api.put('/tenders/update.php', data),
  deleteTender: (id) => api.delete('/tenders/delete.php', { data: { id } }),
  uploadDocument: (formData) => api.post('/tenders/upload-document.php', formData),
  uploadMultipleDocuments: (formData) => api.post('/tenders/upload-document.php', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteDocument: (documentId) => api.delete('/backend/api/tenders/delete-document.php', { data: { document_id: documentId } }),
};
