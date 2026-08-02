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
    return user ? JSON.parse(user) : null;
  },
  isAuthenticated: () => !!localStorage.getItem('token'),
};
