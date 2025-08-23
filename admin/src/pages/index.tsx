import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';

interface DashboardStats {
  totalVehicles: number;
  availableVehicles: number;
  featuredVehicles: number;
  totalInquiries: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/vehicles/stats');
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
          <div className="animate-pulse">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white p-6 rounded-lg border">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">GPS Trucks Japan - Admin Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Total Vehicles</h3>
            <p className="text-3xl font-bold text-gray-900">{stats?.totalVehicles || 0}</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Available Vehicles</h3>
            <p className="text-3xl font-bold text-green-600">{stats?.availableVehicles || 0}</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Featured Vehicles</h3>
            <p className="text-3xl font-bold text-blue-600">{stats?.featuredVehicles || 0}</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Total Inquiries</h3>
            <p className="text-3xl font-bold text-purple-600">{stats?.totalInquiries || 0}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <a
                href="/vehicles"
                className="flex items-center w-full text-left px-4 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <span className="mr-3 text-lg">📋</span>
                <span>Manage Vehicles</span>
              </a>
              <a
                href="/inquiries"
                className="flex items-center w-full text-left px-4 py-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
              >
                <span className="mr-3 text-lg">💬</span>
                <span>View Inquiries</span>
              </a>
              <a
                href="/scrapers"
                className="flex items-center w-full text-left px-4 py-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors"
              >
                <span className="mr-3 text-lg">🕷️</span>
                <span>Scraper Status</span>
              </a>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border">
            <h3 className="text-lg font-semibold mb-4">System Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Backend API</span>
                <span className="flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                  <span className="mr-1">✓</span>
                  <span>Online</span>
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Database</span>
                <span className="flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                  <span className="mr-1">✓</span>
                  <span>Connected</span>
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Image Proxy</span>
                <span className="flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                  <span className="mr-1">✓</span>
                  <span>Active</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}