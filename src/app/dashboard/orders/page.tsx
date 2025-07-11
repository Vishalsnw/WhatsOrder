'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/hooks/useUser';
import DashboardLayout from '@/components/layout/DashboardLayout';

interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  timestamp: Date;
  address?: string;
  notes?: string;
}

export default function OrdersPage() {
  const { user, loading } = useUser();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'delivered'>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push('/login');
      return;
    }

    loadOrders();
  }, [user, loading, router]);

  const loadOrders = async () => {
    try {
      setIsLoading(true);

      // Mock orders data - replace with actual database call
      const mockOrders: Order[] = [];

      setOrders(mockOrders);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    setOrders(orders.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    ));
  };

  const filteredOrders = orders.filter(order => 
    filter === 'all' || order.status === filter
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'status-chip-warning';
      case 'confirmed': return 'status-chip-info';
      case 'preparing': return 'status-chip-info';
      case 'ready': return 'status-chip-success';
      case 'delivered': return 'status-chip-success';
      case 'cancelled': return 'status-chip-error';
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

  const orderCounts = {
    all: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    confirmed: orders.filter(o => o.status === 'confirmed').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
  };

  if (loading || !user) {
    return (
      <DashboardLayout>
        <div className="space-y-4 animate-pulse">
          <div className="skeleton h-8 w-48"></div>
          <div className="skeleton h-12 w-full"></div>
          <div className="skeleton h-64 rounded-2xl"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="material-card p-6 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="material-headline5 text-white">Orders</h1>
              <p className="material-subtitle1 text-indigo-100">
                Manage customer orders
              </p>
              <p className="material-caption text-indigo-200 mt-1">
                {orders.length} total orders
              </p>
            </div>
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-2xl">🛒</span>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl overflow-x-auto">
          {[
            { key: 'all', label: 'All', count: orderCounts.all },
            { key: 'pending', label: 'Pending', count: orderCounts.pending },
            { key: 'confirmed', label: 'Confirmed', count: orderCounts.confirmed },
            { key: 'delivered', label: 'Delivered', count: orderCounts.delivered }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as any)}
              className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                filter === tab.key
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              {[1,2,3].map(i => (
                <div key={i} className="skeleton h-32 rounded-2xl"></div>
              ))}
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="material-card p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📝</span>
              </div>
              <h3 className="material-headline6 text-gray-900 mb-2">No orders found</h3>
              <p className="material-body2 text-gray-600">
                {filter === 'all' 
                  ? "You haven't received any orders yet." 
                  : `No ${filter} orders found.`}
              </p>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div key={order.id} className="material-card overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-lg">👤</span>
                      </div>
                      <div>
                        <h3 className="material-subtitle1 text-gray-900">{order.customerName}</h3>
                        <p className="material-caption text-gray-600">{order.customerPhone}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`status-chip ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                      <p className="material-caption text-gray-500">
                        {formatTimeAgo(order.timestamp)}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs font-semibold">
                            {item.quantity}
                          </span>
                          <span className="material-body2 text-gray-900">{item.name}</span>
                        </div>
                        <span className="material-body2 text-gray-900">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {order.address && (
                    <div className="mb-4">
                      <p className="material-caption text-gray-600">Delivery Address:</p>
                      <p className="material-body2 text-gray-900">{order.address}</p>
                    </div>
                  )}

                  {order.notes && (
                    <div className="mb-4">
                      <p className="material-caption text-gray-600">Notes:</p>
                      <p className="material-body2 text-gray-900">{order.notes}</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex space-x-2">
                      {order.status === 'pending' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'confirmed')}
                          className="material-button material-button-primary"
                        >
                          Confirm
                        </button>
                      )}
                      {order.status === 'confirmed' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'preparing')}
                          className="material-button material-button-primary"
                        >
                          Start Preparing
                        </button>
                      )}
                      {order.status === 'preparing' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'ready')}
                          className="material-button material-button-primary"
                        >
                          Mark Ready
                        </button>
                      )}
                      {order.status === 'ready' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'delivered')}
                          className="material-button material-button-primary"
                        >
                          Mark Delivered
                        </button>
                      )}
                      {order.status !== 'delivered' && order.status !== 'cancelled' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'cancelled')}
                          className="material-button bg-red-600 text-white hover:bg-red-700"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="material-headline6 text-gray-900">
                        ${order.total.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}