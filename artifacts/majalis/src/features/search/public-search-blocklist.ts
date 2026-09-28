/**
 * Public search must not expose COMING_SOON / product-EXCLUDED destinations.
 * Used by index generation, route validation, and runtime result filtering.
 */
import { SECTIONS, isSectionComingSoon } from "@/config/sections.registry";
import { SECTION_PRODUCT_CATALOG } from "@/lib/product";

/** Explicit path prefixes that must never appear in the public search index. */
export const PUBLIC_SEARCH_BLOCKED_PREFIXES = [
  "/islamic-sects",
] as const;

export function comingSoonRoutes(): string[] {
  return SECTIONS.filter((s) => isSectionComingSoon(s)).map((s) =>
    String(s.route || "").split("?")[0].split("#")[0],
  );
}

/** Product catalog routes marked EXCLUDED or COMING_SOON publication. */
export function productExcludedSearchRoutes(): string[] {
  return SECTION_PRODUCT_CATALOG.filter(
    (e) =>
      e.searchStatus === "EXCLUDED" ||
      e.publication === "COMING_SOON" ||
      e.availability === "COMING_SOON",
  ).map((e) => String(e.canonicalRoute || "").split("?")[0].split("#")[0]);
}

export function isBlockedPublicSearchHref(href: string): boolean {
  const clean = String(href || "").split("?")[0].split("#")[0].replace(/\/$/, "") || "/";
  for (const prefix of PUBLIC_SEARCH_BLOCKED_PREFIXES) {
    if (clean === prefix || clean.startsWith(`${prefix}/`)) return true;
  }
  for (const route of comingSoonRoutes()) {
    if (!route || route === "/") continue;
    if (clean === route || clean.startsWith(`${route}/`)) return true;
  }
  // Only block product EXCLUDED routes that are section hubs dedicated to blocked content.
  // Do not block shared hubs (e.g. /discover-islam) used by multiple product ids.
  for (const route of productExcludedSearchRoutes()) {
    if (!route || route === "/" || route === "/discover-islam" || route === "/notifications") continue;
    if (route === "/assistant" || route === "/athan-settings") continue;
    if (clean === route || clean.startsWith(`${route}/`)) return true;
  }
  return false;
}
