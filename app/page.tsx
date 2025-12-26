'use client';

import Link from 'next/link';
import Layout from '@/components/layout/Layout';
import { Leaf, TrendingUp, CloudRain, BarChart3, ArrowRight } from 'lucide-react';

/**
 * Landing Page (Home)
 * - Hero section with CTA
 * - Features showcase
 * - How it works section
 * - Uses ONLY imported components (Layout)
 * - NO inline HTML beyond component structure
 */

export default function HomePage() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 via-white to-green-50 section-padding">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-primary-500 p-4 rounded-2xl animate-pulse-slow">
                <Leaf className="w-16 h-16 text-white" />
              </div>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Welcome to <span className="text-primary-600">Krishi Sakhi</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-700 mb-8 leading-relaxed">
              AI-powered farming assistant helping Indian farmers make <strong>data-driven decisions</strong> for better crop yields and profits.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/dashboard"
                className="inline-flex items-center justify-center px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-colors space-x-2 text-lg"
              >
                <span>Start Analysis</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              
              <Link 
                href="#how-it-works"
                className="inline-flex items-center justify-center px-8 py-4 bg-white hover:bg-gray-50 text-primary-600 font-semibold rounded-lg border-2 border-primary-600 transition-colors text-lg"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
            Why Choose Krishi Sakhi?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-gradient-to-br from-sky-50 to-blue-50 rounded-xl p-8 text-center hover:shadow-lg transition-shadow">
              <div className="flex justify-center mb-4">
                <div className="bg-sky-500 p-4 rounded-full">
                  <CloudRain className="w-8 h-8 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Weather Analysis</h3>
              <p className="text-gray-700">
                Real-time weather data and climate patterns for your district using OpenWeather API.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-gradient-to-br from-earth-50 to-amber-50 rounded-xl p-8 text-center hover:shadow-lg transition-shadow">
              <div className="flex justify-center mb-4">
                <div className="bg-earth-500 p-4 rounded-full">
                  <Leaf className="w-8 h-8 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Soil Testing</h3>
              <p className="text-gray-700">
                Soil fertility analysis (NPK, pH, organic carbon) from AgriStack and ICAR data.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-gradient-to-br from-primary-50 to-green-50 rounded-xl p-8 text-center hover:shadow-lg transition-shadow">
              <div className="flex justify-center mb-4">
                <div className="bg-primary-500 p-4 rounded-full">
                  <BarChart3 className="w-8 h-8 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Market Prices</h3>
              <p className="text-gray-700">
                Live mandi prices from eNAM to calculate profit and rank crops by profitability.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="section-padding bg-gray-50">
        <div className="container-custom">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
            How It Works
          </h2>
          
          <div className="max-w-3xl mx-auto space-y-8">
            {/* Step 1 */}
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-primary-500 text-white rounded-full flex items-center justify-center font-bold text-xl">
                1
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Enter Farm Details</h3>
                <p className="text-gray-700">
                  Select your state, district, and land size in acres. Our system supports 700+ districts across India.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-primary-500 text-white rounded-full flex items-center justify-center font-bold text-xl">
                2
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">AI Analysis (3 Agents)</h3>
                <p className="text-gray-700">
                  <strong>Agent 1:</strong> Collects weather & soil data<br />
                  <strong>Agent 2:</strong> GPT-4o-mini suggests top 5 crops<br />
                  <strong>Agent 3:</strong> Ranks crops by market profitability
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-primary-500 text-white rounded-full flex items-center justify-center font-bold text-xl">
                3
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Get Top 3 Recommendations</h3>
                <p className="text-gray-700">
                  View detailed crop cards with expected profit, yield per acre, market price, and AI reasoning.
                </p>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link 
              href="/dashboard"
              className="inline-flex items-center px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-colors space-x-2"
            >
              <span>Try It Now</span>
              <TrendingUp className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
