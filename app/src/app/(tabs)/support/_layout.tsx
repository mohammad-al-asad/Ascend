import { Stack } from "expo-router";

export default function SupportLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="request" />
      <Stack.Screen name="chat" />
    </Stack>
  );
}
