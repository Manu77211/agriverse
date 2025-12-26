import { NextResponse } from 'next/server';

/**
 * Health Check Endpoint
 * Used by Docker and load balancers to verify app is running
 */
export async function GET() {
  return NextResponse.json(
    {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'Krishi Sakhi API',
      version: '1.0.0',
    },
    { status: 200 }
  );
}
