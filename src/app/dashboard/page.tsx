'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/hooks/useUser';
import { signOut } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import Link from 'next/link';

interface Form {
  id: string;
  businessName: string;
  slug: string;
  createdAt?: { toDate: () => Date };
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading } = useUser();
  const [forms, setForms] = useState<Form[]>([]);
  const [loadingForms, setLoadingForms] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    const fetchForms = async () => {
      if (!user) return;
      try {
        const q = query(collection(db, 'forms'), where('owner', '==', user.uid));
        const snapshot = await getDocs(q);
        const userForms: Form[] = snapshot.docs.map((doc) => {
          const data = doc.data() as Omit<Form, 'id'>;
          return {
            ...data,
            id: doc.id,
          };
        });
        setForms(userForms);
      } catch (error) {
        console.error('❌ Failed to fetch forms:', error);
      } finally {
        setLoadingForms(false);
      }
    };

    fetchForms();
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

  const name = user.displayName || user.phoneNumber || 'User';

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-4xl mx-auto bg-white shadow rounded-xl p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-4">
          <div>
            <h1 className="text-xl font-bold text-indigo-700">👋 Welcome, {name}</h1>
            <p className="text-sm text-gray-500">Manage your order forms here.</p>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-200"
          >
            Logout
          </button>
        </div>

        {/* My Forms Section */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold text-gray-800">📋 My Forms</h2>
            <Link
              href="/my-forms"
              className="text-sm text-blue-600 underline hover:text-blue-800"
            >
              View All Forms
            </Link>
          </div>

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
                    <h3 className="font-semibold text-gray-800">{form.businessName}</h3>
                    <a
                      href={`/preview/${form.slug}`}
                      className="text-sm text-green-600 underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      🔗 View Form
                    </a>
                  </div>
                  <span className="text-xs text-gray-400">
                    Created:{' '}
                    {form.createdAt?.toDate
                      ? form.createdAt.toDate().toLocaleDateString()
                      : 'N/A'}
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
