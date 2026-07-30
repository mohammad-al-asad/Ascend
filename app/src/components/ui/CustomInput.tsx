import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput } from "react-native";
import { useTheme } from "../../utils/useTheme";

interface CustomInputProps {
  label?: string;
  placeholder?: string;
  secureTextEntry?: boolean;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
}

export const CustomInput: React.FC<CustomInputProps> = ({
  label,
  placeholder,
  secureTextEntry = false,
  value,
  onChangeText,
  error,
}) => {
  const theme = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.container}>
      {label && (
        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
          {label}
        </Text>
      )}
      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: theme.colors.card,
            borderColor: error
              ? theme.colors.dangerText
              : isFocused
              ? theme.colors.primary
              : theme.colors.cardBorder,
          },
        ]}
      >
        <TextInput
          placeholder={placeholder}
          secureTextEntry={secureTextEntry}
          value={value}
          onChangeText={onChangeText}
          placeholderTextColor={theme.colors.textTertiary}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={{
            flex: 1,
            height: "100%",
            paddingHorizontal: 12,
            color: theme.colors.text,
            fontSize: 15,
          }}
        />
      </View>
      {error && (
        <Text style={[styles.errorText, { color: theme.colors.dangerText }]}>
          {error}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: "100%",
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 6,
    textTransform: "capitalize",
  },
  inputContainer: {
    borderRadius: 8,
    borderWidth: 1,
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",
  },
  errorText: {
    fontSize: 11,
    marginTop: 4,
  },
});
