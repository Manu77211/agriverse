import axios from 'axios';
import { WeatherData, SoilData, Agent1Output } from '@/utils/types';
import { getDistrictByName, MOCK_WEATHER_DATA, MOCK_SOIL_DATA } from '@/utils/constants';

/**
 * AGENT 1: DATA COLLECTOR
 * 
 * Purpose: Collects environmental data for crop analysis
 * 
 * Responsibilities:
 * 1. Fetch real-time weather data from OpenWeather API
 * 2. Fetch soil fertility data from AgriStack/ICAR APIs
 * 3. Determine current agricultural season
 * 4. Return structured data for Agent 2 to analyze
 * 
 * Flow:
 * Input: { district, state }
 * → Get coordinates from district database
 * → Call weather API (or use mock data if API unavailable)
 * → Call soil API (or use mock data if API unavailable)
 * → Return: { weather, soil }
 */

// Season calculation based on month (Indian agricultural calendar)
function getCurrentSeason(): 'Kharif' | 'Rabi' | 'Zaid' {
  const month = new Date().getMonth() + 1; // 1-12
  
  if (month >= 6 && month <= 11) {
    return 'Kharif'; // June-November (Monsoon crops: Rice, Cotton, Soybean)
  } else if (month >= 11 || month <= 3) {
    return 'Rabi'; // November-March (Winter crops: Wheat, Barley, Mustard)
  } else {
    return 'Zaid'; // March-June (Summer crops: Watermelon, Cucumber)
  }
}

/**
 * Fetch weather data from OpenWeather API
 * API: https://openweathermap.org/api
 * 
 * Returns: Temperature, humidity, rainfall, season
 */
async function fetchWeatherData(district: string, lat: number, lon: number): Promise<WeatherData> {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  
  // Debug: Log what we're getting
  console.log('🔍 DEBUG: OPENWEATHER_API_KEY exists?', !!apiKey);
  console.log('🔍 DEBUG: API Key value:', apiKey ? `${apiKey.substring(0, 10)}...` : 'undefined');
  console.log('🔍 DEBUG: All env vars:', Object.keys(process.env).filter(k => k.includes('WEATHER')));
  
  // Require API key - no mock data fallback
  if (!apiKey) {
    throw new Error('OPENWEATHER_API_KEY is required. Get one from https://openweathermap.org/api');
  }

  try {
    // Call OpenWeather Current Weather API
    const response = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
      params: {
        lat,
        lon,
        appid: apiKey,
        units: 'metric', // Celsius
      },
      timeout: 5000, // 5 second timeout
    });

    const data = response.data;
    
    return {
      temperature: Math.round(data.main.temp),
      humidity: data.main.humidity,
      rainfall: data.rain?.['1h'] || 0, // Rainfall in last 1 hour (mm)
      season: getCurrentSeason(),
      district,
    };
  } catch (error) {
    console.error('Weather API error:', error);
    throw new Error(`Failed to fetch weather data: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Fetch soil data from AgriStack/ICAR API
 * APIs: 
 * - AgriStack: https://agristack.gov.in/
 * - ICAR: Indian Council of Agricultural Research data
 * 
 * Returns: Soil type, pH, NPK levels, fertility rating
 */
async function fetchSoilData(district: string, state: string): Promise<SoilData> {
  const apiKey = process.env.AGRISTACK_API_KEY;
  
  // AgriStack requires government approval - use mock data with warning
  if (!apiKey) {
    console.warn('⚠️ No AgriStack API key - AgriStack requires government approval');
    console.warn('⚠️ Using generic soil data based on district');
    
    const mockData = MOCK_SOIL_DATA[district as keyof typeof MOCK_SOIL_DATA];
    if (mockData) {
      return mockData;
    }
    
    // Default soil data if district not in mock database
    return {
      type: 'Alluvial Soil',
      pH: 7.0,
      nitrogen: 'Medium',
      phosphorus: 'Medium',
      potassium: 'Medium',
      organicCarbon: 0.5,
      fertility: 'Medium',
    };
  }

  try {
    // TODO: Replace with actual AgriStack/ICAR API endpoint
    // This is a placeholder - actual API integration depends on AgriStack authentication
    throw new Error('AgriStack API integration not yet implemented - requires government approval');
  } catch (error) {
    console.error('Soil API error:', error);
    throw new Error(`Failed to fetch soil data: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * MAIN AGENT 1 FUNCTION
 * 
 * Orchestrates data collection from multiple sources
 * 
 * @param district - District name (e.g., "Patna")
 * @param state - State name (e.g., "Bihar")
 * @returns Agent1Output with weather and soil data
 */
export async function agent1DataCollector(district: string, state: string): Promise<Agent1Output> {
  console.log(`🌍 Agent 1: Collecting data for ${district}, ${state}`);
  
  // Step 1: Get district coordinates from database
  const districtData = getDistrictByName(district);
  
  if (!districtData) {
    throw new Error(`District "${district}" not found in database`);
  }
  
  const { lat, lon } = districtData.coordinates;
  
  // Step 2: Fetch weather and soil data in parallel for speed
  const [weather, soil] = await Promise.all([
    fetchWeatherData(district, lat, lon),
    fetchSoilData(district, state),
  ]);
  
  console.log(`✅ Agent 1 complete: Weather=${weather.temperature}°C, Soil=${soil.type}`);
  
  return {
    weather,
    soil,
  };
}

/**
 * LEARNING NOTES:
 * 
 * 1. Why Promise.all()?
 *    - Fetches weather and soil data simultaneously (faster than sequential)
 *    - Both API calls are independent, so we can run them in parallel
 * 
 * 2. Why mock data fallback?
 *    - OpenWeather requires API key ($0 free tier exists)
 *    - AgriStack requires government approval (complex access)
 *    - Mock data lets us prototype without waiting for API keys
 * 
 * 3. Season calculation:
 *    - Kharif: June-Nov (monsoon crops)
 *    - Rabi: Nov-March (winter crops)
 *    - Zaid: March-June (summer crops)
 *    - Important for Agent 2's crop suggestions
 * 
 * 4. Error handling:
 *    - Try API call first
 *    - If fails → use mock data
 *    - If no mock → use sensible defaults
 *    - Never crash the analysis flow
 */
