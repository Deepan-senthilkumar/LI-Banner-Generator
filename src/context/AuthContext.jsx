import React, { createContext, useState, useEffect, useContext } from 'react';
import { authService } from '../services/authService';
import { canAccessAdmin, normalizeUserRole } from '../utils/permissions';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        setUser(normalizeUserRole(currentUser));
      } catch (error) {
        console.error('Auth check failed', error);
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const session = await authService.login(email, password);
      const normalizedUser = normalizeUserRole(session.user);
      setUser(normalizedUser);
      return { ...session, user: normalizedUser };
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password) => {
    setLoading(true);
    try {
      const createdUser = await authService.register({ name, email, password });
      const normalizedUser = normalizeUserRole(createdUser);
      setUser(normalizedUser);
      return normalizedUser;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  const isAuthenticated = !!user;
  const isAdmin = canAccessAdmin(user);

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, isAuthenticated, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
