import { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { AdjustmentsHorizontalIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { SearchFilters as SearchFiltersType, Manufacturer, Model } from '@/types';
import { dataApi } from '@/lib/api';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { cn } from '@/lib/utils';

interface SearchFiltersProps {
  filters: SearchFiltersType;
  onFiltersChange: (filters: SearchFiltersType) => void;
  onSearch: (filters?: SearchFiltersType) => void;
  loading?: boolean;
  resultCount?: number;
  className?: string;
}

const driveTypes = [
  { value: '4WD', label: '4WD' },
  { value: '2WD', label: '2WD' },
  { value: 'AWD', label: 'AWD' },
];

const fuelTypes = [
  { value: 'Gasoline', label: 'Gasoline' },
  { value: 'Diesel', label: 'Diesel' },
  { value: 'Hybrid', label: 'Hybrid' },
  { value: 'Electric', label: 'Electric' },
];

const prefectures = [
  'Tokyo', 'Osaka', 'Kyoto', 'Aichi', 'Kanagawa', 'Saitama', 'Chiba',
  'Hyogo', 'Hokkaido', 'Fukuoka', 'Shizuoka', 'Hiroshima', 'Sendai'
];

export default function SearchFilters({
  filters,
  onFiltersChange,
  onSearch,
  loading = false,
  resultCount,
  className,
}: SearchFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState<SearchFiltersType>(filters);

  const { data: manufacturers } = useQuery(
    'manufacturers',
    () => dataApi.getManufacturers(),
    {
      staleTime: 30 * 60 * 1000, // 30 minutes
    }
  );

  const { data: models } = useQuery(
    ['models', localFilters.manufacturer],
    () => {
      const manufacturer = manufacturers?.find(m => m.name === localFilters.manufacturer);
      return manufacturer ? dataApi.getModels(manufacturer.id) : Promise.resolve([]);
    },
    {
      enabled: !!localFilters.manufacturer && !!manufacturers,
      staleTime: 30 * 60 * 1000,
    }
  );

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleFilterChange = (key: keyof SearchFiltersType, value: any) => {
    const newFilters = { ...localFilters, [key]: value };
    
    // Reset model when manufacturer changes
    if (key === 'manufacturer') {
      newFilters.model = undefined;
    }
    
    setLocalFilters(newFilters);
  };

  const handleApplyFilters = () => {
    onSearch(localFilters);
    setIsOpen(false);
  };

  const handleClearFilters = () => {
    const clearedFilters: SearchFiltersType = {};
    setLocalFilters(clearedFilters);
    onSearch(clearedFilters);
  };

  const getActiveFilterCount = () => {
    return Object.values(localFilters).filter(value => 
      value !== undefined && value !== '' && value !== false
    ).length;
  };

  const activeCount = getActiveFilterCount();

  return (
    <div className={cn('space-y-4', className)}>
      {/* Mobile Filter Toggle */}
      <div className="lg:hidden">
        <Button
          variant="outline"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full justify-between"
        >
          <div className="flex items-center space-x-2">
            <AdjustmentsHorizontalIcon className="h-5 w-5" />
            <span>Filters</span>
            {activeCount > 0 && (
              <span className="bg-primary-600 text-white px-2 py-0.5 rounded-full text-xs">
                {activeCount}
              </span>
            )}
          </div>
          <XMarkIcon className={cn('h-5 w-5 transition-transform', isOpen ? 'rotate-0' : 'rotate-45')} />
        </Button>
      </div>

      {/* Filter Panel */}
      <div className={cn(
        'bg-white rounded-lg border shadow-sm',
        'lg:block',
        isOpen ? 'block' : 'hidden'
      )}>
        <div className="p-6 space-y-6">
          {/* Search Query */}
          <div>
            <Input
              label="Search"
              placeholder="Land Cruiser, Hilux, etc..."
              value={localFilters.query || ''}
              onChange={(e) => handleFilterChange('query', e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleApplyFilters();
                }
              }}
            />
          </div>

          {/* Manufacturer */}
          <div>
            <label className="label">Manufacturer</label>
            <select
              className="select"
              value={localFilters.manufacturer || ''}
              onChange={(e) => handleFilterChange('manufacturer', e.target.value || undefined)}
            >
              <option value="">All Manufacturers</option>
              {manufacturers?.map((manufacturer) => (
                <option key={manufacturer.id} value={manufacturer.name}>
                  {manufacturer.name} ({manufacturer.vehicle_count || 0})
                </option>
              ))}
            </select>
          </div>

          {/* Model */}
          <div>
            <label className="label">Model</label>
            <select
              className="select"
              value={localFilters.model || ''}
              onChange={(e) => handleFilterChange('model', e.target.value || undefined)}
              disabled={!localFilters.manufacturer}
            >
              <option value="">All Models</option>
              {models?.map((model) => (
                <option key={model.id} value={model.name}>
                  {model.name} ({model.vehicle_count || 0})
                </option>
              ))}
            </select>
          </div>

          {/* Price Range */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Min Price (¥)"
              type="number"
              placeholder="1,000,000"
              value={localFilters.minPrice || ''}
              onChange={(e) => handleFilterChange('minPrice', e.target.value ? parseInt(e.target.value) : undefined)}
            />
            <Input
              label="Max Price (¥)"
              type="number"
              placeholder="10,000,000"
              value={localFilters.maxPrice || ''}
              onChange={(e) => handleFilterChange('maxPrice', e.target.value ? parseInt(e.target.value) : undefined)}
            />
          </div>

          {/* Year Range */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Min Year"
              type="number"
              placeholder="2010"
              value={localFilters.minYear || ''}
              onChange={(e) => handleFilterChange('minYear', e.target.value ? parseInt(e.target.value) : undefined)}
            />
            <Input
              label="Max Year"
              type="number"
              placeholder="2024"
              value={localFilters.maxYear || ''}
              onChange={(e) => handleFilterChange('maxYear', e.target.value ? parseInt(e.target.value) : undefined)}
            />
          </div>

          {/* Max Mileage */}
          <div>
            <Input
              label="Max Mileage (km)"
              type="number"
              placeholder="100,000"
              value={localFilters.maxMileage || ''}
              onChange={(e) => handleFilterChange('maxMileage', e.target.value ? parseInt(e.target.value) : undefined)}
            />
          </div>

          {/* Drive Type */}
          <div>
            <label className="label">Drive Type</label>
            <select
              className="select"
              value={localFilters.driveType || ''}
              onChange={(e) => handleFilterChange('driveType', e.target.value || undefined)}
            >
              <option value="">Any Drive Type</option>
              {driveTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Fuel Type */}
          <div>
            <label className="label">Fuel Type</label>
            <select
              className="select"
              value={localFilters.fuelType || ''}
              onChange={(e) => handleFilterChange('fuelType', e.target.value || undefined)}
            >
              <option value="">Any Fuel Type</option>
              {fuelTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Prefecture */}
          <div>
            <label className="label">Prefecture</label>
            <select
              className="select"
              value={localFilters.prefecture || ''}
              onChange={(e) => handleFilterChange('prefecture', e.target.value || undefined)}
            >
              <option value="">Any Prefecture</option>
              {prefectures.map((prefecture) => (
                <option key={prefecture} value={prefecture}>
                  {prefecture}
                </option>
              ))}
            </select>
          </div>

          {/* Checkboxes */}
          <div className="space-y-3">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={localFilters.hasWarranty || false}
                onChange={(e) => handleFilterChange('hasWarranty', e.target.checked || undefined)}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700">Has Warranty</span>
            </label>
            
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={localFilters.isOnlyAvailable || false}
                onChange={(e) => handleFilterChange('isOnlyAvailable', e.target.checked || undefined)}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700">Available Only</span>
            </label>
            
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={localFilters.isFeaturedOnly || false}
                onChange={(e) => handleFilterChange('isFeaturedOnly', e.target.checked || undefined)}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700">Featured Only</span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4 border-t">
            <Button
              variant="primary"
              onClick={handleApplyFilters}
              loading={loading}
              className="flex-1"
            >
              Apply Filters
              {resultCount !== undefined && (
                <span className="ml-2">({resultCount})</span>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={handleClearFilters}
              disabled={activeCount === 0}
            >
              Clear
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}