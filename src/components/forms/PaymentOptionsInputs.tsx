'use client';

import React from 'react';

export interface PaymentMethodsConfig {
  stripeUrl?: string;
  paypalUrl?: string;
  upiId?: string;
  wiseUrl?: string;
  squareUrl?: string;
  paymentNote?: string;
}

interface PaymentOptionsInputsProps {
  paymentMethods: PaymentMethodsConfig;
  onChange: (updated: PaymentMethodsConfig) => void;
}

export default function PaymentOptionsInputs({
  paymentMethods,
  onChange,
}: PaymentOptionsInputsProps) {
  const updateField = (field: keyof PaymentMethodsConfig, value: string) => {
    onChange({
      ...paymentMethods,
      [field]: value,
    });
  };

  return (
    <div className="space-y-4 pt-2">
      <div>
        <h4 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
          <span>💳</span> Payment Links & Options
        </h4>
        <p className="text-xs text-gray-500 mt-0.5">
          Attach payment links so customers can pay directly from the order summary page.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Stripe */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1.5">
            <span className="w-4 h-4 rounded bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-[10px]">S</span>
            Stripe Payment Link URL
          </label>
          <input
            type="url"
            placeholder="https://buy.stripe.com/..."
            value={paymentMethods.stripeUrl || ''}
            onChange={(e) => updateField('stripeUrl', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
          />
        </div>

        {/* PayPal */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1.5">
            <span className="w-4 h-4 rounded bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[10px]">P</span>
            PayPal Link (paypal.me or Checkout)
          </label>
          <input
            type="url"
            placeholder="https://paypal.me/yourname"
            value={paymentMethods.paypalUrl || ''}
            onChange={(e) => updateField('paypalUrl', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
          />
        </div>

        {/* UPI ID */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1.5">
            <span className="w-4 h-4 rounded bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[10px]">U</span>
            UPI ID / QR (GPay, PhonePe, Paytm)
          </label>
          <input
            type="text"
            placeholder="e.g. merchant@upi or 9876543210@paytm"
            value={paymentMethods.upiId || ''}
            onChange={(e) => updateField('upiId', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
          />
        </div>

        {/* Wise */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1.5">
            <span className="w-4 h-4 rounded bg-green-100 text-green-700 flex items-center justify-center font-bold text-[10px]">W</span>
            Wise Payment Link or Tag
          </label>
          <input
            type="text"
            placeholder="https://wise.com/pay/me/... or @wisetag"
            value={paymentMethods.wiseUrl || ''}
            onChange={(e) => updateField('wiseUrl', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
          />
        </div>

        {/* Square / Cash App */}
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1.5">
            <span className="w-4 h-4 rounded bg-gray-900 text-white flex items-center justify-center font-bold text-[10px]">□</span>
            Square / Cash App Payment Link
          </label>
          <input
            type="url"
            placeholder="https://square.link/u/... or https://cash.app/$yourtag"
            value={paymentMethods.squareUrl || ''}
            onChange={(e) => updateField('squareUrl', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
          />
        </div>

        {/* Instructions / Note */}
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Payment Instructions / Note (Optional)
          </label>
          <input
            type="text"
            placeholder="e.g. Please share payment screenshot after sending order on WhatsApp"
            value={paymentMethods.paymentNote || ''}
            onChange={(e) => updateField('paymentNote', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
          />
        </div>
      </div>
    </div>
  );
}
