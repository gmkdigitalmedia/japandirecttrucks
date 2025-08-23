import React from 'react';
import { ChartBarIcon, SparklesIcon, ClockIcon } from '@heroicons/react/24/outline';
import { 
  getMileageComparison, 
  getPriceComparison, 
  convertYenToUSD, 
  formatMileageWithMiles,
  cleanJapaneseFromTitle 
} from '@/lib/utils';

interface CompetitiveAdvantageProps {
  vehicle: {
    title_description: string;
    model_name: string;
    price_total_yen: number;
    mileage_km: number;
    model_year_ad: number;
  };
}

export default function CompetitiveAdvantage({ vehicle }: CompetitiveAdvantageProps) {
  const cleanTitle = cleanJapaneseFromTitle(vehicle.title_description);
  const vehiclePriceUSD = convertYenToUSD(vehicle.price_total_yen);
  const mileageComparison = getMileageComparison(vehicle.mileage_km, vehicle.model_year_ad);
  const priceComparison = getPriceComparison(vehiclePriceUSD, vehicle.model_name, vehicle.model_year_ad);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600 bg-green-50 border-green-200';
      case 'good': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'average': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-red-600 bg-red-50 border-red-200';
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
      <div className="flex items-center gap-2 mb-3">
        <SparklesIcon className="h-5 w-5 text-primary-600" />
        <h3 className="font-semibold text-gray-900">Competitive Advantage</h3>
      </div>

      {/* Price Comparison */}
      <div className={`rounded-lg p-3 border ${getStatusColor(priceComparison.status)}`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <ChartBarIcon className="h-4 w-4" />
            <span className="font-medium">Price vs USA Market</span>
          </div>
          <span className="text-sm font-bold">
            {priceComparison.percentage > 0 ? `${priceComparison.percentage}% SAVINGS` : 'PREMIUM'}
          </span>
        </div>
        <div className="text-sm">
          <div className="flex justify-between">
            <span>Japan Price:</span>
            <span className="font-medium">${vehiclePriceUSD.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span>USA Avg:</span>
            <span className="font-medium">${(vehiclePriceUSD + priceComparison.savings).toLocaleString()}</span>
          </div>
          {priceComparison.savings > 0 && (
            <div className="flex justify-between font-bold text-green-600 border-t pt-1 mt-1">
              <span>You Save:</span>
              <span>${priceComparison.savings.toLocaleString()}</span>
            </div>
          )}
        </div>
      </div>

      {/* Mileage Comparison */}
      <div className={`rounded-lg p-3 border ${getStatusColor(mileageComparison.status)}`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <ClockIcon className="h-4 w-4" />
            <span className="font-medium">Mileage vs USA Average</span>
          </div>
          <span className="text-sm font-bold">
            {Math.abs(mileageComparison.percentage)}% {mileageComparison.percentage < 0 ? 'BELOW' : 'ABOVE'}
          </span>
        </div>
        <div className="text-sm">
          <div className="flex justify-between">
            <span>This Vehicle:</span>
            <span className="font-medium">{formatMileageWithMiles(vehicle.mileage_km)}</span>
          </div>
          <div className="flex justify-between">
            <span>USA Average ({vehicle.model_year_ad}):</span>
            <span className="font-medium">{formatMileageWithMiles(vehicle.mileage_km + (vehicle.mileage_km * mileageComparison.percentage / 100))}</span>
          </div>
          <div className="text-xs mt-1 opacity-75">
            *Based on 12,000 miles/year USA average
          </div>
        </div>
      </div>

      {/* Why This Matters */}
      <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-600">
        <div className="font-medium mb-1">🏆 Japanese Import Advantages:</div>
        <ul className="space-y-1 list-disc list-inside">
          <li>Superior maintenance standards & records</li>
          <li>Road-approved vehicles (not auction risks)</li>
          <li>Physical inspection before purchase</li>
          <li>Warranty coverage & legal recourse</li>
        </ul>
      </div>
    </div>
  );
}