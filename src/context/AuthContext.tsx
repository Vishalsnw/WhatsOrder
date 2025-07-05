'use client';

import {
  onAuthStateChanged,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  signOut,
  User,
} from 'firebase/auth';
import { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '@/lib/firebase';

// Define the shape of AuthContext
interface AuthContextProps {
  user: User | null;
  loading: boolean;
  signInWithPhone: (phone: string, appVerifier: RecaptchaVerifier) => Promise<any>;
  logout: () => Promise<void>;
}

// Create Context
const AuthContext = createContext<AuthContextProps | undefined>(undefined);

// Provider component
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithPhone = async (phone: string, appVerifier: RecaptchaVerifier) => {
    return signInWithPhoneNumber(auth, phone, appVerifier);
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithPhone, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
