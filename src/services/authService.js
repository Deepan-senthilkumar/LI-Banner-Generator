import dataProvider from './dataProvider';
import { ROLES } from '../utils/permissions';
import apiClient from './apiClient';
import { getSupabaseClient } from './supabaseClient';
import {
  isValidEmail,
  sanitizeObjectStrings,
  sanitizeString,
  validatePasswordStrength,
} from '../utils/security';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
const PROVIDER = import.meta.env.VITE_DATA_PROVIDER || 'local';
const TOKEN_KEY = 'token';

const normalizeRole = (role) => (role === ROLES.ADMIN ? ROLES.ADMIN : ROLES.USER);
const asBoolean = (value) => value === true || value === 'true';
const syncStoredToken = (token) => {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
};

const normalizeSupabaseUser = (profile = {}, authUser = null) => {
  const isPro = asBoolean(profile.isPro ?? profile.is_pro) || profile.plan === 'pro';
  return {
    id: profile.id || authUser?.id,
    email: profile.email || authUser?.email || '',
    name: profile.name || authUser?.user_metadata?.name || authUser?.user_metadata?.full_name || '',
    role: normalizeRole(profile.role),
    plan: profile.plan || (isPro ? 'pro' : 'free'),
    is_pro: isPro,
    isPro,
    createdAt: profile.createdAt || profile.created_at || null,
    updatedAt: profile.updatedAt || profile.updated_at || null,
  };
};

const ensureSupabaseProfile = async (supabase, authUser, fallbackName = '') => {
  const { data: existing, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', authUser.id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message || 'Failed to load user profile');
  }

  if (existing) return normalizeSupabaseUser(existing, authUser);

  const insertPayload = {
    id: authUser.id,
    email: authUser.email || '',
    name: fallbackName || authUser.user_metadata?.name || authUser.user_metadata?.full_name || '',
    role: ROLES.USER,
    plan: 'free',
    is_pro: false,
  };

  const { data: created, error: createError } = await supabase
    .from('users')
    .upsert(insertPayload, { onConflict: 'id' })
    .select('*')
    .single();

  if (createError) {
    throw new Error(createError.message || 'Failed to create user profile');
  }

  return normalizeSupabaseUser(created, authUser);
};

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
        syncStoredToken(token);
        return { user: { ...user, role: normalizeRole(user.role) }, token };
      }
      throw new Error('Invalid email or password');
    }

    if (PROVIDER === 'supabase') {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: safeEmail,
        password,
      });

      if (error) throw new Error(error.message || 'Invalid email or password');

      const token = data.session?.access_token || '';
      syncStoredToken(token);

      const user = await authService.getCurrentUser();
      if (!user) throw new Error('Login succeeded but user profile is not available');

      return { user, token };
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
    syncStoredToken(token);

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

    if (PROVIDER === 'supabase') {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.auth.signUp({
        email: safeEmail,
        password: userData.password,
        options: {
          data: {
            name: safePayload.name,
          },
        },
      });

      if (error) throw new Error(error.message || 'Registration failed');

      if (!data.session) {
        throw new Error('Account created. Please verify your email, then sign in.');
      }

      if (data.session?.access_token) {
        syncStoredToken(data.session.access_token);
      }

      if (data.user) {
        const profile = await ensureSupabaseProfile(supabase, data.user, safePayload.name);
        return profile;
      }

      return {
        id: null,
        email: safeEmail,
        name: safePayload.name,
        role: ROLES.USER,
        plan: 'free',
        is_pro: false,
        isPro: false,
      };
    }

    const created = await apiClient.post(`${API_URL}/auth/register`, {
      email: safeEmail,
      password: userData.password,
      full_name: safePayload.name,
    });
    return { ...created, role: normalizeRole(created.role) };
  },

  getCurrentUser: async () => {
    if (PROVIDER === 'local') {
      const token = localStorage.getItem(TOKEN_KEY);
      if (!token) return null;

      if (token.startsWith('mock_token_')) {
        const userId = token.replace('mock_token_', '');
        const user = await dataProvider.get('users', userId);
        return user ? { ...user, role: normalizeRole(user.role) } : null;
      }
      return null;
    }

    if (PROVIDER === 'supabase') {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.auth.getSession();
      if (error) throw new Error(error.message || 'Failed to check auth session');

      const session = data?.session;
      if (!session?.user) return null;

      syncStoredToken(session.access_token || null);

      return ensureSupabaseProfile(supabase, session.user);
    }

    try {
      const token = localStorage.getItem(TOKEN_KEY);
      if (!token) return null;

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
    if (PROVIDER === 'supabase') {
      const supabase = getSupabaseClient();
      supabase.auth.signOut().catch(() => {});
    }
    syncStoredToken(null);
  },

  refreshSession: async () => {
    if (PROVIDER !== 'supabase') return null;
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.auth.refreshSession();
    if (error) throw new Error(error.message || 'Failed to refresh auth session');
    syncStoredToken(data?.session?.access_token || null);
    return data?.session || null;
  },

  subscribeToAuthChanges: (onUserChanged) => {
    if (PROVIDER !== 'supabase') return () => {};

    const supabase = getSupabaseClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      try {
        syncStoredToken(session?.access_token || null);
        if (!session?.user) {
          onUserChanged(null);
          return;
        }
        const user = await ensureSupabaseProfile(supabase, session.user);
        onUserChanged(user);
      } catch (error) {
        console.error('Failed to process auth state change', error);
      }
    });

    return () => subscription.unsubscribe();
  },

  getToken: () => localStorage.getItem(TOKEN_KEY),

  isAuthenticated: () => !!localStorage.getItem(TOKEN_KEY),
};
