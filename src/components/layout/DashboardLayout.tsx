'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useUser } from '@/hooks/useUser';
import { auth } from '@/lib/firebase';
import { signOut, updateProfile } from 'firebase/auth';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, loading } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const [showNamePrompt, setShowNamePrompt] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push('/login');
      return;
    }

    // Check if user needs to set display name
    if (!user.displayName) {
      setShowNamePrompt(true);
    }
  }, [user, loading, router]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleNameUpdate = async (name: string) => {
    if (!user || !name.trim()) return;

    try {
      await updateProfile(user, { displayName: name.trim() });
      setShowNamePrompt(false);
    } catch (error) {
      console.error('Error updating name:', error);
    }
  };

  const menuItems = [
    { href: '/dashboard', label: 'Home', icon: '🏠' },
    { href: '/dashboard/create', label: 'Create', icon: '✨' },
    { href: '/my-forms', label: 'Forms', icon: '📋' },
    { href: '/dashboard/analytics', label: 'Stats', icon: '📊' },
  ];

  const profileItems = [
    { href: '/dashboard/orders', label: 'Orders', icon: '🛒' },
    { href: '/dashboard/profile', label: 'Profile', icon: '👤' },
    { href: '/demo', label: 'Guide', icon: '🚀' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Mobile Header */}
      <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-40">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-sm font-semibold text-blue-600">
                {user.displayName?.charAt(0) || '👤'}
              </span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">WhatsOrder</h1>
              <p className="text-xs text-gray-600">
                {user.displayName || 'Anonymous User'}
              </p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="p-2 rounded-lg hover:bg-gray-100 text-red-600"
          >
            <span className="text-lg">🚪</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-6">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="grid grid-cols-4 h-16">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex flex-col items-center justify-center space-y-1 transition-colors
                  ${isActive 
                    ? 'text-blue-600 bg-blue-50' 
                    : 'text-gray-600 hover:text-gray-900'
                  }
                `}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Profile Menu - Floating Action Button */}
      <div className="fixed bottom-20 right-4 z-40">
        <div className="relative">
          <Link
            href="/dashboard/profile"
            className="w-12 h-12 bg-gray-800 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <span className="text-lg">⚙️</span>
          </Link>
        </div>
      </div>

      {/* Name Prompt Modal */}
      {showNamePrompt && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-lg">
            <h2 className="text-lg font-semibold mb-4">Welcome! What's your name?</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const name = formData.get('name') as string;
                handleNameUpdate(name);
              }}
            >
              <input
                name="name"
                type="text"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
                placeholder="Enter your name"
                required
              />
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition-colors font-semibold"
              >
                Save Name
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}