import { makePage } from "../../../../test-utils/flightFixtures";
import { API_BASE_URL } from "./apiFetch";
import { buildFlightsQuery, getFlights } from "./flightsApi";

const toParams = (search: string) =>
  Object.fromEntries(new URLSearchParams(search));

describe("flights request parameters", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("maps sort and the direct-only filter to server query parameters", async () => {
    expect(
      toParams(
        buildFlightsQuery({ page: 1, limit: 8, sort: "price", onlyDirect: false }),
      ),
    ).toEqual({ page: "1", limit: "8", sort: "price", onlyDirect: "false" });

    expect(
      toParams(
        buildFlightsQuery({ page: 1, limit: 8, sort: "duration", onlyDirect: true }),
      ),
    ).toEqual({ page: "1", limit: "8", sort: "duration", onlyDirect: "true" });

    const fetchMock = jest.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => JSON.stringify(makePage([], { sort: "duration", onlyDirect: true })),
    } as Response);

    await getFlights({ page: 1, limit: 8, sort: "duration", onlyDirect: true });

    const [url] = fetchMock.mock.calls[0];
    const requested = new URL(String(url));
    expect(`${requested.origin}${requested.pathname}`).toBe(`${API_BASE_URL}/flights`);
    expect(toParams(requested.search)).toEqual({
      page: "1",
      limit: "8",
      sort: "duration",
      onlyDirect: "true",
    });
  });
});
