import {
  DefaultTheme,
  NavigationContainer,
  type Theme,
} from "@react-navigation/native";
import { QueryClientProvider } from "@tanstack/react-query";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { useFavoritesStore } from "./src/features/favorites/store/favoritesStore";
import RootNavigator from "./src/navigation/RootNavigator";
import { queryClient } from "./src/query/queryClient";
import { colors } from "./src/theme";

const navigationTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary,
    background: colors.background,
    card: colors.surface,
    text: colors.text,
    border: colors.border,
    notification: colors.danger,
  },
};

export default function App() {
  useEffect(() => {
    useFavoritesStore.getState().hydrate();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <NavigationContainer theme={navigationTheme}>
          <RootNavigator />
        </NavigationContainer>
        <StatusBar style="light" />
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
