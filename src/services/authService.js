import dataProvider from './dataProvider';
import { ROLES } from '../utils/permissions';
import apiClient from './apiClient';
import {
  isValidEmail,
  sanitizeObjectStrings,
  sanitizeString,
  validatePasswordStrength,
} from '../utils/security';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
const PROVIDER = import.meta.env.VITE_DATA_PROVIDER || 'local';

const normalizeRole = (role) => (role === ROLES.ADMIN ? ROLES.ADMIN : ROLES.USER);

export const authService = {
  login: async (email, password) => {
    const safeEmail = sanitizeString(email).toLowerCase();
    if (!isValidEmail(safeEmail)) {
      throw new Error('Please enter a valid email address');
    }

    if (PROVIDER === 'local') {
      let users = await dataProvider.getAll('users', { email: safeEmail });
      let user = users[0];

      if (!user && safeEmail === 'demo@example.com' && password === 'password') {
        user = await dataProvider.create('users', {
          name: 'Demo User',
          email: 'demo@example.com',
          password: 'password',
          is_pro: false,
          role: ROLES.USER,
          plan: 'free',
        });
      }

      if (!user && safeEmail === 'admin@example.com' && password === 'admin123') {
        user = await dataProvider.create('users', {
          name: 'Admin User',
          email: 'admin@example.com',
          password: 'admin123',
          is_pro: true,
          role: ROLES.ADMIN,
          plan: 'pro',
        });
      }

      if (user && (user.password === password || user.hashed_password)) {
        const token = `mock_token_${user.id}`;
        localStorage.setItem('token', token);
        return { user: { ...user, role: normalizeRole(user.role) }, token };
      }
      throw new Error('Invalid email or password');
    }

    const formData = new URLSearchParams();
    formData.append('username', safeEmail);
    formData.append('password', password);

    const data = await apiClient.request(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData,
    });

    const token = data.access_token;
    localStorage.setItem('token', token);

    const user = await authService.getCurrentUser();
    return { user, token };
  },

  register: async (userData) => {
    const safeEmail = sanitizeString(userData.email).toLowerCase();
    if (!isValidEmail(safeEmail)) {
      throw new Error('Please enter a valid email address');
    }

    const passwordCheck = validatePasswordStrength(userData.password);
    if (!passwordCheck.valid) {
      throw new Error(passwordCheck.reason);
    }

    const safePayload = sanitizeObjectStrings({
      ...userData,
      email: safeEmail,
      name: userData.name || userData.full_name || '',
    });

    if (PROVIDER === 'local') {
      const existing = await dataProvider.getAll('users', { email: safeEmail });
      if (existing.length > 0) throw new Error('User already exists');

      return dataProvider.create('users', {
        name: safePayload.name,
        email: safeEmail,
        password: userData.password,
        is_pro: false,
        role: ROLES.USER,
        plan: 'free',
      });
    }

    const created = await apiClient.post(`${API_URL}/auth/register`, {
      email: safeEmail,
      password: userData.password,
      full_name: safePayload.name,
    });
    return { ...created, role: normalizeRole(created.role) };
  },

  getCurrentUser: async () => {
    const token = localStorage.getItem('token');
    if (!token) return null;

    if (PROVIDER === 'local' && token.startsWith('mock_token_')) {
      const userId = token.replace('mock_token_', '');
      const user = await dataProvider.get('users', userId);
      return user ? { ...user, role: normalizeRole(user.role) } : null;
    }

    try {
      const user = await apiClient.get(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return { ...user, role: normalizeRole(user.role) };
    } catch (error) {
      if (error.status === 401) {
        authService.logout();
        return null;
      }
      console.error('Auth check failed', error);
      return null;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
  },

  isAuthenticated: () => !!localStorage.getItem('token'),
};
