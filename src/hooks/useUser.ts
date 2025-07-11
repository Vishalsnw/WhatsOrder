import { useAuth } from '@/context/AuthContext';

/**
 * Custom hook to access authenticated user and loading state
 */
export const useUser = () => {
  const context = useAuth();

  if (!context) {
    throw new Error('useUser must be used within an AuthProvider');
  }

  const { user, loading } = context;
  return { user, loading };
};