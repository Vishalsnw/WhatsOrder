'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firestore';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { useUser } from '@/hooks/useUser';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';

interface Order {
  id: string;
  customerName: string;
  address: string;
  total: number;
  products: {
    name: string;
    quantity: number;
  }[];
  timestamp: Date;
}

export default function OrdersPage() {
  const { user, loading } = useUser();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // 🔐 Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // 📥 Fetch orders for logged in user
  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;

      try {
        const ref = collection(db, 'users', user.uid, 'orders');
        const q = query(ref, orderBy('timestamp', 'desc'));
        const snap = await getDocs(q);
        const orderList: Order[] = [];

        snap.forEach((docSnap) => {
          const data = docSnap.data();
          orderList.push({
            id: docSnap.id,
            customerName: data.customerName || 'Unnamed',
            address: data.address || 'N/A',
            total: data.total || 0,
            products: data.products || [],
            timestamp: data.timestamp?.toDate?.() || new Date(),
          });
        });

        setOrders(orderList);
      } catch (err) {
        console.error('❌ Failed to fetch orders:', err);
      } finally {
        setLoadingOrders(false);
      }
    };

    if (user) fetchOrders();
  }, [user]);

  if (loading || loadingOrders) {
    return <div className="text-center mt-10 text-gray-500">Loading orders...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-indigo-700 mb-6 text-center">📦 Orders</h1>

      {orders.length === 0 ? (
        <p className="text-center text-gray-500">No orders received yet.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-xl shadow p-4 space-y-2">
              <div className="flex justify-between text-sm text-gray-500">
                <span>🧍 {order.customerName}</span>
                <span>{formatDistanceToNow(order.timestamp)} ago</span>
              </div>
              <div className="text-sm text-gray-600">📍 {order.address}</div>
              <ul className="text-sm text-gray-700 list-disc pl-4">
                {order.products.map((p, i) => (
                  <li key={i}>
                    {p.quantity}× {p.name}
                  </li>
                ))}
              </ul>
              <div className="text-right font-semibold text-green-600">
                Total: ₹{order.total}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
                }
