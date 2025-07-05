'use client';

import { useState } from 'react';

export default function OrderPage() {
  const [name, setName] = useState('');
  const [product, setProduct] = useState('');
  const [quantity, setQuantity] = useState(1);

  const handleSubmit = () => {
    const phone = '91xxxxxxxxxx'; // 🔁 Replace with your WhatsApp number
    const msg = `Order Details:\n\n👤 Name: ${name}\n📦 Product: ${product}\n🔢 Quantity: ${quantity}`;
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="max-w-md w-full bg-white shadow-md rounded p-6 space-y-4">
        <h1 className="text-xl font-bold text-center text-green-600">WhatsApp Order Form</h1>

        <input
          type="text"
          placeholder="Your Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-2 border rounded"
          required
        />

        <input
          type="text"
          placeholder="Product Name"
          value={product}
          onChange={(e) => setProduct(e.target.value)}
          className="w-full px-4 py-2 border rounded"
          required
        />

        <input
          type="number"
          placeholder="Quantity"
          value={quantity}
          onChange={(e) => setQuantity(parseInt(e.target.value))}
          className="w-full px-4 py-2 border rounded"
          min={1}
        />

        <button
          onClick={handleSubmit}
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
        >
          Submit via WhatsApp
        </button>
      </div>
    </main>
  );
        }
