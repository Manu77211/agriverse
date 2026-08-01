'use client';

import { useState } from 'react';
import { getRecommendations, RecommendationRequest, RecommendationResponse } from '@/lib/api';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface RecommendationFormProps {
  onSuccess?: (data: RecommendationResponse) => void;
  onError?: (error: string) => void;
}

const INDIAN_STATES = [
  'Maharashtra',
  'Bihar',
  'Punjab',
  'Uttar Pradesh',
  'Madhya Pradesh',
  'Karnataka',
  'Tamil Nadu',
  'Rajasthan',
  'Gujarat',
  'Haryana',
  'Andhra Pradesh',
  'Telangana',
  'West Bengal',
  'Odisha',
  'Assam',
];

const StateDistricts: Record<string, string[]> = {
  Maharashtra: ['Ahmednagar', 'Akola', 'Nashik', 'Pune', 'Satara', 'Solapur'],
  Bihar: ['Patna', 'Muzaffarpur', 'Darbhanga', 'Madhubani', 'Gaya', 'Rohtas'],
  Punjab: ['Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Gurdaspur', 'Hoshiarpur'],
  'Uttar Pradesh': ['Lucknow', 'Kanpur', 'Agra', 'Varanasi', 'Noida', 'Ghaziabad'],
  'Madhya Pradesh': ['Bhopal', 'Indore', 'Jabalpur', 'Gwalior', 'Ujjain', 'Sagar'],
  Karnataka: ['Bangalore', 'Mysore', 'Hubballi', 'Gulbarga', 'Mangalore', 'Belgaum'],
  'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Salem', 'Tiruppur', 'Erode'],
  Rajasthan: ['Jaipur', 'Jodhpur', 'Udaipur', 'Ajmer', 'Bikaner', 'Kota'],
  Gujarat: ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Anand'],
  Haryana: ['Faridabad', 'Gurgaon', 'Hisar', 'Rohtak', 'Panipat', 'Ambala'],
  'Andhra Pradesh': ['Hyderabad', 'Vijayawada', 'Visakhapatnam', 'Tirupati', 'Rajahmundry', 'Nellore'],
  Telangana: ['Hyderabad', 'Secunderabad', 'Warangal', 'Nizamabad', 'Karimnagar', 'Khammam'],
  'West Bengal': ['Kolkata', 'Howrah', 'Darjeeling', 'Jalpaiguri', 'Cooch Behar', 'Malda'],
  Odisha: ['Bhubaneswar', 'Cuttack', 'Rourkela', 'Berhampur', 'Sambalpur', 'Balasore'],
  Assam: ['Guwahati', 'Assam', 'Silchar', 'Dibrughar', 'Tinsukia', 'Nagaon'],
};

