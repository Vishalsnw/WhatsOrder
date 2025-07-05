'use client';

import { useEffect, useState } from 'react';

export default function SplashScreen({ onFinish }: { onFinish: () => void }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onFinish();
    }, 4000); // Show for 4 seconds

    return () => clearTimeout(timer);
  }, [onFinish]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 bg-white flex items-center justify-center">
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
