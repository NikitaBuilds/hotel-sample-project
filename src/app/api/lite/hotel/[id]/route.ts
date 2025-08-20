import { NextRequest, NextResponse } from 'next/server';
import { HotelDetailsResponse } from '@/services/lite/types';

const LITE_API_BASE_URL = process.env.LITE_API_BASE_URL || 'https://api.liteapi.travel';
const LITE_API_KEY = process.env.LITE_API_KEY;

if (!LITE_API_KEY) {
  throw new Error('LITE_API_KEY environment variable is required');
}

const headers = {
  'Content-Type': 'application/json',
  'X-API-Key': LITE_API_KEY,
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const hotelId = id;

    if (!hotelId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'MISSING_HOTEL_ID',
            message: 'Hotel ID is required',
            statusCode: 400,
          },
        },
        { status: 400 }
      );
    }

    const response = await fetch(
      `${LITE_API_BASE_URL}/data/hotel?hotelId=${hotelId}`,
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
            message: errorData.message || 'Failed to fetch hotel details',
            statusCode: response.status,
          },
        },
        { status: response.status }
      );
    }

    const data: HotelDetailsResponse = await response.json();

    return NextResponse.json({
      success: true,
      data,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching hotel details:', error);
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
