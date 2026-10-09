import { apiFetch } from "./apiFetch";
import type {
  FlightDetailResponse,
  FlightDto,
  FlightListQuery,
  FlightListResponse,
} from "./flight.types";

const MAX_IDS = 50;

export function buildFlightsQuery(query: FlightListQuery): string {
  const params = new URLSearchParams();
  const { ids } = query;

  if (ids !== undefined && ids.length === 0) {
    throw new RangeError("ids must contain at least one id");
  }

  if (query.page !== undefined) params.set("page", String(query.page));

  const limit =
    query.limit ?? (ids ? Math.min(ids.length, MAX_IDS) : undefined);
  if (limit !== undefined) params.set("limit", String(limit));

  if (query.sort !== undefined) params.set("sort", query.sort);

  if (ids) {
    params.set("ids", ids.join(","));
  } else if (query.onlyDirect !== undefined) {
    params.set("onlyDirect", String(query.onlyDirect));
  }

  return params.toString();
}

export async function getFlights(
  query: FlightListQuery = {},
  signal?: AbortSignal,
): Promise<FlightListResponse> {
  const search = buildFlightsQuery(query);
  return apiFetch<FlightListResponse>(
    search ? `/flights?${search}` : "/flights",
    signal,
  );
}

export async function getFlightById(
  id: string,
  signal?: AbortSignal,
): Promise<FlightDto> {
  const { item } = await apiFetch<FlightDetailResponse>(
    `/flights/${encodeURIComponent(id)}`,
    signal,
  );
  return item;
}
