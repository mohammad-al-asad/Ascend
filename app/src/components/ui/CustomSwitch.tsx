import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Switch, Host } from "@expo/ui";
import { useTheme } from "../../utils/useTheme";

interface CustomSwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
}

export const CustomSwitch: React.FC<CustomSwitchProps> = ({
  value,
  onValueChange,
  label,
  description,
  disabled = false,
}) => {
  const theme = useTheme();

  return (
    <View style={[styles.container, { borderBottomColor: theme.colors.cardBorder }]}>
      <View style={styles.textContainer}>
        {label && (
          <Text style={[styles.label, { color: theme.colors.text }]}>
            {label}
          </Text>
        )}
        {description && (
          <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
            {description}
          </Text>
        )}
      </View>
      <Host matchContents style={styles.switchWrapper}>
        <Switch
          value={value}
          onValueChange={onValueChange}
          disabled={disabled}
        />
      </Host>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  textContainer: {
    flex: 1,
    paddingRight: 16,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 4,
  },
  description: {
    fontSize: 13,
    lineHeight: 18,
  },
  switchWrapper: {
    justifyContent: "center",
    alignItems: "flex-end",
    minWidth: 60,
  },
});
