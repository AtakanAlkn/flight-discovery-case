import AsyncStorage from "@react-native-async-storage/async-storage";

export const FAVORITES_STORAGE_KEY = "favorites:flightIds";

export type LoadFavoritesResult = { ok: true; ids: string[] } | { ok: false };

function parseIds(raw: string | null): string[] {
  if (raw === null) return [];
  try {
    const value: unknown = JSON.parse(raw);
    if (Array.isArray(value) && value.every((id) => typeof id === "string")) {
      return [...new Set(value)];
    }
  } catch {}
  return [];
}

export async function loadFavoriteIds(): Promise<LoadFavoritesResult> {
  try {
    const raw = await AsyncStorage.getItem(FAVORITES_STORAGE_KEY);
    return { ok: true, ids: parseIds(raw) };
  } catch {
    return { ok: false };
  }
}

export async function saveFavoriteIds(ids: string[]): Promise<boolean> {
  try {
    await AsyncStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(ids));
    return true;
  } catch {
    return false;
  }
}
