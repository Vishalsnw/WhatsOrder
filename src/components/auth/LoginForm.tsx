'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { auth, signInAnonymouslyUser } from '@/lib/firebase';
import { db } from '@/lib/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

export default function LoginForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [loggedInUser, setLoggedInUser] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const attemptedAutoLogin = useRef(false);

  // Anonymous sign-in logic
  const triggerAnonymousLogin = useCallback(async () => {
    setErrorMsg(null);
    setLoading(true);
    try {
      const result = await signInAnonymouslyUser();
      const user = result.user;

      // Save anonymous user to Firestore (non-blocking if Firestore fails)
      try {
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          isAnonymous: true,
          createdAt: serverTimestamp(),
        }, { merge: true });
      } catch (dbErr) {
        console.warn('Could not save user record to Firestore:', dbErr);
      }

      router.push('/dashboard');
    } catch (error: any) {
      console.error('Anonymous login failed:', error);
      let msg = 'Login failed. Please check your connection or Firebase configuration.';
      
      if (error?.code === 'auth/operation-not-allowed') {
        msg = 'Firebase Anonymous Auth disabled hai! Firebase Console > Authentication > Sign-in method mein "Anonymous" enable karein.';
      } else if (error?.code === 'auth/invalid-api-key' || error?.code === 'auth/api-key-not-valid' || error?.message?.includes('api-key-not-valid')) {
        msg = 'Firebase API Key invalid hai. Vercel Project Settings > Environment Variables mein NEXT_PUBLIC_FIREBASE_API_KEY confirm karein.';
      } else if (error?.message) {
        msg = `Login error: ${error.message}`;
      }

      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  }, [router]);

  // Auto-login on load if not already logged in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setLoggedInUser(user.uid);
        router.push('/dashboard');
      } else if (!attemptedAutoLogin.current) {
        attemptedAutoLogin.current = true;
        await triggerAnonymousLogin();
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router, triggerAnonymousLogin]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-md w-full">
        <div className="material-card p-6 md:p-8 text-center">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl">📱</span>
          </div>

          <h1 className="material-headline5 text-gray-900 mb-2">Welcome to WhatsOrder</h1>
          <p className="material-body2 text-gray-600 mb-6">
            Create beautiful order forms for your business
          </p>

          {errorMsg && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-left text-sm text-red-700 space-y-1">
              <p className="font-semibold text-red-800 flex items-center">
                <span className="mr-2">⚠️</span> Authentication Notice
              </p>
              <p>{errorMsg}</p>
            </div>
          )}

          {loggedInUser ? (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 rounded-xl">
                <p className="material-subtitle2 text-green-800">Already logged in</p>
                <p className="material-caption text-green-600">Redirecting to dashboard...</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <button
                onClick={triggerAnonymousLogin}
                disabled={loading}
                className="w-full material-button material-button-primary py-3"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin">⏳</span>
                    Logging in automatically...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <span>🚀</span>
                    Get Started / Retry Login
                  </span>
                )}
              </button>

              <p className="material-caption text-gray-500 pt-2">
                No signup required. Instant guest access.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}