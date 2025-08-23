import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number, currency: 'JPY' | 'USD' = 'JPY'): string {
  if (currency === 'JPY') {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
      minimumFractionDigits: 0,
    }).format(amount);
  } else {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  }
}

export function formatPriceCompact(amount: number, currency: 'JPY' | 'USD' = 'JPY'): string {
  if (currency === 'JPY') {
    if (amount >= 10000000) {
      return `¥${(amount / 10000000).toFixed(1)}cr`;
    } else if (amount >= 10000) {
      return `¥${(amount / 10000).toFixed(0)}万`;
    } else {
      return `¥${amount.toLocaleString()}`;
    }
  } else {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}K`;
    } else {
      return `$${amount.toLocaleString()}`;
    }
  }
}

export function convertYenToUSD(yen: number, exchangeRate: number = 0.00680): number {
  return Math.round(yen * exchangeRate);
}

export function formatMileage(km: number): string {
  // Handle the case where km might be stored as a decimal (e.g., 11.4 for 11.4万km = 114,000km)
  const actualKm = km < 1000 ? km * 10000 : km;
  
  if (actualKm >= 10000) {
    return `${(actualKm / 10000).toFixed(1)}万km`;
  }
  return `${actualKm.toLocaleString()}km`;
}

export function kmToMiles(km: number): number {
  // Convert km to miles - km should already be the correct value from database
  return Math.round(km * 0.621371);
}

export function formatMileageWithMiles(km: number): string {
  // km from database should already be correct (e.g., 114000 for 11.4万km)
  const miles = kmToMiles(km);
  return `${km.toLocaleString()}km (${miles.toLocaleString()}mi)`;
}

export function formatYear(year: number): string {
  return year.toString();
}

export function getVehicleImageUrl(path: string, size: 'thumb' | 'medium' | 'full' = 'full'): string {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';
  
  if (size === 'full') {
    return `${baseUrl}${path}`;
  }
  
  const extension = path.split('.').pop();
  const pathWithoutExtension = path.replace(`.${extension}`, '');
  return `${baseUrl}${pathWithoutExtension}_${size}.jpg`;
}

export function getPlaceholderImage(width: number = 800, height: number = 600): string {
  return `https://via.placeholder.com/${width}x${height}/f3f4f6/9ca3af?text=No+Image`;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function generateVehicleSlug(vehicle: { title_description: string; id: number }): string {
  const titleSlug = slugify(vehicle.title_description);
  return `${titleSlug}-${vehicle.id}`;
}

