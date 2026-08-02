import api from './api';

export const authService = {
  register: (userData) => api.post('/auth/register.php', userData),
  login: (credentials) => api.post('/auth/login.php', credentials),
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    if (!user || user === 'undefined' || user === 'null') {
      return null;
    }
    try {
      return JSON.parse(user);
    } catch (e) {
      console.error('Error parsing user data:', e);
      localStorage.removeItem('user');
      return null;
    }
  },
  isAuthenticated: () => !!localStorage.getItem('token'),
};
