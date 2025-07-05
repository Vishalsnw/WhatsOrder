'use client';

import { useState } from 'react';
import { uploadImageAndGetURL } from '@/lib/storage';

interface Product {
  name: string;
  price: string;
  image?: string;
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
  initialPhone = '',
  initialProducts = [],
  onSubmit,
  submitting = false,
}: Props) {
  const [businessName, setBusinessName] = useState(initialBizName);
  const [phone, setPhone] = useState(initialPhone);
  const [products, setProducts] = useState<Product[]>(
    initialProducts.length > 0
      ? initialProducts
      : [{ name: '', price: '', image: '' }]
  );

  const handleProductChange = (
    index: number,
    field: keyof Product,
    value: string
  ) => {
    const updated = [...products];
    updated[index][field] = value;
    setProducts(updated);
  };

  const handleImageUpload = async (index: number, file: File | null) => {
    if (!file) return;
    const url = await uploadImageAndGetURL(file);
    const updated = [...products];
    updated[index].image = url;
    setProducts(updated);
  };

  const addProduct = () => {
    setProducts([...products, { name: '', price: '', image: '' }]);
  };

  const removeProduct = (index: number) => {
    const updated = [...products];
    updated.splice(index, 1);
    setProducts(updated);
  };

  const handleSubmit = () => {
    const validProducts = products.filter(
      (p) => p.name.trim() && p.price.trim()
    );
    if (!businessName.trim() || !phone.trim() || validProducts.length === 0) {
      alert('Please fill all required fields and add at least one product.');
      return;
    }
    onSubmit({
      businessName: businessName.trim(),
      phone: phone.trim(),
      products: validProducts,
    });
  };

  return (
    <div className="space-y-6">
      <input
        type="text"
        placeholder="Business Name"
        value={businessName}
        onChange={(e) => setBusinessName(e.target.value)}
        className="w-full"
      />

      <input
        type="tel"
        placeholder="WhatsApp Number"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        className="w-full"
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
              className="w-full"
            />
            <input
              type="number"
              placeholder="Price"
              value={product.price}
              onChange={(e) =>
                handleProductChange(index, 'price', e.target.value)
              }
              className="w-full"
            />
            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                handleImageUpload(index, e.target.files?.[0] || null)
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
            <button
              type="button"
              onClick={() => removeProduct(index)}
              className="text-sm text-red-500 hover:underline absolute top-1 right-2"
            >
              Remove
            </button>
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
        disabled={submitting}
        className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700"
      >
        {submitting ? 'Saving...' : 'Save Form'}
      </button>
    </div>
  );
                                  }
