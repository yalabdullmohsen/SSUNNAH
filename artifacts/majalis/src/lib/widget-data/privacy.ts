import { WIDGET_FORBIDDEN_APP_GROUP_SUBSTRINGS } from "./types";

export function assertPublicSafeWidgetJson(json: string): boolean {
  const lower = json.toLowerCase();
  return !WIDGET_FORBIDDEN_APP_GROUP_SUBSTRINGS.some((token) => {
    if (token === "email") return /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i.test(json);
    return new RegExp(`"${token}"\\s*:`).test(lower) || lower.includes(`"${token}":`);
  });
}

export const WIDGET_PRIVACY_DISPLAY_LEVELS = ["minimal", "standard"] as const;
export type WidgetPrivacyDisplayLevel = (typeof WIDGET_PRIVACY_DISPLAY_LEVELS)[number];
