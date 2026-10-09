import { Platform } from "react-native";

import type { ApiErrorResponse } from "./flight.types";

export const API_BASE_URL = (
  process.env.EXPO_PUBLIC_API_URL ||
  (Platform.OS === "android" ? "http://10.0.2.2:4000" : "http://localhost:4000")
).replace(/\/+$/, "");

export type ApiErrorKind = "http" | "network" | "parse";
export type ApiErrorCode = ApiErrorResponse["error"]["code"];

export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  readonly status?: number;
  readonly code?: ApiErrorCode;

  constructor(
    kind: ApiErrorKind,
    message: string,
    options: { status?: number; code?: ApiErrorCode; cause?: unknown } = {},
  ) {
    super(message, { cause: options.cause });
    this.name = "ApiError";
    this.kind = kind;
    this.status = options.status;
    this.code = options.code;
  }
}

function isApiErrorResponse(body: unknown): body is ApiErrorResponse {
  if (typeof body !== "object" || body === null || !("error" in body)) {
    return false;
  }
  const { error } = body;
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof error.code === "string" &&
    "message" in error &&
    typeof error.message === "string"
  );
}

export async function apiFetch<T>(
  path: string,
  signal?: AbortSignal,
): Promise<T> {
  let response: Response;
  let text: string;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      headers: { Accept: "application/json" },
      signal,
    });
    text = await response.text();
  } catch (error) {
    if (signal?.aborted) throw error;
    const message =
      error instanceof Error ? error.message : "Network request failed";
    throw new ApiError("network", message, { cause: error });
  }

  let body: unknown;
  let parsed = true;
  try {
    body = JSON.parse(text);
  } catch {
    parsed = false;
  }

  if (!response.ok) {
    if (isApiErrorResponse(body)) {
      throw new ApiError("http", body.error.message, {
        status: response.status,
        code: body.error.code,
      });
    }
    throw new ApiError("http", `HTTP ${response.status}`, {
      status: response.status,
    });
  }

  if (!parsed) {
    throw new ApiError("parse", "Response body is not valid JSON", {
      status: response.status,
    });
  }

  return body as T;
}
