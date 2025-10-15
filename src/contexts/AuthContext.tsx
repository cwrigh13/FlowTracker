import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api, User, LoginRequest } from '../services/apiFactory';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  error: string | null;
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
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = !!user;

  // Check if user is already authenticated on app load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (api.isAuthenticated()) {
          // For mock API, create a mock admin user
          const mockUser: User = {
            id: '1',
            email: 'admin@demo.com',
            first_name: 'John',
            last_name: 'Admin',
            role: 'admin',
            library: {
              id: '1',
              name: 'Demo Library',
              slug: 'demo-library'
            }
          };
          setUser(mockUser);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        api.logout();
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (credentials: LoginRequest) => {
    try {
      setError(null);
      setIsLoading(true);
      
      // Mock authentication - accept demo credentials
      if (credentials.email === 'admin@demo.com' && credentials.password === 'password123') {
        const mockUser: User = {
          id: '1',
          email: 'admin@demo.com',
          first_name: 'John',
          last_name: 'Admin',
          role: 'admin',
          library: {
            id: '1',
            name: 'Demo Library',
            slug: 'demo-library'
          }
        };
        
        // Set mock token
        api.setToken('mock-admin-token');
        setUser(mockUser);
      } else {
        throw new Error('Invalid credentials. Use admin@demo.com / password123');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    api.logout();
    setUser(null);
    setError(null);
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    error,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
