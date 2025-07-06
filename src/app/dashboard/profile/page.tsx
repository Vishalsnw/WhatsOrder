'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@/hooks/useUser';
import { db } from '@/lib/firestore';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, loading } = useUser();
  const router = useRouter();

  const [bizName, setBizName] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // 🔐 Redirect unauthenticated users
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // 📥 Load existing profile
  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;

      try {
        const ref = doc(db, 'users', user.uid);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          const data = snap.data();
          setBizName(data.businessName || '');
          setPhone(data.phone || '');
        }
      } catch (err) {
        console.error('Failed to load profile:', err);
        toast.error('Failed to load profile.');
      } finally {
        setLoadingProfile(false);
      }
    };

    if (user) {
      loadProfile();
    }
  }, [user]);

  // 💾 Save profile
  const handleSave = async () => {
    if (!bizName.trim() || !phone.trim()) {
      toast.error('Please enter both business name and WhatsApp number.');
      return;
    }

    try {
      setSaving(true);
      const ref = doc(db, 'users', user!.uid);
      await setDoc(ref, {
        businessName: bizName.trim(),
        phone: phone.trim(),
      });
      toast.success('✅ Profile saved successfully!');
    } catch (err) {
      console.error('Error saving profile:', err);
      toast.error('❌ Failed to save profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading || loadingProfile) {
    return (
      <div className="text-center mt-10 text-gray-500">Loading profile...</div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-8 space-y-6">
      <h1 className="text-2xl font-bold text-indigo-600 text-center">👤 Profile</h1>

      <input
        type="text"
        placeholder="Business Name"
        value={bizName}
        onChange={(e) => setBizName(e.target.value)}
        className="w-full border rounded px-3 py-2"
      />

      <input
        type="tel"
        placeholder="WhatsApp Number"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        className="w-full border rounded px-3 py-2"
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
