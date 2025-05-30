
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '../types';
import * as authService from '../services/authService'; // Mock service

interface AuthContextType {
  user: User | null;
  login: (email: string, pass: string) => Promise<User | null>;
  register: (email: string, pass: string) => Promise<User | null>;
  logout: () => Promise<void>;
  loadingAuth: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  const initializeAuth = useCallback(async () => {
    setLoadingAuth(true);
    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error("Error initializing auth:", error);
      setUser(null);
    } finally {
      setLoadingAuth(false);
    }
  }, []);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  const login = async (email: string, pass: string): Promise<User | null> => {
    setLoadingAuth(true);
    try {
      const loggedInUser = await authService.login(email, pass);
      setUser(loggedInUser);
      return loggedInUser;
    } catch (error) {
      console.error("Login failed:", error);
      setUser(null);
      throw error;
    } finally {
      setLoadingAuth(false);
    }
  };

  const register = async (email: string, pass: string): Promise<User | null> => {
    setLoadingAuth(true);
    try {
      const registeredUser = await authService.register(email, pass);
      setUser(registeredUser);
      return registeredUser;
    } catch (error) {
      console.error("Registration failed:", error);
      setUser(null);
      throw error;
    } finally {
      setLoadingAuth(false);
    }
  };

  const logout = async (): Promise<void> => {
    setLoadingAuth(true);
    try {
      await authService.logout();
      setUser(null);
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setLoadingAuth(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loadingAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
