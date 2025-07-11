
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
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
    { href: '/dashboard', label: 'Dashboard', icon: '🏠' },
    { href: '/dashboard/create', label: 'Create Form', icon: '✨' },
    { href: '/my-forms', label: 'My Forms', icon: '📋' },
    { href: '/dashboard/analytics', label: 'Analytics', icon: '📊' },
    { href: '/dashboard/orders', label: 'Orders', icon: '🛒' },
    { href: '/dashboard/profile', label: 'Profile', icon: '👤' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white shadow-sm p-4 flex items-center justify-between">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg hover:bg-gray-100"
        >
          <span className="text-xl">☰</span>
        </button>
        <h1 className="material-headline6">WhatsOrder</h1>
        <button
          onClick={handleSignOut}
          className="p-2 rounded-lg hover:bg-gray-100 text-red-600"
        >
          <span className="text-lg">🚪</span>
        </button>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <div className="p-6 border-b border-gray-100">
            <h1 className="material-headline5 text-blue-600">WhatsOrder</h1>
            <p className="material-caption text-gray-600">Order Form Builder</p>
          </div>

          <nav className="p-4 space-y-2">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200
                    ${isActive 
                      ? 'bg-blue-50 text-blue-600 shadow-sm' 
                      : 'text-gray-700 hover:bg-gray-50'
                    }
                  `}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="material-subtitle2">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-semibold text-blue-600">
                  {user.displayName?.charAt(0) || '👤'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="material-subtitle2 text-gray-900 truncate">
                  {user.displayName || 'Anonymous User'}
                </p>
                <p className="material-caption text-gray-600 truncate">
                  {user.email || user.phoneNumber || 'Anonymous'}
                </p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="w-full material-button bg-red-50 text-red-600 hover:bg-red-100"
            >
              <span className="mr-2">🚪</span>
              Sign Out
            </button>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 lg:ml-0">
          <div className="p-4 lg:p-6">
            {children}
          </div>
        </main>
      </div>

      {/* Name Prompt Modal */}
      {showNamePrompt && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-lg">
            <h2 className="material-headline6 mb-4">Welcome! What's your name?</h2>
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
                className="material-input mb-4"
                placeholder="Enter your name"
                required
              />
              <button
                type="submit"
                className="material-button material-button-primary w-full"
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
