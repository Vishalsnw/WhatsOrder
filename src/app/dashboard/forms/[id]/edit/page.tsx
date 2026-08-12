
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@/hooks/useUser';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { CURRENCIES, getCurrencySymbol } from '@/lib/currencies';
import { LANGUAGES } from '@/lib/languages';
import PhoneInput from '@/components/forms/PhoneInput';
import { formatWhatsAppNumber } from '@/lib/countryCodes';
import PaymentOptionsInputs, { PaymentMethodsConfig } from '@/components/forms/PaymentOptionsInputs';
import DeliveryConfigInputs from '@/components/forms/DeliveryConfigInputs';
import { DeliveryConfig } from '@/lib/firestore';

interface Product {
  name: string;
  price: number | string;
  image: string;
  file?: File | null;
  stock?: number | string;
  isUnlimited?: boolean;
  isOutOfStock?: boolean;
  available?: boolean;
}

export default function EditFormPage() {
  const params = useParams();
  const id = typeof params.id === 'string' ? params.id : params.id?.[0];
  const router = useRouter();
  const { user, loading } = useUser();

  const [bizName, setBizName] = useState('');
  const [whatsapp, setWhatsapp] = useState('+91');
  const [currency, setCurrency] = useState('INR');
  const [language, setLanguage] = useState('en');
  const [defaultTemplateStyle, setDefaultTemplateStyle] = useState<'receipt' | 'detailed' | 'minimal'>('receipt');
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodsConfig>({});
  const [deliveryConfig, setDeliveryConfig] = useState<DeliveryConfig>({
    enabled: true,
    type: 'flat',
    baseFee: 5,
    enableFreeDelivery: true,
    freeDeliveryThreshold: 50,
    zones: [
      { id: 'zone-1', name: 'Local Area (0-5 km)', fee: 3 },
      { id: 'zone-2', name: 'City Center', fee: 5 },
      { id: 'zone-3', name: 'Suburbs / Outskirts', fee: 10 },
    ],
    enablePickup: true,
    pickupAddress: '',
  });
  const [products, setProducts] = useState<Product[]>([]);
  const [saving, setSaving] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    const loadFormData = async () => {
      if (!id || !user) {
        alert('Form ID is missing or user not authenticated.');
        router.push('/my-forms');
        return;
      }

      try {
        // Load from user's subcollection
        const userFormRef = doc(db, 'users', user.uid, 'forms', id);
        const userFormSnap = await getDoc(userFormRef);

        if (userFormSnap.exists()) {
          const data = userFormSnap.data();
          setBizName(data.businessName || '');
          setWhatsapp(data.phoneNumber || data.whatsappNumber || '+91');
          setCurrency(data.currency || data.customization?.currency || 'INR');
          setLanguage(data.language || data.customization?.language || 'en');
          if (data.defaultTemplateStyle) setDefaultTemplateStyle(data.defaultTemplateStyle);
          setPaymentMethods(data.paymentMethods || {});
          if (data.deliveryConfig) setDeliveryConfig(data.deliveryConfig);
          setProducts(data.products || []);
        } else {
          alert('Form not found.');
          router.push('/my-forms');
        }
      } catch (err) {
        console.error('Error loading form:', err);
        alert('Error loading form.');
        router.push('/my-forms');
      } finally {
        setLoadingData(false);
      }
    };

    if (user && id) {
      loadFormData();
    }
  }, [id, router, user]);

  const handleChange = (
    index: number,
    field: 'name' | 'price',
    value: string
  ) => {
    const updated = [...products];
    updated[index][field] = value;
    setProducts(updated);
  };

  const handleProductFieldChange = (index: number, field: keyof Product, value: any) => {
    const updated = [...products];
    updated[index] = { ...updated[index], [field]: value };
    setProducts(updated);
  };

  const handleFileChange = (index: number, file: File | null) => {
    const updated = [...products];
    updated[index].file = file;
    setProducts(updated);
  };

  const addProduct = () => {
    setProducts([...products, { name: '', price: '', image: '' }]);
  };

  const removeProduct = (index: number) => {
    setProducts(products.filter((_, i) => i !== index));
  };

  const uploadImage = async (file: File): Promise<string> => {
    const fileName = `${Date.now()}_${file.name}`;
    const storageRef = ref(storage, `images/${fileName}`);
    const snapshot = await uploadBytes(storageRef, file);
    return await getDownloadURL(snapshot.ref);
  };

  const handleUpdate = async () => {
    if (!bizName.trim()) {
      alert('Please enter your business name.');
      return;
    }

    const cleanPhone = whatsapp.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
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

          const isUnlim = product.isUnlimited ?? (product.stock === undefined);
          const numStock = !isUnlim && product.stock !== undefined ? Math.max(0, parseInt(String(product.stock), 10) || 0) : 9999;
          const isOut = Boolean(product.isOutOfStock) || (!isUnlim && numStock <= 0);

          return {
            name: product.name.trim(),
            price: Number(product.price),
            image: imageUrl || '',
            stock: isUnlim ? undefined : numStock,
            isUnlimited: isUnlim,
            isOutOfStock: isOut,
            available: !isOut,
          };
        })
      );

      const slug = bizName
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');

      const currSymbol = getCurrencySymbol(currency);

      const formattedPhone = '+' + formatWhatsAppNumber(whatsapp);

      // Update in user's subcollection
      await updateDoc(doc(db, 'users', user!.uid, 'forms', id!), {
        businessName: bizName.trim(),
        phoneNumber: formattedPhone,
        whatsappNumber: formattedPhone,
        products: updatedProducts,
        currency,
        currencySymbol: currSymbol,
        language,
        defaultTemplateStyle,
        paymentMethods: paymentMethods || {},
        deliveryConfig: deliveryConfig || {},
        slug: slug,
        updatedAt: new Date(),
      });

      // Also update in public collection for sharing
      try {
        await setDoc(doc(db, 'publicForms', id!), {
          businessName: bizName.trim(),
          phoneNumber: formattedPhone,
          whatsappNumber: formattedPhone,
          products: updatedProducts,
          currency,
          currencySymbol: currSymbol,
          language,
          defaultTemplateStyle,
          paymentMethods: paymentMethods || {},
          deliveryConfig: deliveryConfig || {},
          slug: slug,
          updatedAt: new Date(),
          userId: user!.uid,
          uid: user!.uid,
          ownerId: user!.uid,
        }, { merge: true });
      } catch (publicUpdateError) {
        console.warn('Could not update public form:', publicUpdateError);
      }

      // Save preferred currency for future forms
      try {
        localStorage.setItem('whatsorder_preferred_currency', currency);
      } catch (e) {
        console.error('Failed to save currency preference', e);
      }

      alert('✅ Form updated successfully!');
      router.push('/my-forms');
    } catch (err) {
      console.error('Error updating form:', err);
      alert('Failed to update form. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading || loadingData) {
    return (
      <DashboardLayout>
        <div className="space-y-4 animate-pulse">
          <div className="skeleton h-32 rounded-2xl"></div>
          <div className="skeleton h-48 rounded-2xl"></div>
          <div className="skeleton h-48 rounded-2xl"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="material-card p-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="material-headline5 text-white">Edit Form</h1>
              <p className="material-subtitle1 text-blue-100">
                Update your order form details
              </p>
            </div>
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-2xl">✏️</span>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="material-card p-6">
          <div className="space-y-6">
            {/* Business Info */}
            <div>
              <h3 className="material-headline6 mb-4">Business Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="material-subtitle2 text-gray-700">Business Name *</label>
                  <input
                    type="text"
                    placeholder="Enter your business name"
                    value={bizName}
                    onChange={(e) => setBizName(e.target.value)}
                    className="material-input-filled mt-1"
                  />
                </div>

                <div>
                  <PhoneInput
                    value={whatsapp}
                    onChange={(val) => setWhatsapp(val)}
                    label="WhatsApp Number (With Country Flag & Dial Code) 📱"
                    required
                    helperText="Customers will send WhatsApp order messages directly to this number."
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="material-subtitle2 text-gray-700">Store Currency 💱 *</label>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="material-input-filled mt-1 bg-white"
                    >
                      {CURRENCIES.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="material-subtitle2 text-gray-700">Form Language 🌐 *</label>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="material-input-filled mt-1 bg-white"
                    >
                      {LANGUAGES.map((l) => (
                        <option key={l.code} value={l.code}>
                          {l.flag} {l.name} ({l.nativeName}) {l.dir === 'rtl' ? '— [RTL]' : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="material-subtitle2 text-gray-700">Default Receipt Format 🧾</label>
                    <select
                      value={defaultTemplateStyle}
                      onChange={(e) => setDefaultTemplateStyle(e.target.value as any)}
                      className="material-input-filled mt-1 bg-white"
                    >
                      <option value="receipt">Formatted Receipt 🧾 (Detailed with totals & payment links)</option>
                      <option value="detailed">Detailed Summary 📋 (Full order breakdown)</option>
                      <option value="minimal">Quick Message ⚡ (Short & simple list)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Products */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="material-headline6">Products</h3>
                <button
                  onClick={addProduct}
                  className="material-button material-button-primary"
                >
                  <span className="mr-1">➕</span>
                  Add Product
                </button>
              </div>

              {products.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-xl">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-xl text-gray-400">🛍️</span>
                  </div>
                  <p className="material-body2 text-gray-600">No products added yet</p>
                  <button
                    onClick={addProduct}
                    className="material-button material-button-secondary mt-3"
                  >
                    Add Your First Product
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {products.map((product, index) => (
                    <div
                      key={index}
                      className="p-4 border border-gray-200 rounded-xl bg-gray-50"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="material-subtitle1">Product {index + 1}</h4>
                        <button
                          onClick={() => removeProduct(index)}
                          className="p-1 text-red-500 hover:bg-red-50 rounded-full"
                        >
                          🗑️
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="material-caption text-gray-600">Product Name *</label>
                          <input
                            type="text"
                            placeholder="Enter product name"
                            value={product.name}
                            onChange={(e) =>
                              handleChange(index, 'name', e.target.value)
                            }
                            className="material-input-filled mt-1"
                          />
                        </div>

                        <div>
                          <label className="material-caption text-gray-600">Price ({getCurrencySymbol(currency)}) *</label>
                          <input
                            type="number"
                            placeholder="Enter price"
                            value={product.price}
                            onChange={(e) =>
                              handleChange(index, 'price', e.target.value)
                            }
                            className="material-input-filled mt-1"
                            min="1"
                          />
                        </div>
                      </div>

                      <div className="mt-4">
                        <label className="material-caption text-gray-600">Product Image</label>
                        {product.image && (
                          <img
                            src={product.image}
                            alt="Product"
                            className="w-full h-32 object-cover rounded-lg border mt-2 mb-2"
                          />
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            handleFileChange(index, e.target.files?.[0] || null)
                          }
                          className="w-full mt-1"
                        />
                      </div>

                      {/* Stock & Inventory Control */}
                      <div className="mt-3 bg-white p-3 rounded-lg border border-gray-200 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-gray-700 flex items-center gap-1">
                            📦 Inventory Management
                          </span>
                          <label className="flex items-center gap-1.5 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={product.isUnlimited ?? (product.stock === undefined)}
                              onChange={(e) => handleProductFieldChange(index, 'isUnlimited', e.target.checked)}
                              className="rounded text-blue-600 focus:ring-blue-500 h-3.5 w-3.5"
                            />
                            <span className="text-gray-600 font-medium">Unlimited Stock</span>
                          </label>
                        </div>

                        {!(product.isUnlimited ?? (product.stock === undefined)) && (
                          <div className="flex items-center gap-3 pt-1">
                            <div className="flex-1">
                              <label className="block text-[11px] font-medium text-gray-500 mb-0.5">Quantity in Stock</label>
                              <input
                                type="number"
                                placeholder="e.g. 10"
                                min="0"
                                value={product.stock ?? 10}
                                onChange={(e) => handleProductFieldChange(index, 'stock', e.target.value)}
                                className="w-full px-2.5 py-1.5 border border-gray-300 rounded-md text-xs bg-white"
                              />
                            </div>

                            <label className="flex items-center gap-1.5 cursor-pointer select-none mt-4">
                              <input
                                type="checkbox"
                                checked={product.isOutOfStock || false}
                                onChange={(e) => handleProductFieldChange(index, 'isOutOfStock', e.target.checked)}
                                className="rounded text-red-600 focus:ring-red-500 h-3.5 w-3.5"
                              />
                              <span className="text-xs font-semibold text-red-600">Mark Out of Stock</span>
                            </label>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-gray-200 space-y-4">
              <DeliveryConfigInputs
                config={deliveryConfig}
                currencySymbol={getCurrencySymbol(currency)}
                onChange={setDeliveryConfig}
              />

              <PaymentOptionsInputs
                paymentMethods={paymentMethods}
                onChange={setPaymentMethods}
              />
            </div>

            {/* Actions */}
            <div className="flex space-x-3 pt-4 border-t border-gray-200">
              <button
                onClick={() => router.push('/my-forms')}
                className="flex-1 material-button material-button-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                disabled={saving}
                className="flex-1 material-button material-button-primary disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <span className="mr-1">⏳</span>
                    Updating...
                  </>
                ) : (
                  <>
                    <span className="mr-1">💾</span>
                    Update Form
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
