import { NextRequest, NextResponse } from "next/server";

const LITE_API_BASE_URL =
  process.env.LITE_API_BASE_URL || "https://api.liteapi.travel";
const LITE_API_KEY = process.env.LITE_API_KEY;

if (!LITE_API_KEY) {
  throw new Error("LITE_API_KEY environment variable is required");
}

const headers = {
  "Content-Type": "application/json",
  "X-API-Key": LITE_API_KEY,
};

interface City {
  id: string;
  name: string;
  countryCode: string;
  latitude?: number;
  longitude?: number;
}

interface CitiesResponse {
  cities: City[];
  country: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { country: string } }
) {
  try {
    const countryCode = params.country;

    if (!countryCode) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "MISSING_COUNTRY_CODE",
            message: "Country code is required",
            statusCode: 400,
          },
        },
        { status: 400 }
      );
    }

    const response = await fetch(
      `${LITE_API_BASE_URL}/data/cities?countryCode=${countryCode}`,
      {
        headers,
        next: { revalidate: 86400 }, // Cache for 24 hours - cities rarely change
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        {
          success: false,
          error: {
            code: response.status.toString(),
            message: errorData.message || "Failed to fetch cities",
            statusCode: response.status,
          },
        },
        { status: response.status }
      );
    }

    const data: CitiesResponse = await response.json();

    return NextResponse.json({
      success: true,
      data,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching cities:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Internal server error",
          statusCode: 500,
        },
      },
      { status: 500 }
    );
  }
}
