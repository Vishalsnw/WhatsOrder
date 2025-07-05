'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@/hooks/useUser';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const { user, loading } = useUser();
  const router = useRouter();

  const [bizName, setBizName] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;

      const ref = doc(db, 'users', user.uid);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        const data = snap.data();
        setBizName(data.businessName || '');
        setPhone(data.phone || '');
      }

      setLoadingProfile(false);
    };

    if (user) {
      loadProfile();
    }
  }, [user]);

  const handleSave = async () => {
    if (!bizName.trim() || !phone.trim()) {
      alert('Please enter both name and phone number');
      return;
    }

    try {
      setSaving(true);
      const ref = doc(db, 'users', user!.uid);
      await setDoc(ref, {
        businessName: bizName.trim(),
        phone: phone.trim(),
      });
      alert('Profile saved successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading || loadingProfile) {
    return <div className="text-center mt-10 text-gray-500">Loading profile...</div>;
  }

  return (
    <div className="max-w-md mx-auto px-4 py-8 space-y-6">
      <h1 className="text-2xl font-bold text-indigo-600 text-center">👤 Profile</h1>

      <input
        type="text"
        placeholder="Business Name"
        value={bizName}
        onChange={(e) => setBizName(e.target.value)}
        className="w-full"
      />

      <input
        type="tel"
        placeholder="WhatsApp Number"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        className="w-full"
      />

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
      >
        {saving ? 'Saving...' : 'Save Profile'}
      </button>
    </div>
  );
          }
