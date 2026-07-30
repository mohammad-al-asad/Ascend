import React from "react";
import { View, Text, StyleSheet, Pressable, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../utils/useTheme";

interface CustomHeaderProps {
  title?: string;
  onBack?: () => void;
  rightElement?: React.ReactNode;
}

export const CustomHeader: React.FC<CustomHeaderProps> = ({
  title,
  onBack,
  rightElement,
}) => {
  const theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.leftSection}>
        {onBack ? (
          <Pressable onPress={onBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.textSecondary} />
          </Pressable>
        ) : (
          <View style={styles.spacer} />
        )}

        {/* Shield Logo */}
        <Image
          source={require("../../../assets/app/logo.png")}
          style={styles.logoImage}
          resizeMode="contain"
        />

        {title && (
          <Text style={[styles.titleText, { color: theme.colors.text }]}>
            {title}
          </Text>
        )}
      </View>

      <View style={styles.rightSection}>
        {rightElement}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#1F1F23",
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    marginRight: 16,
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  backText: {
    fontSize: 24,
    fontWeight: "300",
  },
  spacer: {
    width: 8,
  },
  logoImage: {
    width: 28,
    height: 28,
    marginRight: 10,
  },
  titleText: {
    fontSize: 16,
    fontWeight: "600",
  },
  rightSection: {
    justifyContent: "center",
    alignItems: "flex-end",
  },
});
