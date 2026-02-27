import { GoogleGenerativeAI } from '@google/generative-ai';
import { Agent1Output, Agent2Output, WeatherData, SoilData } from '@/utils/types';
import { INDIAN_CROPS } from '@/utils/constants';

/**
 * AGENT 2: GEMINI CROP ANALYZER WITH BIOTECHNOLOGY
 * 
 * Purpose: Uses AI to analyze environmental data and suggest optimal crops
 * 
 * Responsibilities:
 * 1. Receive weather & soil data from Agent 1
 * 2. Use Google Gemini AI to analyze biotechnology and crop suitability
 * 3. Consider modern biotech varieties (BT Cotton, drought-resistant wheat, etc.)
 * 4. Suggest top 5 crops best suited for the climate and soil
 * 5. Return crop list with reasoning for Agent 3 to rank by profit
 * 
 * Biotech Integration:
 * - Considers climate-resilient varieties (drought-tolerant, flood-resistant)
 * - Includes high-yield varieties from ICAR research
 * - Factors in pest-resistant crops (BT crops)
 * - Recommends region-specific improved varieties
 */

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

/**
 * Biotech Crop Varieties Database
 * Source: ICAR, State Agricultural Universities, Krishi Vigyan Kendras
 * 
 * This database includes modern improved varieties with special traits
 */
const BIOTECH_VARIETIES = {
  Cotton: [
    { name: 'BT Cotton (Bollgard II)', traits: ['Pest-resistant', 'High yield'], regions: ['Maharashtra', 'Gujarat', 'Telangana'] },
    { name: 'Hybrid Cotton DCH-32', traits: ['Drought-tolerant', 'Long staple'], regions: ['Punjab', 'Haryana'] },
  ],
  Wheat: [
    { name: 'HD-3086 (Pusa Wheat)', traits: ['High yield', 'Disease-resistant'], regions: ['Punjab', 'Haryana', 'UP'] },
    { name: 'DBW-187', traits: ['Heat-tolerant', 'Early maturing'], regions: ['Rajasthan', 'MP'] },
    { name: 'PBW-725', traits: ['Rust-resistant', 'High protein'], regions: ['Punjab', 'Haryana'] },
  ],
  Rice: [
    { name: 'Swarna Sub-1 (Flood-tolerant)', traits: ['Submergence-tolerant', 'High yield'], regions: ['Bihar', 'Odisha', 'West Bengal'] },
    { name: 'Pusa Basmati 1121', traits: ['Premium quality', 'Long grain'], regions: ['Punjab', 'Haryana'] },
    { name: 'IR-64 (Drought-tolerant)', traits: ['Water-efficient', 'Stable yield'], regions: ['Tamil Nadu', 'AP'] },
  ],
  Maize: [
    { name: 'DHM-117 (Hybrid)', traits: ['High yield', 'Disease-resistant'], regions: ['Karnataka', 'AP'] },
    { name: 'NK-6240 (Drought-tolerant)', traits: ['Water-efficient', 'Heat-tolerant'], regions: ['Rajasthan', 'MP'] },
  ],
  Sugarcane: [
    { name: 'Co-0238 (High sugar)', traits: ['High sucrose', 'Disease-resistant'], regions: ['Maharashtra', 'UP'] },
    { name: 'CoS-767 (Early maturing)', traits: ['Short duration', 'Drought-tolerant'], regions: ['Karnataka', 'Tamil Nadu'] },
  ],
  Soybean: [
    { name: 'JS-335', traits: ['High yield', 'Disease-resistant'], regions: ['MP', 'Maharashtra'] },
    { name: 'RKS-18 (Drought-tolerant)', traits: ['Water-efficient', 'Early maturing'], regions: ['Rajasthan', 'Gujarat'] },
  ],
  Lentil: [
    { name: 'Pusa Vaibhav', traits: ['High yield', 'Wilt-resistant'], regions: ['UP', 'MP', 'Bihar'] },
    { name: 'IPL-220', traits: ['Early maturing', 'Bold grain'], regions: ['Rajasthan', 'Haryana'] },
  ],
  Chickpea: [
    { name: 'Pusa 362', traits: ['Wilt-resistant', 'High yield'], regions: ['MP', 'Maharashtra'] },
    { name: 'JG-11 (Kabuli type)', traits: ['Premium quality', 'Export grade'], regions: ['Rajasthan', 'Karnataka'] },
  ],
  Mustard: [
    { name: 'Pusa Bold', traits: ['High oil content', 'Early maturing'], regions: ['Rajasthan', 'Haryana'] },
    { name: 'RH-30 (Hybrid)', traits: ['High yield', 'Disease-resistant'], regions: ['UP', 'MP'] },
  ],
  Groundnut: [
    { name: 'TAG-24', traits: ['Drought-tolerant', 'High oil'], regions: ['Gujarat', 'Rajasthan'] },
    { name: 'Kadiri-9', traits: ['Early maturing', 'Disease-resistant'], regions: ['AP', 'Karnataka'] },
  ],
};

