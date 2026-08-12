'use client';

import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@/hooks/useUser';
import { getOrders, subscribeToOrders, Order, getUserProfile, getUserForms } from '@/lib/firestore';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Link from 'next/link';
import { getCurrencySymbol } from '@/lib/currencies';
import { formatWhatsAppNumber } from '@/lib/countryCodes';
import { formatOrderTimestamp, getUserBrowserTimezone } from '@/lib/timezones';
import StatusNotificationModal from '@/components/orders/StatusNotificationModal';
import OrderReceiptModal from '@/components/orders/OrderReceiptModal';
import DailySummaryReportModal from '@/components/analytics/DailySummaryReportModal';
import { OrderStatusType } from '@/lib/whatsappStatusNotification';

export default function OrdersPage() {
  const { user, loading: authLoading } = useUser();
  const [orders, setOrders] = useState<Order[]>([]);
  const [forms, setForms] = useState<any[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [sellerTimezone, setSellerTimezone] = useState<string>('Asia/Kolkata');
  const [businessName, setBusinessName] = useState<string>('Our Store');
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [isDailyReportOpen, setIsDailyReportOpen] = useState(false);
  
  // Modal state
  const [notifyOrder, setNotifyOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Receipt Modal state
  const [receiptOrder, setReceiptOrder] = useState<Order | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  const fetchOrders = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const [userOrders, profile, forms] = await Promise.all([
        getOrders(user.uid),
        getUserProfile(user.uid),
        getUserForms(user.uid),
      ]);
      setOrders(userOrders);
      setForms(forms || []);
      setUserProfile(profile || null);
      if (profile?.timezone) {
        setSellerTimezone(profile.timezone);
      } else {
        setSellerTimezone(getUserBrowserTimezone());
      }
      if (forms && forms.length > 0 && forms[0].businessName) {
        setBusinessName(forms[0].businessName);
      } else if (user.displayName) {
        setBusinessName(user.displayName);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }

    fetchOrders();

    // Subscribe to real-time order updates
    const unsubscribe = subscribeToOrders(user.uid, (updatedOrders) => {
      setOrders(updatedOrders);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, authLoading, fetchOrders]);

  const handleStatusChange = async (orderId: string, newStatus: Order['status']) => {
    if (!user) return;
    setUpdatingId(orderId);

    try {
      const orderDocRef = doc(db, 'users', user.uid, 'orders', orderId);
      await updateDoc(orderDocRef, { status: newStatus });
      setOrders(prev =>
        prev.map(o => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
      
      // Prompt modal to immediately notify customer
      const updatedOrd = orders.find(o => o.id === orderId);
      if (updatedOrd) {
        setNotifyOrder({ ...updatedOrd, status: newStatus });
        setIsModalOpen(true);
      }
    } catch (err) {
      console.error('Error updating order status:', err);
      alert('Could not update order status.');
    } finally {
      setUpdatingId(null);
    }
  };

  const openNotifyModalForOrder = (order: Order) => {
    setNotifyOrder(order);
    setIsModalOpen(true);
  };

  if (authLoading || loading) {
    return (
      <DashboardLayout>
        <div className="space-y-4 animate-pulse">
          <div className="skeleton h-24 rounded-2xl"></div>
          <div className="skeleton h-64 rounded-2xl"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="material-card p-6 bg-gradient-to-r from-blue-600 to-indigo-700 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center">
              <span className="mr-2">🛒</span> Customer Orders
            </h1>
            <p className="text-blue-100 text-sm mt-1">
              Track and update order statuses received via WhatsApp forms
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsDailyReportOpen(true)}
              className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl text-sm transition-colors shadow-xs"
            >
              📊 Daily Report
            </button>
            <button
              onClick={() => {
                setLoading(true);
                fetchOrders();
              }}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-xl text-sm font-medium transition-colors"
            >
              🔄 Refresh Orders
            </button>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-gray-100 shadow-sm text-center">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">📥</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">No Orders Received Yet</h2>
            <p className="text-gray-600 max-w-md mx-auto mb-6 text-sm">
              When customers place orders using your form links, their orders will automatically be listed here for management.
            </p>
            <div className="flex justify-center space-x-3">
              <Link
                href="/my-forms"
                className="px-5 py-2.5 bg-blue-600 text-white font-medium text-sm rounded-xl hover:bg-blue-700 transition-colors"
              >
                View My Forms
              </Link>
              <Link
                href="/dashboard/analytics"
                className="px-5 py-2.5 bg-gray-100 text-gray-800 font-medium text-sm rounded-xl hover:bg-gray-200 transition-colors"
              >
                View Stats
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-2">
              <span className="font-bold text-gray-900 text-base">All Orders ({orders.length})</span>
              <span className="text-xs bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-lg border border-indigo-100 font-medium flex items-center gap-1">
                <span>🕒</span> Seller Timezone: <strong className="font-semibold">{sellerTimezone}</strong>
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-600 uppercase text-[11px] font-bold tracking-wider">
                  <tr>
                    <th className="p-4">Customer</th>
                    <th className="p-4">Items</th>
                    <th className="p-4">Total</th>
                    <th className="p-4">Date & Time</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {orders.map((order) => {
                    const sym = order.currencySymbol || getCurrencySymbol(order.currency, '$');
                    return (
                      <tr key={order.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="p-4 font-medium text-gray-900">
                          <div>{order.customerName}</div>
                          {order.customerPhone && (
                            <a
                              href={`https://wa.me/${formatWhatsAppNumber(order.customerPhone)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-green-600 hover:underline flex items-center mt-0.5 font-mono"
                            >
                              <span>📱 {order.customerPhone}</span>
                            </a>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="max-w-xs text-xs text-gray-700 space-y-1">
                            {order.items?.map((item, idx) => (
                              <div key={idx}>
                                • {item.quantity}x {item.name} ({sym}{item.price})
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="p-4 font-bold text-green-600 text-base">
                          {sym}{order.total}
                        </td>
                      <td className="p-4 text-xs text-gray-700 font-medium">
                        {formatOrderTimestamp(order.createdAt, sellerTimezone)}
                      </td>
                      <td className="p-4">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                          order.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : order.status === 'shipped'
                            ? 'bg-blue-100 text-blue-800'
                            : order.status === 'confirmed'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                          <select
                            value={order.status}
                            disabled={updatingId === order.id}
                            onChange={(e) => handleStatusChange(order.id, e.target.value as Order['status'])}
                            className="text-xs px-2.5 py-1.5 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium text-gray-800"
                          >
                            <option value="pending">⏳ Pending</option>
                            <option value="confirmed">🎉 Confirmed</option>
                            <option value="shipped">🚚 Shipped</option>
                            <option value="completed">✅ Completed</option>
                          </select>

                          <button
                            type="button"
                            onClick={() => openNotifyModalForOrder(order)}
                            title="1-Click WhatsApp Notification"
                            className="text-xs px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-xs transition-all flex items-center gap-1 shrink-0"
                          >
                            <span>💬 Notify</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setReceiptOrder(order);
                              setIsReceiptOpen(true);
                            }}
                            title="View / Download PDF Receipt"
                            className="text-xs px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold rounded-lg shadow-xs transition-all flex items-center gap-1 shrink-0"
                          >
                            <span>🧾 Invoice / PDF</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 1-Click Status Notification Modal */}
        <StatusNotificationModal
          order={notifyOrder}
          businessName={businessName}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onStatusChangeAndNotify={async (orderId, newStatus) => {
            await handleStatusChange(orderId, newStatus);
          }}
        />

        {/* Digital Receipt & PDF Generator Modal */}
        <OrderReceiptModal
          order={receiptOrder}
          businessName={businessName}
          isOpen={isReceiptOpen}
          onClose={() => setIsReceiptOpen(false)}
        />

        {/* Daily Business Summary Report Modal */}
        <DailySummaryReportModal
          orders={orders}
          forms={forms}
          userProfile={userProfile}
          isOpen={isDailyReportOpen}
          onClose={() => setIsDailyReportOpen(false)}
        />
      </div>
    </DashboardLayout>
  );
}
