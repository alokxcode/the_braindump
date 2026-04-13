import { ColorScheme } from "@/hooks/useTheme";
import { StyleSheet } from "react-native";

export const CreateThoughtOptionsModalStyles = (colors: ColorScheme) => {
  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.35)",
      justifyContent: "center",
      paddingHorizontal: 24,
    },
    modalCard: {
      borderRadius: 20,
      padding: 18,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      gap: 14,
    },
    title: {
      color: colors.text,
      fontSize: 18,
      fontWeight: "700",
    },
    editInput: {
      marginBottom: 0,
      borderColor: colors.border,
      backgroundColor: colors.backgrounds.input,
    },
    actionRow: {
      flexDirection: "row",
      gap: 10,
    },
    actionButton: {
      flex: 1,
      height: 46,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
    },
    primaryButton: {
      backgroundColor: colors.primary,
    },
    secondaryButton: {
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.bg,
    },
    dangerButton: {
      backgroundColor: colors.danger,
    },
    buttonDisabled: {
      opacity: 0.5,
    },
    dangerButtonDisabled: {
      opacity: 0.6,
    },
    buttonTextLight: {
      color: "#fff",
      fontWeight: "700",
    },
    buttonTextDark: {
      color: colors.text,
      fontWeight: "700",
    },
    previewText: {
      color: colors.textMuted,
      fontSize: 14,
    },
  });

  return styles;
};
