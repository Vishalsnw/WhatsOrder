'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/hooks/useUser';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firestore';

interface Form {
  id: string;
  title: string;
  slug: string;
  createdAt: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading } = useUser();
  const [forms, setForms] = useState<Form[]>([]);
  const [loadingForms, setLoadingForms] = useState(true);

  // 🔐 Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // 📥 Fetch forms
  useEffect(() => {
    if (user) {
      const fetchForms = async () => {
        try {
          const q = query(
            collection(db, 'forms'),
            where('owner', '==', user.uid)
          );
          const snapshot = await getDocs(q);
          const userForms = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...(doc.data() as any),
          }));
          setForms(userForms);
        } catch (error) {
          console.error('Failed to fetch forms:', error);
        } finally {
          setLoadingForms(false);
        }
      };

      fetchForms();
    }
  }, [user]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Checking authentication...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-4xl mx-auto bg-white shadow rounded-xl p-6 space-y-6">
        {/* 👤 Profile */}
        <div className="flex items-center justify-between border-b pb-4">
          <div>
            <h1 className="text-xl font-bold text-indigo-700">
              👋 Welcome, {user.phoneNumber}
            </h1>
            <p className="text-sm text-gray-500">Manage your forms below.</p>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-200"
          >
            Logout
          </button>
        </div>

        {/* 📄 Forms */}
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-2">📋 My Forms</h2>
          {loadingForms ? (
            <p className="text-gray-500">Loading forms...</p>
          ) : forms.length === 0 ? (
            <p className="text-gray-500">No forms created yet.</p>
          ) : (
            <ul className="space-y-3">
              {forms.map((form) => (
                <li
                  key={form.id}
                  className="p-4 border border-gray-200 rounded-lg flex items-center justify-between"
                >
                  <div>
                    <h3 className="font-semibold text-gray-800">{form.title}</h3>
                    <a
                      href={`/preview/${form.slug}`}
                      className="text-sm text-green-600 underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View Form
                    </a>
                  </div>
                  <span className="text-xs text-gray-400">
                    Created: {new Date(form.createdAt).toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </main>
  );
          }
