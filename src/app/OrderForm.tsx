'use client';

import { useSearchParams } from 'next/navigation';
import { useState } from 'react';

export default function OrderForm() {
  const searchParams = useSearchParams();
  const phoneNumber = searchParams.get('phone') || '919999888877';

  const [product, setProduct] = useState('');
  const [quantity, setQuantity] = useState<number>(1);
  const [name, setName] = useState('');
  const [note, setNote] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!product.trim() || quantity < 1) return;

    const message = `🛒 *New Order from ${name || 'Customer'}*\n\n📦 *Product*: ${product.trim()}\n🔢 *Quantity*: ${quantity}\n📝 *Note*: ${note || '-'}`;
    const encodedMessage = encodeURIComponent(message);
    const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    window.open(whatsappURL, '_blank');
  };

  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full bg-white shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-bold text-center text-green-600 mb-6">
          📦 Place Your Order
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Your Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 border rounded"
          />
          <input
            type="text"
            placeholder="Product Name"
            required
            value={product}
            onChange={(e) => setProduct(e.target.value)}
            className="w-full px-4 py-2 border rounded"
          />
          <input
            type="number"
            placeholder="Quantity"
            min={1}
            required
            value={quantity}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              if (!isNaN(val)) setQuantity(val);
            }}
            className="w-full px-4 py-2 border rounded"
          />
          <textarea
            placeholder="Additional Notes (optional)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full px-4 py-2 border rounded"
          />
          <button
            type="submit"
            className="w-full bg-green-600 text-white font-semibold py-2 rounded hover:bg-green-700"
          >
            Send on WhatsApp
          </button>
        </form>
      </div>
    </main>
  );
            }
