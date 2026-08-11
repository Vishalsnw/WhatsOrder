
'use client';

import { useSearchParams, useParams } from 'next/navigation';
import { useState, useEffect, useMemo } from 'react';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getCurrencySymbol } from '@/lib/currencies';
import { formatWhatsAppNumber } from '@/lib/countryCodes';
import { getTranslations, isRTL } from '@/lib/languages';
import PhoneInput from '@/components/forms/PhoneInput';
import PaymentSummaryWidget from '@/components/forms/PaymentSummaryWidget';
import WhatsAppTemplateSelector from '@/components/forms/WhatsAppTemplateSelector';
import { generateWhatsAppReceiptMessage, ReceiptTemplateStyle } from '@/lib/whatsappReceipt';
import { createOrder } from '@/lib/firestore';

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

// Client component that handles all the interactive logic
export default function PreviewClient() {
  const searchParams = useSearchParams();
  const params = useParams();
  const [formData, setFormData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const slug = params?.slug as string;

  // Check if we have an ID parameter (loading from database)
  const formId = searchParams.get('id');
  const directBiz = searchParams.get('biz');
  const directPhone = searchParams.get('phone');
  const directProducts = searchParams.get('products');

  // Load form data if ID is provided, otherwise search by slug
  useEffect(() => {
    if (!slug) return;

    const loadFormData = async () => {
      try {
        if (formId) {
          // First try to load from public forms collection (for shared forms)
          const publicFormRef = doc(db, 'publicForms', formId);
          const publicFormSnap = await getDoc(publicFormRef);

          if (publicFormSnap.exists()) {
            const data = publicFormSnap.data();
            setFormData({
              ...data,
              id: formId,
              createdAt: data.createdAt?.toDate() || new Date()
            });
            setLoading(false);
            return;
          }

          // If not found in public forms, try old collection for backward compatibility
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
        } else if (slug) {
          // Search by slug in public forms
          const publicFormsRef = collection(db, 'publicForms');
          const slugQuery = query(publicFormsRef, where('slug', '==', slug));
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

          // If not found in public forms, search in all users' subcollections
          // This is a fallback for forms that might not be in public collection
          try {
            const usersRef = collection(db, 'users');
            const usersSnapshot = await getDocs(usersRef);

            for (const userDoc of usersSnapshot.docs) {
              const userFormsRef = collection(db, 'users', userDoc.id, 'forms');
              const userFormsQuery = query(userFormsRef, where('slug', '==', slug));
              const userFormsSnapshot = await getDocs(userFormsQuery);

              if (!userFormsSnapshot.empty) {
                const formDoc = userFormsSnapshot.docs[0];
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
          } catch (userSearchError) {
            console.error('Error searching user forms:', userSearchError);
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
  }, [formId, slug]);

  const [selectedLanguage, setSelectedLanguage] = useState<string>('en');
  const [templateStyle, setTemplateStyle] = useState<ReceiptTemplateStyle>('receipt');

  useEffect(() => {
    if (formData) {
      if (formData.language) setSelectedLanguage(formData.language);
      else if (formData.customization?.language) setSelectedLanguage(formData.customization.language);

      if (formData.defaultTemplateStyle) setTemplateStyle(formData.defaultTemplateStyle);
    }
  }, [formData]);

  const translations = getTranslations(selectedLanguage);
  const rtl = isRTL(selectedLanguage);

  // Determine business name, phone, currency, and products
  const businessName = formData?.businessName || decodeURIComponent(directBiz || 'Business');
  const phone = formData?.phoneNumber || directPhone || '919999888877';
  const welcomeMessage = formData?.customization?.welcomeMessage || translations.welcomeMessageDefault;
  const primaryColor = formData?.customization?.primaryColor || '#2563eb';
  const logo = formData?.customization?.logo;
  const currency = formData?.currency || formData?.customization?.currency || 'USD';
  const currencySymbol = formData?.currencySymbol || getCurrencySymbol(currency);

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
  const [customerPhone, setCustomerPhone] = useState('');
  const [fulfillmentType, setFulfillmentType] = useState<'delivery' | 'pickup'>('delivery');
  const [street, setStreet] = useState('');
  const [stateRegion, setStateRegion] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [address, setAddress] = useState('');

  // Keep full address text formatted
  const fullAddress = fulfillmentType === 'pickup'
    ? translations.pickupOption
    : [street, stateRegion, postalCode].filter(Boolean).join(', ') || address;

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

  const handlePlaceOrder = async () => {
    const itemsToOrder = parsedProducts
      .map((p, i) => ({ name: p.name, quantity: quantities[i] || 0, price: p.price }))
      .filter(item => item.quantity > 0);

    if (itemsToOrder.length === 0) {
      alert(translations.fillRequiredAlert);
      return;
    }

    const isAddressValid = fulfillmentType === 'pickup' || street.trim() || address.trim();

    if (!name.trim() || !isAddressValid) {
      alert(translations.fillRequiredAlert);
      return;
    }

    // Attempt to save order in Firestore if seller user ID exists
    const sellerUid = formData?.userId || formData?.uid;
    if (sellerUid) {
      try {
        await createOrder(sellerUid, {
          customerName: name.trim(),
          customerPhone: customerPhone ? '+' + formatWhatsAppNumber(customerPhone) : '',
          items: itemsToOrder,
          total,
          currency: currencySymbol,
          fulfillmentType,
          address: fullAddress,
        });
      } catch (err) {
        console.error('Error recording order to database:', err);
      }
    }

    // Generate formatted multilingual WhatsApp receipt
    const message = generateWhatsAppReceiptMessage({
      businessName,
      customerName: name.trim(),
      customerPhone,
      fulfillmentType,
      fullAddress,
      items: itemsToOrder,
      totalAmount: total,
      currencySymbol,
      langCode: selectedLanguage,
      templateStyle,
      paymentMethods: formData?.paymentMethods,
    });

    const cleanTargetPhone = formatWhatsAppNumber(phone);
    const url = `https://wa.me/${cleanTargetPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-sm mx-4 w-full">
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
      <main className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-sm mx-4 w-full text-center">
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
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100" dir={rtl ? 'rtl' : 'ltr'}>
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
          {parsedProducts.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📦</span>
              </div>
              <p className="text-gray-500 font-medium">{translations.outOfStock}</p>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <span className={rtl ? 'ml-2' : 'mr-2'}>🛍️</span>
                {translations.selectProducts}
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
                        <span className="text-lg font-bold text-green-600">{currencySymbol}{product.price}</span>
                        {product.available === false && (
                          <span className="text-xs text-red-500 bg-red-50 px-2 py-1 rounded-full">
                            {translations.outOfStock}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
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
              <span className={rtl ? 'ml-2' : 'mr-2'}>👤</span>
              {translations.yourDetails}
            </h3>

            {/* Delivery vs Pickup Toggle */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                {translations.fulfillmentTypeLabel}
              </label>
              <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => setFulfillmentType('delivery')}
                  className={`py-2 px-3 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                    fulfillmentType === 'delivery'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {translations.deliveryOption}
                </button>
                <button
                  type="button"
                  onClick={() => setFulfillmentType('pickup')}
                  className={`py-2 px-3 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                    fulfillmentType === 'pickup'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {translations.pickupOption}
                </button>
              </div>
            </div>

            <input
              type="text"
              placeholder={translations.fullNamePlaceholder}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />

            <PhoneInput
              value={customerPhone}
              onChange={(val) => setCustomerPhone(val)}
              label={translations.phoneLabel}
              required={false}
              placeholder={translations.phonePlaceholder}
              helperText={translations.phoneHelper}
            />

            {fulfillmentType === 'delivery' ? (
              <div className="space-y-3 pt-1">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    {translations.streetLabel} *
                  </label>
                  <input
                    type="text"
                    placeholder={translations.streetPlaceholder}
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      {translations.stateLabel}
                    </label>
                    <input
                      type="text"
                      placeholder={translations.statePlaceholder}
                      value={stateRegion}
                      onChange={(e) => setStateRegion(e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      {translations.postalCodeLabel}
                    </label>
                    <input
                      type="text"
                      placeholder={translations.postalCodePlaceholder}
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                  </div>
                </div>

                <div>
                  <textarea
                    placeholder={translations.addressPlaceholder}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    rows={2}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
                  />
                </div>
              </div>
            ) : (
              <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-blue-800 text-xs sm:text-sm flex items-start gap-2">
                <span>{translations.pickupAddressNote}</span>
              </div>
            )}
          </div>

          {/* Order Summary */}
          {total > 0 && (
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-700">{translations.orderTotal}</span>
                <span className="text-2xl font-bold text-green-600">{currencySymbol}{total}</span>
              </div>
              <p className="text-sm text-gray-500">
                {parsedProducts.filter((_, i) => quantities[i] > 0).length} {translations.itemsSelected}
              </p>

              {/* Payment Links & Options in Summary */}
              <PaymentSummaryWidget
                paymentMethods={formData?.paymentMethods}
                translations={translations}
                totalAmount={total}
                currencySymbol={currencySymbol}
                businessName={businessName}
              />
            </div>
          )}

          {/* WhatsApp Receipt Multilingual & Template Config */}
          <WhatsAppTemplateSelector
            selectedLanguage={selectedLanguage}
            onLanguageChange={(lang) => setSelectedLanguage(lang)}
            templateStyle={templateStyle}
            onTemplateStyleChange={(style) => setTemplateStyle(style)}
            businessName={businessName}
            customerName={name}
            customerPhone={customerPhone}
            fulfillmentType={fulfillmentType}
            fullAddress={fullAddress}
            items={parsedProducts
              .map((p, i) => ({ name: p.name, quantity: quantities[i] || 0, price: p.price }))
              .filter(item => item.quantity > 0)}
            totalAmount={total}
            currencySymbol={currencySymbol}
            paymentMethods={formData?.paymentMethods}
          />

          {/* Place Order Button */}
          <button
            onClick={handlePlaceOrder}
            disabled={!parsedProducts.length || total === 0 || !name.trim() || (fulfillmentType === 'delivery' && !street.trim() && !address.trim())}
            className="w-full bg-green-600 text-white font-semibold py-4 rounded-xl hover:bg-green-700 transition-all duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
          >
            <span>📱</span>
            <span>{translations.sendWhatsAppBtn}</span>
          </button>

          {(!name.trim() || (fulfillmentType === 'delivery' && !street.trim() && !address.trim())) && (
            <p className="text-center text-sm text-gray-500">
              {translations.fillRequiredAlert}
            </p>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-gray-500 py-4 bg-gray-50">
        Made with 💜 using <strong>WhatsOrder</strong>
      </div>
    </main>
  );
}
