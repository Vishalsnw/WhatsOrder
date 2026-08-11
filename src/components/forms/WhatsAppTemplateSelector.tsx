'use client';

import React, { useState } from 'react';
import { LANGUAGES } from '@/lib/languages';
import { RECEIPT_STYLES, ReceiptTemplateStyle, generateWhatsAppReceiptMessage } from '@/lib/whatsappReceipt';
import { PaymentMethodsConfig } from './PaymentOptionsInputs';

interface WhatsAppTemplateSelectorProps {
  selectedLanguage: string;
  onLanguageChange: (lang: string) => void;
  templateStyle: ReceiptTemplateStyle;
  onTemplateStyleChange: (style: ReceiptTemplateStyle) => void;
  // Props for live preview modal / accordion
  businessName: string;
  customerName: string;
  customerPhone?: string;
  fulfillmentType: 'delivery' | 'pickup';
  fullAddress: string;
  items: Array<{ name: string; quantity: number; price: number }>;
  subtotal?: number;
  deliveryFee?: number;
  deliveryFeeLabel?: string;
  totalAmount: number;
  currencySymbol: string;
  paymentMethods?: PaymentMethodsConfig;
}

export default function WhatsAppTemplateSelector({
  selectedLanguage,
  onLanguageChange,
  templateStyle,
  onTemplateStyleChange,
  businessName,
  customerName,
  customerPhone,
  fulfillmentType,
  fullAddress,
  items,
  subtotal,
  deliveryFee,
  deliveryFeeLabel,
  totalAmount,
  currencySymbol,
  paymentMethods,
}: WhatsAppTemplateSelectorProps) {
  const [showPreview, setShowPreview] = useState(false);

  const activeLang = LANGUAGES.find(l => l.code === selectedLanguage) || LANGUAGES[0];

  const previewMessage = generateWhatsAppReceiptMessage({
    businessName: businessName || 'Store Name',
    customerName: customerName || 'Customer Name',
    customerPhone: customerPhone || '+91 98765 43210',
    fulfillmentType,
    fullAddress: fullAddress || '123 Main Street, City',
    items: items.length > 0 ? items : [{ name: 'Sample Product', quantity: 2, price: 15 }],
    subtotal: subtotal ?? (totalAmount > 0 ? totalAmount : 30),
    deliveryFee: deliveryFee ?? 0,
    deliveryFeeLabel: deliveryFeeLabel ?? (deliveryFee === 0 ? 'FREE 🎉' : undefined),
    totalAmount: totalAmount > 0 ? totalAmount : 30,
    currencySymbol,
    langCode: selectedLanguage,
    templateStyle,
    paymentMethods,
    orderNumber: '#ORD-789012',
  });

  return (
    <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-3.5 space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
          <span>🌐</span> WhatsApp Receipt Language & Template
        </label>
        <button
          type="button"
          onClick={() => setShowPreview(!showPreview)}
          className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-100/80 hover:bg-emerald-200/80 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1"
        >
          <span>{showPreview ? '🙈 Hide Preview' : '👁️ Preview Receipt'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {/* Language Selector */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
            Receipt Language
          </label>
          <select
            value={selectedLanguage}
            onChange={(e) => onLanguageChange(e.target.value)}
            className="w-full text-xs font-medium bg-white border border-slate-300 rounded-xl px-2.5 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.flag} {lang.name} ({lang.nativeName})
              </option>
            ))}
          </select>
        </div>

        {/* Template Style Selector */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
            Format Style
          </label>
          <select
            value={templateStyle}
            onChange={(e) => onTemplateStyleChange(e.target.value as ReceiptTemplateStyle)}
            className="w-full text-xs font-medium bg-white border border-slate-300 rounded-xl px-2.5 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          >
            {RECEIPT_STYLES.map((style) => (
              <option key={style.id} value={style.id}>
                {style.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Live Preview Box */}
      {showPreview && (
        <div className="mt-2 p-3 bg-emerald-950 text-emerald-100 font-mono text-[11px] leading-relaxed rounded-xl border border-emerald-800 shadow-inner overflow-x-auto relative">
          <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-emerald-800 text-[10px] text-emerald-400 uppercase tracking-widest font-sans font-bold">
            <span className="flex items-center gap-1">
              <span>💬</span> WhatsApp Message Format ({activeLang.flag} {activeLang.name})
            </span>
            <span className="bg-emerald-900/80 px-2 py-0.5 rounded text-[9px] text-emerald-300">
              Live Preview
            </span>
          </div>
          <pre className="whitespace-pre-wrap font-mono text-[11px] text-emerald-100 select-all">
            {previewMessage}
          </pre>
        </div>
      )}
    </div>
  );
}
