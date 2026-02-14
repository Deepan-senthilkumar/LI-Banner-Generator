/**
 * LocalStorage wrapper for simulating database operations
 */

const storage = {
  get: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Error reading ${key} from localStorage:`, error);
      return defaultValue;
    }
  },

  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error writing ${key} to localStorage:`, error);
    }
  },

  remove: (key) => {
    localStorage.removeItem(key);
  },
  
  // Simulation of async DB call
  getAsync: async (key) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(storage.get(key));
      }, 300); // Simulate network delay
    });
  }
};

export default storage;
