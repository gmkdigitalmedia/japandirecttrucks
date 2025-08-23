import { useState, useEffect, useCallback } from 'react';
import { vehicleApi } from '@/lib/api';
import { Vehicle, SearchFilters, PaginatedResponse, SearchParams } from '@/types';
import { debounce } from '@/lib/utils';

interface UseVehicleSearchResult {
  vehicles: Vehicle[];
  loading: boolean;
  error: string | null;
  totalCount: number;
  currentPage: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  search: (params: SearchParams) => Promise<void>;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
}

export function useVehicleSearch(initialFilters: SearchFilters = {}): UseVehicleSearchResult {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 0,
    totalCount: 0,
    hasNext: false,
    hasPrev: false,
  });
  const [currentParams, setCurrentParams] = useState<SearchParams>({
    ...initialFilters,
    page: 1,
    limit: 20,
    // Don't set default sort values here - let them come from the component
  });
  const [isInitialized, setIsInitialized] = useState(false);

  const performSearch = useCallback(async (params: SearchParams, append = false) => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔍 performSearch called with params:', params);

      const result = await vehicleApi.search(params);
      
      if (append) {
        setVehicles(prev => [...prev, ...result.data]);
      } else {
        setVehicles(result.data);
      }

      setPagination({
        currentPage: result.page,
        totalPages: result.totalPages,
        totalCount: result.total,
        hasNext: result.hasNext,
        hasPrev: result.hasPrev,
      });

      setCurrentParams(params);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Search failed';
      setError(errorMessage);
      console.error('Vehicle search error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const debouncedSearch = useCallback(
    debounce((params: SearchParams) => {
      performSearch(params, false);
    }, 300),
    [performSearch]
  );

  const search = useCallback(async (params: SearchParams) => {
    // Mark as initialized when search is first called
    if (!isInitialized) {
      setIsInitialized(true);
    }

    // Ensure we use ALL the params passed in, not merge with old ones for sort
    const searchParams = {
      ...currentParams,
      ...params,
      // Explicitly pass through sort params if provided
      sortBy: params.sortBy || currentParams.sortBy || 'created_at',
      sortOrder: params.sortOrder || currentParams.sortOrder || 'DESC',
      page: params.page || 1,
    };

    console.log('🎯 search called with merged params:', searchParams);

    // Update currentParams immediately to persist sort and filter changes
    setCurrentParams(searchParams);

    // For text searches, use debounce
    if (params.query !== undefined && params.query !== currentParams.query) {
      debouncedSearch(searchParams);
    } else {
      // For sort changes and other filters, search immediately
      await performSearch(searchParams, false);
    }
  }, [currentParams, debouncedSearch, performSearch, isInitialized]);

  const loadMore = useCallback(async () => {
    if (!pagination.hasNext || loading) return;

    const nextParams = {
      ...currentParams,
      page: pagination.currentPage + 1,
    };

    await performSearch(nextParams, true);
  }, [currentParams, pagination.currentPage, pagination.hasNext, loading, performSearch]);

  const refresh = useCallback(async () => {
    await performSearch(currentParams, false);
  }, [currentParams, performSearch]);

  // Remove the automatic search on mount - let the component control initialization
  // This was causing conflicts with the component's own initialization
  useEffect(() => {
    // Only run if explicitly passed initial filters (not empty object)
    if (!isInitialized && Object.keys(initialFilters).length > 0) {
      console.log('🚀 useVehicleSearch initial search with filters:', initialFilters);
      search(initialFilters);
    }
  }, []); // Empty deps to run only once on mount

  return {
    vehicles,
    loading,
    error,
    totalCount: pagination.totalCount,
    currentPage: pagination.currentPage,
    totalPages: pagination.totalPages,
    hasNext: pagination.hasNext,
    hasPrev: pagination.hasPrev,
    search,
    loadMore,
    refresh,
  };
}