import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, LoginRequest, LoginResponse } from '@shared/iam';

interface AuthContextType {
  user: User | null;
  login: (credentials: LoginRequest) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored auth token on app load
    const token = localStorage.getItem('authToken');
    if (token) {
      // Verify token with server (simplified for demo)
      checkAuthStatus();
    } else {
      // For development, provide a fallback demo user if no backend is available
      if (process.env.NODE_ENV === 'development') {
        const fallbackUser = {
          id: "demo-user",
          username: "demo",
          email: "demo@example.com",
          firstName: "Demo",
          lastName: "User",
          status: "active" as const,
          roles: ["user"],
          attributes: {
            department: "Demo",
            clearanceLevel: "medium"
          },
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString()
        };

        // Auto-login demo user after a brief delay to simulate loading
        setTimeout(() => {
          setUser(fallbackUser);
          setIsLoading(false);
        }, 1000);
      } else {
        setIsLoading(false);
      }
    }
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setIsLoading(false);
        return;
      }

      const response = await fetch('/api/auth/verify', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        // Add timeout to prevent hanging requests
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });

      if (response.ok) {
        const userData = await response.json();
        if (userData.success && userData.user) {
          setUser(userData.user);
        } else {
          console.warn('Auth verification response invalid:', userData);
          localStorage.removeItem('authToken');
        }
      } else {
        console.warn(`Auth verification failed with status: ${response.status}`);
        localStorage.removeItem('authToken');
      }
    } catch (error) {
      // Handle different types of errors gracefully
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          console.warn('Auth verification timed out');
        } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
          console.warn('Auth verification failed - server unreachable:', error.message);
        } else {
          console.warn('Auth verification failed:', error.message);
        }
      } else {
        console.warn('Auth verification failed with unknown error:', error);
      }

      // Remove invalid token but don't prevent app from loading
      localStorage.removeItem('authToken');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: LoginRequest): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data: LoginResponse = await response.json();

      if (data.success && data.token && data.user) {
        localStorage.setItem('authToken', data.token);
        setUser(data.user);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
