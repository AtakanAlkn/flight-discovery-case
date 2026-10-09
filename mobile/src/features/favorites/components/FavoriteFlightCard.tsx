import { memo } from "react";

import type { FlightDto } from "../../flights/api/flight.types";
import FlightCard from "../../flights/components/FlightCard";
import { useFavoritesStore } from "../store/favoritesStore";

type FavoriteFlightCardProps = {
  flight: FlightDto;
  onPressFlight?: (flightId: string) => void;
};

function FavoriteFlightCard({ flight, onPressFlight }: FavoriteFlightCardProps) {
  const isFavorite = useFavoritesStore((state) =>
    state.favoriteIds.includes(flight.id),
  );
  const isHydrated = useFavoritesStore((state) => state.isHydrated);
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);

  return (
    <FlightCard
      flight={flight}
      isFavorite={isFavorite}
      onToggleFavorite={
        isHydrated ? () => toggleFavorite(flight.id) : undefined
      }
      onPress={onPressFlight ? () => onPressFlight(flight.id) : undefined}
    />
  );
}

export default memo(FavoriteFlightCard);
