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
  created_at: Date;
  updated_at: Date;
  last_scraped_at?: Date;
  manufacturer?: Manufacturer;
  model?: Model;
  images?: VehicleImage[];
}

export interface VehicleImage {
  id: number;
  vehicle_id: number;
  original_url?: string;
  local_path: string;
  filename: string;
  is_primary: boolean;
  alt_text?: string;
  file_size?: number;
  image_order: number;
  created_at: Date;
}

export interface Manufacturer {
  id: number;
  name: string;
  logo_path?: string;
  country?: string;
  is_active: boolean;
  created_at: Date;
}

export interface Model {
  id: number;
  manufacturer_id: number;
  name: string;
  body_type?: string;
  is_popular: boolean;
  created_at: Date;
  manufacturer?: Manufacturer;
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
  created_at: Date;
  responded_at?: Date;
  vehicle?: Vehicle;
}

export interface AdminUser {
  id: number;
  username: string;
  email: string;
  password_hash: string;
  full_name?: string;
  role: 'admin' | 'moderator' | 'viewer';
  is_active: boolean;
  last_login?: Date;
  created_at: Date;
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

export interface PaginationOptions {
  page: number;
  limit: number;
}

export interface SortOptions {
  field: string;
  order: 'ASC' | 'DESC';
}

export interface SearchResult<T> {
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
}

export interface DashboardStats {
  totalVehicles: number;
  availableVehicles: number;
  featuredVehicles: number;
  totalInquiries: number;
  newInquiries: number;
  recentActivity: Array<{
    type: 'vehicle_added' | 'inquiry_received' | 'vehicle_sold';
    message: string;
    timestamp: Date;
  }>;
  popularManufacturers: Array<{
    name: string;
    count: number;
  }>;
  priceDistribution: Array<{
    range: string;
    count: number;
  }>;
}

export interface ScraperRun {
  id: number;
  scraper_name: string;
  status: 'running' | 'completed' | 'failed';
  started_at: Date;
  completed_at?: Date;
  vehicles_processed: number;
  vehicles_added: number;
  vehicles_updated: number;
  error_message?: string;
  log_details?: any;
}