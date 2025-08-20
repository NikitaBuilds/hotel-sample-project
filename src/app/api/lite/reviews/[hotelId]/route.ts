import { NextRequest, NextResponse } from 'next/server';

const LITE_API_BASE_URL = process.env.LITE_API_BASE_URL || 'https://api.liteapi.travel';
const LITE_API_KEY = process.env.LITE_API_KEY;

if (!LITE_API_KEY) {
  throw new Error('LITE_API_KEY environment variable is required');
}

const headers = {
  'Content-Type': 'application/json',
  'X-API-Key': LITE_API_KEY,
};

interface Review {
  id: string;
  rating: number;
  comment: string;
  author: string;
  date: string;
  verified: boolean;
}

interface ReviewsResponse {
  reviews: Review[];
  hotelId: string;
  totalCount: number;
  averageRating: number;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { hotelId: string } }
) {
  try {
    const hotelId = params.hotelId;
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') || '10';
    const offset = searchParams.get('offset') || '0';

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

    const params_query = new URLSearchParams({
      hotelId,
      limit,
      offset,
    });

    const response = await fetch(
      `${LITE_API_BASE_URL}/data/reviews?${params_query.toString()}`,
      {
        headers,
        next: { revalidate: 1800 }, // Cache for 30 minutes
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        {
          success: false,
          error: {
            code: response.status.toString(),
            message: errorData.message || 'Failed to fetch reviews',
            statusCode: response.status,
          },
        },
        { status: response.status }
      );
    }

    const data: ReviewsResponse = await response.json();

    return NextResponse.json({
      success: true,
      data,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
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
