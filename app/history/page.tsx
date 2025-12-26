'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from '@/components/layout/Layout';
import { GlassCard } from '@/components/ui/GlassCard';
import { AnimatedButton } from '@/components/ui/AnimatedButton';
import { GradientText, AnimatedHeading, AnimatedParagraph } from '@/components/ui/GradientText';
import { FloatingParticles } from '@/components/effects/FloatingParticles';
import { 
  Calendar, MapPin, TrendingUp, Leaf, History, 
  ArrowRight, Sparkles, ChevronRight, BarChart3, Trash2
} from 'lucide-react';

/**
 * History Page - Modern Animated Version
 * - Displays list of past crop analyses
 * - Shows: Date, District, Top crop, Profit estimate
 * - Beautiful hover effects and animations
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
  const [hoveredId, setHoveredId] = useState<string | null>(null);

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
        {
          id: '3',
          date: '2025-12-10',
          district: 'Ludhiana',
          state: 'Punjab',
          acres: 8,
          topCrop: 'Wheat',
          profit: 320000,
        },
      ];
      setHistoryData(mockHistory);
      setLoading(false);
    }, 1000);
  }, []);

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative pt-28 pb-12 overflow-hidden bg-gradient-to-br from-purple-50 via-white to-indigo-50">
        <FloatingParticles />
        
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 left-10 w-64 h-64 bg-purple-300/20 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-80 h-80 bg-indigo-300/20 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 border border-purple-200 mb-6"
            >
              <History className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-700">Past Analyses</span>
            </motion.div>

            <AnimatedHeading className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Analysis{' '}
              <GradientText gradient="blue">History</GradientText>
            </AnimatedHeading>

            <AnimatedParagraph delay={0.2} className="text-lg text-gray-600 max-w-2xl mx-auto">
              View your past crop analysis reports and track your farming decisions over time.
            </AnimatedParagraph>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-12 bg-gradient-to-b from-white to-gray-50 min-h-[50vh]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Loading State */}
          <AnimatePresence mode="wait">
            {loading && (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-20"
              >
                <div className="relative">
                  <div className="w-16 h-16 rounded-full border-4 border-purple-200 border-t-purple-600 animate-spin" />
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <History className="w-6 h-6 text-purple-600" />
                  </motion.div>
                </div>
                <p className="mt-6 text-gray-600 font-medium">Loading history...</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* History List */}
          <AnimatePresence mode="wait">
            {!loading && historyData.length > 0 && (
              <motion.div 
                key="list"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                {historyData.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    onMouseEnter={() => setHoveredId(item.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    className="group relative"
                  >
                    {/* Background glow on hover */}
                    <motion.div
                      className="absolute -inset-1 bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 rounded-2xl blur-lg opacity-0 group-hover:opacity-20 transition-opacity duration-300"
                    />
                    
                    <div className="relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 overflow-hidden">
                      {/* Animated background */}
                      <motion.div
                        initial={{ x: '-100%' }}
                        animate={{ x: hoveredId === item.id ? '0%' : '-100%' }}
                        transition={{ duration: 0.3 }}
                        className="absolute inset-0 bg-gradient-to-r from-purple-50 to-transparent"
                      />
                      
                      <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                        {/* Left side: Date & Location */}
                        <div className="space-y-3">
                          <div className="flex items-center gap-3 text-gray-500">
                            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                              <Calendar className="w-5 h-5 text-purple-600" />
                            </div>
                            <span className="text-sm font-medium">
                              {new Date(item.date).toLocaleDateString('en-IN', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                              <MapPin className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <p className="text-lg font-bold text-gray-900">
                                {item.district}, {item.state}
                              </p>
                              <p className="text-sm text-gray-500">
                                {item.acres} acres analyzed
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Right side: Crop & Profit */}
                        <div className="flex items-center gap-8">
                          <div className="text-left md:text-right">
                            <p className="text-sm text-gray-500 mb-1">Top Recommendation</p>
                            <div className="flex items-center gap-2">
                              <Leaf className="w-5 h-5 text-green-500" />
                              <span className="text-xl font-bold text-gray-900">{item.topCrop}</span>
                            </div>
                          </div>
                          
                          <div className="hidden md:block w-px h-12 bg-gray-200" />
                          
                          <div className="text-left md:text-right">
                            <p className="text-sm text-gray-500 mb-1">Estimated Profit</p>
                            <div className="flex items-center gap-2 text-green-600">
                              <TrendingUp className="w-5 h-5" />
                              <span className="text-xl font-bold">
                                ₹{item.profit.toLocaleString('en-IN')}
                              </span>
                            </div>
                          </div>
                          
                          <motion.div
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            className="w-10 h-10 rounded-full bg-gray-100 group-hover:bg-green-500 flex items-center justify-center transition-colors cursor-pointer"
                          >
                            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                          </motion.div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}

                {/* Summary Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: historyData.length * 0.1 + 0.2 }}
                  className="mt-8"
                >
                  <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 rounded-2xl p-6 text-white">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                          <BarChart3 className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold">Total Analyses</h3>
                          <p className="text-white/80">{historyData.length} farm analyses completed</p>
                        </div>
                      </div>
                      <div className="text-left md:text-right">
                        <p className="text-white/80 text-sm">Total Estimated Profit</p>
                        <p className="text-2xl font-bold">
                          ₹{historyData.reduce((sum, item) => sum + item.profit, 0).toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Empty State */}
          <AnimatePresence mode="wait">
            {!loading && historyData.length === 0 && (
              <motion.div 
                key="empty"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-center py-20"
              >
                <motion.div 
                  animate={{ 
                    y: [0, -10, 0],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="w-24 h-24 rounded-3xl bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center mx-auto mb-8"
                >
                  <History className="w-12 h-12 text-purple-500" />
                </motion.div>
                
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                  No Analysis History Yet
                </h2>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  Start your first crop analysis to see your farming recommendations and track decisions over time.
                </p>
                
                <Link href="/dashboard">
                  <AnimatedButton variant="primary" size="lg">
                    <Sparkles className="w-5 h-5" />
                    Start Your First Analysis
                    <ArrowRight className="w-5 h-5" />
                  </AnimatedButton>
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </Layout>
  );
}
