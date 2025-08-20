# LiteAPI Endpoints & Response Types

## Hotel Data API

### Hotels

- `GET /data/hotels` → `HotelDetails[]`
- `GET /data/hotel` → `HotelDetailsResponse`
- `GET /data/reviews` → `{ reviews: Review[], hotelId: string }`

### Location Data

- `GET /data/cities` → `{ cities: City[], country: string }`
- `GET /data/countries` → `{ countries: Country[] }`
- `GET /data/iataCodes` → `{ codes: IATACode[] }`

### Hotel Metadata

- `GET /data/facilities` → `{ facilities: Facility[] }`
- `GET /data/hotelTypes` → `{ types: HotelType[] }`
- `GET /data/chains` → `{ chains: HotelChain[] }`
- `GET /data/currencies` → `{ currencies: Currency[] }`

## Search API

### Rates

- `POST /hotels/rates` → `SearchResponse`
  - Input: `SearchRequest`
  - Contains: `HotelRate[]` with `RoomType[]` and `Rate[]`

## Key Types Used

**Search**: `SearchRequest`, `SearchResponse`, `HotelRate`, `RoomType`, `Rate`  
**Hotel Details**: `HotelDetails`, `Room`, `HotelFacility`, `SkiAmenities`  
**Common**: `Location`, `Price`, `Image`, `Facility`, `Occupancy`  
**API**: `APIResponse<T>`, `APIError`, `SkiTripSearchRequest`
