/**
 * API Client for Krishi Sakhi Backend
 * Handles all communication with the FastAPI backend
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface RecommendationRequest {
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  temperature: number;
  humidity: number;
  pH: number;
  rainfall: number;
  state: string;
  district: string;
  farm_id?: string;
  season?: string;
}

export interface CropPrediction {
  crop_name: string;
  confidence: number;
  recommended_variety?: string;
  variety_traits?: string[];
  expected_price?: number;
  profitability_score?: number;
  future_price?: number;
  future_profit?: number;
  price_change_percent?: number;
  price_confidence_range?: {
    lower?: number;
    upper?: number;
  };
}

export interface DerivedMetrics {
  stress_index?: number;
  water_deficit_score?: number;
  salinity_risk?: number;
  disease_probability?: number;
  crop_suitability?: number;
}

export interface RecommendationResponse {
  success: boolean;
  farm_id?: string;
  timestamp: string;
  top_crops: CropPrediction[];
  metrics?: DerivedMetrics;
  irrigation_advisory?: string;
  rotation_advisory?: string;
  ai_analysis?: string;
  model_version?: string;
  data_source?: string;
}

/**
 * Get crop recommendations from the backend
 * @param data - Soil and environmental parameters
 * @returns Recommendation response with top crops and advisories
 */
export async function getRecommendations(
  data: RecommendationRequest
): Promise<RecommendationResponse> {
  try {
    // Map pH (capital P) to ph (lowercase) as per backend schema
    const requestPayload = {
      nitrogen: data.nitrogen,
      phosphorus: data.phosphorus,
      potassium: data.potassium,
      temperature: data.temperature,
      humidity: data.humidity,
      ph: data.pH,
      rainfall: data.rainfall,
      state: data.state,
      district: data.district,
      ...(data.farm_id && { farm_id: data.farm_id }),
      ...(data.season && { season: data.season }),
    };

    const response = await fetch(`${API_BASE_URL}/recommendation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestPayload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.detail || `API Error: ${response.status} ${response.statusText}`
      );
    }

    const result: RecommendationResponse = await response.json();
    return result;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to get recommendations: ${error.message}`);
    }
    throw new Error('Failed to get recommendations: Unknown error');
  }
}

/**
 * Health check endpoint
 * @returns Health status
 */
export async function checkHealth(): Promise<{ status: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`Health check failed: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Health check failed: ${error.message}`);
    }
    throw new Error('Health check failed: Unknown error');
  }
}
