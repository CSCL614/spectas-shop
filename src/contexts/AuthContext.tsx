import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { AuthResponse, UserResponse } from '../types';
import { authApi } from '../api/services';

interface AuthContextType {
  user: UserResponse | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: () => boolean;
  isSalesperson: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch (e) {
      // Ignore network errors on logout to allow clean local exit
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setToken(null);
    }
  }, []);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (storedToken && storedUser) {
      setToken(storedToken);
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  // Periodic session heartbeat every 40s to keep active session status accurate
  useEffect(() => {
    if (!token) return;

    // Send immediate heartbeat on mount/login
    authApi.heartbeat().catch(() => {});

    const interval = setInterval(() => {
      authApi.heartbeat().catch(() => {});
    }, 40000);

    return () => clearInterval(interval);
  }, [token]);

  const login = async (username: string, password: string) => {
    const response = await authApi.login(username, password);
    const authData: AuthResponse = response.data.data;

    const userObj: UserResponse = {
      id: authData.id,
      username: authData.username,
      fullName: authData.fullName,
      email: authData.email,
      role: authData.role,
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem('token', authData.token);
    localStorage.setItem('user', JSON.stringify(userObj));
    setToken(authData.token);
    setUser(userObj);
  };

  const isAdmin = () => user?.role === 'ADMIN';
  const isSalesperson = () => user?.role === 'SALESPERSON';

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isAuthenticated: !!token && !!user,
      isLoading,
      login,
      logout,
      isAdmin,
      isSalesperson,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
