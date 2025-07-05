import { Suspense } from 'react';
import OrderForm from './OrderForm';

export default function OrderPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OrderForm />
    </Suspense>
  );
}
