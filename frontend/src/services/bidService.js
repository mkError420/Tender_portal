import api from './api';

export const bidService = {
  getBids: (params) => api.get('/bids/index.php', { params }),
  submitBid: (formData) => api.post('/bids/submit.php', formData),
  updateBidStatus: (data) => api.put('/bids/update-status.php', data),
};
