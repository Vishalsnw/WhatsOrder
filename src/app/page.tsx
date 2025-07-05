'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/hooks/useUser';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function HomePage() {
  const { user } = useUser();
  const router = useRouter();

  const [businessName, setBusinessName] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [products, setProducts] = useState([{ name: '', price: '', image: '' }]);
  const [generatedLink, setGeneratedLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);

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

  const handleGenerateLink = async () => {
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
    setGeneratedLink(fullURL);

    try {
      setSaving(true);

      if (validProducts.length && user?.uid) {
        await addDoc(collection(db, 'users', user.uid, 'forms'), {
          businessName,
          whatsappNumber,
          slug,
          products: products.filter((p) => p.name.trim() && p.price.trim()),
          createdAt: serverTimestamp(),
        });

        alert('✅ Form saved successfully! Redirecting to dashboard...');
        setTimeout(() => router.push('/dashboard'), 1500);
      }
    } catch (err) {
      console.error('❌ Error saving form:', err);
      alert('❌ Failed to save form. Try again.');
    } finally {
      setSaving(false);
    }
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
      <header className="bg-indigo-600 text-white py-4 px-6 shadow-md flex items-center justify-between">
        <h1 className="text-lg font-bold">📋 WhatsOrder</h1>
        <div className="text-2xl">☰</div>
      </header>

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
            className="w-full border px-3 py-2 rounded-md"
          />
          <input
            type="tel"
            placeholder="WhatsApp Number (e.g. 91XXXXXXXXXX)"
            value={whatsappNumber}
            onChange={(e) => setWhatsappNumber(e.target.value)}
            className="w-full border px-3 py-2 rounded-md"
          />

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
                  className="w-full border px-3 py-1.5 rounded"
                />
                <input
                  type="number"
                  placeholder="Price"
                  value={product.price}
                  onChange={(e) => handleProductChange(index, 'price', e.target.value)}
                  className="w-full border px-3 py-1.5 rounded"
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
            disabled={saving}
            className="bg-indigo-600 text-white w-full py-2 rounded-md font-semibold hover:bg-indigo-700"
          >
            {saving ? 'Saving...' : 'Generate Link'}
          </button>

          {generatedLink && (
            <div className="mt-4 space-y-2">
              <p className="text-sm text-center text-blue-600 break-words">
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
