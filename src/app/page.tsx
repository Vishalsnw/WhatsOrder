'use client';

import { useState } from 'react';

export default function HomePage() {
  const [businessName, setBusinessName] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [products, setProducts] = useState([{ name: '', price: '' }]);
  const [generatedLink, setGeneratedLink] = useState('');

  const handleProductChange = (index: number, field: 'name' | 'price', value: string) => {
    const updated = [...products];
    updated[index][field] = value;
    setProducts(updated);
  };

  const addProduct = () => {
    setProducts([...products, { name: '', price: '' }]);
  };

  const handleGenerateLink = () => {
    if (!businessName.trim() || !whatsappNumber.trim()) return;

    const validProducts = products
      .filter(p => p.name.trim() && p.price.trim())
      .map(p => `${encodeURIComponent(p.name.trim())}-${p.price.trim()}`)
      .join(',');

    const slug = businessName
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');

    const query = new URLSearchParams({
      phone: whatsappNumber.trim(),
      biz: encodeURIComponent(businessName.trim()),
      products: validProducts,
    }).toString();

    const fullLink = `${window.location.origin}/preview/${slug}?${query}`;
    setGeneratedLink(fullLink);
  };

  const handleCopyLink = () => {
    if (generatedLink) {
      navigator.clipboard.writeText(generatedLink);
      alert('Link copied to clipboard!');
    }
  };

  const handleShare = async () => {
    if (navigator.share && generatedLink) {
      try {
        await navigator.share({
          title: 'My Order Form',
          text: 'Check out this order form',
          url: generatedLink,
        });
      } catch (err) {
        alert('Sharing cancelled or failed.');
      }
    } else {
      alert('Sharing not supported on this device.');
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded shadow max-w-md w-full">
        <h1 className="text-2xl font-bold text-center text-green-600 mb-4">
          📋 Create Your Order Form
        </h1>

        <div className="space-y-4">
          <input
            type="text"
            placeholder="Business Name (e.g. Vishal Tiffin)"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            className="w-full border px-4 py-2 rounded"
            required
          />
          <input
            type="tel"
            placeholder="WhatsApp Number (e.g. 91XXXXXXXXXX)"
            value={whatsappNumber}
            onChange={(e) => setWhatsappNumber(e.target.value)}
            className="w-full border px-4 py-2 rounded"
            required
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
                />
                <input
                  type="number"
                  placeholder="Price"
                  value={product.price}
                  onChange={(e) => handleProductChange(index, 'price', e.target.value)}
                  className="w-24 border px-2 py-1 rounded"
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
            onClick={handleGenerateLink}
            className="bg-green-600 text-white px-6 py-2 rounded w-full hover:bg-green-700"
          >
            Generate Link
          </button>

          {generatedLink && (
            <div className="mt-4 space-y-2">
              <p className="text-sm break-all text-blue-600 underline">{generatedLink}</p>
              <div className="flex gap-2">
                <button
                  onClick={handleCopyLink}
                  className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                >
                  Copy
                </button>
                <button
                  onClick={handleShare}
                  className="flex-1 bg-purple-600 text-white py-2 rounded hover:bg-purple-700"
                >
                  Share
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
      }
