'use client';

import { useState } from 'react';
import Layout from '@/components/layout/Layout';
import AnalyzerForm from '@/components/forms/AnalyzerForm';
import CropRecommendationCard from '@/components/cards/CropRecommendationCard';
import { AnalysisResult } from '@/utils/types';

/**
 * Dashboard Page
 * - Main analysis page where farmers input data
 * - Uses AnalyzerForm component for input
 * - Displays CropRecommendationCard components for results
 * - Shows weather and soil data summary
 * - ZERO inline HTML - only component imports
 */

export default function DashboardPage() {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  const handleAnalysisComplete = (result: AnalysisResult) => {
    setAnalysisResult(result);
    // Scroll to results smoothly
    setTimeout(() => {
      document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <Layout>
      <div className="section-padding">
        <div className="container-custom">
          {/* Page Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Crop Analysis Dashboard
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Enter your farm details to receive AI-powered crop recommendations
              based on real-time weather, soil fertility, and market prices.
            </p>
          </div>

          {/* Analyzer Form */}
          <div className="max-w-2xl mx-auto mb-12">
            <AnalyzerForm onAnalysisComplete={handleAnalysisComplete} />
          </div>

          {/* Results Section */}
          {analysisResult && (
            <div id="results" className="space-y-8">
              {/* Environmental Data Summary */}
              <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-primary-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  📊 Environmental Analysis for {analysisResult.district}
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Weather Data */}
                  <div className="bg-sky-50 rounded-lg p-6">
                    <h3 className="text-lg font-bold text-sky-900 mb-4 flex items-center">
                      <span className="mr-2">🌤️</span> Weather Conditions
                    </h3>
                    <div className="space-y-2 text-sm text-gray-700">
                      <p><strong>Temperature:</strong> {analysisResult.weatherData.temperature}°C</p>
                      <p><strong>Humidity:</strong> {analysisResult.weatherData.humidity}%</p>
                      <p><strong>Rainfall:</strong> {analysisResult.weatherData.rainfall}mm</p>
                      <p><strong>Season:</strong> {analysisResult.weatherData.season}</p>
                    </div>
                  </div>

                  {/* Soil Data */}
                  <div className="bg-earth-50 rounded-lg p-6">
                    <h3 className="text-lg font-bold text-earth-900 mb-4 flex items-center">
                      <span className="mr-2">🌱</span> Soil Properties
                    </h3>
                    <div className="space-y-2 text-sm text-gray-700">
                      <p><strong>Type:</strong> {analysisResult.soilData.type}</p>
                      <p><strong>pH Level:</strong> {analysisResult.soilData.pH}</p>
                      <p><strong>Nitrogen:</strong> {analysisResult.soilData.nitrogen}</p>
                      <p><strong>Phosphorus:</strong> {analysisResult.soilData.phosphorus}</p>
                      <p><strong>Potassium:</strong> {analysisResult.soilData.potassium}</p>
                      <p><strong>Fertility:</strong> {analysisResult.soilData.fertility}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Crop Recommendations */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  🏆 Top {analysisResult.recommendations.length} Crop Recommendations
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {analysisResult.recommendations.map((crop, index) => (
                    <CropRecommendationCard 
                      key={crop.cropName} 
                      crop={crop} 
                      rank={index + 1} 
                    />
                  ))}
                </div>
              </div>

              {/* Analysis Info */}
              <div className="bg-primary-50 border border-primary-200 rounded-lg p-6 text-center">
                <p className="text-primary-900">
                  <strong>Analysis Date:</strong> {new Date(analysisResult.analysisDate).toLocaleDateString('en-IN')} | 
                  <strong> Land Size:</strong> {analysisResult.acres} acres
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
