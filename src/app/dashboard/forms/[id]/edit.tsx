'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@/hooks/useUser';
import { db } from '@/lib/firestore';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { uploadImage } from '@/lib/storage';
import DashboardLayout from '@/components/layout/DashboardLayout';

interface Product {
  name: string;
  price: number | string;
  image: string;
  file?: File | null;
}

export default function EditFormPage() {
  const params = useParams();
  const id = typeof params.id === 'string' ? params.id : params.id?.[0];
  const router = useRouter();
  const { user, loading } = useUser();

  const [bizName, setBizName] = useState('');
  const [whatsapp, setWhatsapp] = useState('+91');
  const [products, setProducts] = useState<Product[]>([]);
  const [saving, setSaving] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;

      try {
        const ref = doc(db, 'forms', id);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          const data = snap.data();
          setBizName(data.businessName || '');
          setWhatsapp(
            data.whatsappNumber?.startsWith('+91')
              ? data.whatsappNumber
              : `+91${data.whatsappNumber || ''}`
          );
          setProducts(
            (data.products || []).map((p: any) => ({
              name: p.name || '',
              price: p.price || '',
              image: p.image || '',
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

    loadData();
  }, [id, router]);

  const handleChange = (
    index: number,
    field: 'name' | 'price',
    value: string
  ) => {
    const updated = [...products];
    updated[index][field] = value;
    setProducts(updated);
  };

  const handleFileChange = (index: number, file: File | null) => {
    const updated = [...products];
    updated[index].file = file;
    setProducts(updated);
  };

  const handleUpdate = async () => {
    if (!bizName.trim()) {
      alert('Please enter your business name.');
      return;
    }

    const cleanPhone = whatsapp.replace(/\D/g, '');
    if (!/^91\d{10}$/.test(cleanPhone)) {
      alert('Please enter a valid WhatsApp number.');
      return;
    }

    const validProducts = products.filter(
      (p) => p.name.trim() && !isNaN(Number(p.price)) && Number(p.price) > 0
    );

    if (validProducts.length === 0) {
      alert('Please add at least one valid product with name and price.');
      return;
    }

    try {
      setSaving(true);

      const updatedProducts = await Promise.all(
        validProducts.map(async (product) => {
          let imageUrl = product.image;
          if (product.file) {
            imageUrl = await uploadImage(product.file);
          }

          return {
            name: product.name.trim(),
            price: Number(product.price),
            image: imageUrl || '',
          };
        })
      );

      await updateDoc(doc(db, 'forms', id!), {
        businessName: bizName.trim(),
        whatsappNumber: '+91' + cleanPhone.slice(-10),
        products: updatedProducts,
      });

      const slug = bizName
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');

      const encodedProducts = updatedProducts
        .map((p) =>
          `${encodeURIComponent(p.name)}-${p.price}${
            p.image ? `-${encodeURIComponent(p.image)}` : ''
          }`
        )
        .join(',');

      const previewUrl = `/preview/${slug}?biz=${encodeURIComponent(bizName)}&phone=${encodeURIComponent('+91' + cleanPhone.slice(-10))}&products=${encodedProducts}`;
      
      alert('✅ Form updated successfully! Redirecting to preview...');
      setTimeout(() => router.push(previewUrl), 1000);
    } catch (err) {
      console.error('Error updating form:', err);
      alert('Failed to update form.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      {loadingData ? (
        <div className="text-center mt-10 text-gray-500">⏳ Loading form...</div>
      ) : (
        <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
          <h1 className="text-2xl font-bold text-indigo-600 text-center">
            ✏️ Edit Form
          </h1>

          <input
            type="text"
            placeholder="Business Name"
            value={bizName}
            onChange={(e) => setBizName(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />

          <input
            type="tel"
            placeholder="e.g. +91XXXXXXXXXX"
            value={whatsapp}
            onChange={(e) => {
              const clean = e.target.value.replace(/\D/g, '').slice(-10);
              setWhatsapp('+91' + clean);
            }}
            className="w-full border rounded px-3 py-2"
            maxLength={13}
          />

          <div>
            <h3 className="text-gray-700 font-semibold mb-2">🛍️ Products</h3>

            {products.length === 0 && (
              <p className="text-sm text-red-500">No products to edit.</p>
            )}

            {products.map((product, index) => (
              <div
                key={index}
                className="space-y-2 mb-4 border p-3 rounded-lg bg-gray-50"
              >
                <input
                  type="text"
                  placeholder="Product Name"
                  value={product.name}
                  onChange={(e) =>
                    handleChange(index, 'name', e.target.value)
                  }
                  className="w-full border rounded px-3 py-2"
                />

                <input
                  type="number"
                  placeholder="Price"
                  value={product.price}
                  onChange={(e) =>
                    handleChange(index, 'price', e.target.value)
                  }
                  className="w-full border rounded px-3 py-2"
                  min="1"
                />

                {product.image && (
                  <img
                    src={product.image}
                    alt="Product"
                    className="w-full h-32 object-cover rounded-md border"
                  />
                )}

                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    handleFileChange(index, e.target.files?.[0] || null)
                  }
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
      )}
    </DashboardLayout>
  );
                }
