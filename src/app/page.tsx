'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/hooks/useUser';

export default function HomePage() {
  const { user, loading } = useUser();
  const router = useRouter();

  // 👇 Redirect logic
  useEffect(() => {
    if (!loading) {
      if (user) {
        router.push('/dashboard'); // User is logged in → Dashboard
      } else {
        router.push('/login'); // Not logged in → Login
      }
    }
  }, [user, loading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center text-gray-500">
      Loading...
    </div>
  );
}
