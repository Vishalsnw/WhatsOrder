'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/hooks/useUser';

export default function HomePage() {
  const { user, loading } = useUser();
  const router = useRouter();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Wait for splash animation to finish (e.g., 4s), then run redirect logic
    const splashTimer = setTimeout(() => {
      setShowSplash(false);

      if (!loading) {
        if (user) {
          router.push('/dashboard'); // ✅ User logged in
        } else {
          router.push('/login'); // ❌ Not logged in
        }
      }
    }, 4000);

    return () => clearTimeout(splashTimer);
  }, [user, loading, router]);

  // ⏳ While splash is playing
  if (showSplash) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
        <video
          src="/splash.mp4"
          autoPlay
          muted
          playsInline
          className="h-full w-full object-cover"
        />
      </div>
    );
  }

  // ⏳ Fallback (briefly, in case splash ends before redirect)
  return (
    <div className="min-h-screen flex items-center justify-center text-gray-500">
      Loading...
    </div>
  );>
  );
}
