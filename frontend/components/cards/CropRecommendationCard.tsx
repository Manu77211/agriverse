'use client';

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Droplet, Sprout, IndianRupee, Sparkles, Award, ArrowRight, Leaf, Zap } from 'lucide-react';
import { CropRecommendation } from '@/utils/types';

/**
 * CropRecommendationCard Component - Enhanced Animated Version
 * - Displays crop recommendations with backend data
 * - Maps: crop_name, confidence, recommended_variety, variety_traits, expected_price, profitability_score
 * - Features: Gradient badges, color-coded profit levels, trait pills, smooth animations
 * - Fully responsive with mobile support
 */

interface CropRecommendationCardProps {
  crop: CropRecommendation;
  rank: number;
}

export default function CropRecommendationCard({ crop, rank }: CropRecommendationCardProps) {
  // Extract crop name and variety from backend response
  const extractCropDetails = () => {
    // Backend returns: "crop_name (variety)" format
    const nameMatch = crop.cropName?.match(/^(.+?)\s*\((.+?)\)$/);
    if (nameMatch) {
      return { name: nameMatch[1].trim(), variety: nameMatch[2].trim() };
    }
    return { 
      name: crop.cropName || 'Unknown Crop',
      variety: crop.recommended_variety || 'Standard Variety'
    };
  };

  const { name: cropName, variety: extractedVariety } = extractCropDetails();
  const displayVariety = crop.recommended_variety || extractedVariety;

  // Color-code profit level based on profitability_score
  const getProfitColor = () => {
    const profit = crop.expectedProfitPerAcre || 0;
    if (profit >= 50000) return { bg: 'from-green-50 to-emerald-50', border: 'border-green-200', text: 'text-green-700', badge: 'from-green-500 to-emerald-500' };
    if (profit >= 30000) return { bg: 'from-amber-50 to-yellow-50', border: 'border-amber-200', text: 'text-amber-700', badge: 'from-amber-500 to-yellow-500' };
    return { bg: 'from-gray-50 to-slate-50', border: 'border-gray-200', text: 'text-gray-700', badge: 'from-gray-500 to-slate-500' };
  };

  const profitColor = getProfitColor();

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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: rank * 0.1, duration: 0.5, hover: { duration: 0.3 } }}
      className="relative group h-full"
    >
      {/* Background glow on hover */}
      <div className={`absolute -inset-1 bg-gradient-to-r ${config.glow} rounded-2xl blur-lg opacity-0 group-hover:opacity-30 transition-opacity duration-300`} />
      
      <div className="relative bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden h-full flex flex-col">
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-500 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-emerald-500 rounded-full translate-y-1/2 -translate-x-1/2" />
        </div>

        <div className="relative p-4 sm:p-6 flex flex-col h-full">
          {/* Header with Rank Badge */}
          <div className="flex justify-between items-start mb-4">
            {/* Rank Badge */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", duration: 0.8 }}
              className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br ${config.bg} flex items-center justify-center shadow-lg flex-shrink-0`}
            >
              <span className="text-lg sm:text-2xl">{config.icon}</span>
            </motion.div>
          </div>

          {/* Crop Header Section */}
          <div className="mb-5">
            <h3 className="text-lg sm:text-2xl font-bold text-gray-900 mb-1">{cropName}</h3>
            <p className="text-xs sm:text-sm text-gray-500">Growth: {crop.growthDuration || 120} days</p>
          </div>

          {/* Variety Badge */}
          {displayVariety && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
              className="mb-4 inline-flex items-center gap-2 bg-gradient-to-r from-indigo-50 to-blue-50 px-3 py-2 rounded-lg border border-indigo-200 w-fit"
            >
              <Sprout className="w-4 h-4 text-indigo-600" />
              <span className="text-xs font-semibold text-indigo-700">{displayVariety}</span>
            </motion.div>
          )}

          {/* Variety Traits Pills */}
          {crop.variety_traits && crop.variety_traits.length > 0 && (
            <div className="mb-5">
              <p className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">Key Traits</p>
              <div className="flex flex-wrap gap-2">
                {crop.variety_traits.map((trait, idx) => (
                  <motion.span
                    key={idx}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 + idx * 0.05 }}
                    className="px-2.5 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700 border border-emerald-200"
                  >
                    {trait}
                  </motion.span>
                ))}
              </div>
            </div>
          )}

          {/* Key Metrics - Profit and Yield */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            {/* Expected Profit */}
            <motion.div
              whileHover={{ scale: 1.03 }}
              className={`bg-gradient-to-br ${profitColor.bg} rounded-lg p-3 sm:p-4 border ${profitColor.border}`}
            >
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className={`w-4 h-4 ${profitColor.text}`} />
                <span className="text-xs font-semibold uppercase tracking-wide text-gray-600">Profit/Acre</span>
              </div>
              <p className={`text-lg sm:text-xl font-bold ${profitColor.text} flex items-center`}>
                <IndianRupee className="w-4 h-4" />
                {(crop.expectedProfitPerAcre ?? crop.profitability_score ?? 0).toLocaleString('en-IN')}
              </p>
            </motion.div>

            {/* Expected Price */}
            <motion.div
              whileHover={{ scale: 1.03 }}
              className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-3 sm:p-4 border border-purple-100"
            >
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-purple-600" />
                <span className="text-xs font-semibold uppercase tracking-wide text-gray-600">Market Price</span>
              </div>
              <p className="text-lg sm:text-xl font-bold text-purple-700 flex items-center">
                <IndianRupee className="w-4 h-4" />
                {(crop.expected_price || 0).toLocaleString('en-IN')}
              </p>
              <p className="text-xs text-gray-500 mt-1">/quintal</p>
            </motion.div>
          </div>

          {/* Yield Display */}
          {crop.expectedYieldPerAcre && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 }}
              className="bg-amber-50 rounded-lg p-3 sm:p-4 border border-amber-100 mb-5"
            >
              <div className="flex items-center gap-2 mb-2">
                <Leaf className="w-4 h-4 text-amber-600" />
                <span className="text-xs font-semibold uppercase tracking-wide text-gray-600">Expected Yield</span>
              </div>
              <p className="text-lg sm:text-xl font-bold text-amber-700">
                {crop.expectedYieldPerAcre.toLocaleString('en-IN')} <span className="text-sm font-normal text-amber-600">quintals/acre</span>
              </p>
            </motion.div>
          )}

          {/* Suitability Progress Bars */}
          <div className="space-y-3 mb-5 flex-1">
            <ProgressBar 
              label="Soil Suitability" 
              value={crop.soilSuitability || 75} 
              color="from-amber-500 to-orange-500"
              bgColor="bg-amber-100"
            />
            <ProgressBar 
              label="Climate Match" 
              value={crop.climateSuitability || 80} 
              color="from-blue-500 to-cyan-500"
              bgColor="bg-blue-100"
            />
            <ProgressBar 
              label="Market Demand" 
              value={crop.marketDemand || 70} 
              color="from-purple-500 to-pink-500"
              bgColor="bg-purple-100"
            />
          </div>

          {/* Water Requirement */}
          {crop.waterRequirement && (
            <div className={`flex items-center gap-3 p-3 ${water.bg} rounded-lg mb-5`}>
              <div className="flex gap-1">
                {[...Array(3)].map((_, i) => (
                  <Droplet
                    key={i}
                    className={`w-4 h-4 transition-all ${i < water.drops ? water.color : 'text-gray-300'}`}
                    fill={i < water.drops ? 'currentColor' : 'none'}
                  />
                ))}
              </div>
              <span className="text-xs sm:text-sm text-gray-700">
                Water: <strong>{crop.waterRequirement}</strong>
              </span>
            </div>
          )}

          {/* AI Reasoning */}
          <div className="border-t border-gray-100 pt-4 mt-auto">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Sparkles className="w-3 h-3 text-white" />
              </div>
              <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wide">Why This Crop</h4>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed line-clamp-3">
              {crop.reasoning || 'Excellent match for your farm conditions based on soil, climate, and market analysis.'}
            </p>
          </div>
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
