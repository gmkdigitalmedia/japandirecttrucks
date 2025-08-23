import { Vehicle } from '@/types';
import VehicleCard from './VehicleCard';
import Button from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { useInfiniteScroll as useInfiniteScrollHook } from '@/hooks/useInfiniteScroll';

interface VehicleGridProps {
  vehicles: Vehicle[];
  loading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  onInquiry?: (vehicleId: number) => void;
  className?: string;
  competitiveAdvantage?: boolean;
  showFavoriteButton?: boolean;
  onFavoriteToggle?: (vehicleId: number) => void;
  favoriteVehicleIds?: Set<number>;
  useInfiniteScroll?: boolean;
}

export default function VehicleGrid({
  vehicles,
  loading = false,
  hasMore = false,
  onLoadMore,
  onInquiry,
  className,
  competitiveAdvantage = false,
  showFavoriteButton = false,
  onFavoriteToggle,
  favoriteVehicleIds = new Set(),
  useInfiniteScroll = true,
}: VehicleGridProps) {
  const { lastElementRef } = useInfiniteScrollHook({
    hasMore,
    loading,
    onLoadMore: onLoadMore || (() => {}),
  });


  if (vehicles.length === 0 && !loading) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto">
          <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
            <svg
              className="h-16 w-16 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2v0a2 2 0 01-2-2v-2a2 2 0 00-2-2H8z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No vehicles found
          </h3>
          <p className="text-gray-600 mb-6">
            Try adjusting your search criteria or browse all available vehicles.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-8', className)}>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {vehicles.map((vehicle, index) => {
          const isLastElement = index === vehicles.length - 1;
          return (
            <div
              key={vehicle.id}
              ref={useInfiniteScroll && isLastElement ? lastElementRef : undefined}
            >
              <VehicleCard
                vehicle={vehicle}
                onInquiry={onInquiry}
                showCompetitiveAdvantage={competitiveAdvantage}
                showFavoriteButton={showFavoriteButton}
                onFavoriteToggle={onFavoriteToggle}
                isFavorited={favoriteVehicleIds.has(vehicle.id)}
              />
            </div>
          );
        })}
      </div>

      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="card animate-pulse">
              <div className="aspect-w-16 aspect-h-12 bg-gray-200 rounded-t-lg" />
              <div className="p-4 space-y-3">
                <div className="h-5 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
                <div className="grid grid-cols-3 gap-3">
                  <div className="h-4 bg-gray-200 rounded" />
                  <div className="h-4 bg-gray-200 rounded" />
                  <div className="h-4 bg-gray-200 rounded" />
                </div>
                <div className="h-6 bg-gray-200 rounded w-2/3" />
                <div className="flex space-x-2">
                  <div className="h-8 bg-gray-200 rounded flex-1" />
                  <div className="h-8 bg-gray-200 rounded flex-1" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {hasMore && !loading && !useInfiniteScroll && (
        <div className="text-center">
          <Button
            variant="outline"
            size="lg"
            onClick={onLoadMore}
            className="px-8"
          >
            Load More Vehicles
          </Button>
        </div>
      )}
      
      {/* Infinite scroll loading indicator */}
      {hasMore && loading && useInfiniteScroll && (
        <div className="text-center py-4">
          <div className="inline-flex items-center space-x-2 text-gray-600">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-600 border-t-transparent"></div>
            <span className="text-sm">Loading more vehicles...</span>
          </div>
        </div>
      )}
    </div>
  );
}