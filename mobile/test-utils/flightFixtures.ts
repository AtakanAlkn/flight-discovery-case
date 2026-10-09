import type {
  FlightDto,
  FlightListResponse,
  FlightSort,
} from "../src/features/flights/api/flight.types";

export function makeFlight(overrides: Partial<FlightDto> = {}): FlightDto {
  return {
    id: "FL004",
    flightNumber: "AE331",
    airline: "Anadolu Express",
    origin: { code: "SAW", city: "İstanbul", name: "Sabiha Gökçen Havalimanı" },
    destination: { code: "AYT", city: "Antalya", name: "Antalya Havalimanı" },
    departureAt: "2026-10-15T07:30:00+03:00",
    arrivalAt: "2026-10-15T11:00:00+03:00",
    durationMinutes: 210,
    stops: 1,
    priceMinor: 119900,
    currency: "TRY",
    baggageKg: 0,
    ...overrides,
  };
}

export function makePage(
  items: FlightDto[],
  options: { sort?: FlightSort; onlyDirect?: boolean } = {},
): FlightListResponse {
  return {
    items,
    meta: {
      page: 1,
      limit: 8,
      total: items.length,
      totalPages: 1,
      hasMore: false,
      sort: options.sort ?? "price",
      onlyDirect: options.onlyDirect ?? false,
    },
  };
}