/**
 * Build GPT prompt with biotech context
 * 
 * The prompt includes:
 * - Weather and soil data from Agent 1
 * - Current agricultural season
 * - Biotech variety database for the region
 * - Instructions to prioritize climate-resilient varieties
 */
function buildBiotechPrompt(weather: WeatherData, soil: SoilData, state: string): string {
  // Get relevant biotech varieties for the region (simplified)
  const relevantVarieties = Object.entries(BIOTECH_VARIETIES)
    .map(([crop, varieties]) => {
      const regionalVarieties = varieties.filter(v => 
        v.regions.some(r => state.toLowerCase().includes(r.toLowerCase()))
      );
      if (regionalVarieties.length > 0) {
        return `${crop}: ${regionalVarieties[0].name}`;
      }
      return null;
    })
    .filter(Boolean)
    .join(', ');

  return `Recommend 5 crops for:
Location: ${weather.district}, ${state}
Temp: ${weather.temperature}°C, Humidity: ${weather.humidity}%, Rain: ${weather.rainfall}mm
Season: ${weather.season}
Soil: ${soil.type}, pH ${soil.pH}, ${soil.fertility} fertility

Available biotech: ${relevantVarieties || 'standard varieties'}

Return JSON only:
{
  "crops": ["Crop1 (Variety)", "Crop2", "Crop3", "Crop4", "Crop5"],
  "reasoning": "One short sentence"
}`;
}

/**
 * MAIN AGENT 2 FUNCTION
 * 
 * Uses Google Gemini to analyze data and suggest crops with biotech consideration
 * 
 * @param agent1Data - Output from Agent 1 (weather + soil)
 * @param state - State name for regional variety matching
 * @returns Agent2Output with crop suggestions and reasoning
 */
