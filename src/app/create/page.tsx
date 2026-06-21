'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext'; // Adjust path as needed
import { getProducts, Product } from '@/lib/firestore'; // Adjust path as needed
import OrderFormEditor from '@/components/forms/OrderFormEditor'; // Adjust path as needed
import DashboardLayout from '@/components/layout/DashboardLayout'; // Adjust path as needed

export default function NewFormPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const fetchProducts = async () => {
        const userProducts = await getProducts(user.uid);
        setProducts(userProducts);
        setLoading(false);
      };

      fetchProducts();
    } else {
      router.push('/login');
    }
  }, [user, router]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="material-card p-6 bg-gradient-to-r from-green-600 to-green-700 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="material-headline5 text-white">Create New Form</h1>
              <p className="material-subtitle1 text-green-100">Select products from your catalog to include in this form.</p>
            </div>
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-2xl">✨</span>
            </div>
          </div>
        </div>

        <OrderFormEditor products={products} />
      </div>
    </DashboardLayout>
  );
}
