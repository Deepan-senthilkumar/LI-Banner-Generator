import storage from './storage';
import { sanitizeObjectStrings } from '../utils/security';
import supabaseProvider from './providers/supabaseProvider';

// Configuration
const PROVIDER = import.meta.env.VITE_DATA_PROVIDER || 'local';

/**
 * Data Provider Interface
 * Standardizes CRUD operations across different backends (Local, Supabase, Firebase)
 */
const dataProvider = {
  // Generic CRUD
  get: async (table, id) => {
    if (PROVIDER === 'local') {
      await new Promise(resolve => setTimeout(resolve, 200)); // Simulate latency
      const items = storage.get(table, []);
      return items.find(item => item.id === id);
    }

    if (PROVIDER === 'supabase') {
      return supabaseProvider.get(table, id);
    }

    throw new Error(`Unsupported data provider: ${PROVIDER}`);
  },

  getAll: async (table, filter = {}) => {
    if (PROVIDER === 'local') {
      await new Promise(resolve => setTimeout(resolve, 300));
      const items = storage.get(table, []);
      // Basic filtering
      return items.filter(item => {
        return Object.keys(filter).every(key => item[key] === filter[key]);
      }).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    }

    if (PROVIDER === 'supabase') {
      return supabaseProvider.getAll(table, filter);
    }

    throw new Error(`Unsupported data provider: ${PROVIDER}`);
  },

  create: async (table, data) => {
    const safeData = sanitizeObjectStrings(data);

    if (PROVIDER === 'local') {
      await new Promise(resolve => setTimeout(resolve, 300));
      const items = storage.get(table, []);
      const newItem = {
        ...safeData,
        id: data.id || Math.random().toString(36).substr(2, 9),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      items.push(newItem);
      storage.set(table, items);
      return newItem;
    }

    if (PROVIDER === 'supabase') {
      return supabaseProvider.create(table, safeData);
    }

    throw new Error(`Unsupported data provider: ${PROVIDER}`);
  },

  update: async (table, id, data) => {
    const safeData = sanitizeObjectStrings(data);

    if (PROVIDER === 'local') {
      await new Promise(resolve => setTimeout(resolve, 300));
      const items = storage.get(table, []);
      const index = items.findIndex(item => item.id === id);
      if (index === -1) throw new Error(`Item ${id} not found in ${table}`);
      
      const updatedItem = {
        ...items[index],
        ...safeData,
        updatedAt: new Date().toISOString(),
      };
      items[index] = updatedItem;
      storage.set(table, items);
      return updatedItem;
    }

    if (PROVIDER === 'supabase') {
      return supabaseProvider.update(table, id, safeData);
    }

    throw new Error(`Unsupported data provider: ${PROVIDER}`);
  },

  delete: async (table, id) => {
    if (PROVIDER === 'local') {
      await new Promise(resolve => setTimeout(resolve, 200));
      const items = storage.get(table, []);
      const filtered = items.filter(item => item.id !== id);
      storage.set(table, filtered);
      return true;
    }

    if (PROVIDER === 'supabase') {
      return supabaseProvider.delete(table, id);
    }

    throw new Error(`Unsupported data provider: ${PROVIDER}`);
  },
  
  // Specialized Methods
  saveDraft: async (key, data) => {
    if (PROVIDER === 'local') {
      storage.set(key, data);
      return true;
    }

    if (PROVIDER === 'supabase') {
      return supabaseProvider.saveDraft(key, data);
    }

    throw new Error(`Unsupported data provider: ${PROVIDER}`);
  },
  
  getDraft: async (key) => {
    if (PROVIDER === 'local') {
      return storage.get(key, null);
    }

    if (PROVIDER === 'supabase') {
      return supabaseProvider.getDraft(key);
    }

    throw new Error(`Unsupported data provider: ${PROVIDER}`);
  }
};

export default dataProvider;
