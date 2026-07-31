import { Stack } from "expo-router";

export default function ProfileLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="records" />
      <Stack.Screen name="uploads" />
      <Stack.Screen name="add-record" />
      <Stack.Screen name="record-detail" />
      <Stack.Screen name="log-workout" />
      <Stack.Screen name="workout-saved" />
      <Stack.Screen name="workouts" />
      <Stack.Screen name="flyaway" />
      <Stack.Screen name="oft" />
      <Stack.Screen name="assessments" />
      <Stack.Screen name="activation" />
      <Stack.Screen name="data-use" />
    </Stack>
  );
}
