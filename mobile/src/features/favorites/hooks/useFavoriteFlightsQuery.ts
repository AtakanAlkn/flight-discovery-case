import { useQuery } from "@tanstack/react-query";

import { getFlights } from "../../flights/api/flightsApi";

export const MAX_IDS_PER_REQUEST = 50;

export function chunkIds(
  ids: string[],
  size = MAX_IDS_PER_REQUEST,
): string[][] {
  const chunks: string[][] = [];
  for (let start = 0; start < ids.length; start += size) {
    chunks.push(ids.slice(start, start + size));
  }
  return chunks;
}

export function useFavoriteFlightsQuery(ids: string[]) {
  return useQuery({
    queryKey: ["flights", "favorites", ids] as const,
    queryFn: async ({ signal }) => {
      const pages = await Promise.all(
        chunkIds(ids).map((batch) => getFlights({ ids: batch }, signal)),
      );
      return pages.flatMap((page) => page.items);
    },
    enabled: ids.length > 0,
    gcTime: 0,
  });
}
