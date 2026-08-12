'use client';

import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@/hooks/useUser';
import { getAnalyticsData, getOrders, subscribeToOrders, getUserForms, getUserProfile, Order, Form } from '@/lib/firestore';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Link from 'next/link';
import { formatOrderTimestamp, COMMON_TIMEZONES, getCurrentTimeInTimezone } from '@/lib/timezones';
import DailySummaryReportModal from '@/components/analytics/DailySummaryReportModal';

export default function AnalyticsPage() {
  const { user, loading: authLoading } = useUser();
  const [analyticsData, setAnalyticsData] = useState<any>({
    totalRevenue: 0,
    todayRevenue: 0,
    todayOrders: 0,
    thisMonthRevenue: 0,
    thisMonthOrders: 0,
    totalOrders: 0,
    totalForms: 0,
    totalViews: 0,
    avgOrderValue: 0,
    topProducts: [],
    recentOrders: [],
    sellerTimezone: 'Asia/Kolkata',
  });
  const [rawOrders, setRawOrders] = useState<Order[]>([]);
  const [rawForms, setRawForms] = useState<Form[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isDailyReportOpen, setIsDailyReportOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [liveClock, setLiveClock] = useState('');

  const loadStats = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const [data, ordersList, formsList, profile] = await Promise.all([
        getAnalyticsData(user.uid),
        getOrders(user.uid),
        getUserForms(user.uid),
        getUserProfile(user.uid),
      ]);
      setAnalyticsData(data);
      setRawOrders(ordersList);
      setRawForms(formsList);
      setUserProfile(profile);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }

    loadStats();

    // Subscribe to real-time orders to re-calculate stats automatically
    const unsubscribe = subscribeToOrders(user.uid, () => {
      loadStats();
    });

    return () => unsubscribe();
  }, [user, authLoading, loadStats]);

  // Update live clock for seller local time
  useEffect(() => {
    const tz = analyticsData?.sellerTimezone || 'Asia/Kolkata';
    const update = () => setLiveClock(getCurrentTimeInTimezone(tz));
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [analyticsData?.sellerTimezone]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadStats();
  };

  if (authLoading || loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6 animate-pulse">
          <div className="skeleton h-28 rounded-2xl"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="skeleton h-28 rounded-2xl"></div>
            <div className="skeleton h-28 rounded-2xl"></div>
            <div className="skeleton h-28 rounded-2xl"></div>
            <div className="skeleton h-28 rounded-2xl"></div>
          </div>
          <div className="skeleton h-64 rounded-2xl"></div>
        </div>
      </DashboardLayout>
    );
  }

  const {
    totalRevenue = 0,
    todayRevenue = 0,
    todayOrders = 0,
    thisMonthRevenue = 0,
    thisMonthOrders = 0,
    totalOrders = 0,
    totalForms = 0,
    avgOrderValue = 0,
    topProducts = [],
    recentOrders = [],
    currencySymbol = '$',
    sellerTimezone = 'Asia/Kolkata',
  } = analyticsData || {};

  const tzObj = COMMON_TIMEZONES.find(t => t.iana === sellerTimezone);
  const tzLabel = tzObj ? tzObj.code : sellerTimezone;

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Header Card */}
        <div className="material-card p-6 bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-2xl">📊</span>
                <h1 className="text-2xl font-bold text-white">Stats & Analytics</h1>
              </div>
              <p className="text-indigo-100 text-sm mt-1">
                Real-time performance metrics and order summary in your local timezone
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setIsDailyReportOpen(true)}
                className="inline-flex items-center justify-center space-x-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold px-4 py-2 rounded-xl text-sm transition-colors shadow-xs"
              >
                <span>📊</span>
                <span>Daily Report</span>
              </button>

              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="inline-flex items-center justify-center space-x-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
              >
                <span className={`text-base ${refreshing ? 'animate-spin' : ''}`}>🔄</span>
                <span>{refreshing ? 'Refreshing...' : 'Refresh Stats'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Timezone Status Bar */}
        <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-4 rounded-2xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border border-indigo-900/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center text-xl shrink-0">
              🌐
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">Seller Local Timezone</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 font-mono">
                  {tzLabel} ({sellerTimezone})
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                All daily, monthly stats and order times are calculated for <strong className="text-white">{sellerTimezone}</strong>.
              </p>
            </div>
          </div>

          <div className="self-stretch sm:self-auto bg-white/10 px-3.5 py-2 rounded-xl text-xs flex items-center justify-between sm:justify-end gap-2 border border-white/10">
            <span className="text-indigo-200">Current Local Time:</span>
            <span className="font-mono font-bold text-amber-300">{liveClock}</span>
            <Link href="/dashboard/profile" className="text-[11px] underline text-indigo-300 hover:text-white ml-1">
              Change
            </Link>
          </div>
        </div>

        {/* Timezone-Specific Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Today's Sales */}
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white p-5 rounded-2xl shadow-sm space-y-3 flex flex-col justify-between">
            <div className="space-y-1">
              <div className="flex justify-between items-center opacity-90 text-xs font-bold uppercase tracking-wider">
                <span>Today&apos;s Sales ({tzLabel})</span>
                <span className="text-lg">☀️</span>
              </div>
              <div className="text-3xl font-extrabold">
                {currencySymbol}{todayRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="text-xs text-emerald-100 font-medium">
                {todayOrders} order(s) placed today in seller local time
              </div>
            </div>
            <div>
              <button
                onClick={() => setIsDailyReportOpen(true)}
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-1.5 bg-white/20 hover:bg-white/30 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors border border-white/20"
              >
                <span>📊</span>
                <span>View Daily Summary Report →</span>
              </button>
            </div>
          </div>

          {/* This Month's Sales */}
          <div className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white p-5 rounded-2xl shadow-sm space-y-2">
            <div className="flex justify-between items-center opacity-90 text-xs font-bold uppercase tracking-wider">
              <span>This Month ({tzLabel})</span>
              <span className="text-lg">📅</span>
            </div>
            <div className="text-3xl font-extrabold">
              {currencySymbol}{thisMonthRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-xs text-blue-100 font-medium">
              {thisMonthOrders} order(s) placed this calendar month
            </div>
          </div>
        </div>

        {/* Core KPI Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-gray-500 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Total Revenue</span>
                <span className="text-xl">💰</span>
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                {currencySymbol}{totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
            <div className="mt-3 text-xs text-green-600 font-medium flex items-center">
              <span>📈 Lifetime Earnings</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-gray-500 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Total Orders</span>
                <span className="text-xl">🛒</span>
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                {totalOrders}
              </div>
            </div>
            <div className="mt-3 text-xs text-blue-600 font-medium flex items-center justify-between">
              <span>All Received</span>
              <Link href="/dashboard/orders" className="underline hover:text-blue-800">
                View All
              </Link>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-gray-500 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Active Forms</span>
                <span className="text-xl">📋</span>
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                {totalForms}
              </div>
            </div>
            <div className="mt-3 text-xs text-purple-600 font-medium flex items-center justify-between">
              <span>Forms Created</span>
              <Link href="/my-forms" className="underline hover:text-purple-800">
                Manage
              </Link>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-gray-500 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Avg Order Value</span>
                <span className="text-xl">🏷️</span>
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                {currencySymbol}{avgOrderValue.toFixed(2)}
              </div>
            </div>
            <div className="mt-3 text-xs text-amber-600 font-medium flex items-center">
              <span>Per Customer Order</span>
            </div>
          </div>
        </div>

        {/* Analytics Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Selling Products */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900 flex items-center">
                <span className="mr-2">🔥</span> Top Selling Products
              </h2>
              <span className="text-xs font-medium text-gray-500">By Quantity</span>
            </div>

            {topProducts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <span className="text-3xl block mb-2">📦</span>
                <p className="text-sm">No product sales logged yet.</p>
                <p className="text-xs text-gray-400 mt-1">Share your order form to start receiving orders!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {topProducts.map((product: any, idx: number) => {
                  const maxCount = topProducts[0]?.count || 1;
                  const percentage = Math.round((product.count / maxCount) * 100);

                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="font-semibold text-gray-800 flex items-center">
                          <span className="w-5 text-gray-400 font-mono text-xs">#{idx + 1}</span>
                          {product.name}
                        </span>
                        <span className="font-bold text-blue-600">
                          {product.count} sold ({product.revenue ? `${currencySymbol}${product.revenue}` : ''})
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                        <div
                          className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                          style={{ width: `${Math.max(percentage, 5)}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recent Orders List with Local Timestamps */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900 flex items-center">
                <span className="mr-2">🛍️</span> Recent Orders ({tzLabel})
              </h2>
              <Link href="/dashboard/orders" className="text-xs font-semibold text-blue-600 hover:text-blue-800">
                View All →
              </Link>
            </div>

            {recentOrders.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <span className="text-3xl block mb-2">📥</span>
                <p className="text-sm">No orders received yet.</p>
                <p className="text-xs text-gray-400 mt-1">
                  Once customers place orders via your forms, they will show up here.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {recentOrders.map((order: any) => (
                  <div key={order.id} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{order.customerName}</p>
                      <p className="text-xs text-gray-500 font-mono mt-0.5">
                        {order.items?.length || 0} item(s) • {formatOrderTimestamp(order.createdAt, sellerTimezone)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-green-600">{order.currencySymbol || currencySymbol}{order.total}</p>
                      <span className="inline-block px-2 py-0.5 text-[10px] uppercase tracking-wider font-semibold bg-blue-50 text-blue-700 rounded-full">
                        {order.status || 'pending'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions & Tips */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-gray-900">Want to boost your sales stats?</h3>
            <p className="text-sm text-gray-600">Share your WhatsApp order forms across Instagram, Facebook, or WhatsApp Status.</p>
          </div>
          <div className="flex space-x-3 w-full sm:w-auto">
            <Link
              href="/my-forms"
              className="flex-1 sm:flex-none px-4 py-2 bg-blue-600 text-white font-medium text-sm rounded-xl text-center hover:bg-blue-700 transition-colors"
            >
              Share Forms
            </Link>
            <Link
              href="/dashboard/create"
              className="flex-1 sm:flex-none px-4 py-2 bg-gray-100 text-gray-800 font-medium text-sm rounded-xl text-center hover:bg-gray-200 transition-colors"
            >
              + Create Form
            </Link>
          </div>
        </div>
      </div>

      <DailySummaryReportModal
        orders={rawOrders}
        forms={rawForms}
        userProfile={userProfile}
        isOpen={isDailyReportOpen}
        onClose={() => setIsDailyReportOpen(false)}
      />
    </DashboardLayout>
  );
}
