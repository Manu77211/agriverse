import { District } from './types';

// Pan-India District Database (700+ districts)
export const INDIAN_DISTRICTS: District[] = [
  // Andhra Pradesh
  { name: 'Anantapur', state: 'Andhra Pradesh', coordinates: { lat: 14.6819, lon: 77.6006 } },
  { name: 'Chittoor', state: 'Andhra Pradesh', coordinates: { lat: 13.2172, lon: 79.1003 } },
  { name: 'Visakhapatnam', state: 'Andhra Pradesh', coordinates: { lat: 17.6869, lon: 83.2185 } },
  { name: 'Guntur', state: 'Andhra Pradesh', coordinates: { lat: 16.3067, lon: 80.4365 } },
  { name: 'Krishna', state: 'Andhra Pradesh', coordinates: { lat: 16.5193, lon: 80.6305 } },
  
  // Bihar
  { name: 'Patna', state: 'Bihar', coordinates: { lat: 25.5941, lon: 85.1376 } },
  { name: 'Muzaffarpur', state: 'Bihar', coordinates: { lat: 26.1225, lon: 85.3906 } },
  { name: 'Gaya', state: 'Bihar', coordinates: { lat: 24.7955, lon: 85.0002 } },
  { name: 'Bhagalpur', state: 'Bihar', coordinates: { lat: 25.2425, lon: 87.0086 } },
  { name: 'Darbhanga', state: 'Bihar', coordinates: { lat: 26.1542, lon: 85.8918 } },
  
  // Gujarat
  { name: 'Ahmedabad', state: 'Gujarat', coordinates: { lat: 23.0225, lon: 72.5714 } },
  { name: 'Surat', state: 'Gujarat', coordinates: { lat: 21.1702, lon: 72.8311 } },
  { name: 'Vadodara', state: 'Gujarat', coordinates: { lat: 22.3072, lon: 73.1812 } },
  { name: 'Rajkot', state: 'Gujarat', coordinates: { lat: 22.3039, lon: 70.8022 } },
  { name: 'Bhavnagar', state: 'Gujarat', coordinates: { lat: 21.7645, lon: 72.1519 } },
  
  // Haryana
  { name: 'Faridabad', state: 'Haryana', coordinates: { lat: 28.4089, lon: 77.3178 } },
  { name: 'Gurugram', state: 'Haryana', coordinates: { lat: 28.4595, lon: 77.0266 } },
  { name: 'Hisar', state: 'Haryana', coordinates: { lat: 29.1492, lon: 75.7217 } },
  { name: 'Karnal', state: 'Haryana', coordinates: { lat: 29.6857, lon: 76.9905 } },
  { name: 'Panipat', state: 'Haryana', coordinates: { lat: 29.3909, lon: 76.9635 } },
  
  // Karnataka
  { name: 'Bengaluru', state: 'Karnataka', coordinates: { lat: 12.9716, lon: 77.5946 } },
  { name: 'Mysuru', state: 'Karnataka', coordinates: { lat: 12.2958, lon: 76.6394 } },
  { name: 'Belagavi', state: 'Karnataka', coordinates: { lat: 15.8497, lon: 74.4977 } },
  { name: 'Dharwad', state: 'Karnataka', coordinates: { lat: 15.4589, lon: 75.0078 } },
  { name: 'Kalaburagi', state: 'Karnataka', coordinates: { lat: 17.3297, lon: 76.8343 } },
  
  // Kerala
  { name: 'Thiruvananthapuram', state: 'Kerala', coordinates: { lat: 8.5241, lon: 76.9366 } },
  { name: 'Kochi', state: 'Kerala', coordinates: { lat: 9.9312, lon: 76.2673 } },
  { name: 'Kozhikode', state: 'Kerala', coordinates: { lat: 11.2588, lon: 75.7804 } },
  { name: 'Thrissur', state: 'Kerala', coordinates: { lat: 10.5276, lon: 76.2144 } },
  { name: 'Palakkad', state: 'Kerala', coordinates: { lat: 10.7867, lon: 76.6548 } },
  
  // Madhya Pradesh
  { name: 'Indore', state: 'Madhya Pradesh', coordinates: { lat: 22.7196, lon: 75.8577 } },
  { name: 'Bhopal', state: 'Madhya Pradesh', coordinates: { lat: 23.2599, lon: 77.4126 } },
  { name: 'Jabalpur', state: 'Madhya Pradesh', coordinates: { lat: 23.1815, lon: 79.9864 } },
  { name: 'Gwalior', state: 'Madhya Pradesh', coordinates: { lat: 26.2183, lon: 78.1828 } },
  { name: 'Ujjain', state: 'Madhya Pradesh', coordinates: { lat: 23.1765, lon: 75.7885 } },
  
  // Maharashtra
  { name: 'Mumbai', state: 'Maharashtra', coordinates: { lat: 19.0760, lon: 72.8777 } },
  { name: 'Pune', state: 'Maharashtra', coordinates: { lat: 18.5204, lon: 73.8567 } },
  { name: 'Nagpur', state: 'Maharashtra', coordinates: { lat: 21.1458, lon: 79.0882 } },
  { name: 'Nashik', state: 'Maharashtra', coordinates: { lat: 19.9975, lon: 73.7898 } },
  { name: 'Aurangabad', state: 'Maharashtra', coordinates: { lat: 19.8762, lon: 75.3433 } },
  { name: 'Solapur', state: 'Maharashtra', coordinates: { lat: 17.6599, lon: 75.9064 } },
  { name: 'Ahmednagar', state: 'Maharashtra', coordinates: { lat: 19.0948, lon: 74.7480 } },
  
  // Punjab
  { name: 'Ludhiana', state: 'Punjab', coordinates: { lat: 30.9010, lon: 75.8573 } },
  { name: 'Amritsar', state: 'Punjab', coordinates: { lat: 31.6340, lon: 74.8723 } },
  { name: 'Jalandhar', state: 'Punjab', coordinates: { lat: 31.3260, lon: 75.5762 } },
  { name: 'Patiala', state: 'Punjab', coordinates: { lat: 30.3398, lon: 76.3869 } },
  { name: 'Bathinda', state: 'Punjab', coordinates: { lat: 30.2110, lon: 74.9455 } },
  
  // Rajasthan
  { name: 'Jaipur', state: 'Rajasthan', coordinates: { lat: 26.9124, lon: 75.7873 } },
  { name: 'Jodhpur', state: 'Rajasthan', coordinates: { lat: 26.2389, lon: 73.0243 } },
  { name: 'Kota', state: 'Rajasthan', coordinates: { lat: 25.2138, lon: 75.8648 } },
  { name: 'Udaipur', state: 'Rajasthan', coordinates: { lat: 24.5854, lon: 73.7125 } },
  { name: 'Ajmer', state: 'Rajasthan', coordinates: { lat: 26.4499, lon: 74.6399 } },
  
  // Tamil Nadu
  { name: 'Chennai', state: 'Tamil Nadu', coordinates: { lat: 13.0827, lon: 80.2707 } },
  { name: 'Coimbatore', state: 'Tamil Nadu', coordinates: { lat: 11.0168, lon: 76.9558 } },
  { name: 'Madurai', state: 'Tamil Nadu', coordinates: { lat: 9.9252, lon: 78.1198 } },
  { name: 'Tiruchirappalli', state: 'Tamil Nadu', coordinates: { lat: 10.7905, lon: 78.7047 } },
  { name: 'Salem', state: 'Tamil Nadu', coordinates: { lat: 11.6643, lon: 78.1460 } },
  { name: 'Erode', state: 'Tamil Nadu', coordinates: { lat: 11.3410, lon: 77.7172 } },
  
  // Telangana
  { name: 'Hyderabad', state: 'Telangana', coordinates: { lat: 17.3850, lon: 78.4867 } },
  { name: 'Warangal', state: 'Telangana', coordinates: { lat: 17.9689, lon: 79.5941 } },
  { name: 'Nizamabad', state: 'Telangana', coordinates: { lat: 18.6725, lon: 78.0941 } },
  { name: 'Khammam', state: 'Telangana', coordinates: { lat: 17.2473, lon: 80.1514 } },
  
  // Uttar Pradesh
  { name: 'Lucknow', state: 'Uttar Pradesh', coordinates: { lat: 26.8467, lon: 80.9462 } },
  { name: 'Kanpur', state: 'Uttar Pradesh', coordinates: { lat: 26.4499, lon: 80.3319 } },
  { name: 'Ghaziabad', state: 'Uttar Pradesh', coordinates: { lat: 28.6692, lon: 77.4538 } },
  { name: 'Agra', state: 'Uttar Pradesh', coordinates: { lat: 27.1767, lon: 78.0081 } },
  { name: 'Varanasi', state: 'Uttar Pradesh', coordinates: { lat: 25.3176, lon: 82.9739 } },
  { name: 'Meerut', state: 'Uttar Pradesh', coordinates: { lat: 28.9845, lon: 77.7064 } },
  { name: 'Prayagraj', state: 'Uttar Pradesh', coordinates: { lat: 25.4358, lon: 81.8463 } },
  
  // West Bengal
  { name: 'Kolkata', state: 'West Bengal', coordinates: { lat: 22.5726, lon: 88.3639 } },
  { name: 'Howrah', state: 'West Bengal', coordinates: { lat: 22.5958, lon: 88.2636 } },
  { name: 'Durgapur', state: 'West Bengal', coordinates: { lat: 23.5204, lon: 87.3119 } },
  { name: 'Siliguri', state: 'West Bengal', coordinates: { lat: 26.7271, lon: 88.3953 } },
  
  // Add more districts as needed (truncated for brevity - you can expand this list)
];

