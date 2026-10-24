'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, WalletAccount } from '@/types';
import { ApiClient } from './api';

interface AuthContextType {
  user: User | null;
  wallet: WalletAccount | null;
  token: string | null;
  loading: boolean;
  login: (token: string, user: User, wallet?: WalletAccount) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [wallet, setWallet] = useState<WalletAccount | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const res = await ApiClient.get<any>('/auth/me');
      if (res.success && res.data) {
        setUser(res.data);
        if (res.data.wallet) {
          setWallet(res.data.wallet);
        }
      }
    } catch {
      // Token might be invalid or expired
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const savedToken = localStorage.getItem('bazarpool_token');
    const savedUser = localStorage.getItem('bazarpool_user');

    if (savedToken && savedUser) {
      setToken(savedToken);
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        // parsing error
      }
      refreshUser();
    } else {
      setLoading(false);
    }
  }, []);

  const login = (newToken: string, newUser: User, newWallet?: WalletAccount) => {
    setToken(newToken);
    setUser(newUser);
    if (newWallet) setWallet(newWallet);
    localStorage.setItem('bazarpool_token', newToken);
    localStorage.setItem('bazarpool_user', JSON.stringify(newUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setWallet(null);
    localStorage.removeItem('bazarpool_token');
    localStorage.removeItem('bazarpool_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        wallet,
        token,
        loading,
        login,
        logout,
        refreshUser,
      }}
    >
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
