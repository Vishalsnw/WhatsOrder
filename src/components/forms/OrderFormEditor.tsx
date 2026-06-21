
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext'; // Adjust path
import { createOrderForm, Product } from '../../lib/firestore'; // Adjust path

interface OrderFormEditorProps {
  products: Product[];
}

const OrderFormEditor = ({ products }: OrderFormEditorProps) => {
  const router = useRouter();
  const { user } = useAuth();
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [formName, setFormName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleProductToggle = (product: Product) => {
    setSelectedProducts((prevSelected) =>
      prevSelected.find((p) => p.id === product.id)
        ? prevSelected.filter((p) => p.id !== product.id)
        : [...prevSelected, product]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || selectedProducts.length === 0) return;

    setIsSubmitting(true);
    const form = {
      businessName: formName,
      phone: user.phone || '', // Assuming user object has phone
      products: selectedProducts.map(({ id, name, price, image }) => ({ id, name, price, image })),
    };

    await createOrderForm(user.uid, form as any);
    setIsSubmitting(false);
    router.push('/dashboard/forms');
  };

  return (
    <form onSubmit={handleSubmit} className="material-card p-6 space-y-6">
      <div>
        <label htmlFor="formName" className="block text-gray-700 font-semibold mb-2">Form Name</label>
        <input
          type="text"
          id="formName"
          value={formName}
          onChange={(e) => setFormName(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">Select Products</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {products.map((product) => (
            <div
              key={product.id}
              onClick={() => handleProductToggle(product)}
              className={`p-4 border rounded-lg cursor-pointer ${selectedProducts.find((p) => p.id === product.id) ? 'bg-blue-100 border-blue-500' : 'bg-white'}`}>
              <img src={product.image || '/placeholder.png'} alt={product.name} className="w-full h-24 object-cover rounded-md mb-2" />
              <h4 className="font-semibold">{product.name}</h4>
              <p className="text-gray-600">₹{product.price}</p>
            </div>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting || selectedProducts.length === 0}
        className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400"
      >
        {isSubmitting ? 'Creating Form...' : 'Create Form'}
      </button>
    </form>
  );
};

export default OrderFormEditor;
