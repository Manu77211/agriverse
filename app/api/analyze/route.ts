import { NextRequest, NextResponse } from 'next/server';
import { agent1DataCollector } from '@/lib/agents/agent1DataCollector';
import { agent2CropAnalyzer } from '@/lib/agents/agent2CropAnalyzer';
import { agent3MarketOptimizer } from '@/lib/agents/agent3MarketOptimizer';
import { AnalysisInput, AnalysisResult } from '@/utils/types';

/**
 * API ORCHESTRATION ROUTE
 * 
 * Endpoint: POST /api/analyze
 * 
 * Purpose: Coordinates all 3 AI agents to provide crop recommendations
 * 
 * Flow:
 * 1. Receive farmer's input (district, state, acres)
 * 2. Run Agent 1: Collect weather + soil data
 * 3. Run Agent 2: Analyze with GPT, suggest crops with biotech varieties
 * 4. Run Agent 3: Fetch market prices, calculate profit, rank crops
 * 5. Combine results and return top 3 recommendations
 * 
 * This is the "conductor" that orchestrates the entire analysis pipeline
 */

/**
 * POST handler for crop analysis
 * 
 * Request Body:
 * {
 *   "district": "Patna",
 *   "state": "Bihar",
 *   "acres": 5
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "recommendations": [... top 3 crops with profit, yield, prices ...],
 *   "weatherData": {...},
 *   "soilData": {...},
 *   "analysisDate": "2025-12-26T10:30:00Z",
 *   "district": "Patna",
 *   "acres": 5
 * }
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Step 1: Parse and validate request body
    const body: AnalysisInput = await request.json();
    const { district, state, acres } = body;
    
    console.log(`\n🌾 === CROP ANALYSIS STARTED ===`);
    console.log(`📍 Location: ${district}, ${state}`);
    console.log(`📏 Land Size: ${acres} acres`);
    console.log(`⏰ Time: ${new Date().toISOString()}\n`);
    
    // Validation
    if (!district || !state) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'District and state are required' 
        },
        { status: 400 }
      );
    }
    
    if (!acres || acres <= 0 || acres > 1000) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Acres must be between 0.1 and 1000' 
        },
        { status: 400 }
      );
    }
    
    // Step 2: Run Agent 1 - Data Collector
    // Collects weather data (OpenWeather API) and soil data (AgriStack)
    console.log('🌍 Step 1/3: Running Agent 1 (Data Collector)...');
    const agent1Output = await agent1DataCollector(district, state);
    
    console.log(`   ✓ Weather: ${agent1Output.weather.temperature}°C, ${agent1Output.weather.humidity}% humidity`);
    console.log(`   ✓ Soil: ${agent1Output.soil.type}, pH ${agent1Output.soil.pH}, Fertility: ${agent1Output.soil.fertility}\n`);
    
    // Step 3: Run Agent 2 - GPT Crop Analyzer
    // Uses OpenAI GPT-4o-mini to suggest crops based on biotech varieties
    console.log('🧬 Step 2/3: Running Agent 2 (GPT Crop Analyzer with Biotech)...');
    const agent2Output = await agent2CropAnalyzer(agent1Output, state);
    
    console.log(`   ✓ Suggested Crops: ${agent2Output.suggestedCrops.join(', ')}`);
    console.log(`   ✓ Analysis: ${agent2Output.analysis.substring(0, 100)}...\n`);
    
    // Step 4: Run Agent 3 - Market Optimizer
    // Fetches mandi prices, calculates profit, ranks by profitability
    console.log('💰 Step 3/3: Running Agent 3 (Market Optimizer)...');
    const agent3Output = await agent3MarketOptimizer(agent1Output, agent2Output);
    
    console.log(`   ✓ Top 3 Crops Ranked:`);
    agent3Output.rankedCrops.forEach((crop, index) => {
      console.log(`      ${index + 1}. ${crop.cropName} - ₹${crop.expectedProfitPerAcre.toLocaleString()}/acre`);
    });
    
    // Step 5: Combine all results into final response
    const result: AnalysisResult = {
      success: true,
      recommendations: agent3Output.rankedCrops,
      weatherData: agent1Output.weather,
      soilData: agent1Output.soil,
      analysisDate: new Date().toISOString(),
      district,
      acres,
    };
    
    const duration = Date.now() - startTime;
    console.log(`\n✅ === ANALYSIS COMPLETE ===`);
    console.log(`⏱️  Total Time: ${duration}ms`);
    console.log(`🏆 Best Crop: ${result.recommendations[0]?.cropName || 'N/A'}`);
    console.log(`💵 Expected Profit: ₹${result.recommendations[0]?.expectedProfitPerAcre.toLocaleString() || 0}/acre\n`);
    
    // Return successful response
    return NextResponse.json(result, { status: 200 });
    
  } catch (error: any) {
    // Error handling
    console.error('❌ API Error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Analysis failed. Please try again.',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

/**
 * GET handler (optional - for API health check)
 * 
 * Usage: GET /api/analyze
 * Returns: API status and available endpoints
 */
