// Core domain types for Krishi Sakhi

export interface District {
  name: string;
  state: string;
  coordinates: {
    lat: number;
    lon: number;
  };
}

export interface WeatherData {
  temperature: number; // Celsius
  humidity: number; // Percentage
  rainfall: number; // mm
  season: 'Kharif' | 'Rabi' | 'Zaid';
  district: string;
}

export interface SoilData {
  type: string; // Alluvial, Black, Red, Laterite, etc.
  pH: number;
  nitrogen: 'Low' | 'Medium' | 'High';
  phosphorus: 'Low' | 'Medium' | 'High';
  potassium: 'Low' | 'Medium' | 'High';
  organicCarbon: number; // Percentage
  fertility: 'Low' | 'Medium' | 'High';
}

export interface MarketPrice {
  crop: string;
  pricePerKg: number; // Rupees
  mandi: string;
  date: string;
  trend: 'Rising' | 'Falling' | 'Stable';
}

export interface CropRecommendation {
  cropName: string;
  expectedYieldPerAcre: number; // Quintals
  marketPricePerKg: number; // Rupees
  expectedProfitPerAcre: number; // Rupees
  reasoning: string;
  soilSuitability: number; // 0-100 score
  climateSuitability: number; // 0-100 score
  marketDemand: number; // 0-100 score
  growthDuration: number; // Days
  waterRequirement: 'Low' | 'Medium' | 'High';
}

export interface AnalysisInput {
  district: string;
  state: string;
  acres: number;
  season?: 'Kharif' | 'Rabi' | 'Zaid';
}

export interface AnalysisResult {
  success: boolean;
  recommendations: CropRecommendation[];
  weatherData: WeatherData;
  soilData: SoilData;
  analysisDate: string;
  district: string;
  acres: number;
}

export interface Agent1Output {
  weather: WeatherData;
  soil: SoilData;
}

export interface Agent2Output {
  suggestedCrops: string[];
  analysis: string;
}

export interface Agent3Output {
  rankedCrops: CropRecommendation[];
}

// User and history types
export interface User {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  createdAt: string;
}

export interface AnalysisHistory {
  id: string;
  userId: string;
  district: string;
  state: string;
  acres: number;
  result: AnalysisResult;
  createdAt: string;
}

// UI component prop types
export interface CropCardProps {
  crop: CropRecommendation;
  rank: number;
}

export interface AnalyzerFormProps {
  onAnalysisComplete?: (result: AnalysisResult) => void;
}

export interface ChartDataPoint {
  date: string;
  price: number;
  crop: string;
}
