import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AuthAPI } from '../services/api';
import {
  firebaseLoginUser,
  firebaseRegisterUser,
  firebaseGoogleSignIn,
  firebaseSendPasswordReset,
  firebaseSignOut,
} from '../services/firebase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('todo_user_profile');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('todo_auth_token') || null;
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Synchronize session tokens with localStorage
  const saveAuthSession = (authToken, userProfile) => {
    setToken(authToken);
    setUser(userProfile);
    localStorage.setItem('todo_auth_token', authToken);
    localStorage.setItem('todo_user_profile', JSON.stringify(userProfile));
  };

  const clearAuthSession = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('todo_auth_token');
    localStorage.removeItem('todo_user_profile');
  };

  // Re-fetch profile on mount or token change
  const refreshProfile = useCallback(async () => {
    const currentToken = localStorage.getItem('todo_auth_token');
    if (!currentToken) {
      // Auto-connect with demo profile if no existing session
      try {
        const res = await AuthAPI.login({
          email_or_username: 'demo@example.com',
          password: 'demo123',
        });
        if (res?.access_token && res?.user) {
          saveAuthSession(res.access_token, res.user);
        }
      } catch (err) {
        console.warn('Silent demo sign-in bypassed:', err.message);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    try {
      const profile = await AuthAPI.getMe();
      if (profile && profile.id) {
        setUser(profile);
        localStorage.setItem('todo_user_profile', JSON.stringify(profile));
      }
    } catch (err) {
      console.warn('Session expired or invalid, clearing session:', err.message);
      clearAuthSession();
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  /**
   * Firebase Email/Password Sign-In with backend sync
   */
  const loginWithFirebase = async ({ email, password }) => {
    setIsLoading(true);
    try {
      const { idToken } = await firebaseLoginUser({ email, password });
      const res = await AuthAPI.firebaseSync({ id_token: idToken });
      saveAuthSession(res.access_token, res.user);
      setIsAuthModalOpen(false);
      return res;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Firebase Registration with backend sync
   */
  const registerWithFirebase = async ({ email, password, full_name, username, role, bio, github_username }) => {
    setIsLoading(true);
    try {
      const { idToken } = await firebaseRegisterUser({
        email,
        password,
        displayName: full_name || username,
      });
      const res = await AuthAPI.firebaseSync({
        id_token: idToken,
        full_name: full_name || undefined,
        role: role || 'Fullstack Developer',
        bio: bio || undefined,
        github_username: github_username || undefined,
      });
      saveAuthSession(res.access_token, res.user);
      setIsAuthModalOpen(false);
      return res;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 1-Click Google Sign-In with backend sync
   */
  const loginWithGoogle = async () => {
    setIsLoading(true);
    try {
      const { idToken, user: fbUser } = await firebaseGoogleSignIn();
      const res = await AuthAPI.firebaseSync({
        id_token: idToken,
        full_name: fbUser.displayName,
        avatar_url: fbUser.photoURL,
      });
      saveAuthSession(res.access_token, res.user);
      setIsAuthModalOpen(false);
      return res;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Send automated password reset email directly to user's inbox
   */
  const sendFirebasePasswordReset = async (email) => {
    return firebaseSendPasswordReset(email);
  };

  /**
   * Classic email/username login fallback (e.g. demo account)
   */
  const login = async ({ email_or_username, password }) => {
    setIsLoading(true);
    try {
      const res = await AuthAPI.login({ email_or_username, password });
      saveAuthSession(res.access_token, res.user);
      setIsAuthModalOpen(false);
      return res;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (registrationData) => {
    setIsLoading(true);
    try {
      const res = await AuthAPI.register(registrationData);
      saveAuthSession(res.access_token, res.user);
      setIsAuthModalOpen(false);
      return res;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await firebaseSignOut();
    } catch {
      // ignore
    }
    clearAuthSession();
    setIsProfileModalOpen(false);
  };

  const updateProfile = async (updates) => {
    const updated = await AuthAPI.updateProfile(updates);
    setUser(updated);
    localStorage.setItem('todo_user_profile', JSON.stringify(updated));
    return updated;
  };

  const changePassword = async ({ current_password, new_password }) => {
    return AuthAPI.changePassword({ current_password, new_password });
  };

  const value = {
    user,
    token,
    isAuthenticated: Boolean(token && user),
    isLoading,
    isAuthModalOpen,
    setIsAuthModalOpen,
    isProfileModalOpen,
    setIsProfileModalOpen,
    login,
    register,
    loginWithFirebase,
    registerWithFirebase,
    loginWithGoogle,
    sendFirebasePasswordReset,
    logout,
    updateProfile,
    changePassword,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
