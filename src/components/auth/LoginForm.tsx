'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
  onAuthStateChanged,
} from 'firebase/auth';

export default function LoginForm() {
  const router = useRouter();

  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'enter-phone' | 'verify-otp'>('enter-phone');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState<string | null>(null);

  // 🔍 Check if user already logged in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setLoggedInUser(user.phoneNumber || null);
        router.push('/'); // ✅ Redirect to homepage
      }
    });

    return () => unsubscribe();
  }, [router]);

  const sendOTP = async () => {
    if (!phone || phone.length < 10) {
      alert('Please enter a valid phone number');
      return;
    }

    try {
      setLoading(true);
      const recaptcha = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: () => {},
      });

      const fullPhone = phone.startsWith('+') ? phone : `+${phone}`;
      const confirmation = await signInWithPhoneNumber(auth, fullPhone, recaptcha);
      setConfirmationResult(confirmation);
      setStep('verify-otp');
    } catch (err) {
      console.error('OTP Error:', err);
      alert('Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async () => {
    if (!otp || !confirmationResult) return;

    try {
      setLoading(true);
      const result = await confirmationResult.confirm(otp);
      const user = result.user;
      alert(`Welcome! Logged in as ${user.phoneNumber}`);
      router.push('/'); // ✅ Redirect to homepage
    } catch (err) {
      console.error('OTP Verification Failed:', err);
      alert('Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto mt-10 bg-white p-6 rounded-xl shadow-lg space-y-4">
      <h2 className="text-xl font-bold text-center text-indigo-700">📲 Login with Phone</h2>

      {loggedInUser ? (
        <p className="text-center text-green-600">Already logged in as {loggedInUser}</p>
      ) : (
        <>
          {step === 'enter-phone' ? (
            <>
              <input
                type="tel"
                placeholder="Enter phone (e.g. +91XXXXXXXXXX)"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full"
              />
              <button
                onClick={sendOTP}
                disabled={loading}
                className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700"
              >
                {loading ? 'Sending OTP...' : 'Send OTP'}
              </button>
            </>
          ) : (
            <>
              <input
                type="text"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full"
              />
              <button
                onClick={verifyOTP}
                disabled={loading}
                className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
              >
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>
            </>
          )}
        </>
      )}

      {/* 🔒 Hidden ReCAPTCHA */}
      <div id="recaptcha-container"></div>
    </div>
  );
  }
