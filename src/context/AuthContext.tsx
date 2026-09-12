import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types/index.js';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (identifier: string, password: string, role: UserRole) => Promise<boolean>;
  register: (farmerData: any) => Promise<boolean>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => {
    try { return window.localStorage.getItem('paradox_token'); } catch { return null; }
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMe = async () => {
      if (!token) {
        // Never auto-login. Every role must authenticate with its own credentials.
        setUser(null);
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          setUser(await res.json());
        } else {
          localStorage.removeItem('paradox_token');
          setToken(null);
          setUser(null);
        }
      } catch (err) {
        console.error('Failed to authenticate:', err);
        // Keep the session only if we already have a valid local user snapshot.
        // Otherwise require a fresh login.
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMe();
  }, [token]);

  const login = async (identifier: string, password: string, role: UserRole): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: identifier.trim(), password, role }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || 'Login failed');
        return false;
      }

      // The server decides the authenticated role. The UI never chooses a role after login.
      if (!data.user || data.user.role !== role) {
        setError('Authenticated role does not match the selected login type.');
        return false;
      }

      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('paradox_token', data.token);
      return true;
    } catch (err: any) {
      setError(err.message || 'Network error');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (farmerData: any): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(farmerData),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || 'Registration failed');
        return false;
      }

      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('paradox_token', data.token);
      return true;
    } catch (err: any) {
      setError(err.message || 'Network error');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (data: Partial<User>): Promise<boolean> => {
    if (!token) return false;
    setError(null);
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      const response = await res.json().catch(() => ({}));
      if (res.ok) {
        setUser(response);
        return true;
      }
      setError(response.error || 'Profile update failed');
      return false;
    } catch (err: any) {
      console.error('Profile update error:', err);
      setError(err.message || 'Network error');
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setError(null);
    localStorage.removeItem('paradox_token');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, updateProfile, isLoading, error }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
