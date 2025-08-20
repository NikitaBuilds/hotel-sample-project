import { NextRequest, NextResponse } from 'next/server';
import { HotelDetails } from '@/services/lite/types';

const LITE_API_BASE_URL = process.env.LITE_API_BASE_URL || 'https://api.liteapi.travel';
const LITE_API_KEY = process.env.LITE_API_KEY;

if (!LITE_API_KEY) {
  throw new Error('LITE_API_KEY environment variable is required');
}

const headers = {
  'Content-Type': 'application/json',
  'X-API-Key': LITE_API_KEY,
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') || '50';
    const offset = searchParams.get('offset') || '0';
    const countryCode = searchParams.get('countryCode');
    const cityName = searchParams.get('cityName');

    // Build query parameters
    const params = new URLSearchParams({
      limit,
      offset,
    });

    if (countryCode) params.append('countryCode', countryCode);
    if (cityName) params.append('cityName', cityName);

    const response = await fetch(
      `${LITE_API_BASE_URL}/data/hotels?${params.toString()}`,
      {
        headers,
        next: { revalidate: 3600 }, // Cache for 1 hour
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        {
          success: false,
          error: {
            code: response.status.toString(),
            message: errorData.message || 'Failed to fetch hotels',
            statusCode: response.status,
          },
        },
        { status: response.status }
      );
    }

    const data: HotelDetails[] = await response.json();

    return NextResponse.json({
      success: true,
      data,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching hotels:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Internal server error',
          statusCode: 500,
        },
      },
      { status: 500 }
    );
  }
}
