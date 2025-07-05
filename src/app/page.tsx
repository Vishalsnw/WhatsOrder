'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const [businessName, setBusinessName] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [products, setProducts] = useState([{ name: '', price: '' }]);

  const router = useRouter();

  const handleProductChange = (index: number, field: 'name' | 'price', value: string) => {
    const updated = [...products];
    updated[index][field] = value;
    setProducts(updated);
  };

  const addProduct = () => {
    setProducts([...products, { name: '', price: '' }]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!businessName.trim() || !whatsappNumber.trim()) return;

    const validProducts = products
      .filter(p => p.name.trim() && p.price.trim())
      .map(p => `${p.name.trim()}-${p.price.trim()}`)
      .join(',');

    const slug = businessName
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');

    const query = new URLSearchParams({
      phone: whatsappNumber.trim(),
      biz: businessName.trim(),
      products: validProducts,
    }).toString();

    router.push(`/preview/${slug}?${query}`);
  };

  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded shadow max-w-md w-full">
        <h1 className="text-2xl font-bold text-center text-green-600 mb-4">
          📋 Create Your Order Form
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Business Name (e.g. Vishal Tiffin)"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            required
            className="w-full border px-4 py-2 rounded"
          />
          <input
            type="tel"
            placeholder="WhatsApp Number (e.g. 91XXXXXXXXXX)"
            value={whatsappNumber}
            onChange={(e) => setWhatsappNumber(e.target.value)}
            required
            className="w-full border px-4 py-2 rounded"
          />

          <div className="space-y-2">
            <h2 className="font-semibold text-gray-700">🛍️ Products</h2>
            {products.map((product, index) => (
              <div key={index} className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Product Name"
                  value={product.name}
                  onChange={(e) => handleProductChange(index, 'name', e.target.value)}
                  className="flex-1 border px-2 py-1 rounded"
                  required
                />
                <input
                  type="number"
                  placeholder="Price"
                  value={product.price}
                  onChange={(e) => handleProductChange(index, 'price', e.target.value)}
                  className="w-24 border px-2 py-1 rounded"
                  required
                />
              </div>
            ))}
            <button
              type="button"
              onClick={addProduct}
              className="text-green-600 text-sm underline hover:text-green-700"
            >
              + Add More Product
            </button>
          </div>

          <button
            type="submit"
            className="bg-green-600 text-white px-6 py-2 rounded w-full hover:bg-green-700"
          >
            Generate Order Form
          </button>
        </form>
      </div>
    </main>
  );
          }
