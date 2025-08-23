import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { FunnelIcon, Squares2X2Icon, ListBulletIcon } from '@heroicons/react/24/outline';
import Layout from '@/components/layout/Layout';
import DefaultSEO from '@/components/seo/DefaultSEO';
import DynamicVehicleSEO from '@/components/seo/DynamicVehicleSEO';
import SearchFilters from '@/components/vehicles/SearchFilters';
import VehicleGrid from '@/components/vehicles/VehicleGrid';
import Button from '@/components/ui/Button';
import { useVehicleSearch } from '@/hooks/useVehicleSearch';
import { useFavorites } from '@/hooks/useFavorites';
import { SearchFilters as SearchFiltersType } from '@/types';
import { cn } from '@/lib/utils';

const sortOptions = [
  { value: 'created_at:DESC', label: 'Newest First' },
  { value: 'price_total_yen:ASC', label: 'Price: Low to High' },
  { value: 'price_total_yen:DESC', label: 'Price: High to Low' },
  { value: 'model_year_ad:DESC', label: 'Year: Newest' },
  { value: 'model_year_ad:ASC', label: 'Year: Oldest' },
  { value: 'mileage_km:ASC', label: 'Mileage: Low to High' },
];

export default function VehiclesPage() {
  const router = useRouter();
  const [filters, setFilters] = useState<SearchFiltersType>({});
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [currentSort, setCurrentSort] = useState('created_at:DESC');

  const {
    vehicles,
    loading,
    error,
    totalCount,
    currentPage,
    hasNext,
    search,
    loadMore,
  } = useVehicleSearch();

  const { favoriteIds, toggleFavorite } = useFavorites();

  // Initialize filters and sort from URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const initialFilters: SearchFiltersType = {};

    // Extract filters from URL
    if (urlParams.get('q')) initialFilters.query = urlParams.get('q')!;
    if (urlParams.get('manufacturer')) initialFilters.manufacturer = urlParams.get('manufacturer')!;
    if (urlParams.get('model')) initialFilters.model = urlParams.get('model')!;
    if (urlParams.get('minPrice')) initialFilters.minPrice = parseInt(urlParams.get('minPrice')!);
    if (urlParams.get('maxPrice')) initialFilters.maxPrice = parseInt(urlParams.get('maxPrice')!);
    if (urlParams.get('minYear')) initialFilters.minYear = parseInt(urlParams.get('minYear')!);
    if (urlParams.get('maxYear')) initialFilters.maxYear = parseInt(urlParams.get('maxYear')!);
    if (urlParams.get('maxMileage')) initialFilters.maxMileage = parseInt(urlParams.get('maxMileage')!);
    if (urlParams.get('driveType')) initialFilters.driveType = urlParams.get('driveType')!;
    if (urlParams.get('fuelType')) initialFilters.fuelType = urlParams.get('fuelType')!;
    if (urlParams.get('prefecture')) initialFilters.prefecture = urlParams.get('prefecture')!;
    if (urlParams.get('hasWarranty') === 'true') initialFilters.hasWarranty = true;
    if (urlParams.get('featured') === 'true') initialFilters.isFeaturedOnly = true;

    // Extract sort from URL
    const sortFromUrl = urlParams.get('sort') || 'created_at:DESC';
    setCurrentSort(sortFromUrl);

    setFilters(initialFilters);

    // Perform initial search with sort
    const [sortBy, sortOrder] = sortFromUrl.split(':');
    search({
      ...initialFilters,
      page: 1,
      limit: 20,
      sortBy,
      sortOrder: sortOrder as 'ASC' | 'DESC',
    });
  }, []);

  const handleSearch = async (newFilters?: SearchFiltersType, sortValue?: string) => {
    const searchFilters = newFilters || filters;
    
    // Update filters state if new filters provided
    if (newFilters) {
      setFilters(newFilters);
    }
    
    // Use provided sort or current sort
    const sortToUse = sortValue || currentSort;
    const [sortBy, sortOrder] = sortToUse.split(':');

    await search({
      ...searchFilters,
      page: 1,
      limit: 20,
      sortBy,
      sortOrder: sortOrder as 'ASC' | 'DESC',
    });

    // Update URL
    updateURL(searchFilters, sortToUse);
  };

  const updateURL = (searchFilters: SearchFiltersType, sortValue?: string) => {
    const params = new URLSearchParams();
    
    Object.entries(searchFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== '' && value !== false) {
        params.set(key, value.toString());
      }
    });

    // Add sort to URL if not default
    if (sortValue && sortValue !== 'created_at:DESC') {
      params.set('sort', sortValue);
    }

    const newURL = params.toString() 
      ? `/vehicles?${params.toString()}`
      : '/vehicles';
    
    router.replace(newURL, undefined, { shallow: true });
  };

  const handleFiltersChange = (newFilters: SearchFiltersType) => {
    setFilters(newFilters);
  };

  const handleSortChange = (sortValue: string) => {
    setCurrentSort(sortValue);
    handleSearch(filters, sortValue);
  };

  const handleInquiry = (vehicleId: number) => {
    router.push(`/vehicles/${vehicleId}#inquiry`);
  };

  return (
    <>
      <DefaultSEO 
        title="Cheapest JDM Cars for Export - All Vehicles | Japan Direct Trucks"
        description="Browse 1000+ vehicles for export from Japan. Cheapest prices with only 10% markup. Land Cruisers, Hilux, JDM cars direct to USA, Australia, UK, Kenya, Dubai. Save thousands vs US market."
        keywords="cheapest jdm cars export, all vehicles japan export, cheapest land cruiser export, cheapest hilux export, japan to usa car export, japan to australia export, japan to uk export, japan to kenya export, japan to dubai export, lowest price japanese cars, 10% markup vehicles"
        url="https://japandirecttrucks.com/vehicles"
      />
      <DynamicVehicleSEO 
        vehicles={vehicles}
        primaryCountry="global"
        pageUrl="/vehicles"
      />
      <Layout>
      <div className="bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="bg-white border-b">
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold font-display">
                  Best Deals on JDM Japanese Vehicles for Export
                </h1>
                <p className="text-gray-600 mt-1">
                  {totalCount > 0 ? (
                    <>Showing {totalCount} vehicles - Direct export to USA, Australia, UK, Kenya, Dubai</>
                  ) : (
                    'Lowest prices on JDM vehicles - Save thousands vs US market prices'
                  )}
                </p>
              </div>

              <div className="flex items-center space-x-4">
                {/* Sort */}
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium text-gray-700">Sort:</label>
                  <select
                    value={currentSort}
                    onChange={(e) => handleSortChange(e.target.value)}
                    className="select text-sm"
                  >
                    {sortOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* View Mode */}
                <div className="hidden sm:flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={cn(
                      'p-2 rounded-md transition-colors',
                      viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                    )}
                  >
                    <Squares2X2Icon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={cn(
                      'p-2 rounded-md transition-colors',
                      viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                    )}
                  >
                    <ListBulletIcon className="h-4 w-4" />
                  </button>
                </div>

                {/* Mobile Filter Toggle */}
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden"
                >
                  <FunnelIcon className="h-4 w-4 mr-2" />
                  Filters
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8">
          <div className="lg:grid lg:grid-cols-4 lg:gap-8">
            {/* Filters Sidebar */}
            <div className={cn(
              'lg:col-span-1 mb-8 lg:mb-0',
              showFilters ? 'block' : 'hidden lg:block'
            )}>
              <SearchFilters
                filters={filters}
                onFiltersChange={handleFiltersChange}
                onSearch={(newFilters) => handleSearch(newFilters, currentSort)}
                loading={loading}
                resultCount={totalCount}
              />
            </div>

            {/* Vehicle Grid */}
            <div className="lg:col-span-3">
              {error ? (
                <div className="text-center py-12">
                  <div className="text-red-600 mb-4">
                    <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Something went wrong
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {error}
                  </p>
                  <Button
                    variant="primary"
                    onClick={() => handleSearch()}
                  >
                    Try Again
                  </Button>
                </div>
              ) : (
                <VehicleGrid
                  vehicles={vehicles}
                  loading={loading}
                  hasMore={hasNext}
                  onLoadMore={loadMore}
                  onInquiry={handleInquiry}
                  competitiveAdvantage={true}
                  showFavoriteButton={true}
                  onFavoriteToggle={toggleFavorite}
                  favoriteVehicleIds={favoriteIds}
                  useInfiniteScroll={true}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
    </>
  );
}