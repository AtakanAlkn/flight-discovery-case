import { createNativeStackNavigator } from "@react-navigation/native-stack";

import FlightDetailScreen from "../screens/FlightDetailScreen";
import { colors } from "../theme";
import MainTabs from "./MainTabs";
import type { RootStackParamList } from "./types";

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="MainTabs"
      screenOptions={{
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: colors.onPrimary,
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="MainTabs"
        component={MainTabs}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="FlightDetail"
        component={FlightDetailScreen}
        options={{ title: "Uçuş Detayı" }}
      />
    </Stack.Navigator>
  );
}
