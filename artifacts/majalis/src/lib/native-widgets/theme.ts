/** هوية سُنّة للودجت — تباين AA على سطح فاتح. لا نص باهت. */
export const WIDGET_THEME_AA = {
  primaryText: "#15382D",
  secondaryText: "#48645A",
  mutedText: "#5F7168",
  emerald: "#0F5C3F",
  emeraldDark: "#0A4530",
  background: "#F8F6F1",
  card: "#FFFFFF",
  border: "rgba(15, 92, 63, 0.12)",
  onEmerald: "#F7F1E4",
} as const;

export type WidgetThemeMode = "light" | "dark" | "system";
