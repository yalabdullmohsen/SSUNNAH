import type { ReactNode } from "react";

/**
 * Composition seam for platform provider ownership.
 * QueryClientProvider + root ErrorBoundary remain in main.tsx (boot-critical).
 * Theme/Font/Language/UserPreferences/Auth compose inside App.tsx.
 * This wrapper is the documented marker so ownership stays single-sourced.
 */
export const PLATFORM_PROVIDER_OWNERSHIP = {
  rootBoundary: "ErrorBoundary (main.tsx)",
  query: "QueryClientProvider + createAppQueryClient (main.tsx)",
  compositionSeam: "AppProviders (main.tsx → App)",
  theme: "ThemePreferenceProvider (App.tsx)",
  font: "FontPreferenceProvider (App.tsx)",
  language: "LanguageProvider (App.tsx)",
  userPrefs: "UserPreferencesProvider (App.tsx)",
  auth: "AuthProvider (App.tsx)",
  prayer: "PrayerCountdownProvider (App.tsx, deferred)",
} as const;

export function AppProviders({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