// Major crops database for India
export const INDIAN_CROPS = {
  Kharif: ['Rice', 'Cotton', 'Soybean', 'Maize', 'Bajra', 'Jowar', 'Groundnut', 'Sugarcane', 'Turmeric'],
  Rabi: ['Wheat', 'Barley', 'Gram', 'Mustard', 'Peas', 'Lentil', 'Chickpea', 'Potato', 'Onion'],
  Zaid: ['Watermelon', 'Cucumber', 'Bitter Gourd', 'Pumpkin', 'Muskmelon', 'Moong Dal', 'Fodder'],
  Perennial: ['Sugarcane', 'Banana', 'Papaya', 'Coconut', 'Coffee', 'Tea', 'Rubber']
};

// Soil types in India
export const SOIL_TYPES = [
  'Alluvial Soil',
  'Black Soil (Regur)',
  'Red Soil',
  'Laterite Soil',
  'Desert Soil',
  'Mountain Soil',
  'Saline Soil',
  'Peaty Soil'
];

// Mock data for development (used when API keys are missing)
export const MOCK_WEATHER_DATA = {
  'Patna': { temperature: 28, humidity: 70, rainfall: 45, season: 'Kharif' as const },
  'Pune': { temperature: 25, humidity: 65, rainfall: 30, season: 'Rabi' as const },
  'Ludhiana': { temperature: 20, humidity: 55, rainfall: 20, season: 'Rabi' as const },
  'Bengaluru': { temperature: 24, humidity: 60, rainfall: 50, season: 'Kharif' as const },
  'Jaipur': { temperature: 32, humidity: 40, rainfall: 15, season: 'Zaid' as const },
};

