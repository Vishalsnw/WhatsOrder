
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/hooks/useUser';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';

interface DashboardStats {
  totalForms: number;
  totalOrders: number;
  totalRevenue: number;
  activeCustomers: number;
}

interface RecentOrder {
  id: string;
  customerName: string;
  total: number;
  status: 'pending' | 'confirmed' | 'delivered';
  timestamp: Date;
}

export default function Dashboard() {
  const { user, loading } = useUser();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalForms: 0,
    totalOrders: 0,
    totalRevenue: 0,
    activeCustomers: 0,
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push('/login');
      return;
    }

    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 17) setGreeting('Good afternoon');
    else setGreeting('Good evening');

    loadDashboardData();
  }, [user, loading, router]);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Load forms count
      const formsQuery = query(
        collection(db, 'orderForms'),
        where('userId', '==', user.uid)
      );
      const formsSnapshot = await getDocs(formsQuery);
      
      // Load recent orders (simulated data for now)
      const mockOrders: RecentOrder[] = [
        {
          id: '1',
          customerName: 'John Doe',
          total: 150.50,
          status: 'pending',
          timestamp: new Date(Date.now() - 1000 * 60 * 30) // 30 min ago
        },
        {
          id: '2',
          customerName: 'Jane Smith',
          total: 85.75,
          status: 'confirmed',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2) // 2 hours ago
        },
        {
          id: '3',
          customerName: 'Mike Johnson',
          total: 220.00,
          status: 'delivered',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5) // 5 hours ago
        }
      ];

      setStats({
        totalForms: formsSnapshot.size,
        totalOrders: 42,
        totalRevenue: 2850.75,
        activeCustomers: 18,
      });
      
      setRecentOrders(mockOrders);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'status-chip-warning';
      case 'confirmed': return 'status-chip-info';
      case 'delivered': return 'status-chip-success';
      default: return 'status-chip-info';
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  if (loading || !user) {
    return (
      <DashboardLayout>
        <div className="space-y-4 animate-pulse">
          <div className="skeleton h-8 w-48"></div>
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
        {/* Welcome Section */}
        <div className="material-card p-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="material-headline5 text-white">{greeting}!</h2>
              <p className="material-subtitle1 text-blue-100">
                {user.displayName || 'Business Owner'}
              </p>
              <p className="material-caption text-blue-200 mt-1">
                Ready to grow your business today?
              </p>
            </div>
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-2xl">👋</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <Link href="/dashboard/create" className="material-card p-4 text-center hover:scale-105 transition-transform duration-200">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">✨</span>
            </div>
            <h3 className="material-subtitle2 text-gray-900">Create Form</h3>
            <p className="material-caption text-gray-600">New order form</p>
          </Link>
          
          <Link href="/my-forms" className="material-card p-4 text-center hover:scale-105 transition-transform duration-200">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">📋</span>
            </div>
            <h3 className="material-subtitle2 text-gray-900">My Forms</h3>
            <p className="material-caption text-gray-600">Manage forms</p>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="material-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="material-caption text-gray-600">Total Forms</p>
                <p className="material-headline4 text-gray-900">{stats.totalForms}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-lg">📝</span>
              </div>
            </div>
          </div>

          <div className="material-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="material-caption text-gray-600">Total Orders</p>
                <p className="material-headline4 text-gray-900">{stats.totalOrders}</p>
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
                <p className="material-headline4 text-gray-900">${stats.totalRevenue.toFixed(2)}</p>
              </div>
              <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                <span className="text-lg">💰</span>
              </div>
            </div>
          </div>

          <div className="material-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="material-caption text-gray-600">Customers</p>
                <p className="material-headline4 text-gray-900">{stats.activeCustomers}</p>
              </div>
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-lg">👥</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="material-card">
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="material-headline6">Recent Orders</h3>
              <Link href="/dashboard/orders" className="material-subtitle2 text-blue-600">
                View All
              </Link>
            </div>
          </div>
          
          <div className="divide-y divide-gray-100">
            {recentOrders.map((order) => (
              <div key={order.id} className="material-list-item-two-line">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <span className="text-lg">👤</span>
                  </div>
                  <div className="flex-1">
                    <p className="material-subtitle2 text-gray-900">{order.customerName}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`status-chip ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                      <span className="material-caption text-gray-500">
                        {formatTimeAgo(order.timestamp)}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="material-subtitle2 text-gray-900">${order.total.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Insights */}
        <div className="material-card p-6">
          <h3 className="material-headline6 mb-4">Today's Insights</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-sm">📈</span>
              </div>
              <div>
                <p className="material-body2 text-gray-900">Orders increased by 15%</p>
                <p className="material-caption text-gray-600">Compared to yesterday</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-sm">⭐</span>
              </div>
              <div>
                <p className="material-body2 text-gray-900">3 new customer reviews</p>
                <p className="material-caption text-gray-600">Average rating: 4.8/5</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
