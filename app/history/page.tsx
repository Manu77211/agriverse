'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { Calendar, MapPin, TrendingUp } from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

/**
 * History Page
 * - Displays list of past crop analyses
 * - Fetches data from Supabase
 * - Shows: Date, District, Top crop, Profit estimate
 * - Click to view full analysis details
 * - Uses ONLY imported components
 */

interface HistoryItem {
  id: string;
  date: string;
  district: string;
  state: string;
  acres: number;
  topCrop: string;
  profit: number;
}

export default function HistoryPage() {
  const [historyData, setHistoryData] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch from Supabase
    // Simulate API call with mock data
    setTimeout(() => {
      const mockHistory: HistoryItem[] = [
        {
          id: '1',
          date: '2025-12-20',
          district: 'Patna',
          state: 'Bihar',
          acres: 5,
          topCrop: 'Lentil',
          profit: 180000,
        },
        {
          id: '2',
          date: '2025-12-15',
          district: 'Pune',
          state: 'Maharashtra',
          acres: 10,
          topCrop: 'Cotton',
          profit: 420000,
        },
      ];
      setHistoryData(mockHistory);
      setLoading(false);
    }, 1000);
  }, []);

  return (
    <Layout>
      <div className="section-padding">
        <div className="container-custom">
          {/* Page Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Analysis History
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              View your past crop analysis reports and recommendations
            </p>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center py-20">
              <LoadingSpinner size="lg" text="Loading history..." />
            </div>
          )}

          {/* History List */}
          {!loading && historyData.length > 0 && (
            <div className="max-w-4xl mx-auto space-y-4">
              {historyData.map((item) => (
                <div 
                  key={item.id}
                  className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-200"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm">
                          {new Date(item.date).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-5 h-5 text-primary-600" />
                        <span className="text-lg font-semibold text-gray-900">
                          {item.district}, {item.state}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600">
                        Land Size: <strong>{item.acres} acres</strong>
                      </p>
                    </div>

                    <div className="text-left md:text-right">
                      <p className="text-sm text-gray-600 mb-1">Top Recommendation</p>
                      <p className="text-xl font-bold text-primary-600 mb-2">
                        {item.topCrop}
                      </p>
                      <div className="flex items-center space-x-1 text-green-600">
                        <TrendingUp className="w-4 h-4" />
                        <span className="font-semibold">
                          ₹{item.profit.toLocaleString('en-IN')} profit
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && historyData.length === 0 && (
            <div className="text-center py-20">
              <div className="bg-gray-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                <Calendar className="w-12 h-12 text-gray-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                No Analysis History Yet
              </h2>
              <p className="text-gray-600 mb-6">
                Start your first crop analysis to see recommendations here
              </p>
              <a 
                href="/dashboard"
                className="inline-block px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-colors"
              >
                Go to Dashboard
              </a>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
