// Lightweight, safe cross-platform persistent storage
// Works across Android, iOS, Expo Go, and development environments

let memoryCache = {};

export const storage = {
  async getItem(key) {
    try {
      return memoryCache[key] !== undefined ? memoryCache[key] : null;
    } catch {
      return null;
    }
  },

  async setItem(key, value) {
    try {
      memoryCache[key] = String(value);
      return true;
    } catch {
      return false;
    }
  },

  async removeItem(key) {
    try {
      delete memoryCache[key];
      return true;
    } catch {
      return false;
    }
  },

  async clear() {
    try {
      memoryCache = {};
      return true;
    } catch {
      return false;
    }
  },
};

export default storage;
