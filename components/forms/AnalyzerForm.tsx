'use client';

import { useState } from 'react';
import { MapPin, Maximize2 } from 'lucide-react';
import { AnalysisResult } from '@/utils/types';
import { INDIAN_DISTRICTS, getAllStates, getDistrictsByState } from '@/utils/constants';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

/**
 * AnalyzerForm Component
 * - Main input form for crop analysis
 * - Farmer selects: State → District → Land size (acres)
 * - Calls /api/analyze endpoint with 3 AI agents
 * - Returns crop recommendations with profit estimates
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

  const states = getAllStates();
  const districts = selectedState ? getDistrictsByState(selectedState) : [];

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
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
      <div className="mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          Crop Analysis
        </h2>
        <p className="text-gray-600">
          Enter your farm details to get AI-powered crop recommendations
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* State Selection */}
        <div>
          <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-2">
            <MapPin className="w-4 h-4 inline mr-1" />
            Select State
          </label>
          <select
            id="state"
            value={selectedState}
            onChange={(e) => {
              setSelectedState(e.target.value);
              setSelectedDistrict(''); // Reset district when state changes
            }}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
            required
          >
            <option value="">Choose your state</option>
            {states.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
        </div>

        {/* District Selection */}
        <div>
          <label htmlFor="district" className="block text-sm font-medium text-gray-700 mb-2">
            <MapPin className="w-4 h-4 inline mr-1" />
            Select District
          </label>
          <select
            id="district"
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            disabled={!selectedState}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition disabled:bg-gray-100 disabled:cursor-not-allowed"
            required
          >
            <option value="">Choose your district</option>
            {districts.map((district) => (
              <option key={district.name} value={district.name}>
                {district.name}
              </option>
            ))}
          </select>
        </div>

        {/* Acres Input */}
        <div>
          <label htmlFor="acres" className="block text-sm font-medium text-gray-700 mb-2">
            <Maximize2 className="w-4 h-4 inline mr-1" />
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
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
            required
          />
          <p className="text-sm text-gray-500 mt-1">
            Enter the size of your farmland in acres
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-4 rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Analyzing...</span>
            </>
          ) : (
            <span>Get Crop Recommendations</span>
          )}
        </button>

        {loading && (
          <div className="py-8">
            <LoadingSpinner 
              size="lg" 
              text="Processing your farm data"
            />
          </div>
        )}
      </form>

      {/* Info Box */}
      <div className="mt-6 bg-primary-50 border border-primary-200 rounded-lg p-4">
        <p className="text-primary-800 text-sm">
          <strong>How it works:</strong> Our AI analyzes weather patterns, soil fertility, and
          current market prices to recommend the top 3 most profitable crops for your region.
        </p>
      </div>
    </div>
  );
}
