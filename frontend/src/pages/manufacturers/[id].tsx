import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '@/components/layout/Layout';
import { TruckIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

interface Model {
  id: number;
  name: string;
  body_type: string;
  vehicle_count: number;
}

export default function ManufacturerPage() {
  const router = useRouter();
  const { id } = router.query;
  const [models, setModels] = useState<Model[]>([]);
  const [manufacturerName, setManufacturerName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchModels();
    }
  }, [id]);

  const fetchModels = async () => {
    try {
      const response = await fetch(`/api/manufacturers/${id}/models`);
      const result = await response.json();
      
      if (result.success) {
        setModels(result.data);
        // Get manufacturer name from first model or fetch separately
        if (result.data.length > 0) {
          // For now, we'll derive it from the URL or fetch manufacturers list
          fetchManufacturerName();
        }
      } else {
        setError(result.error || 'Failed to load models');
      }
    } catch (err) {
      setError('Failed to load models');
    } finally {
      setLoading(false);
    }
  };

  const fetchManufacturerName = async () => {
    try {
      const response = await fetch('/api/manufacturers');
      const result = await response.json();
      
      if (result.success) {
        const manufacturer = result.data.find((m: any) => m.id === parseInt(id as string));
        if (manufacturer) {
          setManufacturerName(manufacturer.name);
        }
      }
    } catch (err) {
      console.error('Failed to fetch manufacturer name:', err);
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
          <Link
            href="/manufacturers"
            className="inline-flex items-center text-primary-600 hover:text-primary-800 mb-4"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Brands
          </Link>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {manufacturerName || 'Manufacturer'} Models
          </h1>
          <p className="text-gray-600">Browse vehicle models</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {models.map((model) => (
            <Link
              key={model.id}
              href={`/models/${model.id}`}
              className="block p-6 bg-white rounded-lg border border-gray-200 hover:border-primary-500 hover:shadow-lg transition-all duration-200"
            >
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <TruckIcon className="h-8 w-8 text-primary-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">
                    {model.name}
                  </h3>
                  <p className="text-sm text-gray-500 mb-2">
                    {model.body_type}
                  </p>
                  <p className="text-sm text-primary-600 font-medium">
                    {model.vehicle_count} vehicles available
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {models.length === 0 && (
          <div className="text-center py-12">
            <TruckIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No models found</h3>
            <p className="text-gray-500">No vehicle models available for this manufacturer.</p>
          </div>
        )}
      </div>
    </Layout>
  );
}