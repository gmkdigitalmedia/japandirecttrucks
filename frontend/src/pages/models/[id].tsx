import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '@/components/layout/Layout';
import VehicleCard from '@/components/vehicles/VehicleCard';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { Vehicle } from '@/types';

export default function ModelPage() {
  const router = useRouter();
  const { id } = router.query;
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [modelInfo, setModelInfo] = useState<{name: string; manufacturer: string} | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalVehicles, setTotalVehicles] = useState(0);

  useEffect(() => {
    if (id) {
      fetchVehicles(1, true);
    }
  }, [id]);

  // Infinite scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop !== document.documentElement.offsetHeight ||
        loadingMore ||
        !hasMore
      ) {
        return;
      }
      loadMoreVehicles();
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadingMore, hasMore]);

  const fetchVehicles = async (pageNum: number, reset = false) => {
    if (reset) {
      setLoading(true);
      setError(null);
    } else {
      setLoadingMore(true);
    }

    try {
      const response = await fetch(`/api/models/${id}/vehicles?page=${pageNum}&limit=12`);
      const result = await response.json();
      
      if (result.success) {
        const newVehicles = result.data;
        const pagination = result.pagination;
        
        if (reset) {
          setVehicles(newVehicles);
          setTotalVehicles(pagination?.totalCount || newVehicles.length);
        } else {
          setVehicles(prev => [...prev, ...newVehicles]);
        }

        // Set model info from first vehicle if available
        if (newVehicles.length > 0 && !modelInfo) {
          const firstVehicle = newVehicles[0];
          setModelInfo({
            name: firstVehicle.model?.name || 'Unknown Model',
            manufacturer: firstVehicle.manufacturer?.name || 'Unknown Brand'
          });
        }

        // Use pagination info from backend if available, fallback to old logic
        if (pagination) {
          setHasMore(pagination.hasMore);
        } else {
          // Fallback: if we got fewer than requested, we're at the end
          setHasMore(newVehicles.length === 12);
        }
      } else {
        setError(result.error || 'Failed to load vehicles');
      }
    } catch (err) {
      setError('Failed to load vehicles');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMoreVehicles = useCallback(() => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchVehicles(nextPage, false);
  }, [page, id]);

  if (loading) {
    return (
      <Layout
        title="Loading Vehicle Models - Japan Direct Trucks"
        description="Loading vehicle models and specifications from Japan Direct Trucks inventory."
      >
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-96 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout
        title="Error - Vehicle Models | Japan Direct Trucks"
        description="Error loading vehicle model information. Contact Japan Direct Trucks for assistance."
      >
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
    <Layout
      title={modelInfo ? `${modelInfo.manufacturer} ${modelInfo.name} Export from Japan | Japan Direct Trucks` : 'Vehicle Models - Japan Direct Trucks'}
      description={modelInfo ? `Export ${modelInfo.manufacturer} ${modelInfo.name} vehicles from Japan. ${totalVehicles} available units with professional export service worldwide.` : 'Browse vehicle models available for export from Japan with professional service.'}
      keywords={modelInfo ? `${modelInfo.manufacturer.toLowerCase()} ${modelInfo.name.toLowerCase()} export japan, ${modelInfo.name.toLowerCase()} japan export, ${modelInfo.manufacturer.toLowerCase()} japan export, japanese ${modelInfo.name.toLowerCase()}` : 'vehicle models japan, japanese car models, export models japan'}
      url={`https://japandirecttrucks.com/models/${id}`}
    >
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
            {modelInfo ? `${modelInfo.manufacturer} ${modelInfo.name}` : 'Vehicle Model'}
          </h1>
          <p className="text-gray-600">
            {totalVehicles} vehicles available
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {vehicles.map((vehicle) => (
            <VehicleCard
              key={vehicle.id}
              vehicle={vehicle}
              showExportBadge={false}
            />
          ))}
        </div>

        {/* Loading more indicator */}
        {loadingMore && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <span className="ml-3 text-gray-600">Loading more vehicles...</span>
          </div>
        )}

        {/* No more vehicles message */}
        {!hasMore && vehicles.length > 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>You've seen all available {modelInfo?.manufacturer} {modelInfo?.name} vehicles</p>
          </div>
        )}

        {vehicles.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🚗</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No vehicles found</h3>
            <p className="text-gray-500">No vehicles available for this model.</p>
          </div>
        )}
      </div>
    </Layout>
  );
}