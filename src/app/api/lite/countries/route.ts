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

interface Country {
  code: string;
  name: string;
  currency?: string;
}

interface CountriesResponse {
  countries: Country[];
}

export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`${LITE_API_BASE_URL}/data/countries`, {
      headers,
      next: { revalidate: 86400 }, // Cache for 24 hours - countries rarely change
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        {
          success: false,
          error: {
            code: response.status.toString(),
            message: errorData.message || "Failed to fetch countries",
            statusCode: response.status,
          },
        },
        { status: response.status }
      );
    }

    const data: CountriesResponse = await response.json();

    return NextResponse.json({
      success: true,
      data,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching countries:", error);
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
