import { Stack, useRouter, useSegments } from "expo-router";
import { Host } from "@expo/ui";
import { Provider } from "react-redux";
import { store, useAppSelector, useAppDispatch } from "../redux/store";
import { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { getAccessToken, getRefreshToken, getUser } from "../utils/authStorage";
import { setCredentials, setAuthLoading } from "../redux/slices/authSlice";

function AppNavigator() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const segments = useSegments();
  const { isAuthenticated, onboardingStatus, isAuthLoading } = useAppSelector((state) => state.auth);

  useEffect(() => {
    const hydrateAuth = async () => {
      try {
        const token = await getAccessToken();
        const refresh = await getRefreshToken();
        const userObj = await getUser();

        if (token && refresh && userObj) {
          dispatch(
            setCredentials({
              user: userObj,
              accessToken: token,
              refreshToken: refresh,
            })
          );
        } else {
          dispatch(setAuthLoading(false));
        }
      } catch (error) {
        console.error("Failed to hydrate authentication state", error);
        dispatch(setAuthLoading(false));
      }
    };

    hydrateAuth();
  }, [dispatch]);

  useEffect(() => {
    if (!isAuthLoading) {
      const inAuthGroup = segments[0] === "auth";
      if (!isAuthenticated && !inAuthGroup) {
        // Redirect to sign-in if unauthenticated and not on an auth screen
        router.replace("/auth/signin" as any);
      } else if (isAuthenticated && inAuthGroup) {
        // Redirect to home if authenticated but trying to access auth screens
        if (onboardingStatus === "incomplete") {
          router.replace("/onboarding" as any);
        } else {
          router.replace("/(tabs)/(home)" as any);
        }
      }
    }
  }, [isAuthenticated, isAuthLoading, segments, onboardingStatus]);

  if (isAuthLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#0F0F12" }}>
        <ActivityIndicator size="large" color="#00B4D8" />
      </View>
    );
  }

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
