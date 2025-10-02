import React, { createContext, useContext, useState, ReactNode } from 'react';

export type UserRole = 'influencer' | 'provider' | 'admin' | null;
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  bio?: string;
  interests?: string;
  skills?: string;
  location?: string;
  experience?: string;
  socials?: string;
  services?: string;
  createdAt?: string;
}

interface AuthContextType {
  user: User | null;
  login: (role: UserRole, name?: string, email?: string) => void;
  logout: () => void;
  setUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = (role: UserRole, name?: string, email?: string, createdAt?: string) => {
    setUser(prev => ({
      ...prev,
      id: prev?.id || '1',
      name: name || prev?.name || (role === 'admin' ? 'Admin' : role === 'influencer' ? 'Influencer User' : 'Provider User'),
      email: email || prev?.email || `${role}@onefame.com`,
      role,
      createdAt: createdAt || prev?.createdAt || new Date().toISOString(),
      bio: prev?.bio,
      interests: prev?.interests,
      skills: prev?.skills,
      location: prev?.location,
      experience: prev?.experience,
      socials: prev?.socials,
      services: prev?.services,
    }));
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
