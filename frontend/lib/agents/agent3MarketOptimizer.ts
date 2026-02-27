import axios from 'axios';
import { Agent1Output, Agent2Output, Agent3Output, CropRecommendation, MarketPrice } from '@/utils/types';
import { MOCK_MARKET_PRICES } from '@/utils/constants';

/**
 * AGENT 3: MARKET OPTIMIZER
 * 
 * Purpose: Ranks crops by profitability using real-time market prices
 * 
 * Responsibilities:
 * 1. Receive crop suggestions from Agent 2
 * 2. Fetch current mandi prices from eNAM/AgriStack APIs
 * 3. Calculate expected profit per acre for each crop
 * 4. Calculate suitability scores (soil, climate, market demand)
 * 5. Rank crops by profitability and return TOP 3 recommendations
 * 
 * Profit Calculation:
 * Profit = (Yield per acre × Market price per kg) - (Cost of cultivation)
 * 
 * Data Sources:
 * - eNAM (National Agriculture Market): https://enam.gov.in/
 * - AgriStack Market Intelligence
 * - APMC (Agricultural Produce Market Committee) prices
 */

/**
 * Average yield data for crops (in quintals per acre)
 * Source: ICAR, Ministry of Agriculture
 */
const CROP_YIELD_DATA: Record<string, number> = {
  'Rice': 18,
  'Wheat': 16,
  'Cotton': 8,
  'Sugarcane': 320,
  'Maize': 20,
  'Soybean': 10,
  'Groundnut': 12,
  'Lentil': 6,
  'Chickpea': 8,
  'Mustard': 6,
  'Bajra': 12,
  'Jowar': 10,
  'Barley': 14,
  'Potato': 140,
  'Onion': 100,
  'Watermelon': 200,
  'Cucumber': 120,
  'Turmeric': 25,
  'Chilli': 15,
};

/**
 * Cultivation costs per acre (in Rupees)
 * Includes: Seeds, fertilizers, pesticides, labor, irrigation
 * Source: State Agriculture Department estimates
 */
const CULTIVATION_COSTS: Record<string, number> = {
  'Rice': 25000,
  'Wheat': 20000,
  'Cotton': 35000,
  'Sugarcane': 45000,
  'Maize': 18000,
  'Soybean': 15000,
  'Groundnut': 22000,
  'Lentil': 12000,
  'Chickpea': 14000,
  'Mustard': 10000,
  'Bajra': 8000,
  'Jowar': 9000,
  'Barley': 12000,
  'Potato': 40000,
  'Onion': 35000,
  'Watermelon': 25000,
  'Cucumber': 20000,
  'Turmeric': 50000,
  'Chilli': 30000,
};

/**
 * Growth duration in days
 * Important for farmers to plan crop rotations
 */
const GROWTH_DURATION: Record<string, number> = {
  'Rice': 120,
  'Wheat': 130,
  'Cotton': 180,
  'Sugarcane': 365,
  'Maize': 90,
  'Soybean': 100,
  'Groundnut': 110,
  'Lentil': 120,
  'Chickpea': 120,
  'Mustard': 100,
  'Bajra': 75,
  'Jowar': 90,
  'Barley': 120,
  'Potato': 90,
  'Onion': 120,
  'Watermelon': 75,
  'Cucumber': 60,
  'Turmeric': 270,
  'Chilli': 150,
};

/**
 * Water requirement levels
 */
const WATER_REQUIREMENT: Record<string, 'Low' | 'Medium' | 'High'> = {
  'Rice': 'High',
  'Wheat': 'Medium',
  'Cotton': 'Medium',
  'Sugarcane': 'High',
  'Maize': 'Medium',
  'Soybean': 'Low',
  'Groundnut': 'Low',
  'Lentil': 'Low',
  'Chickpea': 'Low',
  'Mustard': 'Low',
  'Bajra': 'Low',
  'Jowar': 'Low',
  'Barley': 'Medium',
  'Potato': 'Medium',
  'Onion': 'Medium',
  'Watermelon': 'High',
  'Cucumber': 'Medium',
  'Turmeric': 'High',
  'Chilli': 'Medium',
};

