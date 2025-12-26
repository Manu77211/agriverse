'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from '@/components/layout/Layout';
import LoginForm from '@/components/forms/LoginForm';
import { GlassCard } from '@/components/ui/GlassCard';
import { AnimatedButton } from '@/components/ui/AnimatedButton';
import { GradientText, AnimatedHeading, AnimatedParagraph } from '@/components/ui/GradientText';
import { FloatingParticles } from '@/components/effects/FloatingParticles';
import { 
  User, Mail, Phone, MapPin, Edit, LogOut, 
  Shield, Camera, BarChart3, Map, Leaf, Settings,
  CheckCircle, Award, TrendingUp
} from 'lucide-react';

/**
 * Profile Page - Modern Animated Version
 * - User authentication (LoginForm if not logged in)
 * - Profile info display with beautiful animations
 * - Edit profile functionality
 */

export default function ProfilePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [userData, setUserData] = useState({
    name: 'Ramesh Kumar',
    email: 'ramesh@example.com',
    phone: '+91 9876543210',
    location: 'Patna, Bihar',
  });

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  const stats = [
    { icon: <BarChart3 className="w-5 h-5" />, value: '12', label: 'Analyses', color: 'from-blue-500 to-cyan-500' },
    { icon: <Map className="w-5 h-5" />, value: '5', label: 'Districts', color: 'from-purple-500 to-pink-500' },
    { icon: <Leaf className="w-5 h-5" />, value: '45', label: 'Acres', color: 'from-green-500 to-emerald-500' },
  ];

  const achievements = [
    { icon: <Award className="w-5 h-5" />, title: 'First Analysis', description: 'Completed your first crop analysis' },
    { icon: <TrendingUp className="w-5 h-5" />, title: 'Profit Master', description: 'Achieved 50% profit increase' },
    { icon: <CheckCircle className="w-5 h-5" />, title: 'Verified Farmer', description: 'Account verified successfully' },
  ];

  // Not logged in - show login form
  if (!isLoggedIn) {
    return (
      <Layout>
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-green-50 via-white to-emerald-50">
          <FloatingParticles />
          
          {/* Background decorations */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-20 left-20 w-64 h-64 bg-green-300/20 rounded-full blur-3xl" />
            <div className="absolute bottom-20 right-20 w-80 h-80 bg-emerald-300/20 rounded-full blur-3xl" />
          </div>

          <div className="relative z-10 w-full max-w-md mx-auto px-4 py-20">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="text-center mb-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", duration: 0.6 }}
                  className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mb-6 shadow-lg"
                >
                  <User className="w-10 h-10 text-white" />
                </motion.div>
                <AnimatedHeading className="text-3xl font-bold text-gray-900 mb-2">
                  Welcome Back
                </AnimatedHeading>
                <AnimatedParagraph delay={0.1} className="text-gray-600">
                  Sign in to access your farming dashboard
                </AnimatedParagraph>
              </div>

              <div className="relative">
                <div className="absolute -inset-2 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 rounded-3xl blur-xl opacity-20" />
                <GlassCard className="p-8 relative" hover={false}>
                  <LoginForm onSuccess={handleLoginSuccess} />
                </GlassCard>
              </div>
            </motion.div>
          </div>
        </section>
      </Layout>
    );
  }

  // Logged in - show profile
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative pt-28 pb-12 overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-teal-50">
        <FloatingParticles />
        
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 right-10 w-64 h-64 bg-emerald-300/20 rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-10 w-80 h-80 bg-teal-300/20 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 border border-emerald-200 mb-6"
            >
              <Shield className="w-4 h-4 text-emerald-600" />
              <span className="text-sm font-medium text-emerald-700">Verified Account</span>
            </motion.div>

            <AnimatedHeading className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              My{' '}
              <GradientText>Profile</GradientText>
            </AnimatedHeading>

            <AnimatedParagraph delay={0.2} className="text-lg text-gray-600 max-w-2xl mx-auto">
              Manage your account information and track your farming journey.
            </AnimatedParagraph>
          </div>
        </div>
      </section>

      {/* Profile Content */}
      <section className="py-12 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8">
            
            {/* Left Column: Profile Card */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-2"
            >
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 rounded-3xl blur-lg opacity-20 group-hover:opacity-30 transition-opacity" />
                <div className="relative bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                  
                  {/* Profile Header */}
                  <div className="flex flex-col sm:flex-row items-center gap-6 mb-8 pb-8 border-b border-gray-100">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="relative"
                    >
                      <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg">
                        <User className="w-12 h-12 text-white" />
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center"
                      >
                        <Camera className="w-4 h-4 text-gray-600" />
                      </motion.button>
                    </motion.div>
                    
                    <div className="text-center sm:text-left">
                      <h2 className="text-2xl font-bold text-gray-900">{userData.name}</h2>
                      <p className="text-gray-500">{userData.email}</p>
                      <div className="flex items-center justify-center sm:justify-start gap-2 mt-2">
                        <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                          Premium Farmer
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Profile Info */}
                  <div className="space-y-4">
                    <ProfileInfoItem 
                      icon={<User className="w-5 h-5" />}
                      label="Full Name"
                      value={userData.name}
                      gradient="from-blue-500 to-cyan-500"
                    />
                    <ProfileInfoItem 
                      icon={<Mail className="w-5 h-5" />}
                      label="Email Address"
                      value={userData.email}
                      gradient="from-purple-500 to-pink-500"
                    />
                    <ProfileInfoItem 
                      icon={<Phone className="w-5 h-5" />}
                      label="Phone Number"
                      value={userData.phone}
                      gradient="from-green-500 to-emerald-500"
                    />
                    <ProfileInfoItem 
                      icon={<MapPin className="w-5 h-5" />}
                      label="Location"
                      value={userData.location}
                      gradient="from-amber-500 to-orange-500"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-8 flex flex-col sm:flex-row gap-4">
                    <AnimatedButton 
                      variant="primary" 
                      className="flex-1"
                      onClick={() => setIsEditing(!isEditing)}
                    >
                      <Edit className="w-4 h-4" />
                      Edit Profile
                    </AnimatedButton>
                    
                    <AnimatedButton 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => setIsLoggedIn(false)}
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </AnimatedButton>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right Column: Stats & Achievements */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-6"
            >
              {/* Stats Card */}
              <div className="bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600 rounded-2xl p-6 text-white shadow-xl">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Account Statistics
                </h3>
                <div className="space-y-4">
                  {stats.map((stat, idx) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 0.3 + idx * 0.1 }}
                      className="flex items-center justify-between p-3 rounded-xl bg-white/10 backdrop-blur-sm"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                          {stat.icon}
                        </div>
                        <span className="text-white/80">{stat.label}</span>
                      </div>
                      <span className="text-2xl font-bold">{stat.value}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Achievements Card */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-500" />
                  Achievements
                </h3>
                <div className="space-y-3">
                  {achievements.map((achievement, idx) => (
                    <motion.div
                      key={achievement.title}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.5 + idx * 0.1 }}
                      className="flex items-start gap-3 p-3 rounded-xl bg-amber-50 border border-amber-100"
                    >
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white flex-shrink-0">
                        {achievement.icon}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{achievement.title}</p>
                        <p className="text-xs text-gray-500">{achievement.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Settings Quick Link */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-between p-4 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Settings className="w-5 h-5 text-gray-600" />
                  <span className="font-medium text-gray-700">Account Settings</span>
                </div>
                <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center">
                  <span className="text-gray-600 text-sm">→</span>
                </div>
              </motion.button>
            </motion.div>
          </div>
        </div>
      </section>
    </Layout>
  );
}

// Profile Info Item Component
function ProfileInfoItem({ 
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
    <motion.div
      whileHover={{ x: 4 }}
      className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
    >
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white shadow-lg`}>
        {icon}
      </div>
      <div className="flex-grow">
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-lg font-semibold text-gray-900">{value}</p>
      </div>
    </motion.div>
  );
}
