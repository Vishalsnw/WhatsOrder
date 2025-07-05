import { useAuth } from '@/context/AuthContext';

/**
 * Custom hook to access authenticated user and loading state
 */
export const useUser = () => {
  const { user, loading } = useAuth();
  return { user, loading };
};
