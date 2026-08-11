'use client';

import React, { useState, useRef, useMemo } from 'react';
import { Order, Form } from '@/lib/firestore';
import {
  generateDailyBusinessSummary,
  formatWhatsAppDailySummaryMessage,
  DailyReportSummary,
} from '@/lib/dailyReport';
import { getLocalDateKey } from '@/lib/timezones';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import toast from 'react-hot-toast';

interface DailySummaryReportModalProps {
  orders: Order[];
  forms: Form[];
  userProfile: any;
  isOpen: boolean;
  onClose: () => void;
}

export default function DailySummaryReportModal({
  orders,
  forms,
  userProfile,
  isOpen,
  onClose,
}: DailySummaryReportModalProps) {
  const sellerTimezone = userProfile?.timezone || 'Asia/Kolkata';
  const defaultToday = getLocalDateKey(new Date(), sellerTimezone);

  const [selectedDate, setSelectedDate] = useState<string>(defaultToday);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);
  const pdfReportRef = useRef<HTMLDivElement>(null);

  // Generate summary report object
  const report: DailyReportSummary = useMemo(() => {
    return generateDailyBusinessSummary(orders, forms, userProfile, selectedDate);
  }, [orders, forms, userProfile, selectedDate]);

  if (!isOpen) return null;

  const handleShareWhatsApp = () => {
    const text = formatWhatsAppDailySummaryMessage(report);
    const encoded = encodeURIComponent(text);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  const handleCopyText = () => {
    const text = formatWhatsAppDailySummaryMessage(report);
    navigator.clipboard.writeText(text);
    toast.success('Report text copied to clipboard!');
  };

  const handleDownloadPDF = async () => {
    if (!pdfReportRef.current) return;
    setIsGeneratingPdf(true);

    try {
      const element = pdfReportRef.current;
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
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);

      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 10;

      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      pdf.save(`Daily-Business-Report-${report.dateKey}.pdf`);
      toast.success('PDF report downloaded successfully!');
    } catch (err) {
      console.error('PDF export failed:', err);
      toast.error('Failed to generate PDF. Please try again.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 my-auto">
        {/* Top Control Bar */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/30 border border-indigo-400/30 flex items-center justify-center text-2xl shrink-0">
              📊
            </div>
            <div>
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                Daily Business Summary Report
              </h2>
              <p className="text-xs text-indigo-200">
                Official daily performance snapshot for <strong className="text-white">{report.businessName}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {/* Date Picker */}
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-semibold px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 cursor-pointer"
            />

            <button
              onClick={onClose}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="bg-indigo-50/80 p-3 sm:px-6 border-b border-indigo-100 flex flex-wrap items-center justify-between gap-2">
          <div className="text-xs font-semibold text-indigo-900 flex items-center gap-2">
            <span>📅 Report Date:</span>
            <span className="bg-white px-2.5 py-1 rounded-lg border border-indigo-200 font-mono text-indigo-950">
              {report.formattedDate}
            </span>
            <span className="text-indigo-600 font-mono text-[11px] hidden sm:inline">
              ({report.sellerTimezone})
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShareWhatsApp}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <span>📲</span>
              <span>Send WhatsApp Report</span>
            </button>

            <button
              onClick={handleCopyText}
              className="px-3 py-1.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1"
            >
              <span>📋</span>
              <span>Copy</span>
            </button>

            <button
              onClick={handleDownloadPDF}
              disabled={isGeneratingPdf}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              <span>{isGeneratingPdf ? '⏳' : '📄'}</span>
              <span>{isGeneratingPdf ? 'Generating PDF...' : 'Download PDF'}</span>
            </button>
          </div>
        </div>

        {/* Printable Report Canvas */}
        <div className="p-4 sm:p-8 max-h-[75vh] overflow-y-auto space-y-6" ref={pdfReportRef}>
          {/* Executive Header Banner */}
          <div className="border border-indigo-100 bg-gradient-to-br from-indigo-50/50 via-white to-blue-50/30 rounded-2xl p-5 shadow-xs space-y-2">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-indigo-100/80 pb-3">
              <div>
                <h3 className="text-lg font-black text-slate-900">{report.businessName}</h3>
                <p className="text-xs text-gray-500">Daily Commerce Performance & Order Analytics</p>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-indigo-700 bg-indigo-100/80 px-3 py-1 rounded-full uppercase tracking-wider">
                  REPORT DATE: {report.formattedDate}
                </span>
              </div>
            </div>

            <div className="pt-2 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-gray-500 block text-[11px]">Total Revenue</span>
                <span className="text-lg font-black text-emerald-600">
                  {report.currencySymbol}{report.totalRevenue.toFixed(2)}
                </span>
              </div>
              <div>
                <span className="text-gray-500 block text-[11px]">Total Orders</span>
                <span className="text-lg font-black text-gray-900">{report.totalOrders}</span>
              </div>
              <div>
                <span className="text-gray-500 block text-[11px]">Avg Order Value</span>
                <span className="text-lg font-black text-indigo-600">
                  {report.currencySymbol}{report.avgOrderValue.toFixed(2)}
                </span>
              </div>
              <div>
                <span className="text-gray-500 block text-[11px]">Peak Rush Hour</span>
                <span className="text-xs font-bold text-slate-800 line-clamp-1">
                  {report.peakHourLabel}
                </span>
              </div>
            </div>
          </div>

          {/* Key KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Sales Breakdown */}
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs space-y-3">
              <div className="flex justify-between items-center text-xs font-bold text-gray-700">
                <span>💰 Sales Revenue Breakdown</span>
                <span>📈</span>
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-gray-600">
                  <span>Product Subtotals</span>
                  <span className="font-mono font-semibold">{report.currencySymbol}{report.subtotalSum.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery Fees Collected</span>
                  <span className="font-mono font-semibold">{report.currencySymbol}{report.totalDeliveryFees.toFixed(2)}</span>
                </div>
                <div className="pt-2 border-t border-gray-100 flex justify-between font-bold text-emerald-700 text-sm">
                  <span>Total Gross Sales</span>
                  <span>{report.currencySymbol}{report.totalRevenue.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Order Status Breakdown */}
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs space-y-3">
              <div className="flex justify-between items-center text-xs font-bold text-gray-700">
                <span>🛒 Order Fulfillment Status</span>
                <span>📦</span>
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-emerald-700 font-semibold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Completed
                  </span>
                  <span className="font-mono font-bold bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded">
                    {report.completedOrders}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-amber-700 font-semibold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span> Pending / In-Progress
                  </span>
                  <span className="font-mono font-bold bg-amber-50 text-amber-800 px-2 py-0.5 rounded">
                    {report.pendingOrders}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-red-600 font-semibold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-red-400"></span> Cancelled
                  </span>
                  <span className="font-mono font-bold bg-red-50 text-red-700 px-2 py-0.5 rounded">
                    {report.cancelledOrders}
                  </span>
                </div>
              </div>
            </div>

            {/* Fulfillment Mode */}
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs space-y-3">
              <div className="flex justify-between items-center text-xs font-bold text-gray-700">
                <span>🚚 Delivery vs Store Pickup</span>
                <span>🏬</span>
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-gray-600">
                  <span>Home Delivery Orders</span>
                  <span className="font-bold text-gray-900">{report.deliveryCount}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Free Delivery Unlocked</span>
                  <span className="font-bold text-emerald-600">{report.freeDeliveryCount} orders</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Store / Self Pickups</span>
                  <span className="font-bold text-blue-600">{report.pickupCount}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Top Products Table */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-3">
            <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <span>🔥</span> Top Products Sold on {report.formattedDate}
            </h4>

            {report.topProducts.length === 0 ? (
              <p className="text-xs text-gray-500 py-4 text-center bg-gray-50 rounded-xl border border-dashed">
                No individual product items logged for this date.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-gray-200 text-gray-500 uppercase tracking-wider text-[10px]">
                      <th className="py-2 px-3">#</th>
                      <th className="py-2 px-3">Product Name</th>
                      <th className="py-2 px-3 text-center">Units Sold</th>
                      <th className="py-2 px-3 text-right">Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {report.topProducts.map((prod, idx) => (
                      <tr key={idx} className="hover:bg-gray-50/80">
                        <td className="py-2.5 px-3 font-mono text-gray-400 font-bold">#{idx + 1}</td>
                        <td className="py-2.5 px-3 font-semibold text-gray-900">{prod.name}</td>
                        <td className="py-2.5 px-3 text-center font-bold text-blue-600 bg-blue-50/50 rounded-lg">
                          {prod.quantity}
                        </td>
                        <td className="py-2.5 px-3 text-right font-black text-emerald-600">
                          {report.currencySymbol}{prod.revenue.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* 24-Hour Sales Rush Graph */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-3">
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <span>⏰</span> Hourly Order Traffic Distribution ({report.sellerTimezone})
              </h4>
              <span className="text-[11px] font-semibold text-indigo-600">
                Peak: {report.peakHourLabel}
              </span>
            </div>

            <div className="pt-2">
              <div className="grid grid-cols-12 sm:grid-cols-24 gap-1 items-end h-28 bg-gray-50/80 rounded-xl p-2 border border-gray-100">
                {Array.from({ length: 24 }).map((_, hr) => {
                  const hourData = report.hourlyDistribution[hr] || { count: 0, revenue: 0 };
                  const maxCount = Math.max(...Object.values(report.hourlyDistribution).map(h => h.count), 1);
                  const barHeight = Math.max(8, Math.round((hourData.count / maxCount) * 100));

                  return (
                    <div
                      key={hr}
                      className="flex flex-col items-center group relative h-full justify-end"
                      title={`${hr}:00 - ${hourData.count} order(s) (${report.currencySymbol}${hourData.revenue})`}
                    >
                      <div
                        className={`w-full rounded-t-md transition-all ${
                          hourData.count > 0 ? 'bg-indigo-600 group-hover:bg-indigo-700' : 'bg-gray-200'
                        }`}
                        style={{ height: `${barHeight}%` }}
                      ></div>
                      <span className="text-[9px] font-mono text-gray-400 mt-1 scale-90">
                        {hr % 6 === 0 ? (hr === 0 ? '12A' : hr === 12 ? '12P' : `${hr % 12}`) : ''}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Executive AI Insights & Recommendations */}
          <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-2xl p-5 shadow-sm space-y-2 border border-indigo-900">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <span>💡</span> Executive Summary Insights
            </h4>
            <ul className="space-y-1.5 text-xs text-indigo-100 list-disc list-inside">
              {report.executiveInsights.map((insight, i) => (
                <li key={i} className="leading-relaxed">
                  {insight}
                </li>
              ))}
            </ul>
          </div>

          {/* Footer stamp */}
          <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center text-[11px] text-gray-400 gap-2">
            <span>WhatsOrder Business Analytics Suite</span>
            <span>Generated for {report.businessName} • {new Date().toLocaleTimeString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
