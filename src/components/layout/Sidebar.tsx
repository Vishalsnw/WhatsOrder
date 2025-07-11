
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useUser } from '@/hooks/useUser';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
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

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
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
                onClick={onClose}
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

        {user && (
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-semibold text-blue-600">
                  {user.displayName?.charAt(0) || user.phoneNumber?.charAt(1) || '?'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="material-subtitle2 text-gray-900 truncate">
                  {user.displayName || 'User'}
                </p>
                <p className="material-caption text-gray-600 truncate">
                  {user.phoneNumber}
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
        )}
      </aside>
    </>
  );
}
