'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Maximize2, Sparkles, Brain, CloudRain, TrendingUp, AlertCircle } from 'lucide-react';
import { AnalysisResult } from '@/utils/types';
import { getAllStates, getDistrictsByState } from '@/utils/constants';

/**
 * AnalyzerForm Component - Modern Animated Version
 * - Main input form for crop analysis
 * - Farmer selects: State → District → Land size (acres)
 * - Beautiful animations and loading states
 */

interface AnalyzerFormProps {
  onAnalysisComplete?: (result: AnalysisResult) => void;
}

export default function AnalyzerForm({ onAnalysisComplete }: AnalyzerFormProps) {
  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [acres, setAcres] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState(0);

  const states = getAllStates();
  const districts = selectedState ? getDistrictsByState(selectedState) : [];

  const loadingSteps = [
    { icon: <CloudRain className="w-5 h-5" />, text: 'Fetching weather data...' },
    { icon: <Brain className="w-5 h-5" />, text: 'AI analyzing crops...' },
    { icon: <TrendingUp className="w-5 h-5" />, text: 'Calculating profits...' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!selectedState || !selectedDistrict || !acres) {
      setError('Please fill all fields');
      return;
    }

    if (Number(acres) <= 0 || Number(acres) > 1000) {
      setError('Please enter valid acres (1-1000)');
      return;
    }

    setLoading(true);
    setCurrentStep(0);

    // Animate through loading steps
    const stepInterval = setInterval(() => {
      setCurrentStep(prev => (prev + 1) % 3);
    }, 2000);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          district: selectedDistrict,
          state: selectedState,
          acres: Number(acres),
        }),
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const result: AnalysisResult = await response.json();
      
      if (onAnalysisComplete) {
        onAnalysisComplete(result);
      }
    } catch (err) {
      setError('Failed to analyze. Please try again.');
      console.error('Analysis error:', err);
    } finally {
      clearInterval(stepInterval);
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center"
          >
            <Sparkles className="w-5 h-5 text-white" />
          </motion.div>
          <h2 className="text-2xl font-bold text-gray-900">Start Analysis</h2>
        </div>
        <p className="text-gray-600">
          Enter your farm details to get AI-powered crop recommendations
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* State Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <label htmlFor="state" className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
              <MapPin className="w-3 h-3 text-white" />
            </div>
            Select State
          </label>
          <select
            id="state"
            value={selectedState}
            onChange={(e) => {
              setSelectedState(e.target.value);
              setSelectedDistrict('');
            }}
            className="w-full px-4 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all hover:border-gray-300 text-gray-900 font-medium"
            required
          >
            <option value="">Choose your state</option>
            {states.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
        </motion.div>

        {/* District Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <label htmlFor="district" className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <MapPin className="w-3 h-3 text-white" />
            </div>
            Select District
          </label>
          <select
            id="district"
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            disabled={!selectedState}
            className="w-full px-4 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all hover:border-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60 text-gray-900 font-medium"
            required
          >
            <option value="">Choose your district</option>
            {districts.map((district) => (
              <option key={district.name} value={district.name}>
                {district.name}
              </option>
            ))}
          </select>
        </motion.div>

        {/* Acres Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <label htmlFor="acres" className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
              <Maximize2 className="w-3 h-3 text-white" />
            </div>
            Land Size (Acres)
          </label>
          <input
            id="acres"
            type="number"
            min="0.1"
            max="1000"
            step="0.1"
            value={acres}
            onChange={(e) => setAcres(e.target.value)}
            placeholder="e.g., 5"
            className="w-full px-4 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all hover:border-gray-300 text-gray-900 font-medium"
            required
          />
          <p className="text-xs text-gray-500 mt-2 ml-1">
            Enter the size of your farmland (1-1000 acres)
          </p>
        </motion.div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-center gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-red-700 text-sm font-medium">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submit Button */}
        <motion.button
          type="submit"
          disabled={loading}
          whileHover={{ scale: loading ? 1 : 1.02 }}
          whileTap={{ scale: loading ? 1 : 0.98 }}
          className="relative w-full overflow-hidden bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 hover:from-green-700 hover:via-emerald-700 hover:to-teal-700 text-white font-bold py-4 rounded-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-green-500/30"
        >
          {/* Shine effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full"
            animate={loading ? {} : { translateX: ['100%', '-100%'] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
          />
          
          <span className="relative flex items-center justify-center gap-2">
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Analyzing...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>Get Crop Recommendations</span>
              </>
            )}
          </span>
        </motion.button>

        {/* Loading Animation */}
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="py-6 space-y-4">
                {loadingSteps.map((step, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0.4 }}
                    animate={{ 
                      opacity: currentStep === idx ? 1 : 0.4,
                      scale: currentStep === idx ? 1.02 : 1,
                    }}
                    className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
                      currentStep === idx 
                        ? 'bg-green-50 border-2 border-green-200' 
                        : 'bg-gray-50 border-2 border-transparent'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      currentStep === idx 
                        ? 'bg-gradient-to-br from-green-500 to-emerald-500 text-white' 
                        : 'bg-gray-200 text-gray-500'
                    }`}>
                      {currentStep === idx ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        >
                          {step.icon}
                        </motion.div>
                      ) : (
                        step.icon
                      )}
                    </div>
                    <span className={`font-medium ${
                      currentStep === idx ? 'text-green-700' : 'text-gray-500'
                    }`}>
                      {step.text}
                    </span>
                    {currentStep === idx && (
                      <motion.div
                        className="ml-auto"
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </form>

      {/* Info Box */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
        className="mt-8 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl"
      >
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center flex-shrink-0">
            <Brain className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-green-800 mb-1">How it works</p>
            <p className="text-sm text-green-700">
              Our AI analyzes weather patterns, soil fertility, and market prices 
              to recommend the top 3 most profitable crops for your region.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
