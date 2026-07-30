import { Stack } from "expo-router";
import { Host } from "@expo/ui";
import { Provider } from "react-redux";
import { store } from "../redux/store";

export default function RootLayout() {
  const isAuthenticated = true;

  return (
    <Provider store={store}>
      <Host style={{ flex: 1 }}>
        <Stack  screenOptions={{ headerShown: false }} >
          <Stack.Screen name="onboarding" />
          <Stack.Protected guard={isAuthenticated}>
            <Stack.Screen name="(tabs)" />
          </Stack.Protected>
        </Stack>
      </Host>
    </Provider>
  );
}
