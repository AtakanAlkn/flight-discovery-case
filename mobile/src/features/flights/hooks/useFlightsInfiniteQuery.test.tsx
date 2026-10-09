import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react-native";
import type { ReactNode } from "react";

import { makeFlight, makePage } from "../../../../test-utils/flightFixtures";
import type {
  FlightListQuery,
  FlightListResponse,
  FlightSort,
} from "../api/flight.types";
import { getFlights } from "../api/flightsApi";
import { useFlightsInfiniteQuery } from "./useFlightsInfiniteQuery";

jest.mock("../api/flightsApi", () => ({
  ...jest.requireActual("../api/flightsApi"),
  getFlights: jest.fn(),
}));

const mockedGetFlights = jest.mocked(getFlights);

type PendingRequest = {
  query: FlightListQuery;
  signal?: AbortSignal;
  resolve: (page: FlightListResponse) => void;
};

describe("useFlightsInfiniteQuery", () => {
  afterEach(() => {
    mockedGetFlights.mockReset();
  });

  it("keeps the latest sort result when an older response arrives late", async () => {
    const requests: PendingRequest[] = [];
    mockedGetFlights.mockImplementation(
      (query = {}, signal) =>
        new Promise<FlightListResponse>((resolve) => {
          requests.push({ query, signal, resolve });
        }),
    );

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false, gcTime: 0 } },
    });
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result, rerender } = renderHook(
      ({ sort }: { sort: FlightSort }) =>
        useFlightsInfiniteQuery({ sort, onlyDirect: false }),
      { initialProps: { sort: "price" as FlightSort }, wrapper },
    );

    await waitFor(() => expect(requests).toHaveLength(1));
    expect(requests[0].query.sort).toBe("price");

    rerender({ sort: "duration" });
    await waitFor(() => expect(requests).toHaveLength(2));
    expect(requests[1].query.sort).toBe("duration");

    const durationFlight = makeFlight({ id: "FL003", flightNumber: "TA512" });
    const priceFlight = makeFlight({ id: "FL004", flightNumber: "AE331" });

    await act(async () => {
      requests[1].resolve(makePage([durationFlight], { sort: "duration" }));
    });
    await waitFor(() =>
      expect(result.current.flights.map((flight) => flight.id)).toEqual(["FL003"]),
    );

    await act(async () => {
      requests[0].resolve(makePage([priceFlight, priceFlight], { sort: "price" }));
    });

    expect(result.current.flights.map((flight) => flight.id)).toEqual(["FL003"]);
    expect(result.current.total).toBe(1);
    expect(result.current.isPending).toBe(false);
    expect(requests[0].signal?.aborted).toBe(true);
    expect(requests).toHaveLength(2);
  });
});
