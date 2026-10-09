import type AsyncStorageModule from "@react-native-async-storage/async-storage";
import { waitFor } from "@testing-library/react-native";

import type { useFavoritesStore as UseFavoritesStore } from "./favoritesStore";

const KEY = "favorites:flightIds";

type AppSession = {
  store: typeof UseFavoritesStore;
  storage: typeof AsyncStorageModule;
};

// Her çağrı yeni bir uygulama başlangıcı gibi temiz modül kaydıyla store ve storage yükler.
function startApp(): AppSession {
  let session!: AppSession;
  jest.isolateModules(() => {
    const storageModule = require("@react-native-async-storage/async-storage");
    session = {
      store: require("./favoritesStore").useFavoritesStore,
      storage: storageModule.default ?? storageModule,
    };
  });
  return session;
}

describe("favorites store", () => {
  it("adds and removes a favorite, persists it and restores saved ids on the next start", async () => {
    const first = startApp();

    first.store.getState().toggleFavorite("FL001");
    expect(first.store.getState().favoriteIds).toEqual([]);

    await first.store.getState().hydrate();
    expect(first.storage.setItem).not.toHaveBeenCalled();

    first.store.getState().addFavorite("FL001");
    expect(first.store.getState().favoriteIds).toEqual(["FL001"]);
    await waitFor(async () => {
      expect(await first.storage.getItem(KEY)).toBe('["FL001"]');
    });

    first.store.getState().removeFavorite("FL001");
    expect(first.store.getState().favoriteIds).toEqual([]);
    await waitFor(async () => {
      expect(await first.storage.getItem(KEY)).toBe("[]");
    });

    first.store.getState().addFavorite("FL007");
    first.store.getState().addFavorite("FL013");
    await waitFor(async () => {
      expect(await first.storage.getItem(KEY)).toBe('["FL007","FL013"]');
    });
    const persisted = await first.storage.getItem(KEY);

    const second = startApp();
    await second.storage.setItem(KEY, persisted as string);
    jest.mocked(second.storage.setItem).mockClear();

    expect(second.store.getState().favoriteIds).toEqual([]);
    await second.store.getState().hydrate();

    expect(second.store.getState().favoriteIds).toEqual(["FL007", "FL013"]);
    expect(second.store.getState().canPersist).toBe(true);
    expect(second.storage.setItem).not.toHaveBeenCalled();
    expect(await second.storage.getItem(KEY)).toBe('["FL007","FL013"]');
  });
});
