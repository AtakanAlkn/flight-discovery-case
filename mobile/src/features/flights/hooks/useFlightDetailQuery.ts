import { useQuery } from "@tanstack/react-query";

import { getFlightById } from "../api/flightsApi";

export function useFlightDetailQuery(flightId: string) {
  return useQuery({
    queryKey: ["flights", "detail", flightId] as const,
    queryFn: ({ signal }) => getFlightById(flightId, signal),
    staleTime: 0,
    gcTime: 0,
  });
}
