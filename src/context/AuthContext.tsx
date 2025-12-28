import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User, AuthState } from '../types';
import { authApi, setAuthToken, clearAuthToken } from '../services/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, role: 'user' | 'admin') => Promise<boolean>;
  loginWithOtp: (email: string, otp: string) => Promise<boolean>;
  requestAdminOtp: (email: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
  });
  const [loading, setLoading] = useState(true);

  // Check for existing token on app start
  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          setAuthToken(token);
          const response = await authApi.validateToken();
          if (response.valid && response.user) {
            setAuthState({
              user: {
                id: response.user.id.toString(),
                name: response.user.firstName || response.user.username,
                email: response.user.email,
                role: response.user.role.toLowerCase() as 'user' | 'admin',
                trustScore: response.user.trustScore,
              },
              isAuthenticated: true,
            });
          } else {
            clearAuthToken();
          }
        } catch (error) {
          console.error('Token validation failed:', error);
          // Don't clear token on network errors, just log and continue
          // clearAuthToken();
        }
      }
      setLoading(false);
    };

    checkAuthStatus();
  }, []);

  const login = async (email: string, password: string, role: 'user' | 'admin'): Promise<boolean> => {
    try {
      setLoading(true);
      
      if (role === 'admin') {
        // For admin, we need OTP login
        return false;
      }

      const response = await authApi.loginUser(email, password);
      
      if (response.success && response.token && response.user) {
        setAuthToken(response.token);
        
        setAuthState({
          user: {
            id: response.user.id.toString(),
            name: response.user.firstName || response.user.username,
            email: response.user.email,
            role: response.user.role.toLowerCase() as 'user' | 'admin',
            trustScore: response.user.trustScore,
          },
          isAuthenticated: true,
        });

        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const requestAdminOtp = async (email: string): Promise<boolean> => {
    try {
      const response = await authApi.loginAdminOtp(email);
      return response.success;
    } catch (error) {
      console.error('OTP request error:', error);
      return false;
    }
  };

  const loginWithOtp = async (email: string, otp: string): Promise<boolean> => {
    try {
      setLoading(true);
      
      const response = await authApi.verifyOtp(email, otp);
      
      if (response.success && response.token && response.user) {
        setAuthToken(response.token);
        
        setAuthState({
          user: {
            id: response.user.id.toString(),
            name: response.user.firstName || response.user.username,
            email: response.user.email,
            role: response.user.role.toLowerCase() as 'user' | 'admin',
            trustScore: response.user.trustScore,
          },
          isAuthenticated: true,
        });

        return true;
      }
      
      return false;
    } catch (error) {
      console.error('OTP login error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    clearAuthToken();
    setAuthState({
      user: null,
      isAuthenticated: false,
    });
  };

  return (
    <AuthContext.Provider value={{ 
      user: authState.user,
      isAuthenticated: authState.isAuthenticated,
      login,
      loginWithOtp,
      requestAdminOtp,
      logout,
      loading,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
