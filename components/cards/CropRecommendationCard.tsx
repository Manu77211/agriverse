'use client';

import { motion } from 'framer-motion';
import { TrendingUp, Droplet, Sprout, IndianRupee, Sparkles, Award } from 'lucide-react';
import { CropRecommendation } from '@/utils/types';

/**
 * CropRecommendationCard Component - Modern Animated Version
 * - Displays individual crop recommendation with detailed stats
 * - Beautiful hover effects and animated progress bars
 * - Shows: Rank badge, crop name, profit, yield, market price
 */

interface CropRecommendationCardProps {
  crop: CropRecommendation;
  rank: number;
}

export default function CropRecommendationCard({ crop, rank }: CropRecommendationCardProps) {
  // Medal colors and icons for top 3 ranks
  const rankConfig = {
    1: { 
      bg: 'from-yellow-400 to-amber-500', 
      text: 'text-white',
      icon: '🥇',
      glow: 'from-yellow-500 to-amber-500'
    },
    2: { 
      bg: 'from-gray-300 to-gray-400', 
      text: 'text-white',
      icon: '🥈',
      glow: 'from-gray-400 to-gray-500'
    },
    3: { 
      bg: 'from-amber-500 to-orange-600', 
      text: 'text-white',
      icon: '🥉',
      glow: 'from-amber-500 to-orange-500'
    },
  };

  const config = rankConfig[rank as keyof typeof rankConfig] || { 
    bg: 'from-green-500 to-emerald-500', 
    text: 'text-white',
    icon: '🌱',
    glow: 'from-green-500 to-emerald-500'
  };

  // Water requirement config
  const waterConfig = {
    Low: { color: 'text-blue-400', bg: 'bg-blue-50', drops: 1 },
    Medium: { color: 'text-blue-500', bg: 'bg-blue-100', drops: 2 },
    High: { color: 'text-blue-600', bg: 'bg-blue-200', drops: 3 },
  };

  const water = waterConfig[crop.waterRequirement] || waterConfig.Medium;

  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ duration: 0.3 }}
      className="relative group"
    >
      {/* Background glow on hover */}
      <div className={`absolute -inset-1 bg-gradient-to-r ${config.glow} rounded-2xl blur-lg opacity-0 group-hover:opacity-30 transition-opacity duration-300`} />
      
      <div className="relative bg-white rounded-2xl shadow-lg p-6 border border-gray-100 overflow-hidden">
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-500 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-emerald-500 rounded-full translate-y-1/2 -translate-x-1/2" />
        </div>

        {/* Rank Badge */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", duration: 0.8 }}
          className={`absolute top-4 right-4 w-14 h-14 rounded-xl bg-gradient-to-br ${config.bg} flex items-center justify-center shadow-lg`}
        >
          <span className="text-2xl">{config.icon}</span>
        </motion.div>

        {/* Crop Name */}
        <div className="mb-6 pr-20">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
              <Sprout className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">{crop.cropName}</h3>
              <p className="text-sm text-gray-500">{crop.growthDuration} days cycle</p>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          {/* Expected Profit */}
          <motion.div
            whileHover={{ scale: 1.03 }}
            className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100"
          >
            <div className="flex items-center gap-2 text-green-600 mb-2">
              <TrendingUp className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wide">Profit/Acre</span>
            </div>
            <p className="text-xl font-bold text-green-700 flex items-center">
              <IndianRupee className="w-4 h-4" />
              {crop.expectedProfitPerAcre.toLocaleString('en-IN')}
            </p>
          </motion.div>

          {/* Yield */}
          <motion.div
            whileHover={{ scale: 1.03 }}
            className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-100"
          >
            <div className="flex items-center gap-2 text-amber-600 mb-2">
              <Sprout className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wide">Yield/Acre</span>
            </div>
            <p className="text-xl font-bold text-amber-700">
              {crop.expectedYieldPerAcre} <span className="text-sm font-normal">qtl</span>
            </p>
          </motion.div>
        </div>

        {/* Market Price Tag */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl mb-5">
          <span className="text-sm text-gray-600">Market Price</span>
          <span className="text-lg font-bold text-gray-900 flex items-center">
            <IndianRupee className="w-4 h-4" />
            {crop.marketPricePerKg}<span className="text-sm font-normal text-gray-500">/kg</span>
          </span>
        </div>

        {/* Suitability Progress Bars */}
        <div className="space-y-4 mb-5">
          <ProgressBar 
            label="Soil Suitability" 
            value={crop.soilSuitability} 
            color="from-amber-500 to-orange-500"
            bgColor="bg-amber-100"
          />
          <ProgressBar 
            label="Climate Match" 
            value={crop.climateSuitability} 
            color="from-blue-500 to-cyan-500"
            bgColor="bg-blue-100"
          />
          <ProgressBar 
            label="Market Demand" 
            value={crop.marketDemand} 
            color="from-purple-500 to-pink-500"
            bgColor="bg-purple-100"
          />
        </div>

        {/* Water Requirement */}
        <div className={`flex items-center gap-3 p-3 ${water.bg} rounded-xl mb-5`}>
          <div className="flex gap-1">
            {[...Array(3)].map((_, i) => (
              <Droplet
                key={i}
                className={`w-4 h-4 transition-all ${i < water.drops ? water.color : 'text-gray-300'}`}
                fill={i < water.drops ? 'currentColor' : 'none'}
              />
            ))}
          </div>
          <span className="text-sm text-gray-700">
            Water: <strong>{crop.waterRequirement}</strong>
          </span>
        </div>

        {/* AI Reasoning */}
        <div className="border-t border-gray-100 pt-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-white" />
            </div>
            <h4 className="text-sm font-bold text-gray-900">AI Insight</h4>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">
            {crop.reasoning}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

// Animated Progress Bar Component
function ProgressBar({ 
  label, 
  value, 
  color, 
  bgColor 
}: { 
  label: string; 
  value: number; 
  color: string; 
  bgColor: string;
}) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-1.5">
        <span className="text-gray-600">{label}</span>
        <span className="font-bold text-gray-900">{value}%</span>
      </div>
      <div className={`w-full ${bgColor} rounded-full h-2.5 overflow-hidden`}>
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${value}%` }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={`h-full bg-gradient-to-r ${color} rounded-full`}
        />
      </div>
    </div>
  );
}
