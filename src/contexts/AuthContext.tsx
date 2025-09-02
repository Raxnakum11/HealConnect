import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'doctor' | 'patient';

export interface User {
  id: string;
  mobile: string;
  role: UserRole;
  name: string;
  email?: string;
}

interface AuthContextType {
  user: User | null;
  login: (mobile: string, role: UserRole, name: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('healconnect_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = (mobile: string, role: UserRole, name: string) => {
    const newUser: User = {
      id: `${role}_${Date.now()}`,
      mobile,
      role,
      name,
    };
    setUser(newUser);
    localStorage.setItem('healconnect_user', JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('healconnect_user');
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      isAuthenticated: !!user
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