'use client';

import { useState } from 'react';
import { auth } from '@/lib/firebase';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  const router = useRouter();

  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: () => {},
      });
    }
  };

  const handleSendOTP = async () => {
    const formatted = phone.startsWith('+') ? phone : `+91${phone}`;

    if (!/^\+\d{10,15}$/.test(formatted)) {
      alert('Please enter a valid phone number (e.g., +919876543210)');
      return;
    }

    try {
      setLoading(true);
      setupRecaptcha();
      const appVerifier = window.recaptchaVerifier;
      const result = await signInWithPhoneNumber(auth, formatted, appVerifier);
      setConfirmationResult(result);
      setStep(2);
    } catch (err) {
      console.error(err);
      alert('Failed to send OTP. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp) return;

    try {
      setLoading(true);
      await confirmationResult.confirm(otp);
      router.push('/dashboard');
    } catch (err) {
      console.error(err);
      alert('Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-100 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 space-y-6">
        <div className="text-center">
          <div className="text-3xl font-bold text-indigo-700">📋 WhatsOrder</div>
          <p className="text-sm text-gray-500 mt-1">Easy Order Form Builder</p>
        </div>

        {step === 1 ? (
          <>
            <div>
              <label className="text-sm font-medium text-gray-700">Phone Number</label>
              <input
                type="tel"
                placeholder="e.g. 9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <button
              onClick={handleSendOTP}
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 font-semibold"
            >
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </button>
          </>
        ) : (
          <>
            <div>
              <label className="text-sm font-medium text-gray-700">Enter OTP</label>
              <input
                type="text"
                placeholder="6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <button
              onClick={handleVerifyOTP}
              disabled={loading}
              className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 font-semibold"
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
          </>
        )}

        <div id="recaptcha-container"></div>

        <p className="text-xs text-center text-gray-400">
          By continuing, you agree to our Terms and Privacy Policy.
        </p>
      </div>
    </main>
  );
                                                                             }
