import { useState, useEffect, useCallback } from 'react';
import { utilityApi } from '@/lib/api';
import { formatPrice, convertYenToUSD } from '@/lib/utils';

interface UseCurrencyResult {
  exchangeRate: number;
  loading: boolean;
  lastUpdated: Date | null;
  formatYen: (amount: number) => string;
  formatUSD: (amount: number) => string;
  convertYenToUSD: (amount: number) => number;
  refreshRate: () => Promise<void>;
}

const STORAGE_KEY = 'gps_trucks_exchange_rate';
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

interface StoredRate {
  rate: number;
  timestamp: number;
}

export function useCurrency(): UseCurrencyResult {
  const [exchangeRate, setExchangeRate] = useState(0.00680); // Default fallback rate (147 yen per dollar)
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadStoredRate = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data: StoredRate = JSON.parse(stored);
        const now = Date.now();
        
        if (now - data.timestamp < CACHE_DURATION) {
          setExchangeRate(data.rate);
          setLastUpdated(new Date(data.timestamp));
          return true;
        }
      }
    } catch (error) {
      console.warn('Failed to load stored exchange rate:', error);
    }
    return false;
  }, []);

  const storeRate = useCallback((rate: number) => {
    try {
      const data: StoredRate = {
        rate,
        timestamp: Date.now(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to store exchange rate:', error);
    }
  }, []);

  const fetchExchangeRate = useCallback(async () => {
    try {
      setLoading(true);
      const { rate } = await utilityApi.getExchangeRate();
      
      setExchangeRate(rate);
      setLastUpdated(new Date());
      storeRate(rate);
    } catch (error) {
      console.error('Failed to fetch exchange rate:', error);
    } finally {
      setLoading(false);
    }
  }, [storeRate]);

  const refreshRate = useCallback(async () => {
    await fetchExchangeRate();
  }, [fetchExchangeRate]);

  const formatYen = useCallback((amount: number) => {
    return formatPrice(amount, 'JPY');
  }, []);

  const formatUSD = useCallback((amount: number) => {
    return formatPrice(amount, 'USD');
  }, []);

  const convertYenToUSDValue = useCallback((amount: number) => {
    return convertYenToUSD(amount, exchangeRate);
  }, [exchangeRate]);

  useEffect(() => {
    const hasStoredRate = loadStoredRate();
    if (!hasStoredRate) {
      fetchExchangeRate();
    }
  }, [loadStoredRate, fetchExchangeRate]);

  return {
    exchangeRate,
    loading,
    lastUpdated,
    formatYen,
    formatUSD,
    convertYenToUSD: convertYenToUSDValue,
    refreshRate,
  };
}