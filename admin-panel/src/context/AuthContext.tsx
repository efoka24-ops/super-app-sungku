import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ADMIN_API_BASE_URL } from '../lib/apiBase';

interface AuthContextType {
  isAuthenticated: boolean;
  adminName: string;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

declare global {
  var __SUNGKU_AUTH_CONTEXT__: React.Context<AuthContextType | undefined> | undefined;
}

const AuthContext = globalThis.__SUNGKU_AUTH_CONTEXT__ ?? createContext<AuthContextType | undefined>(undefined);
globalThis.__SUNGKU_AUTH_CONTEXT__ = AuthContext;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminName, setAdminName] = useState('');

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch(`${ADMIN_API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (response.status === 401) {
        return false;
      }

      if (!response.ok) {
        throw new Error('Le serveur a refusé la connexion. Vérifie l’URL backend et CORS.');
      }

      const data = await response.json();
      localStorage.setItem('adminToken', data.token);
      setIsAuthenticated(true);
      setAdminName(data.admin?.name || 'Admin');
      return true;
    } catch (error) {
      console.error('Login error:', error);
      throw new Error('Connexion impossible au backend (réseau/CORS/URL).');
    }
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    setIsAuthenticated(false);
    setAdminName('');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, adminName, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
