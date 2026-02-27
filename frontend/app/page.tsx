'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Leaf, TrendingUp, CloudRain, BarChart3, ArrowRight, 
  Sparkles, Zap, Shield, Brain, Globe, Users, CheckCircle,
  Sun, Droplets, LineChart
} from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { FloatingParticles } from '@/components/effects/FloatingParticles';
import { GlassCard } from '@/components/ui/GlassCard';
import { AnimatedButton } from '@/components/ui/AnimatedButton';
import { GradientText, AnimatedHeading, AnimatedParagraph } from '@/components/ui/GradientText';
import { FeatureCard } from '@/components/cards/FeatureCard';
import { StepCard } from '@/components/cards/StepCard';
import { StatCard } from '@/components/cards/StatCard';

export default function HomePage() {
  const features = [
    {
      icon: <CloudRain className="w-8 h-8" />,
      title: 'Real-time Weather',
      description: 'Get accurate weather data from OpenWeather API for your exact location with seasonal predictions.',
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      icon: <Brain className="w-8 h-8" />,
      title: 'AI Crop Analysis',
      description: 'Advanced Gemini AI analyzes soil conditions, climate data, and biotech varieties for optimal recommendations.',
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: 'Market Intelligence',
      description: 'Real-time market prices and profit predictions to maximize your agricultural investments.',
      gradient: 'from-green-500 to-emerald-500',
    },
    {
      icon: <Leaf className="w-8 h-8" />,
      title: 'Biotech Varieties',
      description: 'Access to modern biotech crops - BT Cotton, drought-resistant wheat, flood-tolerant rice varieties.',
      gradient: 'from-amber-500 to-orange-500',
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Risk Assessment',
      description: 'Climate resilience scoring and risk analysis for better farming decisions.',
      gradient: 'from-red-500 to-rose-500',
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: 'Pan-India Coverage',
      description: 'Supports all Indian states and 700+ districts with localized recommendations.',
      gradient: 'from-teal-500 to-cyan-500',
    },
  ];

  const steps = [
    { step: 1, title: 'Select Your Location', description: 'Choose your state and district from our comprehensive pan-India database.' },
    { step: 2, title: 'AI Analyzes Data', description: 'Our AI fetches weather, analyzes soil conditions, and processes biotech varieties.' },
    { step: 3, title: 'Get Recommendations', description: 'Receive top 3 crops ranked by profitability with detailed reasoning.' },
    { step: 4, title: 'Start Farming', description: 'Implement recommendations with confidence backed by data-driven insights.' },
  ];

  const stats = [
    { value: '700+', label: 'Districts Covered' },
    { value: '50+', label: 'Crop Varieties' },
    { value: '99%', label: 'Accuracy Rate' },
    { value: '24/7', label: 'AI Availability' },
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-green-50 via-white to-emerald-50">
        <FloatingParticles />
        
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-green-300/30 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-emerald-300/30 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-teal-200/20 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
          <div className="text-center">
            {/* Main Heading */}
            <AnimatedHeading className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Smart Farming with{' '}
              <GradientText gradient="green" className="block md:inline">
                AI Intelligence
              </GradientText>
            </AnimatedHeading>

            <AnimatedParagraph 
              delay={0.2} 
              className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-10 leading-relaxed"
            >
              Krishi Sakhi analyzes weather, soil, and market data using advanced AI 
              to recommend the most profitable crops for your farm.
            </AnimatedParagraph>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
            >
              <Link href="/dashboard">
                <AnimatedButton variant="primary" size="lg">
                  Start Crop Analysis
                  <ArrowRight className="w-5 h-5" />
                </AnimatedButton>
              </Link>
              <Link href="#features">
                <AnimatedButton variant="outline" size="lg">
                  Learn More
                </AnimatedButton>
              </Link>
            </motion.div>

            {/* Hero Image/Card */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="relative max-w-4xl mx-auto"
            >
              <div className="absolute -inset-4 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 rounded-3xl blur-2xl opacity-20" />
              <GlassCard className="p-8" hover={false}>
                <div className="grid grid-cols-3 gap-6 text-left">
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-green-50/50">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                      <Sun className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-800">21°C</p>
                      <p className="text-sm text-gray-500">Temperature</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-blue-50/50">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                      <Droplets className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-800">65%</p>
                      <p className="text-sm text-gray-500">Humidity</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-amber-50/50">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                      <LineChart className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-800">₹67K</p>
                      <p className="text-sm text-gray-500">Profit/Acre</p>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <div className="w-6 h-10 rounded-full border-2 border-gray-400 flex justify-center pt-2">
            <div className="w-1.5 h-3 bg-gray-400 rounded-full" />
          </div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="relative py-20 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, idx) => (
              <StatCard key={stat.label} value={stat.value} label={stat.label} delay={idx * 0.1} />
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-gradient-to-b from-white via-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 mb-6"
            >
              <Zap className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-700">Powerful Features</span>
            </motion.div>
            <AnimatedHeading className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Everything You Need to{' '}
              <GradientText>Succeed</GradientText>
            </AnimatedHeading>
            <AnimatedParagraph delay={0.2} className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our AI-powered platform provides comprehensive tools for modern farming
            </AnimatedParagraph>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <FeatureCard
                key={feature.title}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                gradient={feature.gradient}
                delay={idx * 0.1}
              />
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-gradient-to-br from-green-50 via-white to-emerald-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: Steps */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 mb-6"
              >
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-700">Simple Process</span>
              </motion.div>
              <AnimatedHeading className="text-4xl md:text-5xl font-bold text-gray-900 mb-12">
                How <GradientText>Krishi Sakhi</GradientText> Works
              </AnimatedHeading>

              <div className="space-y-2">
                {steps.map((step, idx) => (
                  <StepCard
                    key={step.step}
                    step={step.step}
                    title={step.title}
                    description={step.description}
                    delay={idx * 0.15}
                  />
                ))}
              </div>
            </div>

            {/* Right: Visual */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="absolute -inset-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-3xl blur-3xl opacity-20" />
              <div className="relative bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
                <div className="space-y-6">
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100">
                    <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center text-white font-bold">1</div>
                    <div className="flex-1">
                      <div className="h-3 bg-green-200 rounded-full w-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: '100%' }}
                          viewport={{ once: true }}
                          transition={{ duration: 1, delay: 0.5 }}
                          className="h-full bg-green-500 rounded-full"
                        />
                      </div>
                      <p className="text-sm text-gray-500 mt-1">Weather data collected</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-100">
                    <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">2</div>
                    <div className="flex-1">
                      <div className="h-3 bg-blue-200 rounded-full w-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: '100%' }}
                          viewport={{ once: true }}
                          transition={{ duration: 1, delay: 1 }}
                          className="h-full bg-blue-500 rounded-full"
                        />
                      </div>
                      <p className="text-sm text-gray-500 mt-1">AI analyzing crops</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100">
                    <div className="w-12 h-12 rounded-full bg-amber-500 flex items-center justify-center text-white font-bold">3</div>
                    <div className="flex-1">
                      <div className="h-3 bg-amber-200 rounded-full w-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: '100%' }}
                          viewport={{ once: true }}
                          transition={{ duration: 1, delay: 1.5 }}
                          className="h-full bg-amber-500 rounded-full"
                        />
                      </div>
                      <p className="text-sm text-gray-500 mt-1">Recommendations ready!</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        
        {/* Floating elements */}
        <motion.div
          animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 5, repeat: Infinity }}
          className="absolute top-20 left-20 w-20 h-20 bg-white/10 rounded-2xl backdrop-blur-sm"
        />
        <motion.div
          animate={{ y: [0, 20, 0], rotate: [0, -5, 0] }}
          transition={{ duration: 6, repeat: Infinity }}
          className="absolute bottom-20 right-20 w-32 h-32 bg-white/10 rounded-full backdrop-blur-sm"
        />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm mb-8">
              <Users className="w-4 h-4 text-white" />
              <span className="text-sm font-medium text-white">Join Thousands of Farmers</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Transform Your Farm?
            </h2>
            <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
              Get AI-powered crop recommendations tailored to your exact location, 
              soil conditions, and market trends. Start farming smarter today.
            </p>
            <Link href="/dashboard">
              <AnimatedButton variant="ghost" size="lg" className="!bg-white !text-green-600 hover:!bg-white/90">
                Start Free Analysis
                <ArrowRight className="w-5 h-5" />
              </AnimatedButton>
            </Link>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}
