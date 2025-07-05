import { Suspense } from 'react';
import OrderForm from './OrderForm';

export default function HomePage() {
  return (
    <Suspense fallback={<div className="text-center p-4">Loading...</div>}>
      <OrderForm />
    </Suspense>
  );
}
