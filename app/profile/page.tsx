'use client';

import { useState } from 'react';
import Layout from '@/components/layout/Layout';
import LoginForm from '@/components/forms/LoginForm';
import { User, Mail, Phone, MapPin, Edit } from 'lucide-react';

/**
 * Profile Page
 * - User authentication (LoginForm if not logged in)
 * - Profile info display (name, email, phone, location)
 * - Edit profile functionality
 * - Uses ONLY imported components
 */

export default function ProfilePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false); // TODO: Check Supabase auth state
  const [isEditing, setIsEditing] = useState(false);

  // Mock user data (TODO: Fetch from Supabase)
  const [userData, setUserData] = useState({
    name: 'Ramesh Kumar',
    email: 'ramesh@example.com',
    phone: '+91 9876543210',
    location: 'Patna, Bihar',
  });

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  // Not logged in - show login form
  if (!isLoggedIn) {
    return (
      <Layout>
        <div className="section-padding">
          <div className="container-custom">
            <div className="max-w-md mx-auto">
              <LoginForm onSuccess={handleLoginSuccess} />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Logged in - show profile
  return (
    <Layout>
      <div className="section-padding">
        <div className="container-custom">
          {/* Page Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              My Profile
            </h1>
            <p className="text-lg text-gray-600">
              Manage your account information and preferences
            </p>
          </div>

          {/* Profile Card */}
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-8 border-2 border-gray-200">
              {/* Profile Picture Placeholder */}
              <div className="flex justify-center mb-8">
                <div className="w-24 h-24 bg-primary-500 rounded-full flex items-center justify-center">
                  <User className="w-12 h-12 text-white" />
                </div>
              </div>

              {/* Profile Info */}
              <div className="space-y-6">
                {/* Name */}
                <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                  <User className="w-6 h-6 text-primary-600" />
                  <div className="flex-grow">
                    <p className="text-sm text-gray-600">Full Name</p>
                    <p className="text-lg font-semibold text-gray-900">{userData.name}</p>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                  <Mail className="w-6 h-6 text-primary-600" />
                  <div className="flex-grow">
                    <p className="text-sm text-gray-600">Email Address</p>
                    <p className="text-lg font-semibold text-gray-900">{userData.email}</p>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                  <Phone className="w-6 h-6 text-primary-600" />
                  <div className="flex-grow">
                    <p className="text-sm text-gray-600">Phone Number</p>
                    <p className="text-lg font-semibold text-gray-900">{userData.phone}</p>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                  <MapPin className="w-6 h-6 text-primary-600" />
                  <div className="flex-grow">
                    <p className="text-sm text-gray-600">Location</p>
                    <p className="text-lg font-semibold text-gray-900">{userData.location}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={() => setIsEditing(!isEditing)}
                  className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-colors"
                >
                  <Edit className="w-5 h-5" />
                  <span>Edit Profile</span>
                </button>
                
                <button 
                  onClick={() => setIsLoggedIn(false)}
                  className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>

            {/* Stats Card */}
            <div className="mt-6 bg-primary-50 border border-primary-200 rounded-xl p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Account Statistics</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-3xl font-bold text-primary-600">12</p>
                  <p className="text-sm text-gray-600">Analyses</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-primary-600">5</p>
                  <p className="text-sm text-gray-600">Districts</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-primary-600">45</p>
                  <p className="text-sm text-gray-600">Acres Analyzed</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
