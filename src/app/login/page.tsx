'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInAnonymously } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAnonymousLogin = async () => {
    try {
      setLoading(true);
      await signInAnonymously(auth);
      router.push('/dashboard');
    } catch (err) {
      console.error('Login failed:', err);
      alert('Something went wrong during login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-200 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-indigo-700">📋 WhatsOrder</h1>
          <p className="text-sm text-gray-500 mt-1">Create and Share Order Forms Instantly</p>
        </div>

        <button
          onClick={handleAnonymousLogin}
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 font-semibold transition"
        >
          {loading ? 'Logging in...' : 'Continue as Guest'}
        </button>

        <p className="text-xs text-center text-gray-400">
          By continuing, you accept our Terms and Privacy Policy.
        </p>
      </div>
    </main>
  );
}
