import { Tabs, useSegments } from "expo-router";
import { View, StyleSheet, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../utils/useTheme";

export default function TabsLayout() {
  const theme = useTheme();
  const segments = useSegments();

  // Hide tab bar on nested details pages
  const subScreens = ["oft", "assessments", "notifications", "review", "report", "request", "chat", "activation", "data-use"];
  const isSubscreen = segments.some((seg) => subScreens.includes(seg));

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textTertiary,
        tabBarStyle: {
          backgroundColor: theme.colors.card,
          borderTopColor: theme.colors.cardBorder,
          height: Platform.OS === "ios" ? 88 : 64,
          paddingBottom: Platform.OS === "ios" ? 30 : 10,
          paddingTop: 10,
          borderTopWidth: 1,
          display: isSubscreen ? "none" : "flex",
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
        },
      }}
    >
      {/* Home Tab */}
      <Tabs.Screen
        name="(home)"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              size={22}
              color={color}
            />
          ),
        }}
      />

      {/* Trends Tab */}
      <Tabs.Screen
        name="trends"
        options={{
          title: "Trends",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "analytics" : "analytics-outline"}
              size={22}
              color={color}
            />
          ),
        }}
      />

      {/* Check-in Center Tab (Floating Button) */}
      <Tabs.Screen
        name="checkin"
        options={{
          title: "Check in",
          tabBarIcon: () => (
            <View style={[styles.floatingButton, { backgroundColor: theme.colors.primary }]}>
              <Ionicons name="checkmark" size={26} color="#FFFFFF" />
            </View>
          ),
          tabBarLabelStyle: {
            display: "none", // Hide label for clean float look
          },
        }}
      />

      {/* Support Tab */}
      <Tabs.Screen
        name="support"
        options={{
          title: "Support",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "people" : "people-outline"}
              size={22}
              color={color}
            />
          ),
        }}
      />

      {/* Profile Tab */}
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "person" : "person-outline"}
              size={22}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  floatingButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginTop: Platform.OS === "ios" ? -14 : -10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
});
