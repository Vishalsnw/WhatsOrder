'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useUser } from '@/hooks/useUser';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: '📊' },
  { label: 'Create Form', href: '/dashboard/create', icon: '✨' },
  { label: 'My Forms', href: '/my-forms', icon: '📋' },
  { label: 'Orders', href: '/dashboard/orders', icon: '🛒' },
  { label: 'Analytics', href: '/dashboard/analytics', icon: '📈' },
  { label: 'Profile', href: '/dashboard/profile', icon: '👤' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useUser();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  const toggleDrawer = () => setMobileOpen(!mobileOpen);
  const closeDrawer = () => setMobileOpen(false);

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Sidebar - Desktop */}
      <aside className="w-72 hidden lg:block bg-white/90 backdrop-blur-sm border-r border-gray-200 shadow-xl">
        <SidebarContent
          pathname={pathname}
          user={user}
          handleLogout={handleLogout}
          onNavigate={() => {}}
        />
      </aside>

      {/* Sidebar - Mobile */}
      <div className="lg:hidden">
        <button
          onClick={toggleDrawer}
          className="fixed top-4 left-4 z-50 p-3 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 text-gray-700 hover:bg-white transition-all duration-200"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {mobileOpen && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={closeDrawer}
          />
        )}

        <div
          className={`fixed top-0 left-0 z-50 w-80 h-full bg-white/95 backdrop-blur-md shadow-2xl transform transition-transform duration-300 border-r border-gray-200 ${
            mobileOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <SidebarContent
            pathname={pathname}
            user={user}
            handleLogout={handleLogout}
            onNavigate={closeDrawer}
          />
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-6 lg:p-8 w-full overflow-auto">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}

function SidebarContent({
  pathname,
  user,
  handleLogout,
  onNavigate,
}: {
  pathname: string;
  user: any;
  handleLogout: () => void;
  onNavigate: () => void;
}) {
  return (
    <div className="h-full flex flex-col p-6">
      <div className="flex-1">
        {/* Brand Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">W</span>
            </div>
            <div>
              <h2 className="text-xl font-bold gradient-text">WhatsOrder</h2>
              <p className="text-xs text-gray-500">Professional Edition</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                pathname === item.href
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
              }`}
              onClick={() => {
                if (typeof window !== 'undefined') window.scrollTo(0, 0);
                onNavigate();
              }}
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
              {pathname === item.href && (
                <div className="ml-auto w-2 h-2 bg-white rounded-full"></div>
              )}
            </Link>
          ))}
        </nav>
      </div>

      {/* User Profile Section */}
      <div className="border-t border-gray-200 pt-6 mt-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold text-sm">
              {(user?.displayName || user?.phoneNumber || 'U').charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {user?.displayName || 'Business Owner'}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {user?.phoneNumber || 'Professional Plan'}
            </p>
          </div>
        </div>
        
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors duration-200"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}
