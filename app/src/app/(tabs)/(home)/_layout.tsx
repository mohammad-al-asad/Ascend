import { Stack } from "expo-router";

export default function RootLayout() {
  // const isAuthenticated = true;

  return (

        <Stack  screenOptions={{ headerShown: false }} >
          <Stack.Screen name="index" />
        <Stack.Screen name="assessments" />
        <Stack.Screen name="oft" />
        <Stack.Screen name="checkin" />
        <Stack.Screen name="notifications" />

        </Stack>

  );
}
