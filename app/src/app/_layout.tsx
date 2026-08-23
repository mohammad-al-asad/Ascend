import { Stack } from "expo-router";
import { Host } from "@expo/ui";
import { Provider } from "react-redux";
import { store, useAppSelector } from "../redux/store";

function AppNavigator() {
  const { isAuthenticated, onboardingStatus } = useAppSelector((state) => state.auth);
  const isFirstTime = onboardingStatus === "incomplete";

  return (
    <Host style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }}>
        {/* We expose all screens and handle redirects in individual screens or hooks */}
        <Stack.Screen name="auth" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </Host>
  );
}

export default function RootLayout() {
  return (
    <Provider store={store}>
      <AppNavigator />
    </Provider>
  );
}
