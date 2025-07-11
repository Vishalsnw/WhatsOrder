
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/hooks/useUser';
import { collection, getDocs, query, where, orderBy, deleteDoc, doc } from 'firebase/firestore';
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
  views?: number;
  orders?: number;
}

export default function MyFormsPage() {
  const { user, loading } = useUser();
  const router = useRouter();
  const [forms, setForms] = useState<FormData[]>([]);
  const [loadingForms, setLoadingForms] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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
      // Load from user's subcollection only
      const userFormsRef = collection(db, 'users', user.uid, 'forms');
      const q = query(userFormsRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      
      const formsData: FormData[] = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          businessName: data.businessName || 'Untitled Form',
          slug: data.slug || data.businessName?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || '',
          createdAt: data.createdAt?.toDate() || new Date(),
          products: data.products || [],
          views: data.views || 0,
          orders: data.orders || 0
        };
      });

      setForms(formsData);
    } catch (error) {
      console.error('Error loading forms:', error);
      // Set empty forms array if there's a permission error
      setForms([]);
    } finally {
      setLoadingForms(false);
    }
  };

  const handleDelete = async (formId: string) => {
    if (!confirm('Are you sure you want to delete this form? This action cannot be undone.')) {
      return;
    }

    setDeletingId(formId);
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'forms', formId));
      setForms(forms.filter(form => form.id !== formId));
    } catch (error) {
      console.error('Error deleting form:', error);
      alert('Error deleting form. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const copyFormLink = async (slug: string, formId: string) => {
    const link = `${window.location.origin}/preview/${slug}?id=${formId}`;
    try {
      await navigator.clipboard.writeText(link);
      alert('Form link copied to clipboard!');
    } catch (error) {
      console.error('Error copying link:', error);
      alert('Unable to copy link. Please try again.');
    }
  };

  if (loading || !user) {
    return (
      <DashboardLayout>
        <div className="space-y-4 animate-pulse">
          <div className="skeleton h-32 rounded-2xl"></div>
          <div className="skeleton h-48 rounded-2xl"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="material-card p-6 bg-gradient-to-r from-purple-600 to-purple-700 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="material-headline5 text-white">My Forms</h1>
              <p className="material-subtitle1 text-purple-100">
                Manage all your order forms
              </p>
              <p className="material-caption text-purple-200 mt-1">
                {forms.length} forms created
              </p>
            </div>
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-2xl">📋</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            <Link href="/dashboard/create" className="material-button material-button-primary">
              <span className="mr-2">✨</span>
              Create New Form
            </Link>
          </div>
          <p className="material-caption text-gray-600">
            {forms.length} of ∞ forms
          </p>
        </div>

        {/* Forms List */}
        {loadingForms ? (
          <div className="space-y-4">
            {[1,2,3].map(i => (
              <div key={i} className="skeleton h-32 rounded-2xl"></div>
            ))}
          </div>
        ) : forms.length === 0 ? (
          <div className="material-card p-8 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl text-gray-400">📝</span>
            </div>
            <h3 className="material-headline6 text-gray-900 mb-2">No forms yet</h3>
            <p className="material-body2 text-gray-600 mb-6">
              Create your first order form to start collecting orders via WhatsApp
            </p>
            <Link href="/dashboard/create" className="material-button material-button-primary">
              <span className="mr-2">✨</span>
              Create Your First Form
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {forms.map((form) => (
              <div key={form.id} className="material-card overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-xl">📋</span>
                      </div>
                      <div>
                        <h3 className="material-subtitle1 text-gray-900">{form.businessName}</h3>
                        <p className="material-caption text-gray-600">
                          Created {form.createdAt.toLocaleDateString()}
                        </p>
                        <p className="material-caption text-blue-600">
                          /preview/{form.slug}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="status-chip status-chip-success">Active</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <p className="material-headline6 text-blue-900">{form.products.length}</p>
                      <p className="material-caption text-blue-700">Products</p>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <p className="material-headline6 text-green-900">{form.views || 0}</p>
                      <p className="material-caption text-green-700">Views</p>
                    </div>
                    <div className="text-center p-3 bg-yellow-50 rounded-lg">
                      <p className="material-headline6 text-yellow-900">{form.orders || 0}</p>
                      <p className="material-caption text-yellow-700">Orders</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex space-x-2">
                      <Link 
                        href={`/preview/${form.slug}?id=${form.id}`}
                        className="material-button material-button-secondary"
                      >
                        <span className="mr-1">👁️</span>
                        Preview
                      </Link>
                      <button
                        onClick={() => copyFormLink(form.slug, form.id)}
                        className="material-button material-button-secondary"
                      >
                        <span className="mr-1">🔗</span>
                        Copy Link
                      </button>
                    </div>
                    <div className="flex space-x-2">
                      <Link 
                        href={`/dashboard/forms/${form.id}/edit`}
                        className="material-button material-button-primary"
                      >
                        <span className="mr-1">✏️</span>
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(form.id)}
                        disabled={deletingId === form.id}
                        className="material-button bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                      >
                        {deletingId === form.id ? (
                          <>
                            <span className="mr-1">⏳</span>
                            Deleting...
                          </>
                        ) : (
                          <>
                            <span className="mr-1">🗑️</span>
                            Delete
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
