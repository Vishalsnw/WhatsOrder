'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Product = {
  name: string;
  price: string;
};

export default function FormBuilder() {
  const router = useRouter();

  const [businessName, setBusinessName] = useState('');
  const [whatsapp, setWhatsapp] = useState('+91');
  const [products, setProducts] = useState<Product[]>([
    { name: '', price: '' },
  ]);

  const handleAddProduct = () => {
    setProducts([...products, { name: '', price: '' }]);
  };

  const handleChangeProduct = (
    index: number,
    field: keyof Product,
    value: string
  ) => {
    const newProducts = [...products];
    newProducts[index][field] = value;
    setProducts(newProducts);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validProducts = products.filter((p) => p.name.trim() !== '');
    if (!businessName.trim()) {
      alert('Please enter a business name.');
      return;
    }
    if (!/^\+91\d{10}$/.test(whatsapp.trim())) {
      alert('Please enter a valid WhatsApp number in +91XXXXXXXXXX format.');
      return;
    }
    if (validProducts.length === 0) {
      alert('Please add at least one product with a name.');
      return;
    }

    const slug = businessName
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');

    const query = new URLSearchParams({
      whatsapp: whatsapp.trim(),
      products: JSON.stringify(validProducts),
    }).toString();

    router.push(`/preview/${slug}?${query}`);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 max-w-2xl mx-auto p-4 bg-white rounded shadow"
    >
      <h1 className="text-2xl font-bold text-center mb-4 text-green-600">
        🛠️ Create Your WhatsApp Order Form
      </h1>

      <input
        type="text"
        placeholder="Business Name"
        value={businessName}
        onChange={(e) => setBusinessName(e.target.value)}
        required
        className="w-full border px-4 py-2 rounded"
      />

      <input
        type="tel"
        placeholder="WhatsApp Number (e.g., +91XXXXXXXXXX)"
        value={whatsapp}
        onChange={(e) => {
          const value = e.target.value.replace(/^\+?91/, '');
          setWhatsapp('+91' + value.slice(0, 10));
        }}
        required
        maxLength={13}
        className="w-full border px-4 py-2 rounded"
      />

      <div>
        <h2 className="text-lg font-semibold mb-2">📦 Products</h2>
        {products.map((product, index) => (
          <div key={index} className="grid grid-cols-2 gap-4 mb-2">
            <input
              type="text"
              placeholder="Product Name"
              value={product.name}
              onChange={(e) =>
                handleChangeProduct(index, 'name', e.target.value)
              }
              required
              className="border px-4 py-2 rounded"
            />
            <input
              type="number"
              placeholder="Price (optional)"
              value={product.price}
              onChange={(e) =>
                handleChangeProduct(index, 'price', e.target.value)
              }
              className="border px-4 py-2 rounded"
              min="0"
            />
          </div>
        ))}

        <button
          type="button"
          onClick={handleAddProduct}
          className="text-green-600 underline text-sm mt-2"
        >
          + Add another product
        </button>
      </div>

      <button
        type="submit"
        className="w-full bg-green-600 text-white py-2 rounded font-semibold hover:bg-green-700"
      >
        🚀 Generate Order Page
      </button>
    </form>
  );
}
