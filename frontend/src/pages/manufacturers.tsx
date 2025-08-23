import { useState, useEffect } from 'react';
import Link from 'next/link';
import Layout from '@/components/layout/Layout';
import { TruckIcon } from '@heroicons/react/24/outline';

interface Manufacturer {
  id: number;
  name: string;
  country: string;
  vehicle_count: number;
}

export default function ManufacturersPage() {
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchManufacturers();
  }, []);

  const fetchManufacturers = async () => {
    try {
      const response = await fetch('/api/manufacturers');
      const result = await response.json();
      
      if (result.success) {
        setManufacturers(result.data);
      } else {
        setError(result.error || 'Failed to load manufacturers');
      }
    } catch (err) {
      setError('Failed to load manufacturers');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Error</h1>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Vehicle Brands</h1>
          <p className="text-gray-600">Browse vehicles by manufacturer</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {manufacturers.map((manufacturer) => (
            <Link
              key={manufacturer.id}
              href={`/manufacturers/${manufacturer.id}`}
              className="block p-6 bg-white rounded-lg border border-gray-200 hover:border-primary-500 hover:shadow-lg transition-all duration-200"
            >
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <TruckIcon className="h-8 w-8 text-primary-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">
                    {manufacturer.name}
                  </h3>
                  <p className="text-sm text-gray-500 mb-2">
                    {manufacturer.country}
                  </p>
                  <p className="text-sm text-primary-600 font-medium">
                    {manufacturer.vehicle_count} vehicles available
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {manufacturers.length === 0 && (
          <div className="text-center py-12">
            <TruckIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No manufacturers found</h3>
            <p className="text-gray-500">Check back later for vehicle listings.</p>
          </div>
        )}
      </div>
    </Layout>
  );
}