import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, radius, sizes, spacing, typography } from "../../../theme";
import type { FlightDto } from "../api/flight.types";
import {
  formatDuration,
  formatPrice,
  formatStops,
  formatTime,
  getArrivalDayOffset,
} from "../formatters";

type FlightCardProps = {
  flight: FlightDto;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  onPress?: () => void;
};

export default function FlightCard({
  flight,
  isFavorite = false,
  onToggleFavorite,
  onPress,
}: FlightCardProps) {
  const dayOffset = getArrivalDayOffset(flight.departureAt, flight.arrivalAt);
  const favoriteLabel = isFavorite
    ? `${flight.flightNumber} favorilerden çıkar`
    : `${flight.flightNumber} favorilere ekle`;
  const cardLabel = [
    `${flight.airline} ${flight.flightNumber}`,
    `${flight.origin.code} ${formatTime(flight.departureAt)}, ${flight.destination.code} ${formatTime(flight.arrivalAt)}${dayOffset > 0 ? " ertesi gün varış" : ""}`,
    formatDuration(flight.durationMinutes),
    formatStops(flight.stops),
    formatPrice(flight.priceMinor, flight.currency),
  ].join(", ");

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      accessibilityRole="button"
      accessibilityLabel={cardLabel}
      accessibilityHint="Uçuş detayını açar"
    >
      <View style={styles.header}>
        <View style={styles.airline}>
          <Text style={styles.airlineName}>{flight.airline}</Text>
          <Text style={styles.flightNumber}>{flight.flightNumber}</Text>
        </View>
        <Pressable
          onPress={onToggleFavorite}
          hitSlop={spacing.xs}
          style={styles.favoriteButton}
          accessibilityRole="button"
          accessibilityLabel={favoriteLabel}
          accessibilityState={{ selected: isFavorite, disabled: !onToggleFavorite }}
        >
          <Ionicons
            name={isFavorite ? "heart" : "heart-outline"}
            size={24}
            color={isFavorite ? colors.favorite : colors.textMuted}
          />
        </Pressable>
      </View>

      <View style={styles.route}>
        <View>
          <Text style={styles.time}>{formatTime(flight.departureAt)}</Text>
          <Text style={styles.airport}>{flight.origin.code}</Text>
        </View>

        <RouteIndicator hasStop={flight.stops > 0} />

        <View style={styles.arrival}>
          {dayOffset > 0 && <Text style={styles.nextDayLabel}>Ertesi gün</Text>}
          <View style={styles.arrivalTime}>
            <Text style={[styles.time, dayOffset > 0 && styles.nextDay]}>
              {formatTime(flight.arrivalAt)}
            </Text>
          </View>
          <Text style={styles.airport}>{flight.destination.code}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.meta}>
          <Ionicons name="time-outline" size={16} color={colors.textMuted} />
          <Text style={styles.metaText}>{formatDuration(flight.durationMinutes)}</Text>
          <Text style={styles.metaText}>·</Text>
          <Text style={[styles.metaText, flight.stops === 0 && styles.direct]}>
            {formatStops(flight.stops)}
          </Text>
        </View>
        <Text style={styles.price}>
          {formatPrice(flight.priceMinor, flight.currency)}
        </Text>
      </View>
    </Pressable>
  );
}

function RouteIndicator({ hasStop }: { hasStop: boolean }) {
  return (
    <View
      style={styles.indicator}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <View style={styles.dot} />
      <View style={styles.line} />
      {hasStop && (
        <>
          <View style={styles.stop} />
          <View style={styles.line} />
        </>
      )}
      <Ionicons
        name="arrow-forward"
        size={16}
        color={colors.primary}
        style={styles.arrow}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignSelf: "stretch",
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.lg,
    elevation: 1,
  },
  cardPressed: { opacity: 0.85 },
  header: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  airline: { flex: 1 },
  airlineName: { ...typography.body, fontWeight: "600", color: colors.text },
  flightNumber: { ...typography.caption, color: colors.textMuted },
  price: {
    ...typography.subtitle,
    fontWeight: "700",
    color: colors.text,
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
  route: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  time: { ...typography.title, color: colors.text },
  nextDay: { color: colors.danger },
  nextDayLabel: {
    ...typography.label,
    fontSize: 11,
    lineHeight: 14,
    color: colors.danger,
    position: "absolute",
    bottom: "100%",
    right: 0,
  },
  airport: { ...typography.label, color: colors.textSecondary },
  arrival: { alignItems: "flex-end" },
  arrivalTime: { flexDirection: "row", alignItems: "flex-start", gap: 2 },
  indicator: { flex: 1, flexDirection: "row", alignItems: "center" },
  dot: {
    width: 8,
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
  },
  line: { flex: 1, height: 2, backgroundColor: colors.primary },
  stop: {
    width: 10,
    height: 10,
    borderRadius: radius.pill,
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: colors.surface,
  },
  arrow: { marginLeft: -6 },
  footer: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  meta: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  metaText: { ...typography.caption, color: colors.textSecondary },
  direct: { color: colors.primary, fontWeight: "600" },
});
