'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useUser } from '@/hooks/useUser';
import { auth } from '@/lib/firebase';
import { signOut, updateProfile } from 'firebase/auth';

const navItems = [
  { label: '🏠 Dashboard', href: '/dashboard' },
  { label: '➕ Create Form', href: '/dashboard/create' },
  { label: '🧾 My Forms', href: '/my-forms' },
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

  // ✅ Close drawer when route/pathname changes
  useEffect(() => {
    closeDrawer();
  }, [pathname]);

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

        {mobileOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-40 z-40" onClick={closeDrawer} />
        )}

        <div
          className={`fixed top-0 left-0 z-50 w-64 h-full bg-white shadow-lg transform transition-transform duration-300 ${
            mobileOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <SidebarContent pathname={pathname} user={user} handleLogout={handleLogout} />
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
  const [displayName, setDisplayName] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [nameInput, setNameInput] = useState('');

  useEffect(() => {
    if (user?.displayName) {
      setDisplayName(user.displayName);
    } else if (user && !user.displayName) {
      setShowModal(true);
    }
  }, [user]);

  const saveName = async () => {
    const name = nameInput.trim();
    if (!name) return;
    try {
      await updateProfile(auth.currentUser!, { displayName: name });
      setDisplayName(name);
      setShowModal(false);
    } catch (err) {
      console.error('Failed to update name:', err);
    }
  };

  const initials = displayName
    ? displayName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'WO';

  return (
    <>
      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full space-y-4">
            <h2 className="text-lg font-semibold text-gray-800">Enter Your Name</h2>
            <input
              type="text"
              placeholder="Your full name"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              className="w-full border px-3 py-2 rounded-md"
            />
            <button
              onClick={saveName}
              className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700"
            >
              Save Name
            </button>
          </div>
        </div>
      )}

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

        <div className="border-t pt-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm font-bold">
            {initials}
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold">
              {displayName || user?.phoneNumber || 'User'}
            </p>
            <button
              onClick={handleLogout}
              className="text-xs text-red-600 hover:underline mt-1"
            >
              🚪 Logout
            </button>
          </div>
        </div>
      </div>
    </>
  );
        }
