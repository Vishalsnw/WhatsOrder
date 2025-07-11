
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUser } from '@/hooks/useUser';
import DashboardLayout from '@/components/layout/DashboardLayout';
import OrderFormEditor from '@/components/forms/OrderFormEditor';

const templates = {
  restaurant: {
    businessName: 'My Restaurant',
    products: [
      { name: 'Margherita Pizza', price: 12.99, image: '' },
      { name: 'Chicken Wings', price: 8.99, image: '' },
      { name: 'Caesar Salad', price: 7.99, image: '' }
    ]
  },
  retail: {
    businessName: 'My Store',
    products: [
      { name: 'T-Shirt', price: 19.99, image: '' },
      { name: 'Jeans', price: 49.99, image: '' },
      { name: 'Sneakers', price: 89.99, image: '' }
    ]
  },
  services: {
    businessName: 'My Service',
    products: [
      { name: 'Basic Service', price: 50.00, image: '' },
      { name: 'Premium Service', price: 100.00, image: '' },
      { name: 'Consultation', price: 25.00, image: '' }
    ]
  }
};

export default function NewFormPage() {
  const { user, loading } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const template = searchParams.get('template');
  const [initialData, setInitialData] = useState(null);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push('/login');
      return;
    }

    if (template && templates[template as keyof typeof templates]) {
      setInitialData(templates[template as keyof typeof templates]);
    }
  }, [user, loading, router, template]);

  if (loading || !user) {
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
              <p className="material-subtitle1 text-green-100">
                {template ? `Using ${template} template` : 'Build your custom form'}
              </p>
            </div>
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-2xl">✨</span>
            </div>
          </div>
        </div>

        <OrderFormEditor initialData={initialData} />
      </div>
    </DashboardLayout>
  );
}
