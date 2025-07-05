'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUser } from '@/hooks/useUser';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

const navItems = [
  { label: '🏠 Dashboard', href: '/dashboard' },
  { label: '➕ Create Form', href: '/dashboard/create' },
  { label: '🧾 My Forms', href: '/dashboard/forms' },
  { label: '📥 Orders', href: '/dashboard/orders' },
  { label: '📊 Analytics', href: '/dashboard/analytics' },
  { label: '👤 Profile', href: '/dashboard/profile' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useUser();
  const router = useRouter();

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
              className={`block px-3 py-2 rounded-md font-medium ${
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

      <div className="pt-6 border-t">
        <p className="text-xs text-gray-500 mb-1">Logged in as</p>
        <p className="text-sm font-semibold truncate">{user?.phoneNumber || 'Guest'}</p>
        <button
          onClick={handleLogout}
          className="mt-2 text-sm text-red-600 hover:underline"
        >
          🚪 Logout
        </button>
      </div>
    </aside>
  );
          }
