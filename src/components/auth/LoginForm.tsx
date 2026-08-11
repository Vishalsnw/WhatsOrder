'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth, signInAnonymouslyUser, signInWithGoogle } from '@/lib/firebase';
import { db } from '@/lib/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

export default function LoginForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Check for existing user login
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setLoggedInUser(user.uid);
        router.push('/dashboard');
      }
    });

    return () => unsubscribe();
  }, [router]);

  // Anonymous sign-in
  const handleAnonymousLogin = async () => {
    setErrorMsg(null);
    try {
      setLoading(true);
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
      } else if (error?.code === 'auth/invalid-api-key' || error?.code === 'auth/api-key-not-valid') {
        msg = 'Firebase API Key invalid hai. Vercel mein NEXT_PUBLIC_FIREBASE_* Environment Variables verify karein.';
      } else if (error?.message) {
        msg = `Login error: ${error.message}`;
      }

      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  // Google Sign-In
  const handleGoogleLogin = async () => {
    setErrorMsg(null);
    try {
      setGoogleLoading(true);
      const result = await signInWithGoogle();
      const user = result.user;

      try {
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          isAnonymous: false,
          createdAt: serverTimestamp(),
        }, { merge: true });
      } catch (dbErr) {
        console.warn('Could not save user record to Firestore:', dbErr);
      }

      router.push('/dashboard');
    } catch (error: any) {
      console.error('Google login failed:', error);
      if (error?.code !== 'auth/popup-closed-by-user') {
        setErrorMsg(error?.message || 'Google login failed. Please try again.');
      }
    } finally {
      setGoogleLoading(false);
    }
  };

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
                onClick={handleAnonymousLogin}
                disabled={loading || googleLoading}
                className="w-full material-button material-button-primary py-3"
              >
                {loading ? (
                  <>
                    <span className="mr-2 animate-spin">⏳</span>
                    Getting Started...
                  </>
                ) : (
                  <>
                    <span className="mr-2">🚀</span>
                    Instant Guest Login
                  </>
                )}
              </button>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500 font-medium">Or</span>
                </div>
              </div>

              <button
                onClick={handleGoogleLogin}
                disabled={loading || googleLoading}
                className="w-full flex items-center justify-center gap-2 bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 font-medium py-2.5 px-4 rounded-xl shadow-sm transition-all"
              >
                {googleLoading ? (
                  <span className="animate-spin">⏳</span>
                ) : (
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                )}
                <span>Sign in with Google</span>
              </button>

              <p className="material-caption text-gray-500 pt-2">
                No signup required for guest login. Instant access.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}