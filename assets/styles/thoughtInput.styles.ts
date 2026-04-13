import { ColorScheme } from "@/hooks/useTheme";
import { StyleSheet } from "react-native";

export const CreateThoughtInputStyles = (colors: ColorScheme) => {
  const styles = StyleSheet.create({
    container: {
      paddingHorizontal: 20,
      paddingTop: 12,
      paddingBottom: 4,
    },
    inputRow: {
      flexDirection: "row",
      alignItems: "flex-end",
      gap: 12,
    },
    input: {
      flex: 1,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 18,
      paddingHorizontal: 16,
      paddingVertical: 14,
      minHeight: 52,
      maxHeight: 120,
      fontSize: 16,
      fontWeight: "500",
      backgroundColor: colors.backgrounds.input,
      color: colors.text,
    },
    sendButton: {
      width: 52,
      height: 52,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.primary,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.24,
      shadowRadius: 12,
      elevation: 6,
    },
    sendButtonDisabled: {
      opacity: 0.45,
    },
    helperText: {
      marginTop: 10,
      marginLeft: 4,
      fontSize: 13,
      fontWeight: "500",
      color: colors.textMuted,
    },
    errorText: {
      marginTop: 10,
      marginLeft: 4,
      fontSize: 13,
      fontWeight: "600",
      color: colors.danger,
    },
  });

  return styles;
};