export async function agent2CropAnalyzer(
  agent1Data: Agent1Output,
  state: string
): Promise<Agent2Output> {
  console.log('🧬 Agent 2: Analyzing crops with Gemini AI and biotechnology data...');
  
  const { weather, soil } = agent1Data;
  const apiKey = process.env.GEMINI_API_KEY;
  
  // Require Gemini API key - no fallback
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is required. Get one from https://aistudio.google.com/app/apikey');
  }

  try {
    const prompt = buildBiotechPrompt(weather, soil, state);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    const result = await model.generateContent({
      contents: [{
        role: 'user',
        parts: [{ text: `You are an expert agricultural biotechnologist specializing in Indian farming and climate-resilient crop varieties.\n\n${prompt}\n\nRespond with valid JSON only.` }]
      }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
        responseMimeType: 'application/json',
      },
    });

    const response = result.response;
    console.log('🔍 Finish reason:', response.candidates?.[0]?.finishReason);
    console.log('🔍 Safety ratings:', JSON.stringify(response.candidates?.[0]?.safetyRatings));
    
    const responseText = response.text();
    
    console.log('🔍 Gemini full response:', responseText);
    console.log('🔍 Response length:', responseText.length);
    
    // Check if response is incomplete
    if (!responseText || responseText.length < 100) {
      throw new Error(`Gemini returned incomplete response (${responseText.length} chars). Finish reason: ${response.candidates?.[0]?.finishReason}`);
    }
    
    // Clean the response - remove markdown code blocks if present
    let cleanedText = responseText.trim();
    if (cleanedText.startsWith('```json')) {
      cleanedText = cleanedText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    
    const parsed = JSON.parse(cleanedText);
    
    console.log(`✅ Agent 2 complete: Suggested ${parsed.crops?.length || 0} crops with biotech varieties`);
    
    return {
      suggestedCrops: parsed.crops || [],
      analysis: parsed.reasoning || 'Crops selected based on climate and soil suitability',
    };
  } catch (error) {
    console.error('Gemini API error:', error);
    throw new Error(`Failed to analyze crops with Gemini: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Fallback crop selection (rule-based algorithm)
 * Used when OpenAI API is unavailable
 * 
 * Logic:
 * 1. Filter crops by season
 * 2. Match soil type compatibility
 * 3. Check temperature range
 * 4. Select top 5 with biotech varieties
 */
function fallbackCropSelection(weather: WeatherData, soil: SoilData, state: string): Agent2Output {
  const seasonCrops = INDIAN_CROPS[weather.season] || [];
  
  // Simple rule-based selection with biotech preference
  const selectedCrops: string[] = [];
  
  // Add crops based on soil and climate
  if (soil.type.includes('Alluvial') || soil.fertility === 'High') {
    selectedCrops.push('Wheat (HD-3086)', 'Rice (Swarna Sub-1)', 'Sugarcane (Co-0238)');
  }
  if (soil.type.includes('Black') && weather.temperature > 25) {
    selectedCrops.push('Cotton (BT Bollgard II)', 'Soybean (JS-335)');
  }
  if (weather.rainfall < 30) {
    selectedCrops.push('Maize (NK-6240 Drought-tolerant)', 'Groundnut (TAG-24)');
  }
  if (weather.season === 'Rabi') {
    selectedCrops.push('Chickpea (Pusa 362)', 'Lentil (Pusa Vaibhav)', 'Mustard (Pusa Bold)');
  }
  
  // Remove duplicates and take top 5
  const uniqueCrops = Array.from(new Set(selectedCrops)).slice(0, 5);
  
  return {
    suggestedCrops: uniqueCrops.length > 0 ? uniqueCrops : seasonCrops.slice(0, 5),
    analysis: `Selected crops based on ${soil.type}, ${weather.season} season, and temperature ${weather.temperature}°C. Biotech varieties included for better yield and climate resilience.`,
  };
}

/**
 * LEARNING NOTES:
 * 
 * 1. Why biotechnology matters:
 *    - BT Cotton: 30-40% higher yield, 80% less pesticide use
 *    - Swarna Sub-1 Rice: Survives 14 days underwater (flood-prone areas)
 *    - Drought-tolerant varieties: Save 30-40% water
 *    - Disease-resistant varieties: Reduce crop loss by 20-30%
 * 
 * 2. GPT prompt engineering:
 *    - Include all environmental data
 *    - Provide biotech variety database
 *    - Ask for specific variety names
 *    - Request JSON format for easy parsing
 * 
 * 3. Regional variety matching:
 *    - Each variety is tested for specific agro-climatic zones
 *    - Punjab varieties may not work in Tamil Nadu
 *    - We filter by state to show relevant options
 * 
 * 4. Fallback logic:
 *    - If OpenAI fails, use rule-based algorithm
 *    - Still includes biotech varieties
 *    - Never crashes the analysis flow
 * 
 * 5. Future API integration:
 *    - ICAR variety database: https://www.icar.org.in/
 *    - State Agricultural Universities publish variety catalogs
 *    - Krishi Vigyan Kendras maintain local variety data
 */
