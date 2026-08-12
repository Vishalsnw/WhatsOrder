'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/hooks/useUser';
import { db } from '@/lib/firebase';
import { collection, addDoc, doc, setDoc, Timestamp } from 'firebase/firestore';
import { storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { CURRENCIES, getCurrencySymbol } from '@/lib/currencies';
import { LANGUAGES, getTranslations } from '@/lib/languages';
import PhoneInput from '@/components/forms/PhoneInput';
import { formatWhatsAppNumber } from '@/lib/countryCodes';
import PaymentOptionsInputs, { PaymentMethodsConfig } from '@/components/forms/PaymentOptionsInputs';
import DeliveryConfigInputs from '@/components/forms/DeliveryConfigInputs';
import { DeliveryConfig } from '@/lib/firestore';

interface ProductInput {
  name: string;
  price: string;
  description?: string;
  file?: File | null;
  stock?: string;
  isUnlimited?: boolean;
  isOutOfStock?: boolean;
}

export default function CreateFormPage() {
  const { user, loading } = useUser();
  const router = useRouter();

  const [businessName, setBusinessName] = useState('');
  const [whatsapp, setWhatsapp] = useState('+1');
  const [welcomeMsg, setWelcomeMsg] = useState('Welcome! Browse our products and place your order.');
  const [currency, setCurrency] = useState('USD');
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

  // Auto-load saved currency preference
  useEffect(() => {
    try {
      const savedCurrency = localStorage.getItem('whatsorder_preferred_currency');
      if (savedCurrency) {
        setCurrency(savedCurrency);
      }
    } catch (e) {
      console.error('Failed to load currency preference', e);
    }
  }, []);

  const handleLanguageChange = (newLang: string) => {
    setLanguage(newLang);
    // Automatically suggest default welcome message in target language if unchanged
    const trans = getTranslations(newLang);
    if (!welcomeMsg || welcomeMsg.startsWith('Welcome!') || welcomeMsg.startsWith('أهلاً') || welcomeMsg.startsWith('¡Bienvenido') || welcomeMsg.startsWith('Bienvenue') || welcomeMsg.startsWith('स्वागत')) {
      setWelcomeMsg(trans.welcomeMessageDefault);
    }
  };
  const [products, setProducts] = useState<ProductInput[]>([
    { name: '', price: '', description: '', file: null, stock: '10', isUnlimited: true, isOutOfStock: false }
  ]);
  const [saving, setSaving] = useState(false);

  const handleAddProduct = () => {
    setProducts([...products, { name: '', price: '', description: '', file: null, stock: '10', isUnlimited: true, isOutOfStock: false }]);
  };

  const handleRemoveProduct = (index: number) => {
    if (products.length === 1) return;
    setProducts(products.filter((_, i) => i !== index));
  };

  const handleProductChange = (index: number, field: keyof ProductInput, value: any) => {
    const updated = [...products];
    updated[index] = { ...updated[index], [field]: value };
    setProducts(updated);
  };

  const uploadImage = async (file: File): Promise<string> => {
    try {
      const fileName = `${Date.now()}_${file.name}`;
      const storageRef = ref(storage, `images/${fileName}`);
      const snapshot = await uploadBytes(storageRef, file);
      return await getDownloadURL(snapshot.ref);
    } catch (err) {
      console.error('Image upload failed:', err);
      return '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      alert('Please log in to create a form.');
      router.push('/login');
      return;
    }

    if (!businessName.trim()) {
      alert('Please enter your business name.');
      return;
    }

    const cleanPhone = whatsapp.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      alert('Please enter a valid WhatsApp phone number.');
      return;
    }

    const validProducts = products.filter(
      p => p.name.trim() && !isNaN(Number(p.price)) && Number(p.price) >= 0
    );

    if (validProducts.length === 0) {
      alert('Please add at least one valid product with a name and price.');
      return;
    }

    setSaving(true);

    try {
      const processedProducts = await Promise.all(
        validProducts.map(async (p) => {
          let imageUrl = '';
          if (p.file) {
            imageUrl = await uploadImage(p.file);
          }
          const isUnlim = p.isUnlimited ?? true;
          const numStock = !isUnlim && p.stock !== undefined ? Math.max(0, parseInt(p.stock, 10) || 0) : 9999;
          const isOut = Boolean(p.isOutOfStock) || (!isUnlim && numStock <= 0);
          return {
            name: p.name.trim(),
            price: Number(p.price),
            description: p.description || '',
            image: imageUrl,
            stock: isUnlim ? undefined : numStock,
            isUnlimited: isUnlim,
            isOutOfStock: isOut,
            available: !isOut,
          };
        })
      );

      const slug = businessName
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');

      const formattedPhone = '+' + formatWhatsAppNumber(whatsapp);

      const currSymbol = getCurrencySymbol(currency);

      const formData = {
        businessName: businessName.trim(),
        phoneNumber: formattedPhone,
        whatsappNumber: formattedPhone,
        slug,
        currency,
        currencySymbol: currSymbol,
        language,
        defaultTemplateStyle,
        userId: user.uid,
        paymentMethods: paymentMethods || {},
        deliveryConfig: deliveryConfig || {},
        customization: {
          welcomeMessage: welcomeMsg,
          primaryColor: '#2563eb',
          currency,
          currencySymbol: currSymbol,
          language,
          defaultTemplateStyle,
        },
        products: processedProducts,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        views: 0,
        orders: 0
      };

      // Save to user forms subcollection
      const userFormsRef = collection(db, 'users', user.uid, 'forms');
      const docRef = await addDoc(userFormsRef, formData);

      // Save to publicForms for sharing
      try {
        await setDoc(doc(db, 'publicForms', docRef.id), {
          ...formData,
          id: docRef.id,
          userId: user.uid,
          uid: user.uid,
          ownerId: user.uid,
        });
      } catch (err) {
        console.warn('Could not save to publicForms:', err);
      }

      // Save currency preference for future form creations
      try {
        localStorage.setItem('whatsorder_preferred_currency', currency);
      } catch (e) {
        console.error('Failed to save currency preference', e);
      }

      alert('✅ Order Form Created Successfully!');
      router.push('/my-forms');
    } catch (err) {
      console.error('Error creating form:', err);
      alert('Error creating form. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-4 animate-pulse">
          <div className="skeleton h-32 rounded-2xl"></div>
          <div className="skeleton h-64 rounded-2xl"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="material-card p-6 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
          <div className="flex items-center space-x-3">
            <span className="text-3xl">✨</span>
            <div>
              <h1 className="text-2xl font-bold text-white">Create WhatsApp Order Form</h1>
              <p className="text-blue-100 text-sm">Add your business details and catalog products</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
          {/* Business Info */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-gray-900 flex items-center">
              <span className="mr-2">🏪</span> Business Details
            </h2>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Business Name *</label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="e.g. Vishal's Bakery"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
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

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Welcome Message</label>
              <input
                type="text"
                value={welcomeMsg}
                onChange={(e) => setWelcomeMsg(e.target.value)}
                placeholder="e.g. Welcome! Place your order below."
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Store Currency 💱 *</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                >
                  {CURRENCIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  ⚡ Preferred currency is auto-saved as your default for all new forms.
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Form Language 🌐 *</label>
                <select
                  value={language}
                  onChange={(e) => handleLanguageChange(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                >
                  {LANGUAGES.map((l) => (
                    <option key={l.code} value={l.code}>
                      {l.flag} {l.name} ({l.nativeName}) {l.dir === 'rtl' ? '— [RTL]' : ''}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Customer form & WhatsApp receipt will automatically default to this language.
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Default Receipt Format 🧾</label>
                <select
                  value={defaultTemplateStyle}
                  onChange={(e) => setDefaultTemplateStyle(e.target.value as any)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                >
                  <option value="receipt">Formatted Receipt 🧾 (Detailed with totals & payment links)</option>
                  <option value="detailed">Detailed Summary 📋 (Full order breakdown)</option>
                  <option value="minimal">Quick Message ⚡ (Short & simple list)</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Customers can also switch receipt language and template style on the order form.
                </p>
              </div>
            </div>
          </div>

          {/* Products Catalog */}
          <div className="space-y-4 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900 flex items-center">
                <span className="mr-2">📦</span> Products Catalog
              </h2>
              <button
                type="button"
                onClick={handleAddProduct}
                className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
              >
                + Add Product
              </button>
            </div>

            <div className="space-y-4">
              {products.map((product, idx) => (
                <div key={idx} className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3 relative">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-sm text-gray-700">Product #{idx + 1}</span>
                    {products.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveProduct(idx)}
                        className="text-red-500 text-xs hover:underline"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Product Name *"
                      value={product.name}
                      onChange={(e) => handleProductChange(idx, 'name', e.target.value)}
                      required
                      className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm"
                    />
                    <input
                      type="number"
                      placeholder={`Price (${getCurrencySymbol(currency)}) *`}
                      value={product.price}
                      onChange={(e) => handleProductChange(idx, 'price', e.target.value)}
                      required
                      min="0"
                      className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm"
                    />
                  </div>

                  <input
                    type="text"
                    placeholder="Short Description (optional)"
                    value={product.description || ''}
                    onChange={(e) => handleProductChange(idx, 'description', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm"
                  />

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Product Image (optional)</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleProductChange(idx, 'file', e.target.files ? e.target.files[0] : null)}
                      className="text-xs text-gray-600"
                    />
                  </div>

                  {/* Stock & Inventory Control */}
                  <div className="bg-white p-3 rounded-lg border border-gray-200 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-gray-700 flex items-center gap-1">
                        📦 Inventory Management
                      </span>
                      <label className="flex items-center gap-1.5 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={product.isUnlimited ?? true}
                          onChange={(e) => handleProductChange(idx, 'isUnlimited', e.target.checked)}
                          className="rounded text-blue-600 focus:ring-blue-500 h-3.5 w-3.5"
                        />
                        <span className="text-gray-600 font-medium">Unlimited Stock</span>
                      </label>
                    </div>

                    {!(product.isUnlimited ?? true) && (
                      <div className="flex items-center gap-3 pt-1">
                        <div className="flex-1">
                          <label className="block text-[11px] font-medium text-gray-500 mb-0.5">Quantity in Stock</label>
                          <input
                            type="number"
                            placeholder="e.g. 10"
                            min="0"
                            value={product.stock ?? '10'}
                            onChange={(e) => handleProductChange(idx, 'stock', e.target.value)}
                            className="w-full px-2.5 py-1.5 border border-gray-300 rounded-md text-xs bg-white"
                          />
                        </div>

                        <label className="flex items-center gap-1.5 cursor-pointer select-none mt-4">
                          <input
                            type="checkbox"
                            checked={product.isOutOfStock || false}
                            onChange={(e) => handleProductChange(idx, 'isOutOfStock', e.target.checked)}
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

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-green-600 text-white font-bold py-4 rounded-xl hover:bg-green-700 transition-all duration-200 disabled:bg-gray-400 flex items-center justify-center space-x-2 shadow-lg"
          >
            <span>{saving ? 'Creating Form...' : '🚀 Publish WhatsApp Form'}</span>
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
}
