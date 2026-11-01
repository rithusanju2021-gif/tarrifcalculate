import { create } from 'zustand';
import apiClient from '../api/client';

export const useAuthStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem('rtt_user') || 'null'),
  token: localStorage.getItem('rtt_access_token') || null,
  isAuthenticated: !!localStorage.getItem('rtt_access_token'),
  isLoading: false,
  error: null,

  login: async (username, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await apiClient.post('/auth/login/', { username, password });
      if (res.data && res.data.access) {
        localStorage.setItem('rtt_access_token', res.data.access);
        localStorage.setItem('rtt_user', JSON.stringify(res.data.user));
        set({
          user: res.data.user,
          token: res.data.access,
          isAuthenticated: true,
          isLoading: false,
        });
        return { success: true };
      }
      return { success: false, error: 'Invalid response from server.' };
    } catch (err) {
      const detail = err.response?.data?.detail 
        || (err.code === 'ECONNABORTED' ? 'Connection timed out. Check backend connection.' : null)
        || (err.message === 'Network Error' ? 'Unable to reach backend server. Please check your network or backend URL.' : null)
        || 'Login failed. Please check your credentials.';
      set({ error: detail, isLoading: false });
      return { success: false, error: detail };
    }
  },

  logout: () => {
    localStorage.removeItem('rtt_access_token');
    localStorage.removeItem('rtt_user');
    set({ user: null, token: null, isAuthenticated: false });
  },

  checkAuth: async () => {
    const token = localStorage.getItem('rtt_access_token');
    if (!token) return;
    try {
      const res = await apiClient.get('/auth/me/');
      if (res.data) {
        set({ user: res.data, isAuthenticated: true });
        localStorage.setItem('rtt_user', JSON.stringify(res.data));
      }
    } catch (e) {
      // Keep session if offline
    }
  }
}));
