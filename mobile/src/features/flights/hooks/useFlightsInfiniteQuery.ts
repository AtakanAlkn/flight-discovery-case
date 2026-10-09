import { useInfiniteQuery } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";

import type { FlightSort } from "../api/flight.types";
import { getFlights } from "../api/flightsApi";

const PAGE_SIZE = 8;
const FIRST_PAGE = 1;

type FlightsListParams = {
  sort: FlightSort;
  onlyDirect: boolean;
};

export function useFlightsInfiniteQuery({
  sort,
  onlyDirect,
}: FlightsListParams) {
  const query = useInfiniteQuery({
    queryKey: ["flights", "list", { sort, onlyDirect }] as const,
    queryFn: ({ pageParam, signal }) =>
      getFlights(
        { page: pageParam, limit: PAGE_SIZE, sort, onlyDirect },
        signal,
      ),
    initialPageParam: FIRST_PAGE,
    getNextPageParam: (lastPage) =>
      lastPage.meta.hasMore ? lastPage.meta.page + 1 : undefined,
    staleTime: Infinity,
    gcTime: 0,
  });

  const {
    data,
    isPending,
    isLoadingError,
    error,
    isFetching,
    refetch,
    hasNextPage,
    isFetchingNextPage,
    isFetchNextPageError,
    fetchNextPage,
  } = query;

  const flights = useMemo(
    () => data?.pages.flatMap((page) => page.items) ?? [],
    [data],
  );
  const total = data?.pages[0]?.meta.total;

  const loadMore = useCallback(() => {
    if (!hasNextPage || isFetchingNextPage || isFetchNextPageError) return;
    fetchNextPage({ cancelRefetch: false });
  }, [hasNextPage, isFetchingNextPage, isFetchNextPageError, fetchNextPage]);

  const retryLoadMore = useCallback(() => {
    if (!isFetchNextPageError || isFetchingNextPage) return;
    fetchNextPage({ cancelRefetch: false });
  }, [isFetchNextPageError, isFetchingNextPage, fetchNextPage]);

  return {
    flights,
    total,
    isPending,
    isLoadingError,
    error,
    isFetching,
    refetch,
    isFetchingNextPage,
    isFetchNextPageError,
    loadMore,
    retryLoadMore,
  };
}
