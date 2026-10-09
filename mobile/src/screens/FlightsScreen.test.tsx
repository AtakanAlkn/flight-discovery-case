import { NavigationContainer } from "@react-navigation/native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react-native";

import { makeFlight, makePage } from "../../test-utils/flightFixtures";
import { ApiError } from "../features/flights/api/apiFetch";
import { getFlights } from "../features/flights/api/flightsApi";
import FlightsScreen from "./FlightsScreen";

jest.mock("../features/flights/api/flightsApi", () => ({
  ...jest.requireActual("../features/flights/api/flightsApi"),
  getFlights: jest.fn(),
}));

const mockedGetFlights = jest.mocked(getFlights);

function renderFlightsScreen() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <NavigationContainer>
        <FlightsScreen />
      </NavigationContainer>
    </QueryClientProvider>,
  );
}

describe("FlightsScreen", () => {
  afterEach(() => {
    mockedGetFlights.mockReset();
  });

  it("shows the list after the user retries a failed request", async () => {
    mockedGetFlights
      .mockRejectedValueOnce(
        new ApiError("http", "Uçuşlar yüklenemedi. Lütfen tekrar deneyin.", {
          status: 500,
          code: "FLIGHTS_UNAVAILABLE",
        }),
      )
      .mockResolvedValueOnce(makePage([makeFlight()]));

    renderFlightsScreen();

    expect(await screen.findByText("Uçuşlar yüklenemedi")).toBeOnTheScreen();
    fireEvent.press(screen.getByText("Tekrar dene"));

    expect(await screen.findByText("AE331")).toBeOnTheScreen();
    expect(screen.getByText("1 uçuş")).toBeOnTheScreen();
    expect(screen.queryByText("Uçuşlar yüklenemedi")).not.toBeOnTheScreen();
    expect(screen.queryByText("Tekrar dene")).not.toBeOnTheScreen();
    expect(mockedGetFlights).toHaveBeenCalledTimes(2);
  });
});
