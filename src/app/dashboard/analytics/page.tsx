
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext'; // Adjust path
import { getAnalyticsData } from '../../../lib/firestore'; // Adjust path
import DashboardLayout from '../../../components/layout/DashboardLayout'; // Adjust path

const AnalyticsPage = () => {
  const { user } = useAuth();
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const fetchData = async () => {
        const data = await getAnalyticsData(user.uid);
        setAnalyticsData(data);
        setLoading(false);
      };

      fetchData();
    }
  }, [user]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8">
        <h1 className="text-2xl font-bold mb-6">Analytics Dashboard</h1>
        {analyticsData ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-700">Total Revenue</h3>
              <p className="text-3xl font-bold">₹{analyticsData.totalRevenue.toFixed(2)}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-700">Total Orders</h3>
              <p className="text-3xl font-bold">{analyticsData.totalOrders}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-700">Top Selling Products</h3>
              <ul>
                {analyticsData.topProducts.map((product: any) => (
                  <li key={product.name} className="flex justify-between py-1">
                    <span>{product.name}</span>
                    <span>{product.count}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <p>No analytics data available yet.</p>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AnalyticsPage;
