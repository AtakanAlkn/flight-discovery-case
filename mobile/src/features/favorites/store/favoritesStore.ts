import { create } from "zustand";

import { loadFavoriteIds, saveFavoriteIds } from "../storage/favoritesStorage";

type FavoritesState = {
  favoriteIds: string[];
  isHydrated: boolean;
  canPersist: boolean;
  hydrate: () => Promise<void>;
  addFavorite: (id: string) => void;
  removeFavorite: (id: string) => void;
  toggleFavorite: (id: string) => void;
};

let hydration: Promise<void> | null = null;
let pendingWrite: Promise<unknown> = Promise.resolve();

export const useFavoritesStore = create<FavoritesState>()((set, get) => {
  const persist = () => {
    if (!get().canPersist) return;
    pendingWrite = pendingWrite.then(() => saveFavoriteIds(get().favoriteIds));
  };

  const update = (next: string[]) => {
    if (!get().isHydrated) return;
    set({ favoriteIds: next });
    persist();
  };

  return {
    favoriteIds: [],
    isHydrated: false,
    canPersist: false,

    hydrate: () => {
      hydration ??= loadFavoriteIds().then((result) => {
        set({
          favoriteIds: result.ok ? result.ids : [],
          isHydrated: true,
          canPersist: result.ok,
        });
      });
      return hydration;
    },

    addFavorite: (id) => {
      const { favoriteIds } = get();
      if (!favoriteIds.includes(id)) update([...favoriteIds, id]);
    },

    removeFavorite: (id) => {
      const { favoriteIds } = get();
      if (favoriteIds.includes(id))
        update(favoriteIds.filter((favoriteId) => favoriteId !== id));
    },

    toggleFavorite: (id) => {
      if (get().favoriteIds.includes(id)) get().removeFavorite(id);
      else get().addFavorite(id);
    },
  };
});
