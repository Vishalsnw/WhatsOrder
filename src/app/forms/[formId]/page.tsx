
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { getOrderFormById, createOrder, Product } from '../../../lib/firestore'; // Adjust path

interface FormItem extends Product {
  quantity: number;
}

const PublicFormPage = () => {
  const { formId } = useParams();
  const [form, setForm] = useState<any>(null);
  const [items, setItems] = useState<FormItem[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (formId) {
      const fetchForm = async () => {
        // This is a simplified example. In a real app, you'd need to know the user ID
        // to fetch the form. You might need to adjust your data model for public forms.
        // For now, I'll assume a placeholder user ID.
        const formData = await getOrderFormById('placeholder-user-id', formId as string);
        setForm(formData);
        setItems(formData.products.map((p: Product) => ({ ...p, quantity: 0 })));
        setLoading(false);
      };
      fetchForm();
    }
  }, [formId]);

  const handleQuantityChange = (productId: string, quantity: number) => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === productId ? { ...item, quantity: Math.max(0, quantity) } : item
      )
    );
  };

  const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form || items.every(item => item.quantity === 0)) return;

    setSubmitting(true);
    const order = {
      customerName,
      customerPhone,
      items: items.filter(item => item.quantity > 0),
      total,
      formId: formId as string,
      status: 'pending',
    };

    // Again, assuming a placeholder user ID
    await createOrder('placeholder-user-id', order as any);
    setSubmitting(false);
    setSubmitted(true);
  };

  if (loading) {
    return <p>Loading form...</p>;
  }

  if (!form) {
    return <p>Form not found.</p>;
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h1 className="text-2xl font-bold text-green-600 mb-4">Order Submitted Successfully!</h1>
          <p>Thank you for your order. We will contact you shortly.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold mb-2">{form.businessName}</h1>
        <p className="text-gray-600 mb-6">Place your order below.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {items.map((item) => (
            <div key={item.id} className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">{item.name}</h3>
                <p className="text-gray-600">₹{item.price}</p>
              </div>
              <input
                type="number"
                min="0"
                value={item.quantity}
                onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value))}
                className="w-20 px-2 py-1 border rounded-lg text-center"
              />
            </div>
          ))}

          <div className="border-t pt-6 space-y-4">
            <div className="flex justify-between font-bold text-xl">
              <span>Total</span>
              <span>₹{total.toFixed(2)}</span>
            </div>

            <input
              type="text"
              placeholder="Your Name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
            <input
              type="tel"
              placeholder="Your Phone Number"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
          </div>

          <button
            type="submit"
            disabled={submitting || total === 0}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 disabled:bg-gray-400"
          >
            {submitting ? 'Placing Order...' : 'Place Order'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PublicFormPage;
