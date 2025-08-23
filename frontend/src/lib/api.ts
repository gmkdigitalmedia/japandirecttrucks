import axios from 'axios';
import { ApiResponse, SearchParams, Vehicle, PaginatedResponse, Inquiry, Manufacturer, Model } from '@/types';

// Use relative URLs to go through Next.js API proxy
const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const vehicleApi = {
  search: async (params: SearchParams): Promise<PaginatedResponse<Vehicle>> => {
    const { data } = await api.post<ApiResponse<PaginatedResponse<Vehicle>>>('/vehicles/search', params);
    if (!data.success) throw new Error(data.error || 'Search failed');
    return data.data!;
  },

  getById: async (id: number): Promise<Vehicle> => {
    const { data } = await api.get<ApiResponse<Vehicle>>(`/vehicles/${id}`);
    if (!data.success) throw new Error(data.error || 'Vehicle not found');
    return data.data!;
  },

  getFeatured: async (limit: number = 8): Promise<Vehicle[]> => {
    const { data } = await api.get<ApiResponse<Vehicle[]>>(`/vehicles/featured?limit=${limit}`);
    if (!data.success) throw new Error(data.error || 'Failed to get featured vehicles');
    return data.data!;
  },

  getSimilar: async (id: number, limit: number = 6): Promise<Vehicle[]> => {
    const { data } = await api.get<ApiResponse<Vehicle[]>>(`/vehicles/${id}/similar?limit=${limit}`);
    if (!data.success) throw new Error(data.error || 'Failed to get similar vehicles');
    return data.data!;
  },

  getStats: async () => {
    const { data } = await api.get<ApiResponse>('/vehicles/stats');
    if (!data.success) throw new Error(data.error || 'Failed to get stats');
    return data.data!;
  },
};

export const inquiryApi = {
  create: async (inquiry: Partial<Inquiry>): Promise<Inquiry> => {
    const { data } = await api.post<ApiResponse<Inquiry>>('/inquiries', inquiry);
    if (!data.success) throw new Error(data.error || 'Failed to submit inquiry');
    return data.data!;
  },
};

export const dataApi = {
  getManufacturers: async (): Promise<Manufacturer[]> => {
    const { data } = await api.get<ApiResponse<Manufacturer[]>>('/manufacturers');
    if (!data.success) throw new Error(data.error || 'Failed to get manufacturers');
    return data.data!;
  },

  getModels: async (manufacturerId?: number): Promise<Model[]> => {
    if (!manufacturerId) return [];
    const { data } = await api.get<ApiResponse<Model[]>>(`/manufacturers/${manufacturerId}/models`);
    if (!data.success) throw new Error(data.error || 'Failed to get models');
    return data.data!;
  },
};

export const utilityApi = {
  getExchangeRate: async (): Promise<{ rate: number }> => {
    try {
      const response = await fetch('https://api.exchangerate-api.com/v4/latest/JPY');
      const data = await response.json();
      return { rate: data.rates.USD };
    } catch (error) {
      console.warn('Failed to fetch exchange rate, using default');
      return { rate: 0.0067 }; // Fallback rate
    }
  },

  calculateShipping: async (vehiclePrice: number, destination: string, method: 'roro' | 'container') => {
    const baseCosts = {
      roro: { base: 1200, perYen: 0.0001 },
      container: { base: 2500, perYen: 0.0002 },
    };

    const destinationMultipliers: Record<string, number> = {
      'US': 1.0,
      'Canada': 1.1,
      'Australia': 1.3,
      'New Zealand': 1.4,
      'UK': 1.2,
      'Germany': 1.25,
      'Other': 1.5,
    };

    const config = baseCosts[method];
    const multiplier = destinationMultipliers[destination] || destinationMultipliers['Other'];
    
    const shippingCost = (config.base + (vehiclePrice * config.perYen)) * multiplier;
    const inspectionFee = 150;
    const documentationFee = 200;
    const totalCost = shippingCost + inspectionFee + documentationFee;
    
    const estimatedDays = method === 'roro' ? 30 : 21;

    return {
      destination,
      method,
      estimatedCost: Math.round(shippingCost),
      estimatedDays,
      additionalFees: [
        { name: 'Pre-shipment Inspection', amount: inspectionFee },
        { name: 'Documentation & Export', amount: documentationFee },
      ],
      totalCost: Math.round(totalCost),
    };
  },
};

export default api;