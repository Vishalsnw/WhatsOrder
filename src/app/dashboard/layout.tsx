'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useUser } from '@/hooks/useUser';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';

const navItems = [
  { label: '🏠 Dashboard', href: '/dashboard' },
  { label: '➕ Create Form', href: '/dashboard/create' },
  { label: '🧾 My Forms', href: '/dashboard/forms' },
  { label: '📥 Orders', href: '/dashboard/orders' },
  { label: '📊 Analytics', href: '/dashboard/analytics' },
  { label: '👤 Profile', href: '/dashboard/profile' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useUser();
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleDrawer = () => setMobileOpen(!mobileOpen);
  const closeDrawer = () => setMobileOpen(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar - Desktop */}
      <aside className="w-64 hidden md:block bg-white border-r p-5 shadow-sm">
        <SidebarContent pathname={pathname} user={user} handleLogout={handleLogout} />
      </aside>

      {/* Sidebar - Mobile Drawer */}
      <div className="md:hidden">
        <button
          onClick={toggleDrawer}
          className="fixed top-3 left-3 z-50 bg-white border rounded-md p-2 shadow"
        >
          ☰
        </button>

        {/* Overlay */}
        {mobileOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-40 z-40"
            onClick={closeDrawer}
          />
        )}

        {/* Drawer */}
        <div
          className={`fixed top-0 left-0 z-50 w-64 h-full bg-white shadow-lg transform transition-transform duration-300 ${
            mobileOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <SidebarContent
            pathname={pathname}
            user={user}
            handleLogout={handleLogout}
          />
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-4">{children}</main>
    </div>
  );
}

function SidebarContent({
  pathname,
  user,
  handleLogout,
}: {
  pathname: string;
  user: any;
  handleLogout: () => void;
}) {
  return (
    <div className="h-full flex flex-col justify-between space-y-6">
      <div>
        <h2 className="text-xl font-bold text-indigo-700 mb-4">📋 WhatsOrder</h2>
        <nav className="space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-3 py-2 rounded-md font-medium ${
                pathname === item.href
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => {
                if (typeof window !== 'undefined') window.scrollTo(0, 0);
              }}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="border-t pt-4">
        <p className="text-xs text-gray-500 mb-1">Logged in as</p>
        <p className="text-sm font-semibold mb-2">
          {user?.phoneNumber || 'Guest'}
        </p>
        <button
          onClick={handleLogout}
          className="text-sm text-red-600 hover:underline"
        >
          🚪 Logout
        </button>
      </div>
    </div>
  );
      }
