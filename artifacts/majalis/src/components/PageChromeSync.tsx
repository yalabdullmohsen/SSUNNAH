/**
 * يزامن PageChrome مع مسار wouter والوضع (فاتح/داكن).
 * DOM (theme-color / body bg) في useLayoutEffect — ذرّي مع المسار.
 * StatusBar الأصلي يبقى غير حاجب في useEffect.
 */
import { useEffect, useLayoutEffect } from "react";
import { useLocation } from "wouter";
import { applyPageChrome, applyPageChromeDom } from "@/lib/apply-page-chrome";
import { resolvePageChrome } from "@/lib/page-chrome";
import { useThemePreference } from "@/components/ThemePreferenceProvider";

export function usePageChromeSync() {
  const [location] = useLocation();
  const { resolvedTheme } = useThemePreference();

  useLayoutEffect(() => {
    const chrome = resolvePageChrome(location, resolvedTheme);
    applyPageChromeDom(chrome, chrome.key);
  }, [location, resolvedTheme]);

  useEffect(() => {
    void applyPageChrome({ pathname: location, resolvedTheme });
  }, [location, resolvedTheme]);
}

/** مكوّن بلا UI — يُوضع داخل Router + ThemePreferenceProvider */
export function PageChromeSync() {
  usePageChromeSync();
  return null;
}
