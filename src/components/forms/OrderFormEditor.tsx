'use client';

import { useState } from 'react';
import { uploadImage } from '@/lib/storage';

interface Product {
  name: string;
  price: string;
  image?: string;
  file?: File | null;
}

interface Props {
  initialBizName?: string;
  initialPhone?: string;
  initialProducts?: Product[];
  onSubmit: (data: {
    businessName: string;
    phone: string;
    products: Product[];
  }) => void;
  submitting?: boolean;
}

export default function OrderFormEditor({
  initialBizName = '',
  initialPhone = '+91',
  initialProducts = [],
  onSubmit,
  submitting = false,
}: Props) {
  const [businessName, setBusinessName] = useState(initialBizName);
  const [phone, setPhone] = useState(
    initialPhone.startsWith('+91') ? initialPhone : `+91${initialPhone}`
  );
  const [products, setProducts] = useState<Product[]>(
    initialProducts.length > 0
      ? initialProducts
      : [{ name: '', price: '', image: '', file: null }]
  );
  const [uploading, setUploading] = useState(false);

  const handleProductChange = (
    index: number,
    field: keyof Product,
    value: string | File | null
  ) => {
    const updated = [...products];
    if (field === 'file') {
      updated[index].file = value as File | null;
    } else {
      updated[index][field] = value as string;
    }
    setProducts(updated);
  };

  const addProduct = () => {
    setProducts([
      ...products,
      { name: '', price: '', image: '', file: null },
    ]);
  };

  const removeProduct = (index: number) => {
    const updated = [...products];
    updated.splice(index, 1);
    setProducts(updated);
  };

  const handlePhoneChange = (value: string) => {
    const cleanValue = value.replace(/^\+?91/, '');
    setPhone('+91' + cleanValue.slice(0, 10));
  };

  const handleSubmit = async () => {
    if (!businessName.trim()) {
      alert('Please enter your business name.');
      return;
    }

    if (!/^\+91\d{10}$/.test(phone.trim())) {
      alert('Please enter a valid 10-digit WhatsApp number.');
      return;
    }

    setUploading(true);

    const validProducts: Product[] = [];

    for (const product of products) {
      const name = product.name.trim();
      const price = Number(product.price);

      if (!name || isNaN(price) || price <= 0) {
        continue;
      }

      let imageUrl = product.image || '';
      if (product.file) {
        try {
          imageUrl = await uploadImage(product.file);
        } catch (err) {
          console.error('Image upload failed:', err);
          alert('Image upload failed.');
          setUploading(false);
          return;
        }
      }

      validProducts.push({
        name,
        price: String(price),
        image: imageUrl,
      });
    }

    setUploading(false);

    if (validProducts.length === 0) {
      alert('Please add at least one valid product.');
      return;
    }

    const data = {
      businessName: businessName.trim(),
      phone: phone.trim(),
      products: validProducts,
    };

    onSubmit(data);
  };

  return (
    <div className="space-y-6">
      <input
        type="text"
        placeholder="Business Name"
        value={businessName}
        onChange={(e) => setBusinessName(e.target.value)}
        className="w-full border px-3 py-2 rounded"
      />

      <input
        type="tel"
        placeholder="+91XXXXXXXXXX"
        value={phone}
        onChange={(e) => handlePhoneChange(e.target.value)}
        className="w-full border px-3 py-2 rounded"
        maxLength={13}
      />

      <div className="space-y-4">
        <h3 className="font-semibold text-sm text-gray-600">🛒 Products</h3>

        {products.map((product, index) => (
          <div
            key={index}
            className="p-3 rounded-lg border bg-gray-50 space-y-2 relative"
          >
            <input
              type="text"
              placeholder="Product Name"
              value={product.name}
              onChange={(e) =>
                handleProductChange(index, 'name', e.target.value)
              }
              className="w-full border px-3 py-2 rounded"
            />

            <input
              type="number"
              placeholder="Price (in ₹)"
              value={product.price}
              onChange={(e) =>
                handleProductChange(index, 'price', e.target.value)
              }
              className="w-full border px-3 py-2 rounded"
              min="1"
            />

            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                handleProductChange(index, 'file', e.target.files?.[0] || null)
              }
              className="w-full"
            />

            {product.image && (
              <img
                src={product.image}
                alt="Preview"
                className="w-full h-32 object-cover rounded-lg border"
              />
            )}

            {products.length > 1 && (
              <button
                type="button"
                onClick={() => removeProduct(index)}
                className="text-sm text-red-500 hover:underline absolute top-1 right-2"
              >
                Remove
              </button>
            )}
          </div>
        ))}

        <button
          type="button"
          onClick={addProduct}
          className="text-sm text-indigo-600 hover:underline"
        >
          + Add Another Product
        </button>
      </div>

      <button
        type="button"
        onClick={handleSubmit}
        disabled={submitting || uploading}
        className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700"
      >
        {submitting || uploading ? 'Saving...' : 'Save Form'}
      </button>
    </div>
  );
        }