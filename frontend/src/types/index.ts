export interface Vehicle {
  id: number;
  source_id: string;
  source_url?: string;
  source_site: string;
  manufacturer_id?: number;
  model_id?: number;
  title_description: string;
  grade?: string;
  body_style?: string;
  price_vehicle_yen: number;
  price_total_yen: number;
  price_misc_expenses_yen?: number;
  monthly_payment_yen?: number;
  model_year_ad: number;
  model_year_era?: string;
  mileage_km: number;
  color?: string;
  transmission_details?: string;
  engine_displacement_cc?: number;
  fuel_type?: string;
  drive_type?: string;
  transmission_type?: string;
  drivetrain_type?: string;
  engine_displacement?: number;
  features?: string[];
  detail_specs?: Record<string, any>;
  has_repair_history: boolean;
  is_one_owner: boolean;
  has_warranty: boolean;
  is_accident_free: boolean;
  warranty_details?: string;
  maintenance_details?: string;
  shaken_status?: string;
  equipment_details?: string;
  dealer_name?: string;
  location_prefecture?: string;
  location_city?: string;
  dealer_phone?: string;
  is_available: boolean;
  is_featured: boolean;
  export_status: 'available' | 'reserved' | 'sold' | 'shipped';
  admin_notes?: string;
  created_at: string;
  updated_at: string;
  last_scraped_at?: string;
  manufacturer?: Manufacturer;
  model?: Model;
  images?: VehicleImage[];
  primary_image?: string;
  ai_analysis?: {
    value_headline: string;
    mileage_advantage: string;
    key_benefits: string[];
    market_comparison: string;
    confidence_score: number;
    usa_price_estimate: number;
    savings_amount: number;
    savings_percentage: number;
  };
}

export interface VehicleImage {
  id?: number;
  vehicle_id?: number;
  original_url?: string;
  local_path?: string;
  filename?: string;
  url: string;
  is_primary: boolean;
  alt_text?: string;
  file_size?: number;
  image_order?: number;
  created_at?: string;
}

export interface Manufacturer {
  id: number;
  name: string;
  logo_path?: string;
  country?: string;
  is_active: boolean;
  created_at: string;
  vehicle_count?: number;
}

export interface Model {
  id: number;
  manufacturer_id: number;
  name: string;
  body_type?: string;
  is_popular: boolean;
  created_at: string;
  manufacturer?: Manufacturer;
  vehicle_count?: number;
}

export interface Inquiry {
  id: number;
  vehicle_id?: number;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  customer_country?: string;
  message?: string;
  inquiry_type: 'general' | 'quote' | 'inspection';
  status: 'new' | 'contacted' | 'quoted' | 'closed';
  admin_response?: string;
  created_at: string;
  responded_at?: string;
  vehicle?: Vehicle;
}

export interface SearchFilters {
  query?: string;
  manufacturer?: string;
  model?: string;
  minPrice?: number;
  maxPrice?: number;
  minYear?: number;
  maxYear?: number;
  maxMileage?: number;
  driveType?: string;
  fuelType?: string;
  hasWarranty?: boolean;
  isOnlyAvailable?: boolean;
  isFeaturedOnly?: boolean;
  prefecture?: string;
}

export interface SearchParams extends SearchFilters {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  details?: string;
}

export interface ExchangeRate {
  rate: number;
  lastUpdated: string;
}

export interface ShippingCalculation {
  destination: string;
  method: 'roro' | 'container';
  estimatedCost: number;
  estimatedDays: number;
  additionalFees: Array<{
    name: string;
    amount: number;
  }>;
  totalCost: number;
}

export interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

export interface VehicleCardProps {
  vehicle: Vehicle;
  onInquiry?: (vehicleId: number) => void;
  showExportBadge?: boolean;
  className?: string;
}

export interface SearchContextType {
  filters: SearchFilters;
  setFilters: (filters: SearchFilters) => void;
  results: PaginatedResponse<Vehicle> | null;
  loading: boolean;
  search: (params?: SearchParams) => Promise<void>;
  clearFilters: () => void;
}

export interface CurrencyContextType {
  exchangeRate: number;
  formatYen: (amount: number) => string;
  formatUSD: (amount: number) => string;
  convertYenToUSD: (amount: number) => number;
}