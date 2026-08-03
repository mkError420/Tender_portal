import api from './api';

export const bidService = {
  getBids: (params) => api.get('/bids/index.php', { params }),
  submitBid: (formData) => api.post('/bids/submit.php', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateBidStatus: (data) => api.put('/bids/update-status.php', data),
  deleteBid: (bidId) => api.delete('/bids/delete.php', { data: { bid_id: bidId } }),
};
