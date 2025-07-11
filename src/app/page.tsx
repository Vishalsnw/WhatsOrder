
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/hooks/useUser';

export default function HomePage() {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.push('/dashboard');
      }
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800">
      {/* Hero Section */}
      <div className="container mx-auto px-6 py-20">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            WhatsOrder
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Create beautiful order forms for your business and receive orders directly on WhatsApp
          </p>
          <div className="space-x-4">
            <button
              onClick={() => router.push('/login')}
              className="bg-white text-blue-600 px-8 py-3 rounded-full font-semibold hover:bg-blue-50 transition-colors"
            >
              Get Started
            </button>
            <button
              onClick={() => router.push('/login')}
              className="border-2 border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white hover:text-blue-600 transition-colors"
            >
              Login
            </button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-20 grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⚡</span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Quick Setup</h3>
            <p className="text-blue-100">Create your order form in just a few minutes</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">💬</span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">WhatsApp Integration</h3>
            <p className="text-blue-100">Receive orders directly on your WhatsApp</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🎨</span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Customizable</h3>
            <p className="text-blue-100">Brand your forms with your logo and colors</p>
          </div>
        </div>

        {/* Demo Section */}
        <div className="mt-20 text-center">
          <h2 className="text-3xl font-bold text-white mb-8">See It In Action</h2>
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-md mx-auto">
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Sample Order Form</h3>
              <div className="space-y-3 text-left">
                <div className="flex justify-between">
                  <span className="text-gray-600">Pizza Margherita</span>
                  <span className="font-semibold">$12.99</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Chicken Burger</span>
                  <span className="font-semibold">$9.99</span>
                </div>
                <div className="border-t pt-3 flex justify-between font-bold">
                  <span>Total</span>
                  <span>$22.98</span>
                </div>
              </div>
              <button className="w-full bg-green-600 text-white py-2 rounded-lg mt-4 font-semibold">
                Order via WhatsApp
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
