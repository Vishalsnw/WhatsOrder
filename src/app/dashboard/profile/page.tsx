'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/hooks/useUser';
import { updateProfile } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import DashboardLayout from '@/components/layout/DashboardLayout';

export default function ProfilePage() {
  const { user, loading } = useUser();
  const router = useRouter();
  const [displayName, setDisplayName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [businessPhone, setBusinessPhone] = useState('');
  const [businessAddress, setBusinessAddress] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push('/login');
      return;
    }

    // Load existing profile data
    setDisplayName(user.displayName || '');
    setBusinessPhone(user.phoneNumber || '');
  }, [user, loading, router]);

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      await updateProfile(user, {
        displayName: displayName
      });

      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage('Error updating profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !user) {
    return (
      <DashboardLayout>
        <div className="space-y-4 animate-pulse">
          <div className="skeleton h-8 w-48"></div>
          <div className="skeleton h-64 rounded-2xl"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="material-card p-6 bg-gradient-to-r from-teal-600 to-teal-700 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="material-headline5 text-white">Profile</h1>
              <p className="material-subtitle1 text-teal-100">
                Manage your account settings
              </p>
            </div>
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-2xl">👤</span>
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <div className="material-card p-6 space-y-6">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl text-white">
                {displayName ? displayName.charAt(0).toUpperCase() : user.phoneNumber?.charAt(1) || '?'}
              </span>
            </div>
            <h2 className="material-headline6">{displayName || 'User'}</h2>
            <p className="material-caption text-gray-600">{user.phoneNumber}</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="material-label">Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="material-input"
                placeholder="Enter your name"
              />
            </div>

            <div>
              <label className="material-label">Business Name</label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="material-input"
                placeholder="Enter your business name"
              />
            </div>

            <div>
              <label className="material-label">Business Phone</label>
              <input
                type="tel"
                value={businessPhone}
                onChange={(e) => setBusinessPhone(e.target.value)}
                className="material-input"
                placeholder="Enter business phone number"
              />
            </div>

            <div>
              <label className="material-label">Business Address</label>
              <textarea
                value={businessAddress}
                onChange={(e) => setBusinessAddress(e.target.value)}
                className="material-input min-h-[100px]"
                placeholder="Enter your business address"
              />
            </div>
          </div>

          {message && (
            <div className={`p-4 rounded-xl ${
              message.includes('successfully') 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {message}
            </div>
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            className="material-button material-button-primary w-full"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

        {/* Account Settings */}
        <div className="material-card p-6 space-y-4">
          <h3 className="material-headline6">Account Settings</h3>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <div>
                <p className="material-subtitle2 text-gray-900">Phone Number</p>
                <p className="material-caption text-gray-600">Your verified phone number</p>
              </div>
              <p className="material-body2 text-gray-900">{user.phoneNumber}</p>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <div>
                <p className="material-subtitle2 text-gray-900">Account Created</p>
                <p className="material-caption text-gray-600">Member since</p>
              </div>
              <p className="material-body2 text-gray-900">
                {user.metadata.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="material-card p-6 border-l-4 border-red-500">
          <h3 className="material-headline6 text-red-600 mb-2">Danger Zone</h3>
          <p className="material-body2 text-gray-600 mb-4">
            These actions cannot be undone. Please be careful.
          </p>
          <button className="material-button bg-red-600 text-white hover:bg-red-700">
            Delete Account
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}