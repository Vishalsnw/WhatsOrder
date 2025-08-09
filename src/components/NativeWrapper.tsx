
'use client';

import { useEffect, ReactNode } from 'react';
import { useNativeFeatures } from '@/hooks/useNativeFeatures';

interface NativeWrapperProps {
  children: ReactNode;
}

export default function NativeWrapper({ children }: NativeWrapperProps) {
  const { isNative, networkStatus } = useNativeFeatures();

  useEffect(() => {
    // Handle share intents
    if (typeof window !== 'undefined') {
      (window as any).handleShareIntent = (sharedText: string) => {
        console.log('Received shared text:', sharedText);
        // Handle shared content here
      };
    }

    // Handle back button on Android
    const handleBackButton = () => {
      if (window.history.length > 1) {
        window.history.back();
      } else {
        // Close app if no history
        if (isNative) {
          // @ts-ignore
          navigator.app?.exitApp();
        }
      }
    };

    if (isNative) {
      document.addEventListener('backbutton', handleBackButton, false);
    }

    return () => {
      if (isNative) {
        document.removeEventListener('backbutton', handleBackButton, false);
      }
    };
  }, [isNative]);

  // Show offline indicator when network is down
  const showOfflineIndicator = networkStatus && !networkStatus.connected;

  return (
    <div className="native-app-wrapper">
      {showOfflineIndicator && (
        <div className="fixed top-0 left-0 right-0 bg-red-500 text-white text-center py-2 z-50">
          You are offline. Some features may not work.
        </div>
      )}
      <div className={showOfflineIndicator ? 'pt-12' : ''}>
        {children}
      </div>
    </div>
  );
}
