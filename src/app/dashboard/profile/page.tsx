
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/hooks/useUser';
import { updateProfile, updatePassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import DashboardLayout from '@/components/layout/DashboardLayout';

export default function ProfilePage() {
  const { user, loading } = useUser();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  
  const [profile, setProfile] = useState({
    displayName: '',
    email: '',
    phone: '',
    businessName: '',
    businessAddress: '',
    businessDescription: ''
  });

  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push('/login');
      return;
    }

    setProfile({
      displayName: user.displayName || '',
      email: user.email || '',
      phone: user.phoneNumber || '',
      businessName: '',
      businessAddress: '',
      businessDescription: ''
    });
  }, [user, loading, router]);

  const handleSaveProfile = async () => {
    if (!user) return;
    
    try {
      setIsSaving(true);
      await updateProfile(user, {
        displayName: profile.displayName,
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!user || passwords.new !== passwords.confirm) return;
    
    try {
      setIsSaving(true);
      await updatePassword(user, passwords.new);
      setShowPasswordChange(false);
      setPasswords({ current: '', new: '', confirm: '' });
    } catch (error) {
      console.error('Error changing password:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-4 animate-pulse">
          <div className="skeleton h-32 rounded-2xl"></div>
          <div className="skeleton h-48 rounded-2xl"></div>
          <div className="skeleton h-32 rounded-2xl"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="material-card p-6 bg-gradient-to-r from-teal-600 to-teal-700 text-white">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-2xl">👤</span>
            </div>
            <div>
              <h1 className="material-headline5 text-white">
                {profile.displayName || 'User Profile'}
              </h1>
              <p className="material-subtitle1 text-teal-100">
                {profile.email}
              </p>
              <p className="material-caption text-teal-200 mt-1">
                Manage your account settings
              </p>
            </div>
          </div>
        </div>

        {/* Profile Information */}
        <div className="material-card">
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="material-headline6">Profile Information</h3>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="material-button material-button-secondary"
              >
                {isEditing ? '❌ Cancel' : '✏️ Edit'}
              </button>
            </div>
          </div>

          <div className="p-4 space-y-4">
            <div>
              <label className="material-subtitle2 text-gray-700">Full Name</label>
              <input
                type="text"
                value={profile.displayName}
                onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
                disabled={!isEditing}
                className="material-input-filled mt-1"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label className="material-subtitle2 text-gray-700">Email</label>
              <input
                type="email"
                value={profile.email}
                disabled
                className="material-input-filled mt-1 bg-gray-100 cursor-not-allowed"
              />
              <p className="material-caption text-gray-500 mt-1">Email cannot be changed</p>
            </div>

            <div>
              <label className="material-subtitle2 text-gray-700">Phone Number</label>
              <input
                type="tel"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                disabled={!isEditing}
                className="material-input-filled mt-1"
                placeholder="Enter your phone number"
              />
            </div>

            <div>
              <label className="material-subtitle2 text-gray-700">Business Name</label>
              <input
                type="text"
                value={profile.businessName}
                onChange={(e) => setProfile({ ...profile, businessName: e.target.value })}
                disabled={!isEditing}
                className="material-input-filled mt-1"
                placeholder="Enter your business name"
              />
            </div>

            <div>
              <label className="material-subtitle2 text-gray-700">Business Address</label>
              <textarea
                value={profile.businessAddress}
                onChange={(e) => setProfile({ ...profile, businessAddress: e.target.value })}
                disabled={!isEditing}
                className="material-textarea mt-1"
                rows={2}
                placeholder="Enter your business address"
              />
            </div>

            <div>
              <label className="material-subtitle2 text-gray-700">Business Description</label>
              <textarea
                value={profile.businessDescription}
                onChange={(e) => setProfile({ ...profile, businessDescription: e.target.value })}
                disabled={!isEditing}
                className="material-textarea mt-1"
                rows={3}
                placeholder="Describe your business"
              />
            </div>

            {isEditing && (
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="flex-1 material-button material-button-primary"
                >
                  {isSaving ? '⏳ Saving...' : '💾 Save Changes'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Security Settings */}
        <div className="material-card">
          <div className="p-4 border-b border-gray-100">
            <h3 className="material-headline6">Security</h3>
          </div>

          <div className="p-4 space-y-4">
            <button
              onClick={() => setShowPasswordChange(true)}
              className="w-full material-list-item text-left"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span>🔒</span>
                </div>
                <div className="flex-1">
                  <p className="material-subtitle2 text-gray-900">Change Password</p>
                  <p className="material-caption text-gray-600">Update your account password</p>
                </div>
                <span className="material-icon text-gray-400">→</span>
              </div>
            </button>

            <div className="material-list-item">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <span>📱</span>
                </div>
                <div className="flex-1">
                  <p className="material-subtitle2 text-gray-900">Two-Factor Authentication</p>
                  <p className="material-caption text-gray-600">Add extra security to your account</p>
                </div>
                <div className="switch">
                  <input type="checkbox" />
                  <span className="slider"></span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Account Actions */}
        <div className="material-card">
          <div className="p-4 border-b border-gray-100">
            <h3 className="material-headline6">Account Actions</h3>
          </div>

          <div className="p-4 space-y-1">
            <button className="w-full material-list-item text-left hover:bg-blue-50">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span>📊</span>
                </div>
                <div className="flex-1">
                  <p className="material-subtitle2 text-gray-900">Export Data</p>
                  <p className="material-caption text-gray-600">Download your account data</p>
                </div>
                <span className="material-icon text-gray-400">→</span>
              </div>
            </button>

            <button className="w-full material-list-item text-left hover:bg-red-50">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <span>🗑️</span>
                </div>
                <div className="flex-1">
                  <p className="material-subtitle2 text-red-600">Delete Account</p>
                  <p className="material-caption text-gray-600">Permanently delete your account</p>
                </div>
                <span className="material-icon text-gray-400">→</span>
              </div>
            </button>
          </div>
        </div>

        {/* Password Change Modal */}
        {showPasswordChange && (
          <>
            <div 
              className="fixed inset-0 z-40 bg-black/50"
              onClick={() => setShowPasswordChange(false)}
            />
            <div className="fixed inset-x-4 top-1/2 transform -translate-y-1/2 z-50 material-card p-6 animate-scale-in">
              <h3 className="material-headline6 text-gray-900 mb-4">Change Password</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="material-subtitle2 text-gray-700">Current Password</label>
                  <input
                    type="password"
                    value={passwords.current}
                    onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                    className="material-input-filled mt-1"
                    placeholder="Enter current password"
                  />
                </div>

                <div>
                  <label className="material-subtitle2 text-gray-700">New Password</label>
                  <input
                    type="password"
                    value={passwords.new}
                    onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                    className="material-input-filled mt-1"
                    placeholder="Enter new password"
                  />
                </div>

                <div>
                  <label className="material-subtitle2 text-gray-700">Confirm New Password</label>
                  <input
                    type="password"
                    value={passwords.confirm}
                    onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                    className="material-input-filled mt-1"
                    placeholder="Confirm new password"
                  />
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowPasswordChange(false)}
                  className="flex-1 material-button material-button-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleChangePassword}
                  disabled={isSaving || passwords.new !== passwords.confirm || !passwords.new}
                  className="flex-1 material-button material-button-primary"
                >
                  {isSaving ? '⏳ Updating...' : '🔒 Update Password'}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
