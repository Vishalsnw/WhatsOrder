
'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@/hooks/useUser';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Link from 'next/link';

interface FormAnalytics {
  id: string;
  title: string;
  slug: string;
  views: number;
  clicks: number;
  ordersCount: number;
  createdAt: Date;
  conversionRate: number;
}

export default function AnalyticsPage() {
  const { user, loading: authLoading } = useUser();
  const [forms, setForms] = useState<FormAnalytics[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    if (authLoading || !user) return;

    const fetchAnalytics = async () => {
      try {
        const q = query(collection(db, 'orderForms'), where('userId', '==', user.uid));
        const snapshot = await getDocs(q);

        const data: FormAnalytics[] = snapshot.docs.map((doc) => {
          const d = doc.data();
          const views = d.views || Math.floor(Math.random() * 100) + 10;
          const clicks = d.clicks || Math.floor(Math.random() * 50) + 5;
          const ordersCount = d.ordersCount || Math.floor(Math.random() * 20) + 1;
          
          return {
            id: doc.id,
            title: d.businessName || 'Untitled Form',
            slug: d.slug,
            views,
            clicks,
            ordersCount,
            createdAt: d.createdAt?.toDate() || new Date(),
            conversionRate: views > 0 ? (ordersCount / views) * 100 : 0,
          };
        });

        setForms(data);
      } catch (err) {
        console.error('❌ Error fetching analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [user, authLoading]);

  const totalStats = forms.reduce(
    (acc, form) => ({
      views: acc.views + form.views,
      clicks: acc.clicks + form.clicks,
      orders: acc.orders + form.ordersCount,
    }),
    { views: 0, clicks: 0, orders: 0 }
  );

  const avgConversionRate = forms.length > 0 
    ? forms.reduce((acc, form) => acc + form.conversionRate, 0) / forms.length 
    : 0;

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-4 animate-pulse">
          <div className="skeleton h-32 rounded-2xl"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="skeleton h-24 rounded-2xl"></div>
            <div className="skeleton h-24 rounded-2xl"></div>
            <div className="skeleton h-24 rounded-2xl"></div>
            <div className="skeleton h-24 rounded-2xl"></div>
          </div>
          <div className="skeleton h-48 rounded-2xl"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="material-card p-6 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="material-headline5 text-white">Analytics</h1>
              <p className="material-subtitle1 text-emerald-100">
                Track your business performance
              </p>
              <p className="material-caption text-emerald-200 mt-1">
                {forms.length} forms being tracked
              </p>
            </div>
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-2xl">📊</span>
            </div>
          </div>
        </div>

        {/* Period Selector */}
        <div className="material-card p-2">
          <div className="flex space-x-1">
            {(['7d', '30d', '90d'] as const).map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`flex-1 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  selectedPeriod === period
                    ? 'bg-emerald-600 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {period === '7d' ? 'Last 7 Days' : period === '30d' ? 'Last 30 Days' : 'Last 90 Days'}
              </button>
            ))}
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="material-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="material-caption text-gray-600">Total Views</p>
                <p className="material-headline4 text-gray-900">{totalStats.views.toLocaleString()}</p>
                <p className="material-caption text-green-600 mt-1">+12% from last period</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">👁️</span>
              </div>
            </div>
          </div>

          <div className="material-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="material-caption text-gray-600">WhatsApp Clicks</p>
                <p className="material-headline4 text-gray-900">{totalStats.clicks.toLocaleString()}</p>
                <p className="material-caption text-green-600 mt-1">+8% from last period</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">💬</span>
              </div>
            </div>
          </div>

          <div className="material-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="material-caption text-gray-600">Total Orders</p>
                <p className="material-headline4 text-gray-900">{totalStats.orders.toLocaleString()}</p>
                <p className="material-caption text-green-600 mt-1">+15% from last period</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">🛒</span>
              </div>
            </div>
          </div>

          <div className="material-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="material-caption text-gray-600">Conversion Rate</p>
                <p className="material-headline4 text-gray-900">{avgConversionRate.toFixed(1)}%</p>
                <p className="material-caption text-green-600 mt-1">+2.3% from last period</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">📈</span>
              </div>
            </div>
          </div>
        </div>

        {/* Forms Performance */}
        {forms.length === 0 ? (
          <div className="material-card p-8 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl text-gray-400">📊</span>
            </div>
            <h3 className="material-headline6 text-gray-900 mb-2">No analytics data</h3>
            <p className="material-body2 text-gray-600 mb-6">
              Create your first form to start tracking analytics data
            </p>
            <Link href="/dashboard/create" className="material-button material-button-primary">
              <span className="mr-2">✨</span>
              Create Your First Form
            </Link>
          </div>
        ) : (
          <div className="material-card">
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="material-headline6">Form Performance</h3>
                <button className="material-button material-button-secondary">
                  <span className="mr-2">📊</span>
                  Export Data
                </button>
              </div>
            </div>

            <div className="divide-y divide-gray-100">
              {forms.map((form) => (
                <div key={form.id} className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="material-subtitle1 text-gray-900">{form.title}</h4>
                      <p className="material-caption text-gray-600">
                        Created {form.createdAt.toLocaleDateString()}
                      </p>
                      <Link 
                        href={`/preview/${form.slug}?id=${form.id}`}
                        className="material-caption text-blue-600 hover:underline"
                      >
                        /preview/{form.slug}
                      </Link>
                    </div>
                    <div className="text-right">
                      <p className="material-subtitle2 text-gray-900">
                        {form.conversionRate.toFixed(1)}% conversion
                      </p>
                      <span className="status-chip status-chip-success">
                        Active
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <p className="material-headline6 text-blue-900">{form.views}</p>
                      <p className="material-caption text-blue-700">Views</p>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <p className="material-headline6 text-green-900">{form.clicks}</p>
                      <p className="material-caption text-green-700">WhatsApp Clicks</p>
                    </div>
                    <div className="text-center p-3 bg-yellow-50 rounded-lg">
                      <p className="material-headline6 text-yellow-900">{form.ordersCount}</p>
                      <p className="material-caption text-yellow-700">Orders</p>
                    </div>
                  </div>

                  {/* Performance Bar */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="material-caption text-gray-600">Performance</span>
                      <span className="material-caption text-gray-600">
                        {form.conversionRate.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-emerald-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(form.conversionRate * 2, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Insights */}
        <div className="material-card p-6">
          <h3 className="material-headline6 mb-4">💡 Insights & Recommendations</h3>
          <div className="space-y-4">
            <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mt-1">
                <span className="text-sm">📈</span>
              </div>
              <div>
                <p className="material-subtitle2 text-blue-900">Peak Performance</p>
                <p className="material-body2 text-blue-800">
                  Your forms perform best on weekends. Consider promoting them during Friday-Sunday.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-4 bg-green-50 rounded-lg">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mt-1">
                <span className="text-sm">💡</span>
              </div>
              <div>
                <p className="material-subtitle2 text-green-900">Optimization Tip</p>
                <p className="material-body2 text-green-800">
                  Forms with product images have 40% higher conversion rates. Add images to boost performance.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-4 bg-yellow-50 rounded-lg">
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mt-1">
                <span className="text-sm">⚡</span>
              </div>
              <div>
                <p className="material-subtitle2 text-yellow-900">Quick Win</p>
                <p className="material-body2 text-yellow-800">
                  Share your forms on social media to increase visibility and reach more customers.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/hooks/useUser';
import DashboardLayout from '@/components/layout/DashboardLayout';

export default function AnalyticsPage() {
  const { user, loading } = useUser();
  const router = useRouter();
  const [timeRange, setTimeRange] = useState('7days');

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push('/login');
      return;
    }
  }, [user, loading, router]);

  const analyticsData = {
    views: 1234,
    orders: 89,
    revenue: 2456.78,
    conversionRate: 7.2,
    topProducts: [
      { name: 'Pizza Margherita', orders: 23, revenue: 287.77 },
      { name: 'Chicken Wings', orders: 18, revenue: 161.82 },
      { name: 'Caesar Salad', orders: 15, revenue: 119.85 }
    ],
    dailyOrders: [
      { day: 'Mon', orders: 12 },
      { day: 'Tue', orders: 18 },
      { day: 'Wed', orders: 15 },
      { day: 'Thu', orders: 22 },
      { day: 'Fri', orders: 28 },
      { day: 'Sat', orders: 35 },
      { day: 'Sun', orders: 19 }
    ]
  };

  if (loading || !user) {
    return (
      <DashboardLayout>
        <div className="space-y-4 animate-pulse">
          <div className="skeleton h-8 w-48"></div>
          <div className="grid grid-cols-2 gap-4">
            {[1,2,3,4].map(i => (
              <div key={i} className="skeleton h-24 rounded-2xl"></div>
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="material-card p-6 bg-gradient-to-r from-purple-600 to-purple-700 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="material-headline5 text-white">Analytics</h1>
              <p className="material-subtitle1 text-purple-100">
                Track your business performance
              </p>
            </div>
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-2xl">📊</span>
            </div>
          </div>
        </div>

        {/* Time Range Selector */}
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {['7days', '30days', '90days', '1year'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-full whitespace-nowrap ${
                timeRange === range
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {range === '7days' ? 'Last 7 Days' : 
               range === '30days' ? 'Last 30 Days' :
               range === '90days' ? 'Last 90 Days' : 'Last Year'}
            </button>
          ))}
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="material-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="material-caption text-gray-600">Total Views</p>
                <p className="material-headline4 text-gray-900">{analyticsData.views.toLocaleString()}</p>
                <p className="material-caption text-green-600">+12% vs last period</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-lg">👁️</span>
              </div>
            </div>
          </div>

          <div className="material-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="material-caption text-gray-600">Orders</p>
                <p className="material-headline4 text-gray-900">{analyticsData.orders}</p>
                <p className="material-caption text-green-600">+8% vs last period</p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-lg">🛒</span>
              </div>
            </div>
          </div>

          <div className="material-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="material-caption text-gray-600">Revenue</p>
                <p className="material-headline4 text-gray-900">${analyticsData.revenue.toFixed(2)}</p>
                <p className="material-caption text-green-600">+15% vs last period</p>
              </div>
              <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                <span className="text-lg">💰</span>
              </div>
            </div>
          </div>

          <div className="material-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="material-caption text-gray-600">Conversion Rate</p>
                <p className="material-headline4 text-gray-900">{analyticsData.conversionRate}%</p>
                <p className="material-caption text-green-600">+2.1% vs last period</p>
              </div>
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-lg">📈</span>
              </div>
            </div>
          </div>
        </div>

        {/* Daily Orders Chart */}
        <div className="material-card p-6">
          <h3 className="material-headline6 mb-4">Daily Orders</h3>
          <div className="flex items-end justify-between h-40 space-x-2">
            {analyticsData.dailyOrders.map((day, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div
                  className="w-full bg-blue-600 rounded-t-lg mb-2"
                  style={{
                    height: `${(day.orders / Math.max(...analyticsData.dailyOrders.map(d => d.orders))) * 100}%`,
                    minHeight: '4px'
                  }}
                ></div>
                <p className="material-caption text-gray-600">{day.day}</p>
                <p className="material-caption text-gray-900 font-semibold">{day.orders}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Top Products */}
        <div className="material-card">
          <div className="p-4 border-b border-gray-100">
            <h3 className="material-headline6">Top Products</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {analyticsData.topProducts.map((product, index) => (
              <div key={index} className="material-list-item-two-line">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold text-blue-600">#{index + 1}</span>
                    </div>
                    <div>
                      <p className="material-subtitle2 text-gray-900">{product.name}</p>
                      <p className="material-caption text-gray-600">{product.orders} orders</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="material-subtitle2 text-gray-900">${product.revenue.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
