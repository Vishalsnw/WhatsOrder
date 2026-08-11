'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext'; // Adjust the path as needed
import { Product, getProducts } from '../../../lib/firestore'; // Adjust the path as needed
import Link from 'next/link';

const ProductsPage = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const fetchProducts = async () => {
        const userProducts = await getProducts(user.uid);
        setProducts(userProducts);
        setLoading(false);
      };

      fetchProducts();
    }
  }, [user]);

  if (loading) {
    return <p>Loading products...</p>;
  }

  return (
    <div className="p-4 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Your Products</h1>
        <Link href="/dashboard/products/new" className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
          Add New Product
        </Link>
      </div>

      {products.length === 0 ? (
        <p>You haven&apos;t added any products yet. Click the button above to get started!</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div key={product.id} className="bg-white p-4 rounded-lg shadow-md">
              <img src={product.image || '/placeholder.png'} alt={product.name} className="w-full h-32 object-cover rounded-md mb-4" />
              <h2 className="text-lg font-semibold">{product.name}</h2>
              <p className="text-gray-600">₹{product.price}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
