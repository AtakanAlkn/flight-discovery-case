import { ApiError } from "./apiFetch";

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.kind === "network") {
      return "İnternet bağlantınızı kontrol edip tekrar deneyiniz.";
    }
    if (error.kind === "http" && error.status !== undefined && error.status >= 500) {
      return "Sunucuda geçici bir sorun oluştu. Tekrar deneyiniz.";
    }
  }
  return "Beklenmeyen bir sorun oluştu. Tekrar deneyiniz.";
}
