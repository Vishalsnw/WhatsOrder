
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import LoginForm from '@/components/auth/LoginForm';

export default function LoginPage() {
  const router = useRouter();
  const [showDemo, setShowDemo] = useState(false);

  return (
    <div className="mobile-container min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800">
      {/* Android-style Status Bar */}
      <div className="system-bar bg-blue-900"></div>

      {/* Hero Section */}
      <div className="px-6 pt-12 pb-8 text-center">
        <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-3xl">📱</span>
        </div>
        <h1 className="material-headline3 text-white mb-2">WhatsOrder</h1>
        <p className="material-subtitle1 text-blue-100">Your business, simplified</p>
        <p className="material-body2 text-blue-200 mt-2">Create beautiful order forms and grow your business with WhatsApp integration</p>
      </div>

      {/* Login Card */}
      <div className="px-4 pb-8">
        <div className="material-card p-6 animate-slide-in-bottom">
          <div className="text-center mb-6">
            <h2 className="material-headline5 text-gray-900 mb-2">Welcome Back</h2>
            <p className="material-body2 text-gray-600">Sign in to continue to your dashboard</p>
          </div>

          <LoginForm />

          {/* Demo Button */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <button
              onClick={() => setShowDemo(true)}
              className="w-full material-button material-button-secondary"
            >
              <span className="mr-2">👀</span>
              View Demo
            </button>
          </div>
        </div>

        {/* Features */}
        <div className="mt-8 space-y-4">
          <div className="flex items-center space-x-4 text-white/90">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <span>⚡</span>
            </div>
            <div>
              <p className="material-subtitle2">Quick Setup</p>
              <p className="material-caption text-blue-200">Create forms in minutes</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 text-white/90">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <span>💬</span>
            </div>
            <div>
              <p className="material-subtitle2">WhatsApp Integration</p>
              <p className="material-caption text-blue-200">Direct customer communication</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 text-white/90">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <span>📊</span>
            </div>
            <div>
              <p className="material-subtitle2">Analytics</p>
              <p className="material-caption text-blue-200">Track your business growth</p>
            </div>
          </div>
        </div>
      </div>

      {/* Demo Modal */}
      {showDemo && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="material-card max-w-sm w-full p-6 animate-scale-in">
            <h3 className="material-headline6 text-gray-900 mb-4">Demo Mode</h3>
            <p className="material-body2 text-gray-700 mb-6">
              Experience WhatsOrder with sample data. Perfect for exploring features without creating an account.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => router.push('/dashboard')}
                className="flex-1 material-button material-button-primary"
              >
                Try Demo
              </button>
              <button
                onClick={() => setShowDemo(false)}
                className="flex-1 material-button material-button-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