export default function RecommendationForm({
  onSuccess,
  onError,
}: RecommendationFormProps) {
  const [formData, setFormData] = useState<RecommendationRequest>({
    nitrogen: 50,
    phosphorus: 45,
    potassium: 40,
    temperature: 25,
    humidity: 70,
    pH: 6.5,
    rainfall: 100,
    state: 'Bihar',
    district: 'Patna',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedState, setSelectedState] = useState('Bihar');

  const handleStateChange = (state: string) => {
    setSelectedState(state);
    const districts = StateDistricts[state] || [];
    setFormData({
      ...formData,
      state,
      district: districts[0] || '',
    });
  };

  const handleInputChange = (
    field: keyof RecommendationRequest,
    value: string | number
  ) => {
    setFormData({
      ...formData,
      [field]: typeof value === 'string' ? parseFloat(value) || value : value,
    });
  };

  const validateForm = (): boolean => {
    if (
      formData.nitrogen < 0 ||
      formData.nitrogen > 200 ||
      formData.phosphorus < 0 ||
      formData.phosphorus > 200 ||
      formData.potassium < 0 ||
      formData.potassium > 200
    ) {
      setError('NPK values must be between 0-200');
      return false;
    }

    if (formData.temperature < -10 || formData.temperature > 60) {
      setError('Temperature must be between -10°C and 60°C');
      return false;
    }

    if (formData.humidity < 0 || formData.humidity > 100) {
      setError('Humidity must be between 0-100%');
      return false;
    }

    if (formData.pH < 0 || formData.pH > 14) {
      setError('pH must be between 0-14');
      return false;
    }

    if (formData.rainfall < 0 || formData.rainfall > 5000) {
      setError('Rainfall must be between 0-5000mm');
      return false;
    }

    if (!formData.state || !formData.district) {
      setError('Please select state and district');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      onError?.(error || 'Validation failed');
      return;
    }

    setLoading(true);
    try {
      const result = await getRecommendations(formData);
      onSuccess?.(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const districts = StateDistricts[selectedState] || [];

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Crop Recommendation Form</h2>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Nitrogen */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nitrogen (kg/ha) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min="0"
            max="200"
            step="0.1"
            value={formData.nitrogen}
            onChange={(e) => handleInputChange('nitrogen', e.target.value)}
            disabled={loading}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
          />
          <p className="text-xs text-gray-500 mt-1">Range: 0-200</p>
        </div>

        {/* Phosphorus */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phosphorus (kg/ha) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min="0"
            max="200"
            step="0.1"
            value={formData.phosphorus}
            onChange={(e) => handleInputChange('phosphorus', e.target.value)}
            disabled={loading}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
          />
          <p className="text-xs text-gray-500 mt-1">Range: 0-200</p>
        </div>

        {/* Potassium */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Potassium (kg/ha) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min="0"
            max="200"
            step="0.1"
            value={formData.potassium}
            onChange={(e) => handleInputChange('potassium', e.target.value)}
            disabled={loading}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
          />
          <p className="text-xs text-gray-500 mt-1">Range: 0-200</p>
        </div>

        {/* Temperature */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Temperature (°C) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min="-10"
            max="60"
            step="0.1"
            value={formData.temperature}
            onChange={(e) => handleInputChange('temperature', e.target.value)}
            disabled={loading}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
          />
          <p className="text-xs text-gray-500 mt-1">Range: -10 to 60</p>
        </div>

        {/* Humidity */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Humidity (%) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min="0"
            max="100"
            step="0.1"
            value={formData.humidity}
            onChange={(e) => handleInputChange('humidity', e.target.value)}
            disabled={loading}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
          />
          <p className="text-xs text-gray-500 mt-1">Range: 0-100</p>
        </div>

        {/* pH */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Soil pH <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min="0"
            max="14"
            step="0.1"
            value={formData.pH}
            onChange={(e) => handleInputChange('pH', e.target.value)}
            disabled={loading}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
          />
          <p className="text-xs text-gray-500 mt-1">Range: 0-14</p>
        </div>

        {/* Rainfall */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rainfall (mm) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min="0"
            max="5000"
            step="0.1"
            value={formData.rainfall}
            onChange={(e) => handleInputChange('rainfall', e.target.value)}
            disabled={loading}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
          />
          <p className="text-xs text-gray-500 mt-1">Range: 0-5000</p>
        </div>

        {/* State */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            State <span className="text-red-500">*</span>
          </label>
          <select
            value={selectedState}
            onChange={(e) => handleStateChange(e.target.value)}
            disabled={loading}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
          >
            {INDIAN_STATES.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
        </div>

        {/* District */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            District <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.district}
            onChange={(e) => handleInputChange('district', e.target.value)}
            disabled={loading}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
          >
            {districts.map((district) => (
              <option key={district} value={district}>
                {district}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Submit Button */}
      <div className="mt-8 flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-6 py-3 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <LoadingSpinner />
              <span>Getting Recommendations...</span>
            </>
          ) : (
            'Get Crop Recommendations'
          )}
        </button>
        <button
          type="reset"
          disabled={loading}
          onClick={() => {
            setFormData({
              nitrogen: 50,
              phosphorus: 45,
              potassium: 40,
              temperature: 25,
              humidity: 70,
              pH: 6.5,
              rainfall: 100,
              state: 'Bihar',
              district: 'Patna',
            });
            setSelectedState('Bihar');
            setError(null);
          }}
          className="px-6 py-3 bg-gray-400 text-white font-medium rounded-md hover:bg-gray-500 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          Reset
        </button>
      </div>

      <p className="text-xs text-gray-500 mt-4">
        <span className="text-red-500">*</span> Required fields
      </p>
    </form>
  );
}
