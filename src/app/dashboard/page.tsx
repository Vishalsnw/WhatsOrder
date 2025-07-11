'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/hooks/useUser';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';

interface FormData {
  id: string;
  businessName: string;
  slug: string;
  createdAt: Date;
  products: Array<{
    name: string;
    price: number;
  }>;
}

export default function DashboardPage() {
  const { user, loading } = useUser();
  const router = useRouter();
  const [forms, setForms] = useState<FormData[]>([]);
  const [loadingForms, setLoadingForms] = useState(true);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push('/login');
      return;
    }

    loadForms();
  }, [user, loading, router]);

  const loadForms = async () => {
    if (!user) return;

    try {
      const q = query(
        collection(db, 'orderForms'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);

      const formsData: FormData[] = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          businessName: data.businessName || 'Untitled Form',
          slug: data.slug || '',
          createdAt: data.createdAt?.toDate() || new Date(),
          products: data.products || []
        };
      });

      setForms(formsData);
    } catch (error) {
      console.error('Error loading forms:', error);
    } finally {
      setLoadingForms(false);
    }
  };

  if (loading || !user) {
    return (
      <DashboardLayout>
        <div className="space-y-4 animate-pulse">
          <div className="skeleton h-32 rounded-2xl"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="skeleton h-24 rounded-2xl"></div>
            <div className="skeleton h-24 rounded-2xl"></div>
          </div>
          <div className="skeleton h-48 rounded-2xl"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="material-card p-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="material-headline5 text-white">
                Welcome back, {user.displayName || 'User'}!
              </h1>
              <p className="material-subtitle1 text-blue-100">
                Manage your order forms and track performance
              </p>
              <p className="material-caption text-blue-200 mt-1">
                {forms.length} forms created
              </p>
            </div>
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-2xl">👋</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <Link href="/dashboard/create" className="material-card p-4 hover:scale-105 transition-transform duration-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-lg">✨</span>
              </div>
              <div>
                <h3 className="material-subtitle1 text-gray-900">Create Form</h3>
                <p className="material-caption text-gray-600">Build new order form</p>
              </div>
            </div>
          </Link>

          <Link href="/dashboard/analytics" className="material-card p-4 hover:scale-105 transition-transform duration-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-lg">📊</span>
              </div>
              <div>
                <h3 className="material-subtitle1 text-gray-900">Analytics</h3>
                <p className="material-caption text-gray-600">View performance</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Recent Forms */}
        <div className="material-card">
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="material-headline6">Your Forms</h3>
              <Link href="/my-forms" className="material-button material-button-secondary">
                View All
              </Link>
            </div>
          </div>

          {loadingForms ? (
            <div className="p-4 space-y-4">
              {[1,2,3].map(i => (
                <div key={i} className="skeleton h-16 rounded-xl"></div>
              ))}
            </div>
          ) : forms.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl text-gray-400">📝</span>
              </div>
              <h3 className="material-headline6 text-gray-900 mb-2">No forms yet</h3>
              <p className="material-body2 text-gray-600 mb-4">
                Create your first order form to get started
              </p>
              <Link href="/dashboard/create" className="material-button material-button-primary">
                <span className="mr-2">✨</span>
                Create Your First Form
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {forms.slice(0, 3).map((form) => (
                <div key={form.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-lg">📋</span>
                      </div>
                      <div>
                        <h4 className="material-subtitle1 text-gray-900">{form.businessName}</h4>
                        <p className="material-caption text-gray-600">
                          {form.products.length} products • Created {form.createdAt.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Link 
                        href={`/preview/${form.slug}?id=${form.id}`}
                        className="material-button material-button-secondary"
                      >
                        Preview
                      </Link>
                      <Link 
                        href={`/dashboard/forms/${form.id}/edit`}
                        className="material-button material-button-primary"
                      >
                        Edit
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="material-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="material-caption text-gray-600">Total Forms</p>
                <p className="material-headline4 text-gray-900">{forms.length}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-lg">📋</span>
              </div>
            </div>
          </div>

          <div className="material-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="material-caption text-gray-600">Total Products</p>
                <p className="material-headline4 text-gray-900">
                  {forms.reduce((acc, form) => acc + form.products.length, 0)}
                </p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-lg">🛍️</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}