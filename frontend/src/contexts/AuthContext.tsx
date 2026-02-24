import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthAPI } from '../lib/api';

export type UserRole = 'doctor' | 'patient';

export interface User {
  id: string;
  name: string;
  email: string;
  mobile: string;
  role: UserRole;
  createdAt?: string;
  lastLogin?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  doctorLogin: (email: string, password: string) => Promise<void>;
  doctorRegister: (data: DoctorRegisterData) => Promise<void>;
  sendOtp: (mobile: string) => Promise<any>;
  verifyOtp: (mobile: string, otp: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (profileData: Partial<User>) => Promise<void>;
  isAuthenticated: boolean;
  forceUpdate: number;
}

interface DoctorRegisterData {
  name: string;
  email: string;
  mobile: string;
  password: string;
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
      await AuthAPI.logout();
    } finally {
      setLoading(false);
    }
  };

  const doctorLogin = async (email: string, password: string) => {
    try {
      const response = await AuthAPI.doctorLogin(email, password);

      if (response.success) {
        setUser(response.data.user);
        setForceUpdate(prev => prev + 1);
        await new Promise(resolve => setTimeout(resolve, 100));
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error: any) {
      if (error.message?.includes('Failed to fetch') || error.message?.includes('Network error')) {
        throw new Error('Unable to connect to server. Please check if the server is running and try again.');
      }
      throw new Error(error.message || 'Login failed. Please try again.');
    }
  };

  const doctorRegister = async (data: DoctorRegisterData) => {
    try {
      const response = await AuthAPI.doctorRegister(data);

      if (response.success) {
        setUser(response.data.user);
        setForceUpdate(prev => prev + 1);
        await new Promise(resolve => setTimeout(resolve, 100));
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error: any) {
      if (error.message?.includes('Failed to fetch') || error.message?.includes('Network error')) {
        throw new Error('Unable to connect to server. Please check if the server is running and try again.');
      }
      throw new Error(error.message || 'Registration failed. Please try again.');
    }
  };

  const sendOtp = async (mobile: string) => {
    try {
      const response = await AuthAPI.sendOtp(mobile);

      if (!response.success) {
        throw new Error(response.message || 'Failed to send OTP');
      }

      return response;
    } catch (error: any) {
      if (error.message?.includes('Failed to fetch') || error.message?.includes('Network error')) {
        throw new Error('Unable to connect to server. Please check if the server is running.');
      }
      throw new Error(error.message || 'Failed to send OTP. Please try again.');
    }
  };

  const verifyOtp = async (mobile: string, otp: string) => {
    try {
      const response = await AuthAPI.verifyOtp(mobile, otp);

      if (response.success) {
        setUser(response.data.user);
        setForceUpdate(prev => prev + 1);
        await new Promise(resolve => setTimeout(resolve, 100));
      } else {
        throw new Error(response.message || 'OTP verification failed');
      }
    } catch (error: any) {
      if (error.message?.includes('Failed to fetch') || error.message?.includes('Network error')) {
        throw new Error('Unable to connect to server. Please check if the server is running.');
      }
      throw new Error(error.message || 'OTP verification failed. Please try again.');
    }
  };

  const logout = async () => {
    try {
      await AuthAPI.logout();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
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
      doctorLogin,
      doctorRegister,
      sendOtp,
      verifyOtp,
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