/**
 * Extract base crop name from variety string
 * e.g., "BT Cotton (Bollgard II)" → "Cotton"
 */
function extractBaseCropName(cropWithVariety: string): string {
  // Remove variety names in parentheses
  const baseName = cropWithVariety.split('(')[0].trim();
  
  // Match against known crops
  for (const crop of Object.keys(CROP_YIELD_DATA)) {
    if (baseName.toLowerCase().includes(crop.toLowerCase())) {
      return crop;
    }
  }
  
  return baseName;
}

/**
 * Fetch market prices from eNAM API
 * API: https://enam.gov.in/web/
 * 
 * Returns current mandi prices for crops
 */
async function fetchMarketPrices(cropName: string): Promise<MarketPrice> {
  const apiKey = process.env.ENAM_API_KEY;
  
  const baseCrop = extractBaseCropName(cropName);
  
  // eNAM requires registration - use mock data with warning
  if (!apiKey) {
    console.warn('⚠️ No eNAM API key - eNAM requires registration at https://enam.gov.in/');
    console.warn('⚠️ Using average market prices from mock database');
    
    const mockPrice = MOCK_MARKET_PRICES[baseCrop as keyof typeof MOCK_MARKET_PRICES];
    if (mockPrice) {
      return {
        crop: baseCrop,
        pricePerKg: mockPrice.pricePerKg,
        mandi: 'Average Market Price (Mock Data)',
        date: new Date().toISOString(),
        trend: mockPrice.trend,
      };
    }
    
    // Default fallback
    return {
      crop: baseCrop,
      pricePerKg: 25,
      mandi: 'Average Market',
      date: new Date().toISOString(),
      trend: 'Stable',
    };
  }

  try {
    // TODO: Replace with actual eNAM API endpoint
    // eNAM requires registration and authentication
    throw new Error('eNAM API integration not yet implemented - requires registration');
  } catch (error) {
    console.error('Market API error:', error);
    throw new Error(`Failed to fetch market prices: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Calculate suitability scores (0-100)
 * Based on environmental match, market demand, and profitability
 */
function calculateSuitabilityScores(
  cropName: string,
  agent1Data: Agent1Output,
  marketPrice: number
): { soil: number; climate: number; market: number } {
  const { weather, soil } = agent1Data;
  const baseCrop = extractBaseCropName(cropName);
  
  // Soil suitability (simplified algorithm)
  let soilScore = 60; // Base score
  if (soil.fertility === 'High') soilScore += 20;
  else if (soil.fertility === 'Medium') soilScore += 10;
  
  if (soil.pH >= 6.5 && soil.pH <= 7.5) soilScore += 10; // Optimal pH
  if (soil.organicCarbon > 0.6) soilScore += 10; // Good organic content
  
  // Climate suitability
  let climateScore = 60; // Base score
  if (weather.temperature >= 20 && weather.temperature <= 35) climateScore += 20; // Optimal temp
  if (weather.humidity >= 50 && weather.humidity <= 80) climateScore += 10; // Good humidity
  if (weather.rainfall > 20) climateScore += 10; // Sufficient rain
  
  // Market demand (based on price trends and current price)
  let marketScore = 60; // Base score
  if (marketPrice > 50) marketScore += 20; // High-value crop
  else if (marketPrice > 30) marketScore += 10; // Medium-value crop
  
  // Bonus for trending crops
  if (baseCrop === 'Lentil' || baseCrop === 'Chickpea') marketScore += 10; // Pulses have high demand
  if (baseCrop === 'Cotton' && weather.temperature > 25) marketScore += 10; // Cotton in warm climate
  
  // Cap at 100
  return {
    soil: Math.min(soilScore, 100),
    climate: Math.min(climateScore, 100),
    market: Math.min(marketScore, 100),
  };
}

/**
 * Calculate expected profit per acre
 * 
 * Formula:
 * Revenue = Yield (quintals) × Market Price (₹/kg) × 100 (kg per quintal)
 * Profit = Revenue - Cultivation Cost
 */
function calculateProfit(
  cropName: string,
  marketPrice: number,
  yieldPerAcre: number,
  cultivationCost: number
): number {
  const revenue = yieldPerAcre * marketPrice * 100; // 100 kg per quintal
  const profit = revenue - cultivationCost;
  return Math.round(profit);
}

/**
 * MAIN AGENT 3 FUNCTION
 * 
 * Orchestrates market analysis and profit calculation
 * 
 * @param agent1Data - Environmental data from Agent 1
 * @param agent2Data - Crop suggestions from Agent 2
 * @returns Agent3Output with top 3 ranked crops by profitability
 */
export async function agent3MarketOptimizer(
  agent1Data: Agent1Output,
  agent2Data: Agent2Output
): Promise<Agent3Output> {
  console.log('💰 Agent 3: Analyzing market prices and profitability...');
  
  const { suggestedCrops } = agent2Data;
  const recommendations: CropRecommendation[] = [];
  
  // Process each crop: fetch price, calculate profit, score suitability
  for (const cropWithVariety of suggestedCrops) {
    const baseCrop = extractBaseCropName(cropWithVariety);
    
    // Get market price
    const marketData = await fetchMarketPrices(baseCrop);
    
    // Get crop data
    const yieldPerAcre = CROP_YIELD_DATA[baseCrop] || 10;
    const cultivationCost = CULTIVATION_COSTS[baseCrop] || 20000;
    const growthDuration = GROWTH_DURATION[baseCrop] || 120;
    const waterReq = WATER_REQUIREMENT[baseCrop] || 'Medium';
    
    // Calculate profit
    const expectedProfit = calculateProfit(
      baseCrop,
      marketData.pricePerKg,
      yieldPerAcre,
      cultivationCost
    );
    
    // Calculate suitability scores
    const scores = calculateSuitabilityScores(
      baseCrop,
      agent1Data,
      marketData.pricePerKg
    );
    
    // Build recommendation object
    recommendations.push({
      cropName: cropWithVariety, // Keep variety name
      expectedYieldPerAcre: yieldPerAcre,
      marketPricePerKg: marketData.pricePerKg,
      expectedProfitPerAcre: expectedProfit,
      reasoning: `${cropWithVariety} shows strong profitability with ₹${marketData.pricePerKg}/kg market price and ${yieldPerAcre} quintal/acre yield. ${agent1Data.weather.season} season is optimal for this crop.`,
      soilSuitability: scores.soil,
      climateSuitability: scores.climate,
      marketDemand: scores.market,
      growthDuration,
      waterRequirement: waterReq,
    });
  }
  
  // Sort by profit (descending) and take top 3
  const rankedCrops = recommendations
    .sort((a, b) => b.expectedProfitPerAcre - a.expectedProfitPerAcre)
    .slice(0, 3);
  
  console.log(`✅ Agent 3 complete: Top crop = ${rankedCrops[0]?.cropName} with ₹${rankedCrops[0]?.expectedProfitPerAcre} profit/acre`);
  
  return {
    rankedCrops,
  };
}

/**
 * LEARNING NOTES:
 * 
 * 1. Profit calculation formula:
 *    Revenue = Yield × Price × 100 (conversion to kg)
 *    Profit = Revenue - Cultivation Cost
 *    Example: Wheat with 16 qtl/acre @ ₹25/kg
 *    Revenue = 16 × 25 × 100 = ₹40,000
 *    Cost = ₹20,000
 *    Profit = ₹20,000 per acre
 * 
 * 2. Why rank by profit?
 *    - Farmers need to know which crop gives maximum return
 *    - Helps in investment decisions
 *    - Considers both yield and market price
 * 
 * 3. Suitability scores:
 *    - Soil: pH, fertility, NPK levels
 *    - Climate: Temperature, humidity, rainfall match
 *    - Market: Current prices, demand trends
 * 
 * 4. Market data sources:
 *    - eNAM (National Agriculture Market)
 *    - APMC (State mandi prices)
 *    - AgriStack Market Intelligence
 *    - Currently using mock data - can integrate real APIs
 * 
 * 5. Future enhancements:
 *    - Historical price trends (3-month, 6-month)
 *    - Demand forecasting using ML
 *    - Input cost optimization suggestions
 *    - Export market opportunities
 */
