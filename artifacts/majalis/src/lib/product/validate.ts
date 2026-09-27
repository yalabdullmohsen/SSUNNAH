import {
  REQUIRED_SECTION_COUNT,
  SECTION_IA_GROUPS,
  SECTION_PRODUCT_CATALOG,
} from "./section-product-catalog";
import type { SectionProductEntry } from "./types";
import { SECTION_AVAILABILITY_STATES } from "./types";

export interface ProductRegistryIssue {
  code: string;
  sectionId?: string;
  message: string;
}

export function validateSectionProductCatalog(
  catalog: readonly SectionProductEntry[] = SECTION_PRODUCT_CATALOG,
): ProductRegistryIssue[] {
  const issues: ProductRegistryIssue[] = [];
  if (catalog.length !== REQUIRED_SECTION_COUNT) {
    issues.push({
      code: "COUNT",
      message: `expected ${REQUIRED_SECTION_COUNT} sections, got ${catalog.length}`,
    });
  }

  const ids = new Set<string>();
  for (const entry of catalog) {
    if (ids.has(entry.id)) {
      issues.push({ code: "DUP_ID", sectionId: entry.id, message: "duplicate product id" });
    }
    ids.add(entry.id);
    if (!entry.arabicName.trim() || !entry.canonicalRoute.trim()) {
      issues.push({ code: "EMPTY_CORE", sectionId: entry.id, message: "name/route required" });
    }
    if (!SECTION_AVAILABILITY_STATES.includes(entry.availability)) {
      issues.push({ code: "BAD_AVAIL", sectionId: entry.id, message: entry.availability });
    }
    if (entry.availability === "COMPLETE" && entry.learningType === "curriculum") {
      issues.push({
        code: "PREMATURE_COMPLETE",
        sectionId: entry.id,
        message: "curriculum must not be COMPLETE without completeness contract evidence",
      });
    }
    if (entry.id === "firaq" && entry.availability !== "COMING_SOON") {
      issues.push({
        code: "FIRAQ_LABEL",
        sectionId: entry.id,
        message: "islamic sects must remain COMING_SOON until source policy complete",
      });
    }
    if (entry.id === "nahw-balagha" && (entry.completeContentCount ?? 0) > 0) {
      issues.push({
        code: "ARABIC_HONESTY",
        sectionId: entry.id,
        message: "arabic completeContentCount must stay 0 until approved lessons publish",
      });
    }
  }

  const grouped = new Set(SECTION_IA_GROUPS.flatMap((g) => [...g.sectionIds]));
  for (const entry of catalog) {
    if (!grouped.has(entry.id)) {
      issues.push({ code: "IA_ORPHAN", sectionId: entry.id, message: "not in any IA group" });
    }
  }
  for (const id of grouped) {
    if (!ids.has(id)) {
      issues.push({ code: "IA_UNKNOWN", sectionId: id, message: "IA references unknown section" });
    }
  }

  if (SECTION_IA_GROUPS.length !== 8) {
    issues.push({ code: "IA_GROUP_COUNT", message: `expected 8 IA groups` });
  }

  return issues;
}

export function summarizeSectionAvailability(
  catalog: readonly SectionProductEntry[] = SECTION_PRODUCT_CATALOG,
): Record<string, number> {
  const out: Record<string, number> = {};
  for (const entry of catalog) {
    out[entry.availability] = (out[entry.availability] || 0) + 1;
  }
  return out;
}

export function listRegistryGaps(
  catalog: readonly SectionProductEntry[] = SECTION_PRODUCT_CATALOG,
): SectionProductEntry[] {
  return catalog.filter((e) => e.publication === "REGISTRY_GAP" || e.registrySectionId === null);
}