export function parseVehicleSlug(slug: string): { id: number } | null {
  const parts = slug.split('-');
  const id = parseInt(parts[parts.length - 1]);
  return isNaN(id) ? null : { id };
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

export function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function getVehicleBadges(vehicle: any): Array<{ text: string; variant: 'success' | 'warning' | 'info' | 'accent' }> {
  const badges: Array<{ text: string; variant: 'success' | 'warning' | 'info' | 'accent' }> = [];
  
  if (vehicle.is_featured) {
    badges.push({ text: 'Featured', variant: 'accent' as const });
  }
  
  if (vehicle.has_warranty) {
    badges.push({ text: 'Warranty', variant: 'success' as const });
  }
  
  if (vehicle.is_one_owner) {
    badges.push({ text: '1 Owner', variant: 'info' as const });
  }
  
  // Only show "No Accidents" if explicitly verified (not just default false)
  if (vehicle.accident_history_verified === true && !vehicle.has_repair_history) {
    badges.push({ text: 'No Accidents', variant: 'success' as const });
  }
  
  if (vehicle.drive_type?.includes('4WD')) {
    badges.push({ text: '4WD', variant: 'info' as const });
  }
  
  return badges;
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

export function getCountryFlag(countryCode: string): string {
  const flags: Record<string, string> = {
    US: '🇺🇸',
    CA: '🇨🇦',
    AU: '🇦🇺',
    NZ: '🇳🇿',
    GB: '🇬🇧',
    DE: '🇩🇪',
    FR: '🇫🇷',
    IT: '🇮🇹',
  };
  return flags[countryCode] || '🌍';
}

export function generateWhatsAppURL(phone: string, message: string): string {
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${phone}?text=${encodedMessage}`;
}

export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('81')) {
    const number = cleaned.slice(2);
    return `+81 ${number.slice(0, 2)} ${number.slice(2, 6)} ${number.slice(6)}`;
  }
  return phone;
}

export function getVehicleConditionText(vehicle: any): string {
  const conditions: string[] = [];
  
  if (!vehicle.has_repair_history) {
    conditions.push('No accident history');
  }
  
  if (vehicle.is_one_owner) {
    conditions.push('Single owner');
  }
  
  if (vehicle.has_warranty) {
    conditions.push('Warranty included');
  }
  
  return conditions.join(' • ') || 'Good condition';
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^[\d\s\-\+\(\)]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
}

// Competitive advantage functions
export function getUSAveragePrice(modelName: string, year: number): number {
  // Rough estimates based on US market data
  const basePrice = getBasePriceByModel(modelName);
  const yearFactor = Math.max(0.3, 1 - (2024 - year) * 0.1); // Depreciation
  return Math.round(basePrice * yearFactor);
}

export function getBasePriceByModel(modelName: string): number {
  const modelPrices: Record<string, number> = {
    'Land Cruiser 200': 64852,
    'Land Cruiser 300': 95000,
    'Land Cruiser 70': 75000,
    'Hijet': 25000,
    'Hilux': 45000,
    'Prado': 65000,
  };
  
  // Find matching model
  const matchedModel = Object.keys(modelPrices).find(model => 
    modelName.toLowerCase().includes(model.toLowerCase())
  );
  
  return matchedModel ? modelPrices[matchedModel] : 50000; // Default
}

export function getUSAverageMileage(year: number): number {
  const currentYear = new Date().getFullYear();
  const age = currentYear - year;
  return Math.round(age * 12000 * 1.60934); // 12k miles/year converted to km
}

export function getMileageComparison(vehicleKm: number, year: number): {
  status: 'excellent' | 'good' | 'average' | 'high';
  text: string;
  percentage: number;
} {
  // vehicleKm should already be correct from database (e.g., 114000 not 11.4)
  const usAverage = getUSAverageMileage(year);
  const percentage = Math.round(((vehicleKm - usAverage) / usAverage) * 100);
  
  if (percentage < -40) {
    return { status: 'excellent', text: 'Excellent - Very Low Mileage', percentage };
  } else if (percentage < -15) {
    return { status: 'good', text: 'Good - Below Average Mileage', percentage };
  } else if (percentage < 20) {
    return { status: 'average', text: 'Average Mileage', percentage };
  } else {
    return { status: 'high', text: 'High Mileage', percentage };
  }
}

export function getPriceComparison(vehiclePriceUSD: number, modelName: string, year: number): {
  status: 'excellent' | 'good' | 'average' | 'expensive';
  text: string;
  savings: number;
  percentage: number;
} {
  const usPrice = getUSAveragePrice(modelName, year);
  const savings = usPrice - vehiclePriceUSD;
  const percentage = Math.round((savings / usPrice) * 100);
  
  if (percentage > 40) {
    return { status: 'excellent', text: 'Excellent Deal - Major Savings', savings, percentage };
  } else if (percentage > 20) {
    return { status: 'good', text: 'Good Value - Significant Savings', savings, percentage };
  } else if (percentage > 0) {
    return { status: 'average', text: 'Fair Price - Some Savings', savings, percentage };
  } else {
    return { status: 'expensive', text: 'Premium Price', savings, percentage };
  }
}

export function cleanJapaneseFromTitle(title: string): string {
  // Remove common Japanese text patterns
  return title
    .replace(/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/g, '') // Remove Japanese characters
    .replace(/\s+/g, ' ') // Clean up extra spaces
    .trim()
    .replace(/^[^\w]+|[^\w]+$/g, '') // Remove leading/trailing non-word chars
    || 'Japanese Import Vehicle'; // Fallback if title becomes empty
}