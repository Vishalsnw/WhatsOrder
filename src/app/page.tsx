'use client';

import { useSearchParams } from 'next/navigation';
import { useState } from 'react';

export default function OrderPage() {
  const searchParams = useSearchParams();
  const phone = searchParams.get('phone');

  const [product, setProduct] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const message = `Hello, I want to order: ${product}`;
    const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    setSubmitted(true);
  };

  if (!phone) {
    return (
      <div className="text-center p-4">
        <h2 className="text-xl font-bold text-red-600">❌ Phone number is missing in the URL</h2>
        <p>Add ?phone=91XXXXXXXXXX in the URL</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-6 rounded shadow max-w-md w-full text-center">
        <h2 className="text-2xl font-bold mb-4">🛒 Order on WhatsApp</h2>

        {submitted ? (
          <p className="text-green-600 font-medium">✅ Redirecting to WhatsApp...</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Enter product name"
              value={product}
              onChange={(e) => setProduct(e.target.value)}
              required
              className="w-full border px-4 py-2 rounded"
            />
            <button
              type="submit"
              className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition"
            >
              Order via WhatsApp
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
