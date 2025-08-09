
'use client';

import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useUser } from '@/hooks/useUser';
import Link from 'next/link';

interface Product {
  name: string;
  price: number;
  image?: string;
  description?: string;
  available?: boolean;
}

export default function FormPreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { user } = useUser();
  const [formData, setFormData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(null);

  // Resolve params promise
  useEffect(() => {
    params.then(setResolvedParams);
  }, [params]);

  useEffect(() => {
    if (!resolvedParams || !user) return;

    const loadFormData = async () => {
      try {
        // Load from user's forms collection
        const formRef = doc(db, 'users', user.uid, 'forms', resolvedParams.id);
        const formSnap = await getDoc(formRef);

        if (formSnap.exists()) {
          const data = formSnap.data();
          setFormData({
            ...data,
            id: resolvedParams.id,
            createdAt: data.createdAt?.toDate() || new Date()
          });
        } else {
          setError('Form not found');
        }
      } catch (error) {
        console.error('Error loading form:', error);
        setError('Error loading form');
      }
      setLoading(false);
    };

    loadFormData();
  }, [resolvedParams, user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-sm mx-4 w-full">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-4 h-4 bg-blue-600 rounded-full animate-bounce"></div>
            <div className="w-4 h-4 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-4 h-4 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
          <p className="text-center text-gray-600 mt-4">Loading preview...</p>
        </div>
      </div>
    );
  }

  if (error || !formData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-sm mx-4 w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Form Not Found</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link 
            href="/my-forms"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Forms
          </Link>
        </div>
      </div>
    );
  }

  const businessName = formData.businessName || 'Business';
  const welcomeMessage = formData.customization?.welcomeMessage || 'Welcome! Browse our products and place your order.';
  const primaryColor = formData.customization?.primaryColor || '#2563eb';
  const logo = formData.customization?.logo;
  const products = formData.products || [];

  const copyShareLink = () => {
    const shareUrl = `${window.location.origin}/preview/${formData.slug}?id=${formData.id}`;
    navigator.clipboard.writeText(shareUrl);
    alert('Share link copied to clipboard!');
  };

  const shareToWhatsApp = () => {
    const shareUrl = `${window.location.origin}/preview/${formData.slug}?id=${formData.id}`;
    const message = `Check out my order form: ${shareUrl}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Owner Header */}
      <div className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-40">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link href="/my-forms" className="text-blue-600 hover:text-blue-700">
              ← Back
            </Link>
            <h1 className="text-lg font-bold text-gray-900">Form Preview</h1>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={copyShareLink}
              className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
            >
              📋 Copy Link
            </button>
            <button
              onClick={shareToWhatsApp}
              className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
            >
              📱 Share
            </button>
          </div>
        </div>
      </div>

      {/* Preview Notice */}
      <div className="bg-blue-50 border-b border-blue-200 px-4 py-2">
        <p className="text-sm text-blue-800 text-center">
          👁️ This is how your form will look to customers
        </p>
      </div>

      {/* Form Preview (same as customer view but non-functional) */}
      <div className="pb-8">
        <div className="bg-white min-h-screen max-w-md mx-auto w-full overflow-hidden sm:rounded-2xl sm:shadow-xl sm:my-8 sm:min-h-auto">
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

          <div className="p-4 space-y-4 pb-8">
            {/* Products */}
            {products.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📦</span>
                </div>
                <p className="text-gray-500 font-medium">No products added yet</p>
                <p className="text-gray-400 text-sm">Add products in the edit form</p>
              </div>
            ) : (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <span className="mr-2">🛍️</span>
                  Our Products
                </h3>

                {products.map((product: Product, index: number) => (
                  <div
                    key={index}
                    className="bg-gray-50 rounded-xl p-4 border border-gray-100"
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
                        <button className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                          -
                        </button>
                        <span className="w-8 text-center font-semibold">0</span>
                        <button className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center">
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Customer Details Preview */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <span className="mr-2">👤</span>
                Customer Details
              </h3>

              <input
                type="text"
                placeholder="Customer's Full Name"
                disabled
                className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50"
              />

              <textarea
                placeholder="Delivery Address"
                disabled
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 resize-none"
              />
            </div>

            {/* Place Order Button Preview */}
            <button
              disabled
              className="w-full bg-green-600 text-white font-semibold py-4 rounded-xl flex items-center justify-center space-x-2 shadow-lg opacity-75"
            >
              <span>📱</span>
              <span>Place Order on WhatsApp</span>
            </button>

            <p className="text-center text-sm text-gray-500">
              Preview mode - buttons are disabled
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-500 py-4 bg-gray-50">
          Made with 💜 using <strong>WhatsOrder</strong>
        </div>
      </div>
    </div>
  );
}
