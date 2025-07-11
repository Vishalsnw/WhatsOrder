
'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';

interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  timestamp: Date;
  formName: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'delivered'>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);

  useEffect(() => {
    // Mock data - replace with actual API call
    const mockOrders: Order[] = [
      {
        id: '1',
        customerName: 'John Doe',
        customerPhone: '+1234567890',
        customerAddress: '123 Main St, City',
        items: [
          { name: 'Burger Deluxe', quantity: 2, price: 12.99 },
          { name: 'French Fries', quantity: 1, price: 4.99 }
        ],
        total: 30.97,
        status: 'pending',
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
        formName: 'Burger Palace Menu'
      },
      {
        id: '2',
        customerName: 'Jane Smith',
        customerPhone: '+1234567891',
        customerAddress: '456 Oak Ave, Town',
        items: [
          { name: 'Pizza Margherita', quantity: 1, price: 18.50 },
          { name: 'Coca Cola', quantity: 2, price: 2.50 }
        ],
        total: 23.50,
        status: 'confirmed',
        timestamp: new Date(Date.now() - 1000 * 60 * 120),
        formName: 'Tony\'s Pizzeria'
      },
      {
        id: '3',
        customerName: 'Mike Johnson',
        customerPhone: '+1234567892',
        customerAddress: '789 Pine St, Village',
        items: [
          { name: 'T-Shirt Blue', quantity: 1, price: 25.00 },
          { name: 'Jeans Classic', quantity: 1, price: 55.00 }
        ],
        total: 80.00,
        status: 'delivered',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5),
        formName: 'Fashion Store'
      }
    ];
    setOrders(mockOrders);
  }, []);

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'confirmed': return '✅';
      case 'preparing': return '👨‍🍳';
      case 'ready': return '📦';
      case 'delivered': return '🚚';
      case 'cancelled': return '❌';
      default: return '📋';
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

  const filteredOrders = filter === 'all' 
    ? orders 
    : orders.filter(order => order.status === filter);

  const updateOrderStatus = (orderId: string, newStatus: Order['status']) => {
    setOrders(orders.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    ));
  };

  const orderCounts = {
    all: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    confirmed: orders.filter(o => o.status === 'confirmed').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
  };

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
        <div className="material-card p-2">
          <div className="flex space-x-1">
            {(['all', 'pending', 'confirmed', 'delivered'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`flex-1 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  filter === status
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <div className="flex flex-col items-center space-y-1">
                  <span className="capitalize">{status}</span>
                  <span className="text-xs opacity-75">
                    {orderCounts[status]}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="material-card p-8 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl text-gray-400">📦</span>
            </div>
            <h3 className="material-headline6 text-gray-900 mb-2">No orders found</h3>
            <p className="material-body2 text-gray-600">
              {filter === 'all' 
                ? 'You haven\'t received any orders yet. Share your forms to start getting orders!'
                : `No ${filter} orders at the moment.`
              }
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredOrders.map((order) => (
              <div key={order.id} className="material-card overflow-hidden">
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <span className="text-lg">👤</span>
                      </div>
                      <div>
                        <h3 className="material-subtitle1 text-gray-900">{order.customerName}</h3>
                        <p className="material-caption text-gray-600">
                          {order.formName} • {formatTimeAgo(order.timestamp)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="material-subtitle2 text-gray-900">${order.total.toFixed(2)}</p>
                      <span className={`status-chip ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)} {order.status}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <span>📱</span>
                      <span>{order.customerPhone}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <span>📍</span>
                      <span className="truncate">{order.customerAddress}</span>
                    </div>
                  </div>

                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <p className="material-caption text-gray-600 mb-2">Order Items:</p>
                    {order.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center text-sm">
                        <span className="text-gray-700">
                          {item.quantity}x {item.name}
                        </span>
                        <span className="text-gray-900 font-medium">
                          ${(item.quantity * item.price).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setSelectedOrder(order);
                        setShowOrderDetails(true);
                      }}
                      className="flex-1 material-button material-button-secondary text-center"
                    >
                      <span className="mr-2">👁️</span>
                      View Details
                    </button>
                    
                    <a
                      href={`https://wa.me/${order.customerPhone.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 material-button material-button-primary text-center"
                    >
                      <span className="mr-2">💬</span>
                      WhatsApp
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Order Details Modal */}
        {showOrderDetails && selectedOrder && (
          <>
            <div 
              className="fixed inset-0 z-40 bg-black/50"
              onClick={() => setShowOrderDetails(false)}
            />
            <div className="fixed inset-x-4 top-20 bottom-20 z-50 material-card overflow-y-auto animate-slide-in-bottom">
              <div className="sticky top-0 bg-white border-b border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <h3 className="material-headline6 text-gray-900">Order Details</h3>
                  <button
                    onClick={() => setShowOrderDetails(false)}
                    className="p-2 rounded-full hover:bg-gray-100"
                  >
                    <span className="material-icon">✕</span>
                  </button>
                </div>
              </div>

              <div className="p-4 space-y-6">
                {/* Customer Info */}
                <div>
                  <h4 className="material-subtitle1 text-gray-900 mb-3">Customer Information</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <span>👤</span>
                      <span className="material-body2">{selectedOrder.customerName}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span>📱</span>
                      <span className="material-body2">{selectedOrder.customerPhone}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span>📍</span>
                      <span className="material-body2">{selectedOrder.customerAddress}</span>
                    </div>
                  </div>
                </div>

                {/* Order Status */}
                <div>
                  <h4 className="material-subtitle1 text-gray-900 mb-3">Order Status</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {(['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'] as const).map((status) => (
                      <button
                        key={status}
                        onClick={() => updateOrderStatus(selectedOrder.id, status)}
                        className={`p-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                          selectedOrder.status === status
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <div className="flex flex-col items-center space-y-1">
                          <span>{getStatusIcon(status)}</span>
                          <span className="capitalize">{status}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Order Items */}
                <div>
                  <h4 className="material-subtitle1 text-gray-900 mb-3">Order Items</h4>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="material-body2 text-gray-900">{item.name}</p>
                          <p className="material-caption text-gray-600">Qty: {item.quantity}</p>
                        </div>
                        <p className="material-subtitle2 text-gray-900">
                          ${(item.quantity * item.price).toFixed(2)}
                        </p>
                      </div>
                    ))}
                    <div className="border-t border-gray-200 pt-3">
                      <div className="flex justify-between items-center">
                        <p className="material-subtitle1 text-gray-900">Total</p>
                        <p className="material-headline6 text-gray-900">
                          ${selectedOrder.total.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
