'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/hooks/useUser';
import { uploadImage } from '@/lib/storage';
import { db } from '@/lib/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

export default function CreateFormPage() {
  const router = useRouter();
  const { user, loading } = useUser();

  const [bizName, setBizName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [products, setProducts] = useState([{ name: '', price: '', image: '', file: null as File | null }]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
    if (user) {
      setWhatsapp(user.phone);
    }
  }, [user, loading, router]);

  const handleProductChange = (i: number, field: 'name' | 'price', value: string) => {
    const updated = [...products];
    updated[i][field] = value;
    setProducts(updated);
  };

  const handleFileChange = (i: number, file: File | null) => {
    const updated = [...products];
    updated[i].file = file;
    setProducts(updated);
  };

  const addProduct = () => {
    setProducts([...products, { name: '', price: '', image: '', file: null }]);
  };

  const handleCreateForm = async () => {
    if (!bizName.trim() || !whatsapp.trim()) {
      alert('Please fill business name and WhatsApp number.');
      return;
    }

    try {
      setSaving(true);
      const uploadedProducts = await Promise.all(
        products.map(async (p) => {
          let imageUrl = '';
          if (p.file) {
            imageUrl = await uploadImage(p.file);
          }
          return {
            name: p.name.trim(),
            price: Number(p.price),
            image: imageUrl,
          };
        })
      );

      const docRef = await addDoc(collection(db, 'forms'), {
        uid: user?.uid,
        businessName: bizName.trim(),
        phone: whatsapp.trim(),
        products: uploadedProducts,
        createdAt: serverTimestamp(),
      });

      const slug = bizName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      router.push(`/preview/${slug}?id=${docRef.id}`);
    } catch (err) {
      console.error(err);
      alert('Failed to create form.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-2xl font-bold text-indigo-600 text-center">📋 Create Order Form</h1>

      <input
        type="text"
        placeholder="Business Name"
        value={bizName}
        onChange={(e) => setBizName(e.target.value)}
        className="w-full"
      />
      <input
        type="tel"
        placeholder="WhatsApp Number"
        value={whatsapp}
        onChange={(e) => setWhatsapp(e.target.value)}
        className="w-full"
      />

      <div>
        <h3 className="text-gray-700 font-semibold mb-2">🛍️ Products</h3>
        {products.map((p, i) => (
          <div key={i} className="space-y-2 mb-4 border p-3 rounded-lg">
            <input
              type="text"
              placeholder="Product Name"
              value={p.name}
              onChange={(e) => handleProductChange(i, 'name', e.target.value)}
              className="w-full"
            />
            <input
              type="number"
              placeholder="Price"
              value={p.price}
              onChange={(e) => handleProductChange(i, 'price', e.target.value)}
              className="w-full"
            />
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(i, e.target.files?.[0] || null)}
              className="w-full"
            />
          </div>
        ))}
        <button
          type="button"
          onClick={addProduct}
          className="text-sm text-indigo-600 hover:underline mt-1"
        >
          + Add Product
        </button>
      </div>

      <button
        onClick={handleCreateForm}
        disabled={saving}
        className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700"
      >
        {saving ? 'Saving...' : 'Create Form'}
      </button>
    </div>
  );
                            }
