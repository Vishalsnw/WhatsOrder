'use client';

import React, { useState } from 'react';
import { PaymentMethodsConfig } from './PaymentOptionsInputs';
import { FormTranslations } from '@/lib/languages';

interface PaymentSummaryWidgetProps {
  paymentMethods?: PaymentMethodsConfig;
  translations: FormTranslations;
  totalAmount?: number;
  currencySymbol?: string;
  businessName?: string;
}

export default function PaymentSummaryWidget({
  paymentMethods,
  translations,
  totalAmount,
  currencySymbol = '$',
  businessName = 'Store',
}: PaymentSummaryWidgetProps) {
  const [copied, setCopied] = useState(false);

  if (!paymentMethods) return null;

  const { stripeUrl, paypalUrl, upiId, wiseUrl, squareUrl, paymentNote } = paymentMethods;

  const hasAnyPayment = Boolean(
    stripeUrl?.trim() ||
    paypalUrl?.trim() ||
    upiId?.trim() ||
    wiseUrl?.trim() ||
    squareUrl?.trim()
  );

  if (!hasAnyPayment && !paymentNote?.trim()) {
    return null;
  }

  const handleCopyUpi = () => {
    if (!upiId) return;
    navigator.clipboard.writeText(upiId.trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  // Format Wise link if tag provided instead of URL
  const formattedWiseUrl = wiseUrl?.startsWith('http')
    ? wiseUrl
    : wiseUrl?.startsWith('@')
    ? `https://wise.com/pay/me/${wiseUrl.replace('@', '')}`
    : wiseUrl;

  // UPI intent link for Indian mobile apps
  const upiIntentUrl = upiId
    ? `upi://pay?pa=${encodeURIComponent(upiId.trim())}&pn=${encodeURIComponent(businessName)}${
        totalAmount ? `&am=${totalAmount}` : ''
      }&cu=INR`
    : '';

  return (
    <div className="mt-4 p-4 bg-gradient-to-br from-gray-50 to-slate-100 rounded-2xl border border-gray-200/80 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
          <span>💳</span> {translations.paymentMethodsLabel}
        </h4>
        <span className="text-[10px] bg-blue-100 text-blue-800 font-semibold px-2 py-0.5 rounded-full">
          Instant Pay
        </span>
      </div>

      {/* Payment Buttons Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
        {/* Stripe */}
        {stripeUrl?.trim() && (
          <a
            href={stripeUrl.trim()}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 px-3 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all hover:scale-[1.02]"
          >
            <span className="font-extrabold text-sm">S</span>
            <span>{translations.payWithStripe}</span>
            <span className="text-xs opacity-75">↗</span>
          </a>
        )}

        {/* PayPal */}
        {paypalUrl?.trim() && (
          <a
            href={paypalUrl.trim()}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 px-3 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all hover:scale-[1.02]"
          >
            <span className="font-extrabold text-sm">P</span>
            <span>{translations.payWithPayPal}</span>
            <span className="text-xs opacity-75">↗</span>
          </a>
        )}

        {/* UPI */}
        {upiId?.trim() && (
          <div className="sm:col-span-2 bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-900 truncate">
                <span className="text-base">📲</span>
                <span className="truncate">UPI ID: <span className="font-mono bg-white px-2 py-0.5 rounded border border-emerald-200">{upiId}</span></span>
              </div>
              <button
                type="button"
                onClick={handleCopyUpi}
                className="shrink-0 px-2.5 py-1 bg-emerald-600 text-white text-[11px] font-medium rounded-lg hover:bg-emerald-700 transition-colors"
              >
                {copied ? translations.upiCopied : translations.copyUPI}
              </button>
            </div>
            {upiIntentUrl && (
              <a
                href={upiIntentUrl}
                className="block text-center text-[11px] text-emerald-700 hover:text-emerald-900 font-medium underline"
              >
                Tap to open in UPI App (GPay / PhonePe / Paytm)
              </a>
            )}
          </div>
        )}

        {/* Wise */}
        {formattedWiseUrl?.trim() && (
          <a
            href={formattedWiseUrl.trim()}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 px-3 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold shadow-sm transition-all hover:scale-[1.02]"
          >
            <span className="font-bold text-sm">W</span>
            <span>{translations.payWithWise}</span>
            <span className="text-xs opacity-75">↗</span>
          </a>
        )}

        {/* Square */}
        {squareUrl?.trim() && (
          <a
            href={squareUrl.trim()}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 px-3 py-2.5 bg-gray-900 hover:bg-black text-white rounded-xl text-xs font-semibold shadow-sm transition-all hover:scale-[1.02]"
          >
            <span className="font-bold text-sm">□</span>
            <span>{translations.payWithSquare}</span>
            <span className="text-xs opacity-75">↗</span>
          </a>
        )}
      </div>

      {/* Note / Instruction */}
      {paymentNote?.trim() && (
        <div className="pt-1 text-[11px] text-gray-600 border-t border-gray-200/80">
          <span className="font-semibold text-gray-800">{translations.paymentNoteLabel} </span>
          <span>{paymentNote}</span>
        </div>
      )}
    </div>
  );
}
