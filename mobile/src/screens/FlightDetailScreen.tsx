import { Ionicons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { ComponentProps } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useFavoritesStore } from "../features/favorites/store/favoritesStore";
import { ApiError } from "../features/flights/api/apiFetch";
import { getErrorMessage } from "../features/flights/api/errorMessage";
import type { Airport, FlightDto } from "../features/flights/api/flight.types";
import {
  formatBaggage,
  formatDate,
  formatDuration,
  formatPrice,
  formatStops,
  formatTime,
} from "../features/flights/formatters";
import { useFlightDetailQuery } from "../features/flights/hooks/useFlightDetailQuery";
import type { RootStackParamList } from "../navigation/types";
import ActionButton from "../shared/components/ActionButton";
import { colors, radius, sizes, spacing, typography } from "../theme";

type Props = NativeStackScreenProps<RootStackParamList, "FlightDetail">;

export default function FlightDetailScreen({ route }: Props) {
  const {
    data: flight,
    isError,
    error,
    isFetching,
    refetch,
  } = useFlightDetailQuery(route.params.flightId);

  if (flight) return <FlightDetail flight={flight} />;

  if (isError) {
    const notFound =
      error instanceof ApiError && error.code === "FLIGHT_NOT_FOUND";
    return notFound ? (
      <View style={styles.center}>
        <Ionicons
          name="alert-circle-outline"
          size={40}
          color={colors.textMuted}
        />
        <Text style={styles.stateTitle}>Bu uçuş bulunamadı</Text>
        <Text style={styles.stateText}>
          Uçuş artık mevcut olmayabilir. Geri dönüp başka bir uçuş seçebilirsiniz.
        </Text>
      </View>
    ) : (
      <View style={styles.center}>
        <Ionicons
          name="cloud-offline-outline"
          size={40}
          color={colors.textMuted}
        />
        <Text style={styles.stateTitle}>Uçuş detayı yüklenemedi</Text>
        <Text style={styles.stateText}>{getErrorMessage(error)}</Text>
        <ActionButton
          label="Tekrar dene"
          disabled={isFetching}
          onPress={() => refetch({ cancelRefetch: false })}
        />
      </View>
    );
  }

  return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.stateText}>Uçuş detayı yükleniyor...</Text>
    </View>
  );
}

function FlightDetail({ flight }: { flight: FlightDto }) {
  const insets = useSafeAreaInsets();
  const isFavorite = useFavoritesStore((state) =>
    state.favoriteIds.includes(flight.id),
  );
  const isHydrated = useFavoritesStore((state) => state.isHydrated);
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);

  return (
    <ScrollView
      contentContainerStyle={[
        styles.content,
        { paddingBottom: insets.bottom + spacing.xl },
      ]}
    >
      <View style={[styles.card, styles.summary]}>
        <View style={styles.summaryText}>
          <Text style={styles.airline}>{flight.airline}</Text>
          <Text style={styles.flightNumber}>{flight.flightNumber}</Text>
        </View>
        <Pressable
          onPress={() => toggleFavorite(flight.id)}
          disabled={!isHydrated}
          hitSlop={spacing.xs}
          style={styles.favoriteButton}
          accessibilityRole="button"
          accessibilityLabel={
            isFavorite
              ? `${flight.flightNumber} favorilerden çıkar`
              : `${flight.flightNumber} favorilere ekle`
          }
          accessibilityState={{ selected: isFavorite, disabled: !isHydrated }}
        >
          <Ionicons
            name={isFavorite ? "heart" : "heart-outline"}
            size={24}
            color={isFavorite ? colors.favorite : colors.textMuted}
          />
        </Pressable>
      </View>

      <View style={styles.card}>
        <RoutePoint
          label="Kalkış"
          iso={flight.departureAt}
          airport={flight.origin}
        />
        <View style={styles.divider} />
        <RoutePoint
          label="Varış"
          iso={flight.arrivalAt}
          airport={flight.destination}
        />
      </View>

      <View style={styles.card}>
        <InfoRow
          icon="time-outline"
          label="Toplam süre"
          value={formatDuration(flight.durationMinutes)}
        />
        <InfoRow
          icon="git-commit-outline"
          label="Aktarma"
          value={formatStops(flight.stops)}
        />
        <InfoRow
          icon="briefcase-outline"
          label="Bagaj"
          value={formatBaggage(flight.baggageKg)}
        />
      </View>

      <View style={[styles.card, styles.priceSection]}>
        <Text style={styles.priceLabel}>Toplam fiyat</Text>
        <Text style={styles.price}>
          {formatPrice(flight.priceMinor, flight.currency)}
        </Text>
      </View>
    </ScrollView>
  );
}

function RoutePoint({
  label,
  iso,
  airport,
}: {
  label: string;
  iso: string;
  airport: Airport;
}) {
  return (
    <View style={styles.routePoint}>
      <Text style={styles.routeLabel}>{label}</Text>
      <View style={styles.routeMain}>
        <View>
          <Text style={styles.time}>{formatTime(iso)}</Text>
          <Text style={styles.date}>{formatDate(iso)}</Text>
        </View>
        <View style={styles.airportInfo}>
          <Text style={styles.airportCode}>{airport.code}</Text>
          <Text style={styles.airportName}>
            {airport.city} · {airport.name}
          </Text>
        </View>
      </View>
    </View>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: ComponentProps<typeof Ionicons>["name"];
  label: string;
  value: string;
}) {
  return (
    <View style={styles.infoRow}>
      <Ionicons name={icon} size={20} color={colors.primary} />
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.screen, gap: spacing.md },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.md,
    elevation: 1,
  },
  summary: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  summaryText: { flex: 1 },
  airline: { ...typography.subtitle, color: colors.text },
  flightNumber: { ...typography.caption, color: colors.textMuted },
  priceSection: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  priceLabel: { ...typography.body, color: colors.textSecondary },
  price: {
    ...typography.title,
    color: colors.primary,
    marginLeft: "auto",
  },
  favoriteButton: {
    width: sizes.touchTarget,
    height: sizes.touchTarget,
    marginVertical: -spacing.sm,
    marginRight: -spacing.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  routePoint: { gap: spacing.xs },
  routeLabel: { ...typography.label, color: colors.textMuted },
  routeMain: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "flex-start",
    gap: spacing.lg,
  },
  time: { ...typography.title, color: colors.text },
  date: { ...typography.body, color: colors.textSecondary },
  airportInfo: { flexGrow: 1, flexBasis: 160, alignItems: "flex-end" },
  airportCode: { ...typography.subtitle, color: colors.text },
  airportName: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: "right",
  },
  divider: { height: 1, backgroundColor: colors.border },
  infoRow: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  infoLabel: { ...typography.body, color: colors.textSecondary },
  infoValue: {
    ...typography.body,
    fontWeight: "600",
    color: colors.text,
    textAlign: "right",
    flex: 1,
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
