import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from "react-native";
import { useTheme } from "../../utils/useTheme";

interface CustomButtonProps {
  label: string;
  onPress: () => void;
  variant?: "filled" | "outlined" | "text";
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
}

export const CustomButton: React.FC<CustomButtonProps> = ({
  label,
  onPress,
  variant = "filled",
  disabled = false,
  loading = false,
  style,
  textStyle,
  icon,
  iconPosition = "left",
}) => {
  const theme = useTheme();

  const getButtonStyle = (pressed: boolean): ViewStyle => {
    const baseStyle: ViewStyle = {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      height: 48,
      borderRadius: 24,
      paddingHorizontal: 24,
      borderWidth: 1,
      borderColor: "transparent",
    };

    if (variant === "filled") {
      return {
        ...baseStyle,
        backgroundColor: disabled
          ? theme.colors.primaryDisabled
          : pressed
          ? theme.colors.primaryHover
          : theme.colors.primary,
        ...style,
      };
    } else if (variant === "outlined") {
      return {
        ...baseStyle,
        backgroundColor: pressed ? "rgba(255, 255, 255, 0.05)" : "transparent",
        borderColor: disabled ? theme.colors.primaryDisabled : theme.colors.primary,
        ...style,
      };
    } else {
      // Text only
      return {
        ...baseStyle,
        height: "auto",
        paddingHorizontal: 0,
        backgroundColor: "transparent",
        ...style,
      };
    }
  };

  const getTextColor = (): string => {
    if (variant === "filled") {
      return disabled ? theme.colors.textSecondary : "#FFFFFF";
    }
    return disabled ? theme.colors.primaryDisabled : theme.colors.primary;
  };

  return (
    <Pressable
      onPress={disabled || loading ? undefined : onPress}
      style={({ pressed }) => [getButtonStyle(pressed)]}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator size="small" color={getTextColor()} />
      ) : (
        <>
          {icon && iconPosition === "left" && (
            <View style={styles.iconLeftWrapper}>
              {typeof icon === "string" ? (
                <Text style={[styles.iconText, { color: getTextColor() }]}>{icon}</Text>
              ) : (
                icon
              )}
            </View>
          )}
          <Text
            style={[
              styles.buttonText,
              { color: getTextColor() },
              textStyle,
            ]}
          >
            {label}
          </Text>
          {icon && iconPosition === "right" && (
            <View style={styles.iconRightWrapper}>
              {typeof icon === "string" ? (
                <Text style={[styles.iconText, { color: getTextColor() }]}>{icon}</Text>
              ) : (
                icon
              )}
            </View>
          )}
        </>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  buttonText: {
    fontSize: 15,
    fontWeight: "700",
    textAlign: "center",
  },
  iconLeftWrapper: {
    marginRight: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  iconRightWrapper: {
    marginLeft: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  iconText: {
    fontSize: 16,
  },
});
