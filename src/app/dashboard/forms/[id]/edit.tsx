'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@/hooks/useUser';
import { db } from '@/lib/firestore';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { uploadImage } from '@/lib/storage';

export default function EditFormPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, loading } = useUser();

  const [bizName, setBizName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [products, setProducts] = useState<
    { name: string; price: number | string; image: string; file?: File | null }[]
  >([]);
  const [saving, setSaving] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const ref = doc(db, 'forms', id as string);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          const data = snap.data();
          setBizName(data.businessName || '');
          setWhatsapp(data.whatsappNumber || '');
          setProducts(
            data.products.map((p: any) => ({
              name: p.name,
              price: p.price,
              image: p.image,
              file: null,
            }))
          );
        } else {
          alert('Form not found.');
          router.push('/dashboard');
        }
      } catch (err) {
        console.error('Error loading form:', err);
        alert('Failed to load form.');
        router.push('/dashboard');
      } finally {
        setLoadingData(false);
      }
    };

    if (id) loadData();
  }, [id, router]);

  const handleChange = (i: number, field: 'name' | 'price', value: string) => {
    const updated = [...products];
    updated[i][field] = value;
    setProducts(updated);
  };

  const handleFileChange = (i: number, file: File | null) => {
    const updated = [...products];
    updated[i].file = file;
    setProducts(updated);
  };

  const handleUpdate = async () => {
    if (!bizName.trim() || !whatsapp.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setSaving(true);

      const updatedProducts = await Promise.all(
        products.map(async (p) => {
          let imageUrl = p.image;
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

      await updateDoc(doc(db, 'forms', id as string), {
        businessName: bizName.trim(),
        whatsappNumber: whatsapp.trim(),
        products: updatedProducts,
      });

      const slug = bizName
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');

      router.push(`/preview/${slug}?id=${id}`);
    } catch (err) {
      console.error('Error updating form:', err);
      alert('Failed to update form.');
    } finally {
      setSaving(false);
    }
  };

  if (loadingData) {
    return <div className="text-center mt-10 text-gray-500">Loading...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-2xl font-bold text-indigo-600 text-center">✏️ Edit Form</h1>

      <input
        type="text"
        placeholder="Business Name"
        value={bizName}
        onChange={(e) => setBizName(e.target.value)}
        className="w-full border rounded px-3 py-2"
      />

      <input
        type="tel"
        placeholder="WhatsApp Number"
        value={whatsapp}
        onChange={(e) => setWhatsapp(e.target.value)}
        className="w-full border rounded px-3 py-2"
      />

      <div>
        <h3 className="text-gray-700 font-semibold mb-2">🛍️ Products</h3>
        {products.map((p, i) => (
          <div key={i} className="space-y-2 mb-4 border p-3 rounded-lg">
            <input
              type="text"
              placeholder="Product Name"
              value={p.name}
              onChange={(e) => handleChange(i, 'name', e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
            <input
              type="number"
              placeholder="Price"
              value={p.price}
              onChange={(e) => handleChange(i, 'price', e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
            {p.image && (
              <img
                src={p.image}
                alt="Product"
                className="w-full h-32 object-cover rounded-md border"
              />
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(i, e.target.files?.[0] || null)}
              className="w-full"
            />
          </div>
        ))}
      </div>

      <button
        onClick={handleUpdate}
        disabled={saving}
        className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
      >
        {saving ? 'Saving...' : 'Update Form'}
      </button>
    </div>
  );
              }
