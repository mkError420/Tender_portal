import api from './api';

export const settingsService = {
  getSettings: () => {
    return api.get('/settings/get.php');
  },

  updateSettings: (formData) => {
    return api.post('/settings/update.php', formData);
  },
};
