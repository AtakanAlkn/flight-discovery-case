import type { NavigatorScreenParams } from "@react-navigation/native";

export type MainTabParamList = {
  Flights: undefined;
  Favorites: undefined;
};

export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<MainTabParamList>;
  FlightDetail: { flightId: string };
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
