import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  StyleProp,
} from "react-native";
import { useTheme } from "../../utils/useTheme";

interface CustomButtonProps {
  label: string;
  onPress: () => void;
  variant?: "filled" | "outlined" | "text";
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  glow?: boolean;
  glowColor?: string;
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
  glow = false,
  glowColor,
}) => {
  const theme = useTheme();

  const getButtonStyle = (pressed: boolean): ViewStyle => {
    const baseStyle: ViewStyle = {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      height: 48,
      borderRadius: 16,
      paddingHorizontal: 24,
      borderWidth: 1,
      borderColor: "transparent",
    };

    let variantStyle: ViewStyle = {};

    if (variant === "filled") {
      variantStyle = {
        backgroundColor: disabled
          ? theme.colors.primaryDisabled
          : pressed
          ? theme.colors.primaryHover
          : theme.colors.primary,
      };
    } else if (variant === "outlined") {
      variantStyle = {
        backgroundColor: pressed ? "rgba(255, 255, 255, 0.05)" : "transparent",
        borderColor: disabled ? theme.colors.primaryDisabled : theme.colors.primary,
      };
    } else {
      // Text only
      variantStyle = {
        height: "auto",
        paddingHorizontal: 0,
        backgroundColor: "transparent",
      };
    }

    const flatStyle = (StyleSheet.flatten(style) as ViewStyle) || {};
    let glowStyle: ViewStyle = {};
    if (glow && variant === "filled" && !disabled) {
      const gColor = glowColor || flatStyle.backgroundColor?.toString() || theme.colors.primary;
      glowStyle = {
        shadowColor: gColor,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.6,
        shadowRadius: 16,
        elevation: 10,
      };
    }

    return {
      ...baseStyle,
      ...variantStyle,
      ...glowStyle,
      ...flatStyle,
    };
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
    fontSize: 16,
    fontWeight: "500",
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
    fontSize: 18,
  },
});
