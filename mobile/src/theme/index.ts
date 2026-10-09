import type { TextStyle } from "react-native";

export const colors = {
  background: "#F5F6F8",
  surface: "#FFFFFF",
  text: "#1A1D23",
  textSecondary: "#4A5160",
  textMuted: "#5F6673",
  primary: "#235DFF",
  onPrimary: "#FFFFFF",
  border: "#E1E4EA",
  danger: "#C62828",
  favorite: "#D6336C",
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  screen: 16,
} as const;

export const radius = {
  sm: 6,
  md: 10,
  lg: 16,
  pill: 999,
} as const;

export const typography = {
  title: { fontSize: 22, lineHeight: 28, fontWeight: "700" },
  subtitle: { fontSize: 17, lineHeight: 22, fontWeight: "600" },
  body: { fontSize: 15, lineHeight: 20, fontWeight: "400" },
  caption: { fontSize: 13, lineHeight: 18, fontWeight: "400" },
  label: { fontSize: 13, lineHeight: 16, fontWeight: "600" },
} as const satisfies Record<string, TextStyle>;

export const sizes = {
  touchTarget: 48,
} as const;
