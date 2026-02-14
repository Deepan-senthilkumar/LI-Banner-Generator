import storage from './storage';
import { sanitizeObjectStrings } from '../utils/security';

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
    // Future Supabase/Firebase implementation
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
  },

  create: async (table, data) => {
    if (PROVIDER === 'local') {
      await new Promise(resolve => setTimeout(resolve, 300));
      const items = storage.get(table, []);
      const newItem = {
        ...sanitizeObjectStrings(data),
        id: data.id || Math.random().toString(36).substr(2, 9),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      items.push(newItem);
      storage.set(table, items);
      return newItem;
    }
  },

  update: async (table, id, data) => {
    if (PROVIDER === 'local') {
      await new Promise(resolve => setTimeout(resolve, 300));
      const items = storage.get(table, []);
      const index = items.findIndex(item => item.id === id);
      if (index === -1) throw new Error(`Item ${id} not found in ${table}`);
      
      const updatedItem = {
        ...items[index],
        ...sanitizeObjectStrings(data),
        updatedAt: new Date().toISOString(),
      };
      items[index] = updatedItem;
      storage.set(table, items);
      return updatedItem;
    }
  },

  delete: async (table, id) => {
    if (PROVIDER === 'local') {
      await new Promise(resolve => setTimeout(resolve, 200));
      const items = storage.get(table, []);
      const filtered = items.filter(item => item.id !== id);
      storage.set(table, filtered);
      return true;
    }
  },
  
  // Specialized Methods
  saveDraft: async (key, data) => {
       if (PROVIDER === 'local') {
           storage.set(key, data);
           return true;
       }
  },
  
  getDraft: async (key) => {
      if (PROVIDER === 'local') {
          return storage.get(key, null);
      }
  }
};

export default dataProvider;
