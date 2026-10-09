import { Ionicons } from "@expo/vector-icons";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  type ListRenderItem,
  StyleSheet,
  Text,
  View,
} from "react-native";

import FavoriteFlightCard from "../features/favorites/components/FavoriteFlightCard";
import { useFavoriteFlightsQuery } from "../features/favorites/hooks/useFavoriteFlightsQuery";
import { useFavoritesStore } from "../features/favorites/store/favoritesStore";
import { getErrorMessage } from "../features/flights/api/errorMessage";
import type { FlightDto } from "../features/flights/api/flight.types";
import ActionButton from "../shared/components/ActionButton";
import { colors, spacing, typography } from "../theme";

export default function FavoritesScreen() {
  const isFocused = useIsFocused();
  const isHydrated = useFavoritesStore((state) => state.isHydrated);
  const hasFavorites = useFavoritesStore(
    (state) => state.favoriteIds.length > 0,
  );

  if (!isHydrated) return <LoadingState />;

  if (!hasFavorites) {
    return (
      <View style={styles.center}>
        <Ionicons name="heart-outline" size={40} color={colors.textMuted} />
        <Text style={styles.stateTitle}>Henüz favori uçuşunuz yok</Text>
      </View>
    );
  }

  return isFocused ? <FavoritesContent /> : null;
}

function FavoritesContent() {
  const navigation = useNavigation();
  const [requestIds] = useState(() => useFavoritesStore.getState().favoriteIds);
  const favoriteIds = useFavoritesStore((state) => state.favoriteIds);
  const { data, isPending, isError, error, isFetching, refetch } =
    useFavoriteFlightsQuery(requestIds);

  const flights = useMemo(() => {
    if (!data) return [];
    const byId = new Map(data.map((flight) => [flight.id, flight]));
    return favoriteIds
      .map((id) => byId.get(id))
      .filter((flight): flight is FlightDto => flight !== undefined);
  }, [data, favoriteIds]);

  const openDetail = useCallback(
    (flightId: string) => navigation.navigate("FlightDetail", { flightId }),
    [navigation],
  );
  const renderFlight = useCallback<ListRenderItem<FlightDto>>(
    ({ item }) => <FavoriteFlightCard flight={item} onPressFlight={openDetail} />,
    [openDetail],
  );

  if (isPending) return <LoadingState />;

  if (isError) {
    return (
      <View style={styles.center}>
        <Ionicons
          name="cloud-offline-outline"
          size={40}
          color={colors.textMuted}
        />
        <Text style={styles.stateTitle}>Favori uçuşlar yüklenemedi</Text>
        <Text style={styles.stateText}>{getErrorMessage(error)}</Text>
        <ActionButton
          label="Tekrar dene"
          disabled={isFetching}
          onPress={() => refetch({ cancelRefetch: false })}
        />
      </View>
    );
  }

  if (flights.length === 0) {
    return (
      <View style={styles.center}>
        <Ionicons
          name="alert-circle-outline"
          size={40}
          color={colors.textMuted}
        />
        <Text style={styles.stateTitle}>Favori uçuşlarınız şu an bulunamadı</Text>
        <Text style={styles.stateText}>
          Kaydettiğiniz uçuşlar artık listelenmiyor olabilir.
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={flights}
      keyExtractor={(flight) => flight.id}
      renderItem={renderFlight}
      contentContainerStyle={styles.list}
    />
  );
}

function LoadingState() {
  return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.stateText}>Favori uçuşlar yükleniyor...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: spacing.screen,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
  },
  stateTitle: {
    ...typography.subtitle,
    color: colors.text,
    textAlign: "center",
  },
  stateText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: "center",
  },
});
