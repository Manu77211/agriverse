'use client';

import { TrendingUp, TrendingDown, Droplet, Calendar, Sprout, IndianRupee } from 'lucide-react';
import { CropRecommendation } from '@/utils/types';

/**
 * CropRecommendationCard Component
 * - Displays individual crop recommendation with detailed stats
 * - Shows: Rank badge, crop name, profit, yield, market price
 * - Visual indicators for soil/climate suitability scores
 * - Water requirement icon
 * - AI reasoning explanation
 */

interface CropRecommendationCardProps {
  crop: CropRecommendation;
  rank: number;
}

export default function CropRecommendationCard({ crop, rank }: CropRecommendationCardProps) {
  // Medal colors for top 3 ranks
  const rankColors = {
    1: 'bg-yellow-500 text-white', // Gold
    2: 'bg-gray-400 text-white',   // Silver
    3: 'bg-amber-600 text-white',  // Bronze
  };

  const rankColor = rankColors[rank as keyof typeof rankColors] || 'bg-primary-500 text-white';

  // Water requirement colors
  const waterColors = {
    Low: 'text-blue-400',
    Medium: 'text-blue-500',
    High: 'text-blue-600',
  };

  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow p-6 border-2 border-gray-100 relative overflow-hidden">
      {/* Rank Badge */}
      <div className={`absolute top-0 right-0 ${rankColor} px-4 py-2 rounded-bl-xl font-bold text-lg`}>
        #{rank}
      </div>

      {/* Crop Name */}
      <div className="mb-4 pr-16">
        <h3 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
          <Sprout className="w-6 h-6 text-primary-600" />
          <span>{crop.cropName}</span>
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          {crop.growthDuration} days growth cycle
        </p>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Expected Profit */}
        <div className="bg-primary-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 text-primary-700 mb-1">
            <TrendingUp className="w-4 h-4" />
            <span className="text-xs font-medium uppercase">Profit/Acre</span>
          </div>
          <p className="text-2xl font-bold text-primary-900 flex items-center">
            <IndianRupee className="w-5 h-5" />
            {crop.expectedProfitPerAcre.toLocaleString('en-IN')}
          </p>
        </div>

        {/* Yield */}
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 text-green-700 mb-1">
            <Sprout className="w-4 h-4" />
            <span className="text-xs font-medium uppercase">Yield/Acre</span>
          </div>
          <p className="text-2xl font-bold text-green-900">
            {crop.expectedYieldPerAcre} qtl
          </p>
        </div>
      </div>

      {/* Market Price */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Market Price</span>
          <span className="text-lg font-bold text-gray-900 flex items-center">
            <IndianRupee className="w-4 h-4" />
            {crop.marketPricePerKg}/kg
          </span>
        </div>
      </div>

      {/* Suitability Scores */}
      <div className="space-y-3 mb-4">
        {/* Soil Suitability */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">Soil Suitability</span>
            <span className="font-medium text-gray-900">{crop.soilSuitability}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-earth-500 h-2 rounded-full transition-all"
              style={{ width: `${crop.soilSuitability}%` }}
            ></div>
          </div>
        </div>

        {/* Climate Suitability */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">Climate Suitability</span>
            <span className="font-medium text-gray-900">{crop.climateSuitability}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-sky-500 h-2 rounded-full transition-all"
              style={{ width: `${crop.climateSuitability}%` }}
            ></div>
          </div>
        </div>

        {/* Market Demand */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">Market Demand</span>
            <span className="font-medium text-gray-900">{crop.marketDemand}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary-500 h-2 rounded-full transition-all"
              style={{ width: `${crop.marketDemand}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Water Requirement */}
      <div className="flex items-center space-x-2 mb-4 text-sm">
        <Droplet className={`w-5 h-5 ${waterColors[crop.waterRequirement]}`} />
        <span className="text-gray-600">
          Water Requirement: <strong className="text-gray-900">{crop.waterRequirement}</strong>
        </span>
      </div>

      {/* AI Reasoning */}
      <div className="border-t border-gray-200 pt-4">
        <h4 className="text-sm font-semibold text-gray-900 mb-2">
          🤖 AI Recommendation
        </h4>
        <p className="text-sm text-gray-700 leading-relaxed">
          {crop.reasoning}
        </p>
      </div>
    </div>
  );
}
