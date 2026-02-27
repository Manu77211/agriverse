'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from '@/components/layout/Layout';
import AnalyzerForm from '@/components/forms/AnalyzerForm';
import CropRecommendationCard from '@/components/cards/CropRecommendationCard';
import { AnalysisResult } from '@/utils/types';
import { GlassCard } from '@/components/ui/GlassCard';
import { GradientText, AnimatedHeading, AnimatedParagraph } from '@/components/ui/GradientText';
import { FloatingParticles } from '@/components/effects/FloatingParticles';
import { 
  CloudRain, Leaf, ThermometerSun, Droplets, 
  TestTube, Layers, BarChart3, Sparkles, TrendingUp, Calendar, Map
} from 'lucide-react';

/**
 * Dashboard Page - Modern Animated Version
 */

export default function DashboardPage() {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  const handleAnalysisComplete = (result: AnalysisResult) => {
    setAnalysisResult(result);
    setTimeout(() => {
      document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative pt-28 pb-12 overflow-hidden bg-gradient-to-br from-green-50 via-white to-emerald-50">
        <FloatingParticles />
        
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 right-10 w-64 h-64 bg-green-300/20 rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-10 w-80 h-80 bg-emerald-300/20 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 border border-green-200 mb-6"
            >
              <Sparkles className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-700">AI-Powered Analysis</span>
            </motion.div>

            <AnimatedHeading className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Crop Analysis{' '}
              <GradientText>Dashboard</GradientText>
            </AnimatedHeading>

            <AnimatedParagraph delay={0.2} className="text-lg text-gray-600 max-w-2xl mx-auto">
              Enter your farm details to receive AI-powered crop recommendations
              based on real-time weather, soil fertility, and market trends.
            </AnimatedParagraph>
          </div>

          {/* Analyzer Form Card */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="max-w-2xl mx-auto relative"
          >
            <div className="absolute -inset-4 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 rounded-3xl blur-2xl opacity-10" />
            <GlassCard className="p-8 relative" hover={false}>
              <AnalyzerForm onAnalysisComplete={handleAnalysisComplete} />
            </GlassCard>
          </motion.div>
        </div>
      </section>

      {/* Results Section */}
      <AnimatePresence mode="wait">
        {analysisResult && (
          <motion.section 
            id="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="py-16 bg-gradient-to-b from-white to-gray-50"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
              
              {/* Environmental Data Summary */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                    Environmental Analysis for{' '}
                    <GradientText>{analysisResult.district}</GradientText>
                  </h2>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Weather Card */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    <div className="relative group">
                      <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl blur-lg opacity-20 group-hover:opacity-40 transition-opacity" />
                      <div className="relative bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                            <CloudRain className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-gray-900">Weather Conditions</h3>
                            <p className="text-sm text-gray-500">Real-time data from OpenWeather</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <WeatherStat 
                            icon={<ThermometerSun className="w-5 h-5" />}
                            label="Temperature"
                            value={`${analysisResult.weatherData.temperature}°C`}
                            gradient="from-red-500 to-orange-500"
                          />
                          <WeatherStat 
                            icon={<Droplets className="w-5 h-5" />}
                            label="Humidity"
                            value={`${analysisResult.weatherData.humidity}%`}
                            gradient="from-blue-500 to-cyan-500"
                          />
                          <WeatherStat 
                            icon={<CloudRain className="w-5 h-5" />}
                            label="Rainfall"
                            value={`${analysisResult.weatherData.rainfall}mm`}
                            gradient="from-indigo-500 to-purple-500"
                          />
                          <WeatherStat 
                            icon={<Calendar className="w-5 h-5" />}
                            label="Season"
                            value={analysisResult.weatherData.season}
                            gradient="from-green-500 to-emerald-500"
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Soil Card */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  >
                    <div className="relative group">
                      <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl blur-lg opacity-20 group-hover:opacity-40 transition-opacity" />
                      <div className="relative bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                            <Leaf className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-gray-900">Soil Properties</h3>
                            <p className="text-sm text-gray-500">Region-specific analysis</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <SoilStat 
                            icon={<Layers className="w-5 h-5" />}
                            label="Type"
                            value={analysisResult.soilData.type}
                          />
                          <SoilStat 
                            icon={<TestTube className="w-5 h-5" />}
                            label="pH Level"
                            value={analysisResult.soilData.pH.toString()}
                          />
                          <SoilStat 
                            label="Nitrogen"
                            value={analysisResult.soilData.nitrogen}
                            badge
                          />
                          <SoilStat 
                            label="Phosphorus"
                            value={analysisResult.soilData.phosphorus}
                            badge
                          />
                          <SoilStat 
                            label="Potassium"
                            value={analysisResult.soilData.potassium}
                            badge
                          />
                          <SoilStat 
                            label="Fertility"
                            value={analysisResult.soilData.fertility}
                            badge
                            highlight
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>

              {/* Crop Recommendations */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                    Top {analysisResult.recommendations.length}{' '}
                    <GradientText gradient="orange">Crop Recommendations</GradientText>
                  </h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {analysisResult.recommendations.map((crop, index) => (
                    <motion.div
                      key={crop.cropName}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                    >
                      <CropRecommendationCard crop={crop} rank={index + 1} />
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Analysis Meta Info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.8 }}
                className="flex flex-wrap justify-center gap-4"
              >
                <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {new Date(analysisResult.analysisDate).toLocaleDateString('en-IN', { 
                      dateStyle: 'long' 
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full">
                  <Map className="w-4 h-4" />
                  <span className="text-sm font-medium">{analysisResult.acres} acres</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-full">
                  <Sparkles className="w-4 h-4" />
                  <span className="text-sm font-medium">Powered by Gemini AI</span>
                </div>
              </motion.div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </Layout>
  );
}

// Weather Stat Component
function WeatherStat({ 
  icon, 
  label, 
  value, 
  gradient 
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: string; 
  gradient: string; 
}) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center text-white`}>
        {icon}
      </div>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="font-semibold text-gray-900">{value}</p>
      </div>
    </div>
  );
}

// Soil Stat Component
function SoilStat({ 
  icon, 
  label, 
  value, 
  badge = false,
  highlight = false
}: { 
  icon?: React.ReactNode; 
  label: string; 
  value: string;
  badge?: boolean;
  highlight?: boolean;
}) {
  if (badge) {
    return (
      <div className={`p-3 rounded-xl ${highlight ? 'bg-amber-50 border border-amber-200' : 'bg-gray-50'}`}>
        <p className="text-xs text-gray-500 mb-1">{label}</p>
        <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
          value === 'High' ? 'bg-green-100 text-green-700' :
          value === 'Medium' ? 'bg-amber-100 text-amber-700' :
          'bg-red-100 text-red-700'
        }`}>
          {value}
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
      {icon && (
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white">
          {icon}
        </div>
      )}
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="font-semibold text-gray-900">{value}</p>
      </div>
    </div>
  );
}
