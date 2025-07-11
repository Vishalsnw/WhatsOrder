
'use client';

import { useSearchParams } from 'next/navigation';
import { useState, useEffect, useMemo } from 'react';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface Product {
  name: string;
  price: number;
  image?: string;
  description?: string;
  available?: boolean;
}

function isValidProduct(obj: any): obj is Product {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.name === 'string' &&
    typeof obj.price === 'number' &&
    (typeof obj.image === 'string' || typeof obj.image === 'undefined')
  );
}

export default function PreviewOrderPage({ params }: { params: { slug: string } }) {
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if we have an ID parameter (loading from database)
  const formId = searchParams.get('id');
  const directBiz = searchParams.get('biz');
  const directPhone = searchParams.get('phone');
  const directProducts = searchParams.get('products');

  // Load form data if ID is provided, otherwise search by slug
  useEffect(() => {
    const loadFormData = async () => {
      try {
        if (formId) {
          // Try to find form in all users' collections by ID
          const usersRef = collection(db, 'users');
          const usersSnapshot = await getDocs(usersRef);
          
          for (const userDoc of usersSnapshot.docs) {
            const formRef = doc(db, 'users', userDoc.id, 'forms', formId);
            const formSnap = await getDoc(formRef);
            
            if (formSnap.exists()) {
              const data = formSnap.data();
              setFormData({
                ...data,
                id: formId,
                createdAt: data.createdAt?.toDate() || new Date()
              });
              setLoading(false);
              return;
            }
          }
          
          // If not found by ID, try old collection
          const oldFormRef = doc(db, 'forms', formId);
          const oldFormSnap = await getDoc(oldFormRef);
          
          if (oldFormSnap.exists()) {
            const data = oldFormSnap.data();
            setFormData({
              ...data,
              id: formId,
              createdAt: data.createdAt?.toDate() || new Date()
            });
          } else {
            setError('Form not found');
          }
        } else if (params.slug) {
          // Search by slug in all users' collections
          const usersRef = collection(db, 'users');
          const usersSnapshot = await getDocs(usersRef);
          
          for (const userDoc of usersSnapshot.docs) {
            const formsRef = collection(db, 'users', userDoc.id, 'forms');
            const slugQuery = query(formsRef, where('slug', '==', params.slug));
            const formsSnapshot = await getDocs(slugQuery);
            
            if (!formsSnapshot.empty) {
              const formDoc = formsSnapshot.docs[0];
              const data = formDoc.data();
              setFormData({
                ...data,
                id: formDoc.id,
                createdAt: data.createdAt?.toDate() || new Date()
              });
              setLoading(false);
              return;
            }
          }
          
          setError('Form not found');
        }
      } catch (error) {
        console.error('Error loading form:', error);
        setError('Error loading form');
      }
      setLoading(false);
    };

    loadFormData();
  }, [formId, params.slug]);

  // Determine business name, phone, and products
  const businessName = formData?.businessName || decodeURIComponent(directBiz || 'Business');
  const phone = formData?.phoneNumber || directPhone || '919999888877';
  const welcomeMessage = formData?.customization?.welcomeMessage || 'Welcome! Browse our products and place your order.';
  const primaryColor = formData?.customization?.primaryColor || '#2563eb';
  const logo = formData?.customization?.logo;
  
  const parsedProducts: Product[] = useMemo(() => {
    // If we have form data from database, use it
    if (formData?.products) {
      return formData.products.filter(isValidProduct);
    }

    // Otherwise parse from URL parameters
    if (!directProducts) return [];

    const rawProducts: (Product | null)[] = directProducts.split(',').map((entry) => {
      try {
        const parts = entry.split('-');
        if (parts.length < 2) return null;

        const name = decodeURIComponent(parts[0]?.trim());
        const price = Number(decodeURIComponent(parts[1]?.trim()));
        const image = parts[2] ? decodeURIComponent(parts.slice(2).join('-').trim()) : undefined;

        if (!name || isNaN(price)) return null;

        return { name, price, image, available: true };
      } catch {
        return null;
      }
    });

    const validProducts: Product[] = [];
    for (const product of rawProducts) {
      if (product !== null && isValidProduct(product)) {
        validProducts.push(product);
      }
    }

    return validProducts;
  }, [formData, directProducts]);

  const [quantities, setQuantities] = useState<number[]>([]);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');

  useEffect(() => {
    setQuantities(parsedProducts.map(() => 0));
  }, [parsedProducts]);

  const handleQuantityChange = (index: number, value: number) => {
    const newQuantities = [...quantities];
    newQuantities[index] = Math.max(0, value);
    setQuantities(newQuantities);
  };

  const total = parsedProducts.reduce(
    (sum, product, i) => sum + (quantities[i] || 0) * product.price,
    0
  );

  const handlePlaceOrder = () => {
    const orderLines = parsedProducts
      .map((p, i) => (quantities[i] > 0 ? `- ${quantities[i]}x ${p.name}` : ''))
      .filter(Boolean)
      .join('\n');

    if (!orderLines) {
      alert('Please select at least one item.');
      return;
    }

    if (!name.trim() || !address.trim()) {
      alert('Please enter your name and address.');
      return;
    }

    const message = `Hello ${businessName},\nI'd like to order:\n${orderLines}\n\nTotal: ₹${total}\n\nName: ${name}\nAddress: ${address}`;
    const url = `https://wa.me/${phone.replace('+', '')}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const handleShareToWhatsApp = () => {
    const currentUrl = window.location.href;
    const shareMessage = `Check out ${businessName}'s order form: ${currentUrl}`;
    const shareUrl = `https://wa.me/?text=${encodeURIComponent(shareMessage)}`;
    window.open(shareUrl, '_blank');
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-8 flex flex-col">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md mx-auto w-full">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-4 h-4 bg-blue-600 rounded-full animate-bounce"></div>
            <div className="w-4 h-4 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-4 h-4 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
          <p className="text-center text-gray-600 mt-4">Loading your order form...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 px-4 py-8 flex flex-col">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md mx-auto w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Form Not Found</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <a 
            href="/"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Home
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-8 flex flex-col">
      <div className="bg-white rounded-2xl shadow-xl max-w-md mx-auto w-full overflow-hidden">
        {/* Header with Logo */}
        <div 
          className="p-6 text-white text-center"
          style={{ background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}dd)` }}
        >
          {logo && (
            <img
              src={logo}
              alt={`${businessName} Logo`}
              className="w-16 h-16 rounded-full mx-auto mb-3 border-4 border-white shadow-lg"
            />
          )}
          <h1 className="text-2xl font-bold mb-2">🛒 {businessName}</h1>
          <p className="text-white/90 text-sm">{welcomeMessage}</p>
        </div>

        <div className="p-6 space-y-6">
          {/* Share Button */}
          <div className="flex justify-center">
            <button
              onClick={handleShareToWhatsApp}
              className="flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-full hover:bg-green-600 transition-colors shadow-lg"
            >
              <span>📱</span>
              <span className="font-medium">Share to WhatsApp</span>
            </button>
          </div>

          {/* Products */}
          {parsedProducts.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📦</span>
              </div>
              <p className="text-gray-500 font-medium">No products available</p>
              <p className="text-gray-400 text-sm">Please check back later</p>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <span className="mr-2">🛍️</span>
                Our Products
              </h3>
              
              {parsedProducts.map((product, index) => (
                <div
                  key={index}
                  className="bg-gray-50 rounded-xl p-4 border border-gray-100 hover:shadow-md transition-shadow"
                >
                  <div className="flex gap-4 items-center">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-16 h-16 object-cover rounded-xl border-2 border-gray-200"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl flex items-center justify-center border-2 border-gray-200">
                        <span className="text-gray-500 text-xs">📦</span>
                      </div>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 truncate">{product.name}</h4>
                      {product.description && (
                        <p className="text-sm text-gray-600 truncate">{product.description}</p>
                      )}
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-lg font-bold text-green-600">₹{product.price}</span>
                        {product.available === false && (
                          <span className="text-xs text-red-500 bg-red-50 px-2 py-1 rounded-full">
                            Out of Stock
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleQuantityChange(index, Math.max(0, quantities[index] - 1))}
                        className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
                        disabled={product.available === false}
                      >
                        -
                      </button>
                      <span className="w-8 text-center font-semibold">{quantities[index] || 0}</span>
                      <button
                        onClick={() => handleQuantityChange(index, quantities[index] + 1)}
                        className="w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors"
                        disabled={product.available === false}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Customer Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <span className="mr-2">👤</span>
              Your Details
            </h3>
            
            <input
              type="text"
              placeholder="Your Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />

            <textarea
              placeholder="Delivery Address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Order Summary */}
          {total > 0 && (
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-gray-700">Order Total:</span>
                <span className="text-2xl font-bold text-green-600">₹{total}</span>
              </div>
              <p className="text-sm text-gray-500">
                {parsedProducts.filter((_, i) => quantities[i] > 0).length} item(s) selected
              </p>
            </div>
          )}

          {/* Place Order Button */}
          <button
            onClick={handlePlaceOrder}
            disabled={!parsedProducts.length || total === 0 || !name.trim() || !address.trim()}
            className="w-full bg-green-600 text-white font-semibold py-4 rounded-xl hover:bg-green-700 transition-all duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-lg"
          >
            <span>📱</span>
            <span>Place Order on WhatsApp</span>
          </button>

          {(!name.trim() || !address.trim()) && (
            <p className="text-center text-sm text-gray-500">
              Please fill in your name and address to place an order
            </p>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-gray-500 mt-6 mb-2">
        Made with 💜 using <strong>WhatsOrder</strong>
      </div>
    </main>
  );
}
