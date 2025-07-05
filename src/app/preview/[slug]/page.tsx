'use client';

import { useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';

interface Product {
  name: string;
  price: number;
}

export default function PreviewOrderPage() {
  const searchParams = useSearchParams();
  const businessName = decodeURIComponent(searchParams.get('biz') || 'Business');
  const phone = searchParams.get('phone') || '919999888877';
  const productsParam = searchParams.get('products') || '';

  const parsedProducts: Product[] = productsParam
    .split(',')
    .map((entry) => {
      const [rawName, rawPrice] = entry.split('-');
      const name = decodeURIComponent(rawName || '').trim();
      const price = Number(rawPrice?.trim());
      return { name, price };
    })
    .filter((p) => p.name && !isNaN(p.price));

  const [quantities, setQuantities] = useState<number[]>([]);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');

  useEffect(() => {
    setQuantities(parsedProducts.map(() => 0));
  }, [productsParam]);

  const handleQuantityChange = (index: number, value: number) => {
    const newQuantities = [...quantities];
    newQuantities[index] = value;
    setQuantities(newQuantities);
  };

  const handlePlaceOrder = () => {
    const orderLines = parsedProducts
      .map((p, i) => (quantities[i] > 0 ? `- ${quantities[i]}x ${p.name}` : ''))
      .filter(Boolean)
      .join('\n');

    if (!orderLines) {
      alert('Please select at least one item.');
      return;
    }

    const message = `Hello ${businessName},\nI'd like to order:\n${orderLines}\n\nName: ${name}\nAddress: ${address}`;
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-8">
      <div className="bg-white p-6 rounded shadow-md max-w-md w-full space-y-4">
        <h2 className="text-2xl font-bold text-green-600 text-center">
          🛒 Order from {businessName}
        </h2>

        {parsedProducts.length === 0 ? (
          <p className="text-center text-red-500">⚠️ No products found in URL</p>
        ) : (
          parsedProducts.map((product, index) => (
            <div
              key={index}
              className="flex justify-between items-center border p-2 rounded"
            >
              <div>
                <p className="font-semibold">{product.name}</p>
                <p className="text-sm text-gray-600">₹{product.price}</p>
              </div>
              <input
                type="number"
                min={0}
                value={quantities[index] || 0}
                onChange={(e) =>
                  handleQuantityChange(index, parseInt(e.target.value) || 0)
                }
                className="w-16 text-center border rounded px-2 py-1"
              />
            </div>
          ))
        )}

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
          disabled={!parsedProducts.length}
          className="w-full bg-green-600 text-white font-semibold py-2 rounded hover:bg-green-700"
        >
          Place Order
        </button>
      </div>
    </main>
  );
  }
