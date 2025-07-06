'use client';

import { useState } from 'react';

export default function CreateOrderForm() {
  const [biz, setBiz] = useState('');
  const [phone, setPhone] = useState('');
  const [products, setProducts] = useState('');
  const [generatedLink, setGeneratedLink] = useState('');

  const handleGenerateLink = () => {
    if (!biz || !phone || !products) {
      alert('Please fill all fields');
      return;
    }

    const encodedProducts = products
      .split('\n') // one product per line
      .map((line) => {
        const [name, price, image] = line.split('-').map((s) => encodeURIComponent(s.trim()));
        return `${name}-${price}-${image}`;
      })
      .join(',');

    const link = `/preview/test?biz=${encodeURIComponent(biz)}&phone=${encodeURIComponent(
      phone
    )}&products=${encodedProducts}`;

    setGeneratedLink(link);
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="bg-white p-6 rounded-xl shadow-lg max-w-lg w-full space-y-4">
        <h2 className="text-2xl font-bold text-center text-indigo-600">Create WhatsOrder Link</h2>

        <input
          placeholder="Business Name"
          value={biz}
          onChange={(e) => setBiz(e.target.value)}
          className="w-full border px-3 py-2 rounded"
        />
        <input
          placeholder="Phone (e.g. 919999888877)"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full border px-3 py-2 rounded"
        />
        <textarea
          placeholder={`Enter products like:\nBurger - 50 - https://img.com/burger.jpg\nPizza - 120 - https://img.com/pizza.jpg`}
          value={products}
          onChange={(e) => setProducts(e.target.value)}
          className="w-full border px-3 py-2 rounded"
          rows={5}
        />

        <button
          onClick={handleGenerateLink}
          className="bg-indigo-600 text-white font-semibold py-2 px-4 rounded hover:bg-indigo-700 w-full"
        >
          Generate Link
        </button>

        {generatedLink && (
          <div className="mt-4 text-center text-sm">
            <p className="mb-2 text-gray-700">Preview your order:</p>
            <a
              href={generatedLink}
              target="_blank"
              className="text-blue-600 underline break-all"
            >
              {generatedLink}
            </a>
          </div>
        )}
      </div>
    </main>
  );
      }
