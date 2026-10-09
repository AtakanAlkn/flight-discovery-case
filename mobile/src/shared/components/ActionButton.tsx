import { Pressable, StyleSheet, Text } from "react-native";

import { colors, radius, sizes, spacing, typography } from "../../theme";

type ActionButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
};

export default function ActionButton({
  label,
  onPress,
  disabled = false,
}: ActionButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[styles.button, disabled && styles.disabled]}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
    >
      <Text style={styles.text}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: sizes.touchTarget,
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
    marginTop: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
  },
  disabled: { opacity: 0.6 },
  text: { ...typography.body, fontWeight: "600", color: colors.onPrimary },
});
