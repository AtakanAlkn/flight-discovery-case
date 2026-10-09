import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  type ListRenderItem,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import type { FlightDto, FlightSort } from "../features/flights/api/flight.types";
import FavoriteFlightCard from "../features/favorites/components/FavoriteFlightCard";
import { getErrorMessage } from "../features/flights/api/errorMessage";
import { useFlightsInfiniteQuery } from "../features/flights/hooks/useFlightsInfiniteQuery";
import ActionButton from "../shared/components/ActionButton";
import { colors, radius, sizes, spacing, typography } from "../theme";

const SORT_OPTIONS: { value: FlightSort; label: string }[] = [
  { value: "price", label: "En düşük fiyat" },
  { value: "duration", label: "En kısa süre" },
];

export default function FlightsScreen() {
  const [sort, setSort] = useState<FlightSort>("price");
  const [onlyDirect, setOnlyDirect] = useState(false);
  const navigation = useNavigation();

  const {
    flights,
    total,
    isPending,
    isLoadingError,
    error,
    isFetching,
    refetch,
    isFetchingNextPage,
    isFetchNextPageError,
    loadMore,
    retryLoadMore,
  } = useFlightsInfiniteQuery({ sort, onlyDirect });

  const openDetail = useCallback(
    (flightId: string) => navigation.navigate("FlightDetail", { flightId }),
    [navigation],
  );
  const renderFlight = useCallback<ListRenderItem<FlightDto>>(
    ({ item }) => <FavoriteFlightCard flight={item} onPressFlight={openDetail} />,
    [openDetail],
  );

  let content;
  if (isPending) {
    content = (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.stateText}>Uçuşlar yükleniyor...</Text>
      </View>
    );
  } else if (isLoadingError) {
    content = (
      <View style={styles.center}>
        <Ionicons
          name="cloud-offline-outline"
          size={40}
          color={colors.textMuted}
        />
        <Text style={styles.stateTitle}>Uçuşlar yüklenemedi</Text>
        <Text style={styles.stateText}>{getErrorMessage(error)}</Text>
        <ActionButton
          label="Tekrar dene"
          disabled={isFetching}
          onPress={() => refetch({ cancelRefetch: false })}
        />
      </View>
    );
  } else if (flights.length === 0) {
    content = onlyDirect ? (
      <View style={styles.center}>
        <Ionicons name="funnel-outline" size={40} color={colors.textMuted} />
        <Text style={styles.stateTitle}>Direkt uçuş bulunamadı</Text>
        <Text style={styles.stateText}>
          Aktarmalı uçuşları da görmek için filtreyi kaldırabilirsiniz.
        </Text>
        <ActionButton
          label="Filtreyi temizle"
          onPress={() => setOnlyDirect(false)}
        />
      </View>
    ) : (
      <View style={styles.center}>
        <Ionicons name="search-outline" size={40} color={colors.textMuted} />
        <Text style={styles.stateTitle}>Uçuş bulunamadı</Text>
      </View>
    );
  } else {
    content = (
      <FlatList
        data={flights}
        keyExtractor={(flight) => flight.id}
        renderItem={renderFlight}
        contentContainerStyle={styles.list}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isFetchingNextPage ? (
            <ActivityIndicator color={colors.primary} style={styles.footer} />
          ) : isFetchNextPageError ? (
            <View style={styles.footer}>
              <Text style={styles.stateText}>Sonraki sayfa yüklenemedi</Text>
              <ActionButton label="Tekrar dene" onPress={retryLoadMore} />
            </View>
          ) : null
        }
      />
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.controls}>
        <View style={styles.sortRow}>
          {SORT_OPTIONS.map((option) => {
            const selected = option.value === sort;
            return (
              <Pressable
                key={option.value}
                onPress={() => setSort(option.value)}
                hitSlop={spacing.xs}
                style={[
                  styles.sortOption,
                  selected && styles.sortOptionSelected,
                ]}
                accessibilityRole="button"
                accessibilityLabel={option.label}
                accessibilityState={{ selected }}
              >
                {selected && (
                  <Ionicons
                    name="checkmark"
                    size={16}
                    color={colors.onPrimary}
                  />
                )}
                <Text
                  style={[
                    styles.sortOptionText,
                    selected && styles.sortOptionTextSelected,
                  ]}
                >
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.filterRow}>
          <Pressable
            onPress={() => setOnlyDirect((value) => !value)}
            style={styles.checkboxRow}
            accessibilityRole="checkbox"
            accessibilityLabel="Yalnızca direkt"
            accessibilityState={{ checked: onlyDirect }}
          >
            <View
              style={[styles.checkbox, onlyDirect && styles.checkboxChecked]}
            >
              {onlyDirect && (
                <Ionicons name="checkmark" size={16} color={colors.onPrimary} />
              )}
            </View>
            <Text style={styles.checkboxLabel}>Yalnızca direkt</Text>
          </Pressable>
          {total !== undefined && (
            <Text style={styles.total} accessibilityLiveRegion="polite">
              {total} uçuş
            </Text>
          )}
        </View>
      </View>
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  controls: {
    paddingHorizontal: spacing.screen,
    paddingTop: spacing.md,
    paddingBottom: spacing.xs,
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sortRow: { flexDirection: "row", alignItems: "stretch", gap: spacing.sm },
  sortOption: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    minHeight: 40,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.xs,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  sortOptionSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  sortOptionText: {
    ...typography.label,
    color: colors.textSecondary,
    flexShrink: 1,
    textAlign: "center",
  },
  sortOptionTextSelected: { color: colors.onPrimary },
  filterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    minHeight: sizes.touchTarget,
  },
  checkbox: {
    width: 22,
    height: 22,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.sm,
    borderWidth: 2,
    borderColor: colors.textMuted,
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkboxLabel: { ...typography.body, color: colors.text },
  total: { ...typography.label, color: colors.textSecondary },
  list: {
    paddingHorizontal: spacing.screen,
    paddingTop: spacing.sm,
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
  footer: {
    paddingVertical: spacing.lg,
    alignItems: "center",
    gap: spacing.sm,
  },
});
