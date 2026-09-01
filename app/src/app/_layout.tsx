import { Stack } from "expo-router";
import { Host } from "@expo/ui";
import { Provider } from "react-redux";
import { store, useAppSelector, useAppDispatch } from "../redux/store";
import { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { getAccessToken, getRefreshToken, getUser } from "../utils/authStorage";
import { setCredentials, setAuthLoading } from "../redux/slices/authSlice";

function AppNavigator() {
  const dispatch = useAppDispatch();
  const { isAuthenticated, user, isAuthLoading } = useAppSelector((state) => state.auth);

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

  if (isAuthLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#0F0F12" }}>
        <ActivityIndicator size="large" color="#00B4D8" />
      </View>
    );
  }

  const hasCompletedOnboarding = Boolean(user?.onboarding_completed);  

  return (
    <Host style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }}>
        {/* Unauthenticated Routes */}
        <Stack.Protected guard={!isAuthenticated}>
          <Stack.Screen name="auth" />
        </Stack.Protected>

        {/* Authenticated Onboarding Flow */}
        <Stack.Protected guard={isAuthenticated && !hasCompletedOnboarding}>
          <Stack.Screen name="onboarding" />
        </Stack.Protected>

        {/* Authenticated Main App Flow */}
        <Stack.Protected guard={isAuthenticated && hasCompletedOnboarding}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="checkin" />
          <Stack.Screen name="notifications" />
        </Stack.Protected>
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

