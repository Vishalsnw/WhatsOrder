
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/hooks/useUser';
import { collection, getDocs, query, where, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';

interface OrderForm {
  id: string;
  businessName: string;
  slug: string;
  phone: string;
  createdAt: Date;
  products: any[];
  views?: number;
  orders?: number;
}

export default function MyFormsPage() {
  const { user, loading: userLoading } = useUser();
  const router = useRouter();
  const [forms, setForms] = useState<OrderForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedForm, setSelectedForm] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (userLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }
    loadForms();
  }, [user, userLoading, router]);

  const loadForms = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const q = query(
        collection(db, 'orderForms'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      
      const formsData: OrderForm[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      })) as OrderForm[];
      
      setForms(formsData);
    } catch (error) {
      console.error('Error loading forms:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteForm = async () => {
    if (!selectedForm) return;
    
    try {
      await deleteDoc(doc(db, 'orderForms', selectedForm));
      setForms(forms.filter(form => form.id !== selectedForm));
      setShowDeleteModal(false);
      setSelectedForm(null);
    } catch (error) {
      console.error('Error deleting form:', error);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (userLoading || loading) {
    return (
      <DashboardLayout>
        <div className="space-y-4 animate-pulse">
          <div className="skeleton h-32 rounded-2xl"></div>
          <div className="space-y-3">
            <div className="skeleton h-20 rounded-2xl"></div>
            <div className="skeleton h-20 rounded-2xl"></div>
            <div className="skeleton h-20 rounded-2xl"></div>
          </div>
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
                Manage your order forms
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

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <Link href="/dashboard/create" className="material-card p-4 text-center hover:scale-105 transition-transform duration-200">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">➕</span>
            </div>
            <h3 className="material-subtitle2 text-gray-900">Create New</h3>
            <p className="material-caption text-gray-600">Build a new form</p>
          </Link>
          
          <Link href="/dashboard/analytics" className="material-card p-4 text-center hover:scale-105 transition-transform duration-200">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">📊</span>
            </div>
            <h3 className="material-subtitle2 text-gray-900">Analytics</h3>
            <p className="material-caption text-gray-600">View statistics</p>
          </Link>
        </div>

        {/* Forms List */}
        {forms.length === 0 ? (
          <div className="material-card p-8 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl text-gray-400">📝</span>
            </div>
            <h3 className="material-headline6 text-gray-900 mb-2">No forms yet</h3>
            <p className="material-body2 text-gray-600 mb-6">
              Create your first order form to start accepting orders through WhatsApp
            </p>
            <Link href="/dashboard/create" className="material-button material-button-primary">
              <span className="mr-2">✨</span>
              Create Your First Form
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {forms.map((form) => (
              <div key={form.id} className="material-card overflow-hidden">
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="material-subtitle1 text-gray-900">{form.businessName}</h3>
                      <p className="material-caption text-gray-600 mt-1">
                        Created {formatDate(form.createdAt)}
                      </p>
                      <div className="flex items-center space-x-4 mt-2">
                        <div className="flex items-center space-x-1">
                          <span className="text-sm">👁️</span>
                          <span className="material-caption text-gray-600">{form.views || 0}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span className="text-sm">🛒</span>
                          <span className="material-caption text-gray-600">{form.orders || 0}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span className="text-sm">📦</span>
                          <span className="material-caption text-gray-600">{form.products?.length || 0} products</span>
                        </div>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => {
                        setSelectedForm(form.id);
                        setShowDeleteModal(true);
                      }}
                      className="p-2 rounded-full hover:bg-red-50 text-red-500 transition-colors duration-200"
                    >
                      <span className="material-icon">🗑️</span>
                    </button>
                  </div>
                </div>

                <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
                  <div className="flex space-x-3">
                    <Link
                      href={`/preview/${form.slug}?id=${form.id}`}
                      className="flex-1 material-button material-button-secondary text-center"
                    >
                      <span className="mr-2">👁️</span>
                      Preview
                    </Link>
                    
                    <Link
                      href={`/dashboard/forms/${form.id}/edit`}
                      className="flex-1 material-button material-button-primary text-center"
                    >
                      <span className="mr-2">✏️</span>
                      Edit
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <>
            <div 
              className="fixed inset-0 z-40 bg-black/50"
              onClick={() => setShowDeleteModal(false)}
            />
            <div className="fixed inset-x-4 top-1/2 transform -translate-y-1/2 z-50 material-card p-6 animate-scale-in">
              <h3 className="material-headline6 text-gray-900 mb-4">Delete Form</h3>
              <p className="material-body2 text-gray-700 mb-6">
                Are you sure you want to delete this form? This action cannot be undone and will break any existing links.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 material-button material-button-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteForm}
                  className="flex-1 material-button bg-red-600 hover:bg-red-700 text-white focus:ring-red-500"
                >
                  Delete
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
