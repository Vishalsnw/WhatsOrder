'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firestore';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useUser } from '@/hooks/useUser';

interface FormAnalytics {
  id: string;
  title: string;
  slug: string;
  views: number;
  clicks: number;
  ordersCount: number;
}

export default function AnalyticsPage() {
  const { user, loading: authLoading } = useUser();
  const [forms, setForms] = useState<FormAnalytics[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading || !user) return;

    const fetchAnalytics = async () => {
      try {
        const q = query(collection(db, 'forms'), where('owner', '==', user.uid));
        const snapshot = await getDocs(q);

        const data: FormAnalytics[] = snapshot.docs.map((doc) => {
          const d = doc.data();
          return {
            id: doc.id,
            title: d.businessName || 'Untitled Form',
            slug: d.slug,
            views: d.views || 0,
            clicks: d.clicks || 0,
            ordersCount: d.ordersCount || 0,
          };
        });

        setForms(data);
      } catch (err) {
        console.error('❌ Error fetching analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [user, authLoading]);

  return (
    <main className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-indigo-700 mb-6">📊 Form Analytics</h1>

      {loading ? (
        <p className="text-gray-500">Loading analytics...</p>
      ) : forms.length === 0 ? (
        <p className="text-gray-500">No forms found. Create one first!</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {forms.map((form) => (
            <div key={form.id} className="bg-white shadow rounded-lg p-5 space-y-2">
              <div className="text-lg font-semibold text-gray-800">{form.title}</div>
              <p className="text-sm text-gray-500">🔗 /preview/{form.slug}</p>
              <div className="grid grid-cols-3 gap-4 text-center mt-2">
                <div>
                  <p className="text-xl font-bold text-indigo-600">{form.views}</p>
                  <p className="text-xs text-gray-500">Views</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-blue-600">{form.clicks}</p>
                  <p className="text-xs text-gray-500">WhatsApp Clicks</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-green-600">{form.ordersCount}</p>
                  <p className="text-xs text-gray-500">Orders</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
