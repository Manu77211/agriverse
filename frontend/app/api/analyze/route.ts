import { NextRequest, NextResponse } from 'next/server';
import { agent1DataCollector } from '@/lib/agents/agent1DataCollector';
import { AnalysisInput, AnalysisResult, CropRecommendation } from '@/utils/types';

/**
 * Next.js API Orchestration Route (POST /api/analyze)
 * 
 * Forwards requests containing coordinates, weather data, and simulated 
 * hardware inputs (N, P, K, pH, temp, humidity, rain) to the Python FastAPI 
 * ML recommendation engine, returning a finalized ranked advisory.
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const body: AnalysisInput = await request.json();
    const { 
      district, 
      state, 
      acres,
      nitrogen,
      phosphorus,
      potassium,
      ph,
      temperature,
      humidity,
      rainfall
    } = body;
    
    console.log(`\n🌾 === NEXT.JS PORTAL: ANALYSIS STARTED ===`);
    console.log(`📍 Location: ${district}, ${state}`);
    console.log(`📏 Land Size: ${acres} acres`);
    
    if (!district || !state) {
      return NextResponse.json(
        { success: false, error: 'District and state are required' },
        { status: 400 }
      );
    }
    
    // Check if we are in full manual simulation mode
    const isManualSim = 
      nitrogen !== undefined && 
      phosphorus !== undefined && 
      potassium !== undefined && 
      ph !== undefined && 
      temperature !== undefined && 
      humidity !== undefined && 
      rainfall !== undefined;

    let finalN = nitrogen;
    let finalP = phosphorus;
    let finalK = potassium;
    let finalpH = ph;
    let finalTemp = temperature;
    let finalHum = humidity;
    let finalRain = rainfall;
    
    let weatherData = {
      temperature: temperature || 25,
      humidity: humidity || 70,
      rainfall: rainfall || 100,
      season: (body.season || 'Kharif') as 'Kharif' | 'Rabi' | 'Zaid',
      district
    };

    let soilData = {
      type: 'Alluvial Soil',
      pH: ph || 6.5,
      nitrogen: 'Medium' as 'Low' | 'Medium' | 'High',
      phosphorus: 'Medium' as 'Low' | 'Medium' | 'High',
      potassium: 'Medium' as 'Low' | 'Medium' | 'High',
      organicCarbon: 0.5,
      fertility: 'Medium' as 'Low' | 'Medium' | 'High'
    };

    // If any sensor parameters are missing, gather default values from Agent 1 (OpenWeather + Location Soil data)
    if (!isManualSim) {
      console.log('🌍 Fetching environment defaults via Agent 1 (OpenWeather & soil DB)...');
      try {
        const agent1Output = await agent1DataCollector(district, state);
        
        weatherData = agent1Output.weather;
        soilData = agent1Output.soil;

        // Map categorical soil metrics to numerical equivalents for the ML model
        const mapCategory = (val: 'Low' | 'Medium' | 'High', lowVal: number, medVal: number, highVal: number) => {
          if (val === 'Low') return lowVal;
          if (val === 'High') return highVal;
          return medVal;
        };

        if (finalN === undefined) finalN = mapCategory(soilData.nitrogen, 30, 70, 110);
        if (finalP === undefined) finalP = mapCategory(soilData.phosphorus, 35, 55, 85);
        if (finalK === undefined) finalK = mapCategory(soilData.potassium, 20, 35, 65);
        if (finalpH === undefined) finalpH = soilData.pH;
        if (finalTemp === undefined) finalTemp = weatherData.temperature;
        if (finalHum === undefined) finalHum = weatherData.humidity;
        if (finalRain === undefined) finalRain = weatherData.rainfall;

        console.log(`   ✓ Weather fetched: ${finalTemp}°C, ${finalHum}% hum, ${finalRain}mm rain`);
        console.log(`   ✓ Soil properties: ${soilData.type}, pH ${finalpH}`);
      } catch (err) {
        console.warn('⚠️ Environment collector warning:', err);
        // Set fallbacks if API collector fails
        if (finalN === undefined) finalN = 70;
        if (finalP === undefined) finalP = 55;
        if (finalK === undefined) finalK = 35;
        if (finalpH === undefined) finalpH = 6.5;
        if (finalTemp === undefined) finalTemp = 25;
        if (finalHum === undefined) finalHum = 70;
        if (finalRain === undefined) finalRain = 100;
      }
    }

    // Call Python FastAPI recommendation endpoint
    const backendUrl = process.env.BACKEND_URL || 'http://127.0.0.1:8000';
    console.log(`🚀 Contacting Python ML server at: ${backendUrl}/recommendation`);

    const pythonPayload = {
      farm_id: null,
      nitrogen: finalN,
      phosphorus: finalP,
      potassium: finalK,
      temperature: finalTemp,
      humidity: finalHum,
      ph: finalpH,
      rainfall: finalRain,
      state,
      district,
      season: weatherData.season
    };

    const response = await fetch(`${backendUrl}/recommendation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(pythonPayload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Python server error (${response.status}): ${errorText}`);
    }

    const backendResult = await response.json();

    // Map backend response back to frontend CropRecommendation array format
    const recommendations: CropRecommendation[] = backendResult.top_crops.map((crop: any) => {
      const cropNameOnly = crop.crop_name.split(' (')[0];
      return {
        cropName: crop.crop_name, // Includes the variety name in brackets (e.g. Rice (Swarna Sub-1))
        expectedYieldPerAcre: cropNameOnly === 'Sugarcane' ? 320 : cropNameOnly === 'Watermelon' ? 200 : cropNameOnly === 'Potato' ? 140 : cropNameOnly === 'Rice' ? 18 : 12,
        marketPricePerKg: crop.expected_price / 100.0,
        expectedProfitPerAcre: crop.profitability_score,
        reasoning: backendResult.ai_analysis,
        soilSuitability: Math.round(crop.confidence * 100) || 85,
        climateSuitability: Math.round(crop.confidence * 100) || 80,
        marketDemand: cropNameOnly === 'Cotton' || cropNameOnly === 'Lentil' ? 90 : 75,
        growthDuration: cropNameOnly === 'Sugarcane' ? 365 : cropNameOnly === 'Cotton' ? 180 : cropNameOnly === 'Wheat' ? 130 : 100,
        waterRequirement: cropNameOnly === 'Rice' || cropNameOnly === 'Sugarcane' ? 'High' : cropNameOnly === 'Wheat' ? 'Medium' : 'Low'
      };
    });

    const result: AnalysisResult = {
      success: true,
      recommendations,
      weatherData: {
        temperature: Number(finalTemp),
        humidity: Number(finalHum),
        rainfall: Number(finalRain),
        season: weatherData.season,
        district
      },
      soilData: {
        type: soilData.type,
        pH: Number(finalpH),
        nitrogen: finalN! < 45 ? 'Low' : finalN! > 90 ? 'High' : 'Medium',
        phosphorus: finalP! < 40 ? 'Low' : finalP! > 75 ? 'High' : 'Medium',
        potassium: finalK! < 25 ? 'Low' : finalK! > 55 ? 'High' : 'Medium',
        organicCarbon: soilData.organicCarbon,
        fertility: soilData.fertility
      },
      analysisDate: new Date().toISOString(),
      district,
      acres
    };

    const duration = Date.now() - startTime;
    console.log(`✅ PORTAL COMPLETE: Response served in ${duration}ms\n`);
    
    return NextResponse.json(result, { status: 200 });

  } catch (error: any) {
    console.error('❌ Next.js Route Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Analysis failed. Please make sure the Python server is running.'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'online',
    service: 'Krishi Sakhi - Front End API Orchestrator (Proxy to FastAPI Backend)'
  });
}
