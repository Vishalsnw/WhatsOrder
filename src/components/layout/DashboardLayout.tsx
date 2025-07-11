'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useUser } from '@/hooks/useUser';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';

const bottomNavItems = [
  { label: 'Home', href: '/dashboard', icon: '🏠', activeIcon: '🏠' },
  { label: 'Create', href: '/dashboard/create', icon: '➕', activeIcon: '✨' },
  { label: 'Forms', href: '/my-forms', icon: '📋', activeIcon: '📋' },
  { label: 'Orders', href: '/dashboard/orders', icon: '🛒', activeIcon: '🛒' },
  { label: 'Profile', href: '/dashboard/profile', icon: '👤', activeIcon: '👤' },
];

const moreItems = [
  { label: 'Analytics', href: '/dashboard/analytics', icon: '📊' },
  { label: 'Settings', href: '/dashboard/settings', icon: '⚙️' },
  { label: 'Help', href: '/dashboard/help', icon: '❓' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useUser();
  const [showMore, setShowMore] = useState(false);
  const [notifications, setNotifications] = useState(3);

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  return (
    <div className="mobile-container min-h-screen bg-gray-50 pb-16">
      {/* Android-style Status Bar */}
      <div className="system-bar"></div>

      {/* App Bar */}
      <header className="app-bar sticky top-0 z-40">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">W</span>
          </div>
          <div>
            <h1 className="material-headline6 text-gray-900">WhatsOrder</h1>
            <p className="material-caption text-gray-500">Business Dashboard</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Search Button */}
          <button className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200">
            <span className="material-icon">🔍</span>
          </button>

          {/* Notifications */}
          <button className="relative p-2 rounded-full hover:bg-gray-100 transition-colors duration-200">
            <span className="material-icon">🔔</span>
            {notifications > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {notifications}
              </span>
            )}
          </button>

          {/* More Menu */}
          <button 
            onClick={() => setShowMore(!showMore)}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
          >
            <span className="material-icon">⋮</span>
          </button>
        </div>
      </header>

      {/* More Menu Dropdown */}
      {showMore && (
        <>
          <div 
            className="fixed inset-0 z-40 bg-black/20"
            onClick={() => setShowMore(false)}
          />
          <div className="fixed top-16 right-4 z-50 material-card w-48 animate-scale-in">
            <div className="py-2">
              {moreItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="material-list-item text-gray-700 hover:bg-gray-50"
                  onClick={() => setShowMore(false)}
                >
                  <span className="mr-3">{item.icon}</span>
                  <span className="material-body2">{item.label}</span>
                </Link>
              ))}
              <hr className="my-2 border-gray-200" />
              <button
                onClick={handleLogout}
                className="w-full material-list-item text-red-600 hover:bg-red-50"
              >
                <span className="mr-3">🚪</span>
                <span className="material-body2">Sign Out</span>
              </button>
            </div>
          </div>
        </>
      )}

      {/* Main Content */}
      <main className="flex-1 p-4 pb-20">
        {children}
      </main>

      {/* Floating Action Button */}
      <div className="fab-container">
        <Link href="/dashboard/create" className="material-button-fab">
          <span className="text-xl">➕</span>
        </Link>
      </div>

      {/* Bottom Navigation */}
      <nav className="bottom-nav">
        <div className="flex">
          {bottomNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`bottom-nav-item ${isActive ? 'active' : ''}`}
              >
                <span className="text-xl mb-1">
                  {isActive ? item.activeIcon : item.icon}
                </span>
                <span className="text-xs font-medium">{item.label}</span>
                {isActive && (
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-blue-600 rounded-full"></div>
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}