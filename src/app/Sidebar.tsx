// src/components/layout/Sidebar.tsx

'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function Sidebar() {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex">
      <button
        onClick={() => setOpen(!open)}
        className="p-2 bg-blue-500 text-white"
      >
        {open ? 'Close' : 'Open'} Sidebar
      </button>

      <aside
        className={`transition-all duration-300 ${
          open ? 'w-64' : 'w-0'
        } overflow-hidden bg-gray-100 h-screen`}
      >
        <nav className="p-4 space-y-2">
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/profile">Profile</Link>
        </nav>
      </aside>
    </div>
  );
}
