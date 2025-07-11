'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth, signInAnonymouslyUser } from '@/lib/firebase';
import { db } from '@/lib/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

export default function LoginForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState<string | null>(null);

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
    try {
      setLoading(true);
      const result = await signInAnonymouslyUser();
      const user = result.user;

      // Save anonymous user to Firestore
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        isAnonymous: true,
        createdAt: serverTimestamp(),
      });

      router.push('/dashboard');
    } catch (error) {
      console.error('Anonymous login failed:', error);
      alert('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full mx-4">
        <div className="material-card p-8 text-center">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl">📱</span>
          </div>

          <h1 className="material-headline5 text-gray-900 mb-2">Welcome to WhatsOrder</h1>
          <p className="material-body2 text-gray-600 mb-8">
            Create beautiful order forms for your business
          </p>

          {loggedInUser ? (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 rounded-xl">
                <p className="material-subtitle2 text-green-800">Already logged in</p>
                <p className="material-caption text-green-600">Redirecting to dashboard...</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <button
                onClick={handleAnonymousLogin}
                disabled={loading}
                className="w-full material-button material-button-primary"
              >
                {loading ? (
                  <>
                    <span className="mr-2">⏳</span>
                    Getting Started...
                  </>
                ) : (
                  <>
                    <span className="mr-2">🚀</span>
                    Get Started
                  </>
                )}
              </button>

              <p className="material-caption text-gray-500">
                No signup required. Start creating forms instantly.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}