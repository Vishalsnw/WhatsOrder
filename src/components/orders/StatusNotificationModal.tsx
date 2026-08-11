'use client';

import { useState, useEffect } from 'react';
import { Order } from '@/lib/firestore';
import { getCurrencySymbol } from '@/lib/currencies';
import {
  OrderStatusType,
  STATUS_CONFIG,
  generateStatusNotificationMessage,
  openWhatsAppNotification,
} from '@/lib/whatsappStatusNotification';

interface StatusNotificationModalProps {
  order: Order | null;
  businessName?: string;
  isOpen: boolean;
  onClose: () => void;
  onStatusChangeAndNotify?: (orderId: string, newStatus: OrderStatusType) => Promise<void>;
}

export default function StatusNotificationModal({
  order,
  businessName = 'Our Store',
  isOpen,
  onClose,
  onStatusChangeAndNotify,
}: StatusNotificationModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<OrderStatusType>('confirmed');
  const [lang, setLang] = useState<'en' | 'hi' | 'hinglish' | 'es'>('en');
  const [customNote, setCustomNote] = useState('');
  const [copied, setCopied] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (order) {
      setSelectedStatus((order.status as OrderStatusType) || 'confirmed');
    }
  }, [order]);

  if (!isOpen || !order) return null;

  const currencySym = order.currencySymbol || getCurrencySymbol(order.currency, '₹');

  const formattedMsg = generateStatusNotificationMessage({
    orderId: order.id,
    customerName: order.customerName,
    customerPhone: order.customerPhone,
    businessName,
    items: order.items || [],
    total: order.total,
    currencySymbol: currencySym,
    status: selectedStatus,
    fulfillmentType: order.fulfillmentType,
    address: order.address,
    lang,
    customNote,
  });

  const handleSendWhatsApp = async () => {
    if (!order.customerPhone) {
      alert('Customer phone number is missing for this order.');
      return;
    }

    setIsUpdating(true);
    try {
      // If status changed, update in Firestore
      if (onStatusChangeAndNotify && selectedStatus !== order.status) {
        await onStatusChangeAndNotify(order.id, selectedStatus);
      }
      // Open WhatsApp
      openWhatsAppNotification(order.customerPhone, formattedMsg);
      onClose();
    } catch (e) {
      console.error('Error in status notification:', e);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(formattedMsg);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-gray-100 my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-xl">
              📲
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">1-Click WhatsApp Notification</h3>
              <p className="text-xs text-emerald-100">Send instant status updates directly to customer</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-lg transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Customer Info Card */}
          <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100 flex items-center justify-between">
            <div>
              <div className="text-xs text-emerald-800 font-semibold uppercase tracking-wider">Customer</div>
              <div className="text-sm font-bold text-gray-900">{order.customerName}</div>
              <div className="text-xs text-emerald-700 font-mono">📱 {order.customerPhone || 'N/A'}</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-500">Order ID</div>
              <div className="text-xs font-mono font-bold text-gray-800">#{order.id.slice(-6).toUpperCase()}</div>
              <div className="text-xs font-bold text-emerald-600 mt-0.5">{currencySym}{order.total}</div>
            </div>
          </div>

          {/* Select Target Status */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Select Status Update:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(['confirmed', 'shipped', 'completed', 'cancelled'] as OrderStatusType[]).map((st) => {
                const conf = STATUS_CONFIG[st];
                const isSel = selectedStatus === st;
                return (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setSelectedStatus(st)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all text-center flex flex-col items-center justify-center gap-1 ${
                      isSel
                        ? 'border-emerald-600 bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-200'
                        : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-base">{conf.emoji}</span>
                    <span>{conf.label.split('/')[0]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Language Selection */}
          <div className="flex items-center justify-between gap-2 pt-1">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Language:</label>
            <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-xl">
              {[
                { id: 'hinglish', label: 'Hinglish 🇮🇳' },
                { id: 'hi', label: 'हिंदी 🇮🇳' },
                { id: 'en', label: 'English 🇬🇧' },
                { id: 'es', label: 'Español 🇪🇸' },
              ].map((l) => (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => setLang(l.id as any)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                    lang === l.id ? 'bg-white text-emerald-700 shadow-xs' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          {/* Optional Custom Note */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Custom Message Note (Optional):
            </label>
            <input
              type="text"
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              placeholder="e.g. Expected delivery by 5 PM / Tracking ID: 12345"
              className="w-full text-xs px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* Message Preview Box */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                WhatsApp Message Preview:
              </label>
              <button
                type="button"
                onClick={handleCopyMessage}
                className="text-xs text-emerald-600 hover:underline font-semibold flex items-center gap-1"
              >
                {copied ? '✅ Copied!' : '📋 Copy Text'}
              </button>
            </div>
            <div className="p-3.5 bg-slate-900 text-emerald-400 font-mono text-xs rounded-xl border border-slate-800 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto shadow-inner">
              {formattedMsg}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-200 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSendWhatsApp}
            disabled={isUpdating}
            className="w-full sm:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
          >
            <span>💬 Send via WhatsApp Now</span>
          </button>
        </div>
      </div>
    </div>
  );
}
