/**
 * Common types shared across LiteAPI services
 * For ski trip planning app - group hotel bookings
 */

export interface Location {
  latitude: number;
  longitude: number;
}

export interface Address {
  street: string;
  city: string;
  state?: string;
  country: string;
  zipCode?: string;
}

export interface Price {
  amount: number;
  currency: string;
}

export interface Image {
  url: string;
  description?: string;
  alt?: string;
}

export interface Facility {
  id: number;
  name: string;
  category?: string;
}

export interface DateRange {
  checkin: string; // ISO date string (YYYY-MM-DD)
  checkout: string; // ISO date string (YYYY-MM-DD)
}

export interface Occupancy {
  rooms: number;
  adults: number;
  children: number;
  childAges?: number[];
}

export interface GuestInfo {
  nationality: string; // ISO country code
  residency: string; // ISO country code
}

// Ski trip specific types
export interface SkiResortInfo {
  nearbyResorts?: string[];
  distanceToSlopes?: number; // in meters
  shuttleService?: boolean;
  skiPassAvailable?: boolean;
}
