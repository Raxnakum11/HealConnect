import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthAPI } from '../lib/api';

export type UserRole = 'doctor' | 'patient';

export interface User {
  id: string;
  name: string;
  email: string;
  mobile: string;
  role: UserRole;
  specialization?: string;
  licenseNumber?: string;
  createdAt?: string;
  lastLogin?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (mobileOrEmail: string, nameOrPassword: string, role?: UserRole, isEmailLogin?: boolean) => Promise<void>;
  register: (registerData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (profileData: Partial<User>) => Promise<void>;
  isAuthenticated: boolean;
  forceUpdate: number;
}

interface RegisterData {
  name: string;
  email: string;
  mobile: string;
  password: string;
  role: UserRole;
  specialization?: string;
  licenseNumber?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [forceUpdate, setForceUpdate] = useState(0);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      if (AuthAPI.isAuthenticated()) {
        const response = await AuthAPI.getCurrentUser();
        if (response.success) {
          setUser(response.data.user);
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      // Token might be expired, clear it
      await AuthAPI.logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (mobileOrEmail: string, nameOrPassword: string, role: UserRole = 'patient', isEmailLogin: boolean = false) => {
    try {
      console.log('AuthContext: Starting login process', { mobileOrEmail, isEmailLogin, role });
      
      let response;
      if (isEmailLogin) {
        // Email and password login
        response = await AuthAPI.loginWithEmail(mobileOrEmail, nameOrPassword);
      } else {
        // Mobile and name login (backward compatibility)
        response = await AuthAPI.loginWithMobile(mobileOrEmail, nameOrPassword, role);
      }
      
      console.log('AuthContext: Login response received', response);
      
      if (response.success) {
        setUser(response.data.user);
        // Force a re-render to ensure state updates
        setForceUpdate(prev => prev + 1);
        // Force a small delay to ensure state updates
        await new Promise(resolve => setTimeout(resolve, 100));
        console.log('AuthContext: Login successful, user set');
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      console.error('AuthContext: Login error:', error);
      
      // Handle different types of errors
      if (error.message?.includes('Failed to fetch') || error.message?.includes('Network error')) {
        throw new Error('Unable to connect to server. Please check if the server is running and try again.');
      } else if (error.message?.includes('expired')) {
        throw new Error('Session expired. Please try logging in again.');
      } else {
        throw new Error(error.message || 'Login failed. Please try again.');
      }
    }
  };

  const register = async (registerData: RegisterData) => {
    try {
      console.log('AuthContext: Starting registration process', { email: registerData.email, role: registerData.role });
      const response = await AuthAPI.register(registerData);
      console.log('AuthContext: Registration response received', response);
      
      if (response.success) {
        setUser(response.data.user);
        // Force a re-render to ensure state updates
        setForceUpdate(prev => prev + 1);
        // Force a small delay to ensure state updates
        await new Promise(resolve => setTimeout(resolve, 100));
        console.log('AuthContext: Registration successful, user set');
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error) {
      console.error('AuthContext: Registration error:', error);
      
      // Handle different types of errors
      if (error.message?.includes('Failed to fetch') || error.message?.includes('Network error')) {
        throw new Error('Unable to connect to server. Please check if the server is running and try again.');
      } else if (error.message?.includes('already registered')) {
        throw new Error(error.message);
      } else {
        throw new Error(error.message || 'Registration failed. Please try again.');
      }
    }
  };

  const logout = async () => {
    try {
      await AuthAPI.logout();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      // Clear user anyway
      setUser(null);
    }
  };

  const updateProfile = async (profileData: Partial<User>) => {
    try {
      const response = await AuthAPI.updateProfile(profileData);
      if (response.success) {
        setUser(response.data.user);
      } else {
        throw new Error(response.message || 'Profile update failed');
      }
    } catch (error) {
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      register,
      logout,
      updateProfile,
      isAuthenticated: !!user,
      forceUpdate
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}