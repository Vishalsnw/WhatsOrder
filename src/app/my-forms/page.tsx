'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@/hooks/useUser';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import Link from 'next/link';

interface Form {
  id: string;
  businessName: string;
  slug: string;
}

export default function MyFormsPage() {
  const { user, loading } = useUser();
  const [forms, setForms] = useState<Form[]>([]);
  const [loadingForms, setLoadingForms] = useState(true);

  useEffect(() => {
    if (!loading && user) {
      const fetchForms = async () => {
        try {
          const q = query(collection(db, 'forms'), where('uid', '==', user.uid));
          const snap = await getDocs(q);
          const result: Form[] = snap.docs.map((doc) => ({
            id: doc.id,
            businessName: doc.data().businessName,
            slug: doc.data().slug || '',
          }));
          setForms(result);
        } catch (err) {
          console.error('Error fetching forms:', err);
        } finally {
          setLoadingForms(false);
        }
      };

      fetchForms();
    }
  }, [user, loading]);

  if (loading || loadingForms) {
    return <div className="text-center mt-10 text-gray-500">Loading forms...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-4">
      <h1 className="text-2xl font-bold text-indigo-700 text-center">📄 My Forms</h1>

      {forms.length === 0 ? (
        <p className="text-center text-gray-500">No forms created yet.</p>
      ) : (
        <ul className="space-y-3">
          {forms.map((form) => (
            <li key={form.id} className="bg-white rounded-xl shadow p-4">
              <div className="text-lg font-semibold text-gray-800">{form.businessName}</div>
              <Link
                href={`/preview/${form.slug}?id=${form.id}`}
                className="text-sm text-blue-600 hover:underline"
              >
                View Form
              </Link>
              <Link
                href={`/dashboard/forms/${form.id}/edit`}
                className="ml-4 text-sm text-green-600 hover:underline"
              >
                Edit
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
          }
