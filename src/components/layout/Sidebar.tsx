'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useUser } from '@/hooks/useUser';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';

const navItems = [
  { label: '🏠 Dashboard', href: '/dashboard' },
  { label: '➕ Create Form', href: '/dashboard/create' },
  { label: '🧾 My Forms', href: '/my-forms' }, // ✅ Fixed path
  { label: '📥 Orders', href: '/dashboard/orders' },
  { label: '📊 Analytics', href: '/dashboard/analytics' },
  { label: '👤 Profile', href: '/dashboard/profile' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useUser();

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  return (
    <aside className="w-full h-full flex flex-col justify-between px-5 py-6 bg-white border-r shadow-sm">
      <div>
        <h1 className="text-xl font-bold text-indigo-700 mb-6">📋 WhatsOrder</h1>

        <nav className="space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-3 py-2 rounded-md font-medium transition-colors ${
                pathname === item.href
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      {user?.uid && (
        <div className="pt-6 border-t">
          <p className="text-xs text-gray-500 mb-1">Logged in as</p>
          <p className="text-sm font-semibold truncate">
            {user.displayName || user.phoneNumber || 'User'}
          </p>
          <button
            onClick={handleLogout}
            className="mt-2 text-sm text-red-600 hover:underline"
          >
            🚪 Logout
          </button>
        </div>
      )}
    </aside>
  );
}
