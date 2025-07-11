
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/hooks/useUser';
import { collection, addDoc, doc, updateDoc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  image?: string;
  category?: string;
  available: boolean;
}

interface OrderForm {
  id?: string;
  businessName: string;
  description: string;
  phoneNumber: string;
  products: Product[];
  userId: string;
  createdAt: Date;
  isActive: boolean;
  theme: 'default' | 'dark' | 'colorful';
  customization: {
    logo?: string;
    primaryColor: string;
    welcomeMessage: string;
  };
}

interface OrderFormEditorProps {
  formId?: string;
  initialData?: any;
}

export default function OrderFormEditor({ formId, initialData }: OrderFormEditorProps) {
  const { user } = useUser();
  const router = useRouter();
  const [form, setForm] = useState<OrderForm>({
    businessName: initialData?.businessName || '',
    description: '',
    phoneNumber: '',
    products: initialData?.products || [],
    userId: user?.uid || '',
    createdAt: new Date(),
    isActive: true,
    theme: 'default',
    customization: {
      primaryColor: '#2563eb',
      welcomeMessage: 'Welcome! Browse our products and place your order.',
    },
  });
  const [userProfile, setUserProfile] = useState<any>(null);
  const [currentProduct, setCurrentProduct] = useState<Product>({
    id: '',
    name: '',
    price: 0,
    description: '',
    category: 'General',
    available: true,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'products' | 'design'>('basic');
  const [showProductForm, setShowProductForm] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const categories = ['General', 'Food', 'Beverages', 'Electronics', 'Clothing', 'Books', 'Other'];

  useEffect(() => {
    if (formId) {
      loadForm();
    } else if (initialData) {
      setForm(prev => ({
        ...prev,
        businessName: initialData.businessName || '',
        products: initialData.products || []
      }));
    }
    
    // Load user profile for auto-filling
    if (user && !formId) {
      loadUserProfile();
    }
  }, [formId, initialData, user]);

  const loadUserProfile = async () => {
    try {
      const docRef = doc(db, 'users', user!.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const profile = docSnap.data();
        setUserProfile(profile);
        
        // Auto-fill form with user's saved info
        setForm(prev => ({
          ...prev,
          businessName: prev.businessName || profile.businessName || '',
          phoneNumber: prev.phoneNumber || profile.phone || '',
        }));
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const loadForm = async () => {
    try {
      const docRef = doc(db, 'orderForms', formId!);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setForm({ ...docSnap.data() as OrderForm, id: formId });
      }
    } catch (error) {
      console.error('Error loading form:', error);
    }
  };

  const handleImageUpload = async (file: File, isLogo = false) => {
    try {
      setUploadingImage(true);
      const fileName = `${Date.now()}_${file.name}`;
      const storageRef = ref(storage, `images/${fileName}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      if (isLogo) {
        setForm(prev => ({
          ...prev,
          customization: { ...prev.customization, logo: downloadURL }
        }));
      } else {
        setCurrentProduct(prev => ({ ...prev, image: downloadURL }));
      }
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setUploadingImage(false);
    }
  };

  const addProduct = () => {
    if (!currentProduct.name || currentProduct.price <= 0) return;
    
    const product = {
      ...currentProduct,
      id: Date.now().toString(),
    };
    
    setForm(prev => ({ ...prev, products: [...prev.products, product] }));
    setCurrentProduct({
      id: '',
      name: '',
      price: 0,
      description: '',
      category: 'General',
      available: true,
    });
    setShowProductForm(false);
  };

  const removeProduct = (productId: string) => {
    setForm(prev => ({
      ...prev,
      products: prev.products.filter(p => p.id !== productId)
    }));
  };

  const saveForm = async () => {
    if (!user || !form.businessName || !form.phoneNumber) return;
    
    try {
      setIsLoading(true);
      const formData = { 
        ...form, 
        userId: user.uid,
        slug: form.businessName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
        createdAt: formId ? form.createdAt : new Date(),
        updatedAt: new Date()
      };
      
      let savedFormId = formId;
      if (formId) {
        const docRef = doc(db, 'orderForms', formId);
        await updateDoc(docRef, formData);
      } else {
        const docRef = await addDoc(collection(db, 'orderForms'), formData);
        savedFormId = docRef.id;
      }
      
      // Update user profile with business info if not already saved
      if (!userProfile?.businessName || !userProfile?.phone) {
        const userDocRef = doc(db, 'users', user.uid);
        await updateDoc(userDocRef, {
          businessName: form.businessName,
          phone: form.phoneNumber,
          updatedAt: new Date()
        });
      }
      
      // Create preview URL
      const previewUrl = `/preview/${encodeURIComponent(formData.slug)}?id=${savedFormId}`;
      
      router.push(previewUrl);
    } catch (error) {
      console.error('Error saving form:', error);
      alert('Error saving form. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* App Bar */}
      <header className="app-bar">
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => router.back()}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <span className="material-icon">←</span>
          </button>
          <div>
            <h1 className="material-headline6">
              {formId ? 'Edit Form' : 'Create Form'}
            </h1>
            <p className="material-caption text-gray-500">Build your order form</p>
          </div>
        </div>
        <button
          onClick={saveForm}
          disabled={isLoading}
          className="material-button material-button-primary"
        >
          {isLoading ? '⏳' : '💾'} Save
        </button>
      </header>

      {/* Tab Bar */}
      <div className="bg-white border-b border-gray-200 px-4">
        <div className="flex space-x-6">
          {[
            { id: 'basic', label: 'Basic Info', icon: '📝' },
            { id: 'products', label: 'Products', icon: '🛍️' },
            { id: 'design', label: 'Design', icon: '🎨' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3 px-1 border-b-2 transition-colors duration-200 ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500'
              }`}
            >
              <div className="flex items-center space-x-2">
                <span>{tab.icon}</span>
                <span className="material-subtitle2">{tab.label}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-6">
        {activeTab === 'basic' && (
          <div className="space-y-4">
            <div className="material-card p-6">
              <h2 className="material-headline6 mb-4">Business Information</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="material-subtitle2 text-gray-700">Business Name *</label>
                  <input
                    type="text"
                    value={form.businessName}
                    onChange={(e) => setForm(prev => ({ ...prev, businessName: e.target.value }))}
                    className="material-input-filled mt-1"
                    placeholder="Enter your business name"
                  />
                </div>
                
                <div>
                  <label className="material-subtitle2 text-gray-700">Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                    className="material-textarea mt-1"
                    rows={3}
                    placeholder="Describe your business..."
                  />
                </div>
                
                <div>
                  <label className="material-subtitle2 text-gray-700">WhatsApp Number *</label>
                  <input
                    type="tel"
                    value={form.phoneNumber}
                    onChange={(e) => setForm(prev => ({ ...prev, phoneNumber: e.target.value }))}
                    className="material-input-filled mt-1"
                    placeholder="+1234567890"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <div className="space-y-4">
            {/* Add Product Button */}
            <div className="material-card p-4">
              <button
                onClick={() => setShowProductForm(true)}
                className="w-full flex items-center justify-center space-x-2 p-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-blue-600 hover:text-blue-600 transition-colors duration-200"
              >
                <span className="text-2xl">➕</span>
                <span className="material-subtitle2">Add Product</span>
              </button>
            </div>

            {/* Products List */}
            {form.products.map((product) => (
              <div key={product.id} className="material-card p-4">
                <div className="flex items-start space-x-4">
                  {product.image && (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-16 h-16 rounded-xl object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="material-subtitle1">{product.name}</h3>
                      <button
                        onClick={() => removeProduct(product.id)}
                        className="p-1 text-red-500 hover:bg-red-50 rounded-full"
                      >
                        🗑️
                      </button>
                    </div>
                    <p className="material-body2 text-gray-600">{product.description}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="material-subtitle2 text-green-600">${product.price}</span>
                      <span className={`status-chip ${product.available ? 'status-chip-success' : 'status-chip-error'}`}>
                        {product.available ? 'Available' : 'Out of Stock'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'design' && (
          <div className="space-y-4">
            <div className="material-card p-6">
              <h2 className="material-headline6 mb-4">Customization</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="material-subtitle2 text-gray-700">Welcome Message</label>
                  <textarea
                    value={form.customization.welcomeMessage}
                    onChange={(e) => setForm(prev => ({
                      ...prev,
                      customization: { ...prev.customization, welcomeMessage: e.target.value }
                    }))}
                    className="material-textarea mt-1"
                    rows={2}
                    placeholder="Welcome message for customers..."
                  />
                </div>
                
                <div>
                  <label className="material-subtitle2 text-gray-700">Primary Color</label>
                  <input
                    type="color"
                    value={form.customization.primaryColor}
                    onChange={(e) => setForm(prev => ({
                      ...prev,
                      customization: { ...prev.customization, primaryColor: e.target.value }
                    }))}
                    className="mt-1 w-full h-12 rounded-xl border border-gray-200"
                  />
                </div>
                
                <div>
                  <label className="material-subtitle2 text-gray-700">Business Logo</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], true)}
                    className="mt-1 w-full"
                  />
                  {form.customization.logo && (
                    <img
                      src={form.customization.logo}
                      alt="Logo"
                      className="mt-2 w-20 h-20 rounded-xl object-cover"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Product Form Modal */}
      {showProductForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="w-full bg-white rounded-t-3xl max-h-[80vh] overflow-auto animate-slide-in-bottom">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="material-headline6">Add Product</h3>
                <button
                  onClick={() => setShowProductForm(false)}
                  className="p-2 rounded-full hover:bg-gray-100"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-4 space-y-4">
              <div>
                <label className="material-subtitle2 text-gray-700">Product Name *</label>
                <input
                  type="text"
                  value={currentProduct.name}
                  onChange={(e) => setCurrentProduct(prev => ({ ...prev, name: e.target.value }))}
                  className="material-input-filled mt-1"
                  placeholder="Enter product name"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="material-subtitle2 text-gray-700">Price *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={currentProduct.price}
                    onChange={(e) => setCurrentProduct(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
                    className="material-input-filled mt-1"
                    placeholder="0.00"
                  />
                </div>
                
                <div>
                  <label className="material-subtitle2 text-gray-700">Category</label>
                  <select
                    value={currentProduct.category}
                    onChange={(e) => setCurrentProduct(prev => ({ ...prev, category: e.target.value }))}
                    className="material-input-filled mt-1"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="material-subtitle2 text-gray-700">Description</label>
                <textarea
                  value={currentProduct.description}
                  onChange={(e) => setCurrentProduct(prev => ({ ...prev, description: e.target.value }))}
                  className="material-textarea mt-1"
                  rows={3}
                  placeholder="Product description..."
                />
              </div>
              
              <div>
                <label className="material-subtitle2 text-gray-700">Product Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
                  className="mt-1 w-full"
                  disabled={uploadingImage}
                />
                {currentProduct.image && (
                  <img
                    src={currentProduct.image}
                    alt="Product"
                    className="mt-2 w-20 h-20 rounded-xl object-cover"
                  />
                )}
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setShowProductForm(false)}
                  className="flex-1 material-button material-button-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={addProduct}
                  disabled={!currentProduct.name || currentProduct.price <= 0}
                  className="flex-1 material-button material-button-primary disabled:opacity-50"
                >
                  Add Product
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
