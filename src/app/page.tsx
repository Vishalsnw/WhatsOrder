'use client';

import { useState } from 'react';

export default function HomePage() {
  const [businessName, setBusinessName] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [products, setProducts] = useState([{ name: '', price: '', image: '' }]);
  const [generatedLink, setGeneratedLink] = useState('');
  const [copied, setCopied] = useState(false); // ✅ Toast feedback

  const handleProductChange = (
    index: number,
    field: 'name' | 'price',
    value: string
  ) => {
    const updated = [...products];
    updated[index][field] = value;
    setProducts(updated);
  };

  const handleImageUpload = (index: number, file: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const updated = [...products];
      updated[index].image = reader.result as string;
      setProducts(updated);
    };
    reader.readAsDataURL(file);
  };

  const addProduct = () => {
    setProducts([...products, { name: '', price: '', image: '' }]);
  };

  const handleGenerateLink = () => {
    if (!businessName.trim() || !whatsappNumber.trim()) return;

    const validProducts = products
      .filter((p) => p.name.trim() && p.price.trim())
      .map((p) =>
        `${encodeURIComponent(p.name.trim())}-${p.price.trim()}${
          p.image ? `-${encodeURIComponent(p.image)}` : ''
        }`
      )
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

    const fullURL = `${window.location.origin}/preview/${slug}?${query}`;
    setGeneratedLink(fullURL); // ✅ No fake short link
  };

  const handleCopyLink = async () => {
    if (generatedLink) {
      await navigator.clipboard.writeText(generatedLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
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
        console.error('Share cancelled or failed.');
      }
    } else {
      alert('Sharing not supported on this device.');
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-indigo-600 text-white py-4 px-6 shadow-md flex items-center justify-between">
        <h1 className="text-lg font-bold">📋 WhatsOrder</h1>
        <div className="text-2xl">☰</div>
      </header>

      {/* Content */}
      <div className="p-4 max-w-md mx-auto">
        <div className="bg-white p-5 rounded-2xl shadow space-y-6">
          <h2 className="text-xl font-semibold text-center text-gray-800">
            Create Your Order Form
          </h2>

          <input
            type="text"
            placeholder="Business Name (e.g. Vishal Tiffin)"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring focus:ring-indigo-400"
          />
          <input
            type="tel"
            placeholder="WhatsApp Number (e.g. 91XXXXXXXXXX)"
            value={whatsappNumber}
            onChange={(e) => setWhatsappNumber(e.target.value)}
            className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring focus:ring-indigo-400"
          />

          {/* Products */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">🛍️ Products</h3>
            {products.map((product, index) => (
              <div
                key={index}
                className="space-y-2 mb-3 border border-gray-200 rounded-lg p-3"
              >
                <input
                  type="text"
                  placeholder="Product Name"
                  value={product.name}
                  onChange={(e) => handleProductChange(index, 'name', e.target.value)}
                  className="w-full border border-gray-300 px-3 py-2 rounded-md"
                />
                <input
                  type="number"
                  placeholder="Price"
                  value={product.price}
                  onChange={(e) => handleProductChange(index, 'price', e.target.value)}
                  className="w-full border border-gray-300 px-3 py-2 rounded-md"
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(index, e.target.files?.[0] || null)}
                  className="w-full"
                />
                {product.image && (
                  <img
                    src={product.image}
                    alt="Product Preview"
                    className="w-full h-32 object-cover rounded-md border"
                  />
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addProduct}
              className="text-sm text-indigo-600 hover:underline mt-2"
            >
              + Add More Product
            </button>
          </div>

          <button
            onClick={handleGenerateLink}
            className="bg-indigo-600 text-white w-full py-2 rounded-md font-semibold hover:bg-indigo-700"
          >
            Generate Link
          </button>

          {generatedLink && (
            <div className="mt-4 space-y-2">
              <p className="text-sm text-center text-blue-600 break-all">
                {generatedLink}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleCopyLink}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
                <button
                  onClick={handleShare}
                  className="flex-1 bg-purple-600 text-white py-2 rounded-md hover:bg-purple-700"
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
