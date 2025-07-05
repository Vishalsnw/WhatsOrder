'use client';

import { useSearchParams } from 'next/navigation';
import { useState } from 'react';

const sampleProducts = [
  { name: 'Veg Thali', price: 120 },
  { name: 'Sweet Dish', price: 50 },
  { name: 'Chapati Pack (4 pc)', price: 30 },
];

export default function PreviewOrderPage() {
  const searchParams = useSearchParams();
  const businessName = decodeURIComponent(searchParams.get('biz') || 'Business');
  const phone = searchParams.get('phone') || '919999888877';

  const [quantities, setQuantities] = useState<number[]>(sampleProducts.map(() => 0));
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');

  const handleQuantityChange = (index: number, value: number) => {
    const newQuantities = [...quantities];
    newQuantities[index] = value;
    setQuantities(newQuantities);
  };

  const handlePlaceOrder = () => {
    const orderLines = sampleProducts
      .map((p, i) => (quantities[i] > 0 ? `- ${quantities[i]}x ${p.name}` : ''))
      .filter(Boolean)
      .join('\n');

    const message = `Hello ${businessName},\nI'd like to order:\n${orderLines}\n\nName: ${name}\nAddress: ${address}`;
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-8">
      <div className="bg-white p-6 rounded shadow-md max-w-md w-full space-y-4">
        <h2 className="text-2xl font-bold text-green-600 text-center">🛒 Order from {businessName}</h2>

        {sampleProducts.map((product, index) => (
          <div key={product.name} className="flex justify-between items-center border p-2 rounded">
            <div>
              <p className="font-semibold">{product.name}</p>
              <p className="text-sm text-gray-600">₹{product.price}</p>
            </div>
            <input
              type="number"
              min={0}
              value={quantities[index]}
              onChange={(e) => handleQuantityChange(index, parseInt(e.target.value))}
              className="w-16 text-center border rounded px-2 py-1"
            />
          </div>
        ))}

        <input
          type="text"
          placeholder="Your Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border px-4 py-2 rounded"
        />
        <textarea
          placeholder="Your Address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="w-full border px-4 py-2 rounded"
        />

        <button
          onClick={handlePlaceOrder}
          className="w-full bg-green-600 text-white font-semibold py-2 rounded hover:bg-green-700"
        >
          Place Order
        </button>
      </div>
    </main>
  );
                }