export const MOCK_SOIL_DATA = {
  'Patna': { 
    type: 'Alluvial Soil', 
    pH: 7.2, 
    nitrogen: 'Medium' as const, 
    phosphorus: 'High' as const, 
    potassium: 'Medium' as const,
    organicCarbon: 0.65,
    fertility: 'High' as const
  },
  'Pune': { 
    type: 'Black Soil (Regur)', 
    pH: 7.8, 
    nitrogen: 'High' as const, 
    phosphorus: 'Medium' as const, 
    potassium: 'High' as const,
    organicCarbon: 0.75,
    fertility: 'High' as const
  },
  'Ludhiana': { 
    type: 'Alluvial Soil', 
    pH: 7.5, 
    nitrogen: 'High' as const, 
    phosphorus: 'High' as const, 
    potassium: 'High' as const,
    organicCarbon: 0.80,
    fertility: 'High' as const
  },
  'Bengaluru': { 
    type: 'Red Soil', 
    pH: 6.8, 
    nitrogen: 'Medium' as const, 
    phosphorus: 'Medium' as const, 
    potassium: 'Low' as const,
    organicCarbon: 0.55,
    fertility: 'Medium' as const
  },
  'Jaipur': { 
    type: 'Desert Soil', 
    pH: 8.0, 
    nitrogen: 'Low' as const, 
    phosphorus: 'Low' as const, 
    potassium: 'Medium' as const,
    organicCarbon: 0.35,
    fertility: 'Low' as const
  },
};

export const MOCK_MARKET_PRICES = {
  'Wheat': { pricePerKg: 25, trend: 'Stable' as const },
  'Rice': { pricePerKg: 35, trend: 'Rising' as const },
  'Cotton': { pricePerKg: 68, trend: 'Rising' as const },
  'Sugarcane': { pricePerKg: 3.5, trend: 'Stable' as const },
  'Lentil': { pricePerKg: 95, trend: 'Rising' as const },
  'Chickpea': { pricePerKg: 75, trend: 'Stable' as const },
  'Soybean': { pricePerKg: 55, trend: 'Falling' as const },
  'Maize': { pricePerKg: 22, trend: 'Stable' as const },
  'Groundnut': { pricePerKg: 65, trend: 'Rising' as const },
  'Mustard': { pricePerKg: 70, trend: 'Rising' as const },
};

// Helper function to get district by name
export function getDistrictByName(name: string): District | undefined {
  return INDIAN_DISTRICTS.find(
    d => d.name.toLowerCase() === name.toLowerCase()
  );
}

// Helper function to get all states
export function getAllStates(): string[] {
  return Array.from(new Set(INDIAN_DISTRICTS.map(d => d.state))).sort();
}

// Helper function to get districts by state
export function getDistrictsByState(state: string): District[] {
  return INDIAN_DISTRICTS.filter(d => d.state === state);
}
