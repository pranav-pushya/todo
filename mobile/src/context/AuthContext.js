import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthAPI } from '../services/api.js';
import storage from '../services/storage.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize session on boot
  useEffect(() => {
    async function loadStoredSession() {
      try {
        const storedToken = await storage.getItem('kortex_auth_token');
        if (storedToken) {
          setToken(storedToken);
          // Try to fetch current user profile
          try {
            const profile = await AuthAPI.getProfile();
            setUser(profile);
          } catch {
            // Profile fetch failed, fallback to stored profile
            const cachedProfile = await storage.getItem('kortex_user_profile');
            if (cachedProfile) setUser(JSON.parse(cachedProfile));
          }
        }
      } catch (err) {
        console.warn('Session restoration failed:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadStoredSession();
  }, []);

  const login = async (username, password) => {
    setIsLoading(true);
    try {
      const data = await AuthAPI.login(username, password);
      setToken(data.access_token);
      let profile = null;
      try {
        profile = await AuthAPI.getProfile();
      } catch {
        profile = { username, role: 'Developer' };
      }
      setUser(profile);
      await storage.setItem('kortex_user_profile', JSON.stringify(profile));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (username, email, password) => {
    setIsLoading(true);
    try {
      await AuthAPI.register(username, email, password);
      // Auto-login after successful registration
      return await login(username, password);
    } catch (err) {
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  // Instant Guest / Demo Mode for fast mobile verification
  const loginAsGuest = async () => {
    const guestUser = {
      id: 9999,
      username: 'GuestDeveloper',
      email: 'guest@kortex.dev',
      full_name: 'Guest Developer',
      role: 'Staff Engineer',
      is_guest: true,
    };
    setUser(guestUser);
    setToken('guest_token_demo');
    await storage.setItem('kortex_user_profile', JSON.stringify(guestUser));
    return { success: true };
  };

  const logout = async () => {
    setUser(null);
    setToken(null);
    await AuthAPI.logout();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        loginAsGuest,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
