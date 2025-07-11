'use client';

import { useSearchParams } from 'next/navigation';
import { useState, useEffect, useMemo } from 'react';

interface Product {
  name: string;
  price: number;
  image?: string;
}

function isValidProduct(obj: any): obj is Product {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.name === 'string' &&
    typeof obj.price === 'number' &&
    (typeof obj.image === 'string' || typeof obj.image === 'undefined')
  );
}

export default function PreviewOrderPage() {
  const searchParams = useSearchParams();

  const businessName = decodeURIComponent(searchParams.get('biz') || 'Business');
  const phone = searchParams.get('phone') || '919999888877';
  const productsParam = searchParams.get('products') || '';

  const parsedProducts: Product[] = useMemo(() => {
    if (!productsParam) return [];

    const rawProducts = productsParam.split(',').map((entry) => {
      try {
        const parts = entry.split('-');
        if (parts.length < 2) return null;

        const name = decodeURIComponent(parts[0]?.trim());
        const price = Number(decodeURIComponent(parts[1]?.trim()));
        const image = parts[2] ? decodeURIComponent(parts.slice(2).join('-').trim()) : undefined;

        if (!name || isNaN(price)) return null;

        return { name, price, image };
      } catch {
        return null;
      }
    });

    return rawProducts.filter((p): p is Product => p !== null && isValidProduct(p));
  }, [productsParam]);

  const [quantities, setQuantities] = useState<number[]>([]);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');

  useEffect(() => {
    setQuantities(parsedProducts.map(() => 0));
  }, [parsedProducts]);

  const handleQuantityChange = (index: number, value: number) => {
    const newQuantities = [...quantities];
    newQuantities[index] = Math.max(0, value);
    setQuantities(newQuantities);
  };

  const total = parsedProducts.reduce(
    (sum, product, i) => sum + (quantities[i] || 0) * product.price,
    0
  );

  const handlePlaceOrder = () => {
    const orderLines = parsedProducts
      .map((p, i) => (quantities[i] > 0 ? `- ${quantities[i]}x ${p.name}` : ''))
      .filter(Boolean)
      .join('\n');

    if (!orderLines) {
      alert('Please select at least one item.');
      return;
    }

    if (!name.trim() || !address.trim()) {
      alert('Please enter your name and address.');
      return;
    }

    const message = `Hello ${businessName},\nI'd like to order:\n${orderLines}\n\nTotal: ₹${total}\n\nName: ${name}\nAddress: ${address}`;
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 flex flex-col">
      <div className="bg-white p-6 rounded-xl shadow-lg max-w-md mx-auto w-full space-y-6">
        <h2 className="text-2xl font-bold text-indigo-600 text-center">
          🛒 Order from {businessName}
        </h2>

        {parsedProducts.length === 0 ? (
          <p className="text-center text-red-500">⚠️ No products found in link</p>
        ) : (
          parsedProducts.map((product, index) => (
            <div
              key={index}
              className="flex gap-4 border border-gray-200 p-3 rounded-lg items-center bg-gray-50"
            >
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-16 h-16 object-cover rounded-lg border"
                />
              ) : (
                <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center text-gray-500 text-xs border">
                  No Image
                </div>
              )}
              <div className="flex-1">
                <p className="font-semibold text-gray-800">{product.name}</p>
                <p className="text-sm text-gray-600">₹{product.price}</p>
              </div>
              <input
                type="number"
                min={0}
                value={quantities[index] || 0}
                onChange={(e) =>
                  handleQuantityChange(index, parseInt(e.target.value) || 0)
                }
                className="w-16 text-center border rounded px-2 py-1 focus:outline-none focus:ring focus:ring-indigo-400"
              />
            </div>
          ))
        )}

        <input
          type="text"
          placeholder="Your Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:ring focus:ring-indigo-400"
        />

        <textarea
          placeholder="Your Address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="w-full border border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:ring focus:ring-indigo-400"
        />

        <div className="text-right font-semibold text-lg text-gray-800">
          Total: ₹{total}
        </div>

        <button
          onClick={handlePlaceOrder}
          disabled={!parsedProducts.length}
          className="w-full bg-indigo-600 text-white font-semibold py-2 rounded-lg hover:bg-indigo-700 transition-all duration-200"
        >
          Place Order on WhatsApp
        </button>
      </div>

      <div className="text-center text-xs text-gray-400 mt-6 mb-2">
        Made with 💜 using <strong>WhatsOrder</strong>
      </div>
    </main>
  );
                }
