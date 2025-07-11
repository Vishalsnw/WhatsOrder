
'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/hooks/useUser';
import { uploadImage } from '@/lib/storage';
import { db } from '@/lib/firebase';
import { addDoc, collection, serverTimestamp, updateDoc, doc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

interface Product {
  id: string;
  name: string;
  price: number;
  image?: string;
  description?: string;
}

interface FormData {
  title: string;
  businessName: string;
  phoneNumber: string;
  products: Product[];
  message?: string;
}

interface OrderFormEditorProps {
  formData?: FormData;
  formId?: string;
}

export default function OrderFormEditor({ formData, formId }: OrderFormEditorProps) {
  const { user } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<FormData>({
    title: '',
    businessName: '',
    phoneNumber: '',
    products: [],
    message: 'Thank you for your order! We will contact you soon.',
    ...formData,
  });

  const [newProduct, setNewProduct] = useState<Omit<Product, 'id'>>({
    name: '',
    price: 0,
    image: '',
    description: '',
  });

  const [imageUploading, setImageUploading] = useState(false);

  const handleImageUpload = async (file: File) => {
    if (!file) return;
    
    setImageUploading(true);
    try {
      const imageUrl = await uploadImage(file, `products/${Date.now()}`);
      setNewProduct(prev => ({ ...prev, image: imageUrl }));
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image');
    } finally {
      setImageUploading(false);
    }
  };

  const addProduct = () => {
    if (!newProduct.name || !newProduct.price) {
      alert('Please fill in product name and price');
      return;
    }

    const product: Product = {
      id: Date.now().toString(),
      ...newProduct,
    };

    setForm(prev => ({
      ...prev,
      products: [...prev.products, product],
    }));

    setNewProduct({
      name: '',
      price: 0,
      image: '',
      description: '',
    });
  };

  const removeProduct = (productId: string) => {
    setForm(prev => ({
      ...prev,
      products: prev.products.filter(p => p.id !== productId),
    }));
  };

  const saveForm = async () => {
    if (!user) {
      alert('Please login first');
      return;
    }

    if (!form.title || !form.businessName || !form.phoneNumber || form.products.length === 0) {
      alert('Please fill in all required fields and add at least one product');
      return;
    }

    setLoading(true);
    try {
      const formDocData = {
        ...form,
        userId: user.uid,
        slug: form.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        views: 0,
        clicks: 0,
        ordersCount: 0,
      };

      if (formId) {
        // Update existing form
        await updateDoc(doc(db, 'forms', formId), {
          ...formDocData,
          createdAt: undefined, // Don't update creation time
        });
        alert('Form updated successfully!');
      } else {
        // Create new form
        const docRef = await addDoc(collection(db, 'forms'), formDocData);
        alert('Form saved successfully!');
        
        // Encode products for preview URL
        const encodedProducts = form.products.map(p => 
          `${encodeURIComponent(p.name)}-${p.price}-${encodeURIComponent(p.image || '')}-${encodeURIComponent(p.description || '')}`
        ).join(',');
        
        // Generate preview URL
        const previewUrl = `/preview/${formDocData.slug}?biz=${encodeURIComponent(form.businessName)}&phone=${encodeURIComponent(form.phoneNumber)}&products=${encodedProducts}`;
        
        // Navigate to preview
        router.push(previewUrl);
        return;
      }
      
      router.push('/dashboard');
    } catch (error) {
      console.error('Error saving form:', error);
      alert('Failed to save form');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold gradient-text mb-2">
          {formId ? 'Edit Order Form' : 'Create New Order Form'}
        </h1>
        <p className="text-gray-600">Build a professional ordering experience for your customers</p>
      </div>

      {/* Form Details Card */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <span className="mr-2">📝</span>
            Form Details
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="label-required">Form Title</label>
            <input
              type="text"
              placeholder="e.g., Pizza Palace Menu"
              value={form.title}
              onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
              className="w-full"
            />
          </div>
          
          <div>
            <label className="label-required">Business Name</label>
            <input
              type="text"
              placeholder="Your Business Name"
              value={form.businessName}
              onChange={(e) => setForm(prev => ({ ...prev, businessName: e.target.value }))}
              className="w-full"
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="label-required">WhatsApp Number</label>
            <input
              type="tel"
              placeholder="+1234567890"
              value={form.phoneNumber}
              onChange={(e) => setForm(prev => ({ ...prev, phoneNumber: e.target.value }))}
              className="w-full"
            />
          </div>
          
          <div className="md:col-span-2">
            <label>Custom Message</label>
            <textarea
              placeholder="Thank you message for customers..."
              value={form.message}
              onChange={(e) => setForm(prev => ({ ...prev, message: e.target.value }))}
              className="w-full h-24 resize-none"
            />
          </div>
        </div>
      </div>

      {/* Add Product Card */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <span className="mr-2">➕</span>
            Add New Product
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="label-required">Product Name</label>
            <input
              type="text"
              placeholder="e.g., Margherita Pizza"
              value={newProduct.name}
              onChange={(e) => setNewProduct(prev => ({ ...prev, name: e.target.value }))}
              className="w-full"
            />
          </div>
          
          <div>
            <label className="label-required">Price</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={newProduct.price || ''}
                onChange={(e) => setNewProduct(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                className="w-full pl-8"
              />
            </div>
          </div>
          
          <div className="md:col-span-2">
            <label>Product Image</label>
            <div className="flex items-center space-x-4">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
                className="flex-1"
                disabled={imageUploading}
              />
              {imageUploading && (
                <div className="flex items-center space-x-2 text-blue-600">
                  <div className="spinner"></div>
                  <span className="text-sm">Uploading...</span>
                </div>
              )}
            </div>
            {newProduct.image && (
              <div className="mt-4">
                <img src={newProduct.image} alt="Preview" className="w-24 h-24 product-image" />
              </div>
            )}
          </div>
          
          <div className="md:col-span-2">
            <label>Description (Optional)</label>
            <textarea
              placeholder="Brief description of the product..."
              value={newProduct.description}
              onChange={(e) => setNewProduct(prev => ({ ...prev, description: e.target.value }))}
              className="w-full h-20 resize-none"
            />
          </div>
          
          <div className="md:col-span-2">
            <button
              onClick={addProduct}
              disabled={!newProduct.name || !newProduct.price || imageUploading}
              className="btn-primary w-full md:w-auto"
            >
              <span className="mr-2">➕</span>
              Add Product
            </button>
          </div>
        </div>
      </div>

      {/* Products List */}
      {form.products.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <span className="mr-2">📦</span>
              Products ({form.products.length})
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {form.products.map((product) => (
              <div key={product.id} className="bg-gray-50 rounded-xl p-4 relative group hover:shadow-md transition-shadow">
                <button
                  onClick={() => removeProduct(product.id)}
                  className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 focus-ring"
                >
                  ×
                </button>
                
                {product.image && (
                  <img src={product.image} alt={product.name} className="w-full h-32 product-image mb-3" />
                )}
                
                <h3 className="font-semibold text-gray-900 mb-1">{product.name}</h3>
                <p className="text-lg font-bold text-blue-600 mb-2">${product.price.toFixed(2)}</p>
                
                {product.description && (
                  <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Save Button */}
      <div className="text-center pb-8">
        <button
          onClick={saveForm}
          disabled={loading || form.products.length === 0}
          className="btn-success text-lg px-8 py-4"
        >
          {loading ? (
            <div className="flex items-center">
              <div className="spinner mr-2"></div>
              {formId ? 'Updating...' : 'Saving...'}
            </div>
          ) : (
            <>
              <span className="mr-2">💾</span>
              {formId ? 'Update Form' : 'Save & Preview Form'}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
