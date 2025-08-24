import React from 'react';
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon, MinusIcon } from '@heroicons/react/24/outline';

interface AIAnalysisCardProps {
  analysis: {
    value_headline: string;
    mileage_advantage: string;
    key_benefits: string[];
    market_comparison: string;
    confidence_score: number;
    usa_price_estimate: number;
    savings_amount: number;
    savings_percentage: number;
  };
  vehiclePrice: number;
  vehicleMileage: number;
  vehicleYear: number;
  usaPrice?: number;
  savings?: number;
  savingsPercent?: number;
}

export default function AIAnalysisCard({ analysis, vehiclePrice, vehicleMileage, vehicleYear, usaPrice, savings, savingsPercent }: AIAnalysisCardProps) {
  // Calculate average mileage for comparison
  const currentYear = new Date().getFullYear();
  const vehicleAge = currentYear - vehicleYear;
  const avgMileagePerYear = 19312; // 12k miles = 19,312 km
  const expectedMileage = vehicleAge * avgMileagePerYear;
  const mileageDifference = vehicleMileage - expectedMileage;
  const mileagePercentage = Math.round((mileageDifference / expectedMileage) * 100);

  // Color coding for savings
  const getSavingsColor = (percentage: number) => {
    if (percentage > 30) return 'text-green-600 bg-green-50';
    if (percentage > 15) return 'text-blue-600 bg-blue-50';
    if (percentage > 0) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getMileageColor = (percentage: number) => {
    if (percentage < -30) return 'text-green-600';
    if (percentage < -10) return 'text-blue-600';
    if (percentage < 20) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Progress bar component
  const ProgressBar = ({ value, maxValue, color, label }: { value: number; maxValue: number; color: string; label: string }) => {
    const percentage = Math.min((Math.abs(value) / maxValue) * 100, 100);
    
    return (
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">{label}</span>
          <span className={`text-sm font-bold ${color}`}>
            {value > 0 ? '+' : ''}{value}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${
              color.includes('green') ? 'bg-green-500' :
              color.includes('blue') ? 'bg-blue-500' :
              color.includes('yellow') ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  };

  // Gauge component for confidence
  const ConfidenceGauge = ({ score }: { score: number }) => {
    const angle = (score / 10) * 180 - 90; // Convert 0-10 to -90 to +90 degrees
    
    return (
      <div className="relative w-20 h-10 mx-auto">
        <svg viewBox="0 0 100 50" className="w-full h-full">
          {/* Background arc */}
          <path
            d="M 10 40 A 30 30 0 0 1 90 40"
            stroke="#e5e7eb"
            strokeWidth="8"
            fill="none"
          />
          {/* Progress arc */}
          <path
            d="M 10 40 A 30 30 0 0 1 90 40"
            stroke={score >= 8 ? '#10b981' : score >= 6 ? '#3b82f6' : score >= 4 ? '#f59e0b' : '#ef4444'}
            strokeWidth="8"
            fill="none"
            strokeDasharray={`${(score / 10) * 125.66} 125.66`}
            className="transition-all duration-500"
          />
          {/* Needle */}
          <line
            x1="50"
            y1="40"
            x2="50"
            y2="15"
            stroke="#374151"
            strokeWidth="2"
            transform={`rotate(${angle} 50 40)`}
            className="transition-transform duration-500"
          />
          <circle cx="50" cy="40" r="3" fill="#374151" />
        </svg>
        <div className="text-center mt-1">
          <span className="text-xs font-bold text-gray-600">{score}/10</span>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900">Market Analysis</h3>
        <ConfidenceGauge score={analysis.confidence_score} />
      </div>

      {/* Price Comparison Chart */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Price Comparison</h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Japan Price</span>
            <span className="font-bold text-blue-600">${vehiclePrice.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">USA Average</span>
            <span className="font-bold text-gray-700">${(usaPrice || analysis.usa_price_estimate).toLocaleString()}</span>
          </div>
          <div className="border-t pt-2">
            <div className={`flex items-center justify-between p-2 rounded-lg ${getSavingsColor(savingsPercent || analysis.savings_percentage)}`}>
              <span className="text-sm font-medium">Your Savings</span>
              <div className="text-right">
                <div className="font-bold">${(savings || analysis.savings_amount).toLocaleString()}</div>
                <div className="text-xs">{(savingsPercent || analysis.savings_percentage)}% less</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mileage Comparison Bar */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Mileage Analysis</h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">This Vehicle</span>
            <span className="font-bold text-blue-600">{vehicleMileage.toLocaleString()} km</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Expected ({vehicleYear})</span>
            <span className="font-bold text-gray-700">{expectedMileage.toLocaleString()} km</span>
          </div>
          <ProgressBar 
            value={mileagePercentage}
            maxValue={100}
            color={getMileageColor(mileagePercentage)}
            label="vs Average"
          />
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-center mb-1">
            {analysis.savings_amount > 0 ? (
              <ArrowTrendingDownIcon className="h-5 w-5 text-green-600" />
            ) : (
              <MinusIcon className="h-5 w-5 text-gray-400" />
            )}
          </div>
          <div className="text-xs text-gray-600">Price</div>
          <div className={`text-sm font-bold ${analysis.savings_amount > 0 ? 'text-green-600' : 'text-gray-600'}`}>
            {analysis.savings_amount > 0 ? 'EXCELLENT' : 'FAIR'}
          </div>
        </div>
        
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-center mb-1">
            {mileagePercentage < -20 ? (
              <ArrowTrendingDownIcon className="h-5 w-5 text-green-600" />
            ) : mileagePercentage < 10 ? (
              <MinusIcon className="h-5 w-5 text-blue-600" />
            ) : (
              <ArrowTrendingUpIcon className="h-5 w-5 text-yellow-600" />
            )}
          </div>
          <div className="text-xs text-gray-600">Mileage</div>
          <div className={`text-sm font-bold ${getMileageColor(mileagePercentage)}`}>
            {mileagePercentage < -20 ? 'EXCELLENT' : mileagePercentage < 10 ? 'GOOD' : 'HIGH'}
          </div>
        </div>
      </div>

      {/* Benefits */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="text-xs text-gray-500">
          Based on USA market data • Japanese maintenance standards
        </div>
      </div>
    </div>
  );
}