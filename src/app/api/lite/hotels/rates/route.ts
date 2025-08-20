import { NextRequest, NextResponse } from "next/server";
import {
  SearchRequest,
  SearchResponse,
  LiteAPIRawResponse,
} from "@/services/lite/types";

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

export async function POST(request: NextRequest) {
  try {
    console.log("🔑 API Key Status:", LITE_API_KEY ? "✅ Set" : "❌ Missing");
    console.log("🌐 API Base URL:", LITE_API_BASE_URL);

    const body: SearchRequest = await request.json();
    console.log("🔍 Hotel Search Request:", JSON.stringify(body, null, 2));

    // Validate required fields
    if (
      !body.checkin ||
      !body.checkout ||
      !body.currency ||
      !body.guestNationality ||
      !body.occupancies
    ) {
      console.error("❌ Validation Error: Missing required fields", {
        checkin: !!body.checkin,
        checkout: !!body.checkout,
        currency: !!body.currency,
        guestNationality: !!body.guestNationality,
        occupancies: !!body.occupancies,
      });
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "MISSING_REQUIRED_FIELDS",
            message:
              "Missing required fields: checkin, checkout, currency, guestNationality, occupancies",
            statusCode: 400,
          },
        },
        { status: 400 }
      );
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(body.checkin) || !dateRegex.test(body.checkout)) {
      console.error("❌ Validation Error: Invalid date format", {
        checkin: body.checkin,
        checkout: body.checkout,
        checkinValid: dateRegex.test(body.checkin),
        checkoutValid: dateRegex.test(body.checkout),
      });
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_DATE_FORMAT",
            message: "Dates must be in YYYY-MM-DD format",
            statusCode: 400,
          },
        },
        { status: 400 }
      );
    }

    // Validate checkin is before checkout
    if (new Date(body.checkin) >= new Date(body.checkout)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_DATE_RANGE",
            message: "Check-in date must be before check-out date",
            statusCode: 400,
          },
        },
        { status: 400 }
      );
    }

    const response = await fetch(`${LITE_API_BASE_URL}/hotels/rates`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      // No caching for search results as they're dynamic and time-sensitive
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("❌ LiteAPI Error Response:", {
        status: response.status,
        statusText: response.statusText,
        errorData,
        url: `${LITE_API_BASE_URL}/hotels/rates`,
      });
      return NextResponse.json(
        {
          success: false,
          error: {
            code: response.status.toString(),
            message: errorData.message || "Failed to search hotel rates",
            statusCode: response.status,
          },
        },
        { status: response.status }
      );
    }

    const rawData: LiteAPIRawResponse = await response.json();
    console.log("✅ LiteAPI Success Response:", {
      totalResults: rawData.data?.length || 0,
      hotelsCount: rawData.hotels?.length || 0,
      sampleHotelIds: rawData.data?.slice(0, 3).map((h) => h.hotelId) || [],
    });

    // Map the response to match our SearchResponse interface
    // Merge hotel rates with hotel details
    const hotelsWithDetails = (rawData.data || []).map((hotelRate) => {
      const hotelDetails = rawData.hotels?.find(
        (h) => h.id === hotelRate.hotelId
      );
      return {
        ...hotelRate,
        name: hotelDetails?.name,
        main_photo: hotelDetails?.main_photo,
        address: hotelDetails?.address,
        rating: hotelDetails?.rating,
      };
    });

    const data: SearchResponse = {
      hotels: hotelsWithDetails,
      searchId: rawData.searchId,
      currency: body.currency,
      checkin: body.checkin,
      checkout: body.checkout,
      nights: Math.ceil(
        (new Date(body.checkout).getTime() - new Date(body.checkin).getTime()) /
          (1000 * 60 * 60 * 24)
      ),
      totalResults: rawData.data?.length || 0,
      priceRange:
        rawData.data?.length > 0
          ? {
              min: {
                amount: Math.min(
                  ...rawData.data.map(
                    (h) =>
                      h.roomTypes?.[0]?.rates?.[0]?.retailRate?.total?.[0]
                        ?.amount || 0
                  )
                ),
                currency: body.currency,
              },
              max: {
                amount: Math.max(
                  ...rawData.data.map(
                    (h) =>
                      h.roomTypes?.[0]?.rates?.[0]?.retailRate?.total?.[0]
                        ?.amount || 0
                  )
                ),
                currency: body.currency,
              },
            }
          : undefined,
    };

    return NextResponse.json({
      success: true,
      data,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error searching hotel rates:", error);
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
