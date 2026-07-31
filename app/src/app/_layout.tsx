import { Stack } from "expo-router";
import { Host } from "@expo/ui";
import { Provider } from "react-redux";
import { store } from "../redux/store";

export default function RootLayout() {
  const isAuthenticated = true;
  const isFirstTime = false

  return (
    <Provider store={store}>
      <Host style={{ flex: 1 }}>
        <Stack  screenOptions={{ headerShown: false }} >
          <Stack.Protected guard={isAuthenticated && isFirstTime}>
          <Stack.Screen name="onboarding" />
          </Stack.Protected>
          <Stack.Protected guard={isAuthenticated && !isFirstTime}>
            <Stack.Screen name="(tabs)" />
          </Stack.Protected>
        </Stack>
      </Host>
    </Provider>
  );
}
