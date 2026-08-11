'use client';

import { useState, useRef } from 'react';
import { Order } from '@/lib/firestore';
import { getCurrencySymbol, formatPrice } from '@/lib/currencies';
import { formatOrderTimestamp } from '@/lib/timezones';
import { STATUS_CONFIG } from '@/lib/whatsappStatusNotification';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface OrderReceiptModalProps {
  order: Order | null;
  businessName?: string;
  businessAddress?: string;
  businessPhone?: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function OrderReceiptModal({
  order,
  businessName = 'Our Store',
  businessAddress,
  businessPhone,
  isOpen,
  onClose,
}: OrderReceiptModalProps) {
  const receiptRef = useRef<HTMLDivElement>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  if (!isOpen || !order) return null;

  const currencySym = order.currencySymbol || getCurrencySymbol(order.currency, '$');
  const shortOrderId = order.id ? order.id.slice(-6).toUpperCase() : '000000';
  const invoiceNo = `INV-${shortOrderId}`;
  const formattedDate = formatOrderTimestamp(order.createdAt, 'Asia/Kolkata');
  const statusInfo = STATUS_CONFIG[order.status || 'pending'] || STATUS_CONFIG.pending;

  // Handle PDF Generation
  const handleDownloadPDF = async () => {
    if (!receiptRef.current) return;
    setIsGeneratingPdf(true);

    try {
      const element = receiptRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${invoiceNo}_Receipt.pdf`);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
      alert('Could not download PDF. Please try again or use the Print button.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Handle Printing
  const handlePrint = () => {
    if (!receiptRef.current) return;
    const printContent = receiptRef.current.innerHTML;
    const printWindow = window.open('', '_blank', 'width=800,height=900');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Invoice - ${invoiceNo}</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <style>
              body { font-family: system-ui, -apple-system, sans-serif; padding: 20px; }
              @media print {
                body { padding: 0; }
                .no-print { display: none !important; }
              }
            </style>
          </head>
          <body>
            <div style="max-width: 650px; margin: 0 auto;">
              ${printContent}
            </div>
            <script>
              setTimeout(() => {
                window.print();
                window.close();
              }, 500);
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden border border-gray-100 my-6">
        {/* Top Control Bar */}
        <div className="bg-gray-900 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🧾</span>
            <div>
              <h3 className="font-bold text-sm text-white">Digital Order Receipt / Tax Invoice</h3>
              <p className="text-xs text-gray-400">{invoiceNo}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-lg transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Printable Receipt Area */}
        <div className="p-6 bg-gray-50 overflow-y-auto max-h-[70vh]">
          <div
            ref={receiptRef}
            className="bg-white p-6 sm:p-8 rounded-xl shadow-xs border border-gray-200 text-gray-800 font-sans space-y-6"
          >
            {/* Header / Business Info */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-gray-100 pb-6">
              <div>
                <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">{businessName}</h1>
                {businessAddress && <p className="text-xs text-gray-500 mt-1 max-w-xs">{businessAddress}</p>}
                {businessPhone && <p className="text-xs text-gray-500 mt-0.5">📞 {businessPhone}</p>}
                <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${statusInfo.badgeColor}">
                  <span>{statusInfo.emoji}</span>
                  <span className="capitalize">{statusInfo.label}</span>
                </div>
              </div>

              <div className="text-left sm:text-right font-mono">
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">TAX INVOICE</div>
                <div className="text-lg font-black text-gray-900 mt-0.5">{invoiceNo}</div>
                <div className="text-xs text-gray-500 mt-1">Date: {formattedDate}</div>
              </div>
            </div>

            {/* Customer & Fulfillment Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100 text-xs">
              <div>
                <span className="font-bold text-gray-400 uppercase tracking-wider block mb-1">Billed To:</span>
                <p className="font-bold text-gray-900 text-sm">{order.customerName}</p>
                {order.customerPhone && <p className="text-gray-600 mt-0.5 font-mono">📱 {order.customerPhone}</p>}
              </div>
              <div>
                <span className="font-bold text-gray-400 uppercase tracking-wider block mb-1">Order Details:</span>
                <p className="text-gray-700 font-semibold capitalize">
                  Type: {order.fulfillmentType === 'pickup' ? '🏪 Store Pickup' : '🚚 Home Delivery'}
                </p>
                {order.address && (
                  <p className="text-gray-600 mt-0.5 line-clamp-2">📍 {order.address}</p>
                )}
              </div>
            </div>

            {/* Order Items Table */}
            <div>
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b-2 border-gray-200 text-gray-400 uppercase tracking-wider font-bold">
                    <th className="py-2">Item</th>
                    <th className="py-2 text-center">Qty</th>
                    <th className="py-2 text-right">Price</th>
                    <th className="py-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {(order.items || []).map((item, idx) => (
                    <tr key={idx} className="text-gray-800">
                      <td className="py-2.5 font-medium">{item.name}</td>
                      <td className="py-2.5 text-center font-mono">{item.quantity}</td>
                      <td className="py-2.5 text-right font-mono">
                        {currencySym}{item.price}
                      </td>
                      <td className="py-2.5 text-right font-mono font-bold">
                        {currencySym}{(item.quantity * item.price).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Summary Totals */}
            <div className="border-t border-gray-200 pt-4 flex justify-end">
              <div className="w-full sm:w-64 space-y-2 text-xs">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-mono font-semibold">
                    {currencySym}{((typeof order.subtotal === 'number' ? order.subtotal : (order.items || []).reduce((a, b) => a + b.quantity * b.price, 0))).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>
                    Delivery Charge {order.deliveryZone ? `(${order.deliveryZone})` : ''}
                  </span>
                  <span className="font-mono font-semibold text-gray-800">
                    {(typeof order.deliveryFee === 'number' && order.deliveryFee === 0) || order.fulfillmentType === 'pickup'
                      ? <span className="text-emerald-600 font-bold">FREE 🎉</span>
                      : `${currencySym}${(order.deliveryFee ?? 0).toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-black text-gray-900 pt-2 border-t border-gray-200">
                  <span>Grand Total</span>
                  <span className="font-mono text-base text-emerald-600">{currencySym}{order.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Thank you footer */}
            <div className="text-center pt-4 border-t border-dashed border-gray-200">
              <p className="text-xs font-bold text-gray-700">Thank you for your business! 🙏</p>
              <p className="text-[10px] text-gray-400 mt-0.5">Powered by WhatsOrder Digital Receipts</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-200 rounded-xl transition-colors"
          >
            Close
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-900 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5"
            >
              <span>🖨️ Print Bill</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadPDF}
              disabled={isGeneratingPdf}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              <span>{isGeneratingPdf ? '⏳ Generating PDF...' : '📄 Download PDF Receipt'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
