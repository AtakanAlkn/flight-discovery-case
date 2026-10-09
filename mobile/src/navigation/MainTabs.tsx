import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import FavoritesScreen from "../screens/FavoritesScreen";
import FlightsScreen from "../screens/FlightsScreen";
import { colors } from "../theme";
import type { MainTabParamList } from "./types";

const Tab = createBottomTabNavigator<MainTabParamList>();

const TAB_BAR_HEIGHT = 49;
const TAB_LABEL_LINE_HEIGHT = 14;

export default function MainTabs() {
  const { fontScale } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const tabBarStyle =
    fontScale > 1
      ? {
          height:
            TAB_BAR_HEIGHT +
            TAB_LABEL_LINE_HEIGHT * (fontScale - 1) +
            insets.bottom,
        }
      : undefined;

  return (
    <Tab.Navigator
      initialRouteName="Flights"
      screenOptions={{
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: colors.onPrimary,
        headerShadowVisible: false,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle,
      }}
    >
      <Tab.Screen
        name="Flights"
        component={FlightsScreen}
        options={{
          title: "Uçuşlar",
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? "airplane" : "airplane-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Favorites"
        component={FavoritesScreen}
        options={{
          title: "Favoriler",
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? "heart" : "heart-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
