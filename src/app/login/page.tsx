'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { signInWithPhoneNumber, RecaptchaVerifier } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    if (auth.currentUser) {
      router.push('/dashboard');
    }
  }, []);

  const handleLogin = async () => {
    const phoneNumber = prompt('Enter your phone number (with country code):');
    if (!phoneNumber) return;

    const appVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
      size: 'invisible',
    });

    try {
      const confirmation = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
      const code = prompt('Enter OTP:');
      if (code) {
        await confirmation.confirm(code);
        alert('Login successful');
        router.push('/dashboard');
      }
    } catch (err) {
      console.error(err);
      alert('Login failed');
    }
  };

  return (
    <div className="h-screen flex items-center justify-center">
      <button
        onClick={handleLogin}
        className="bg-indigo-600 text-white px-6 py-2 rounded-lg shadow"
      >
        Login with Phone
      </button>
      <div id="recaptcha-container"></div>
    </div>
  );
  }