export async function GET() {
  return NextResponse.json({
    status: 'online',
    service: 'Krishi Sakhi - Crop Analysis API',
    version: '1.0.0',
    endpoints: {
      analyze: {
        method: 'POST',
        path: '/api/analyze',
        description: 'Get AI-powered crop recommendations',
        requiredFields: ['district', 'state', 'acres'],
      },
    },
    agents: {
      agent1: 'Data Collector (Weather + Soil)',
      agent2: 'GPT Crop Analyzer (Biotechnology)',
      agent3: 'Market Optimizer (Profitability Ranking)',
    },
    timestamp: new Date().toISOString(),
  });
}

/**
 * LEARNING NOTES:
 * 
 * 1. Why NextRequest/NextResponse?
 *    - Next.js 15 uses native Web APIs (Request/Response)
 *    - NextRequest adds Next.js-specific features (cookies, headers)
 *    - NextResponse.json() creates proper JSON responses
 * 
 * 2. Why sequential execution?
 *    - Agent 2 NEEDS Agent 1's output (weather + soil data)
 *    - Agent 3 NEEDS Agent 2's output (crop suggestions)
 *    - Can't run in parallel - it's a dependency chain
 * 
 * 3. Error handling strategy:
 *    - Each agent has internal fallbacks (mock data)
 *    - If any agent fails, error is caught here
 *    - Return 500 status with error message
 *    - In development, include stack trace for debugging
 * 
 * 4. Console logging:
 *    - Helps track progress in real-time
 *    - Shows which agent is running
 *    - Displays key results at each step
 *    - Useful for debugging in production
 * 
 * 5. Validation:
 *    - Check required fields (district, state)
 *    - Validate acres range (0.1 - 1000)
 *    - Return 400 Bad Request if validation fails
 * 
 * 6. Performance tracking:
 *    - startTime/endTime measures total duration
 *    - Typical execution: 2-5 seconds
 *    - Agent 2 (GPT) is usually the slowest (1-3 seconds)
 * 
 * 7. Response structure:
 *    - Always include "success" boolean
 *    - Include all environmental data for display
 *    - Top 3 recommendations with full details
 *    - Timestamp for history tracking
 * 
 * 8. HTTP Methods:
 *    - POST: Main analysis endpoint (mutates/processes data)
 *    - GET: Health check (read-only, returns API info)
 * 
 * 9. Next.js 15 Route Handlers:
 *    - File location: app/api/[route]/route.ts
 *    - Export named functions: GET, POST, PUT, DELETE, etc.
 *    - Runs on server only (has access to env variables)
 *    - Can use async/await for external API calls
 * 
 * 10. Future enhancements:
 *     - Add caching (same district analysis within 1 hour)
 *     - Rate limiting (prevent API abuse)
 *     - Authentication (require user login)
 *     - Save to Supabase (analysis history)
 *     - Webhooks (notify farmer when analysis complete)
 */
