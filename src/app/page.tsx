'use client';

import { Suspense } from 'react';
import OrderForm from './OrderForm';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Suspense fallback={<div className="text-center text-gray-500">Loading...</div>}>
          <OrderForm />
        </Suspense>
      </div>
    </main>
  );
}
