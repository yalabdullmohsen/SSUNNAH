/**
 * Program 13 — Shubuhat response center contract.
 * Deterministic completeness only — never invents rebuttals or sources.
 */
import type { DawahShubha } from "@/lib/dawah-service";

export const SHUBUHAT_CANONICAL_LIST_ROUTE = "/discover-islam/doubts";
export const SHUBUHAT_LEGACY_ALIAS_ROUTE = "/shubuhat";

/** Program 13 required fields for a public detail page. */
export const SHUBUHAT_REQUIRED_FIELDS = [
  "title",
  "shubha_text",
  "short_answer",
  "detailed_refutation",
  "evidences",
  "updated_at",
] as const;

export type ShubuhatCompletenessTier =
  | "STRUCTURE_ONLY"
  | "EVIDENCE_PARTIAL"
  | "PROVENANCE_PARTIAL"
  | "PROVENANCE_COMPLETE"
  | "BLOCKED_INCOMPLETE";

export interface ShubuhatContractIssue {
  code: string;
  field?: string;
  message: string;
}

export function validateShubuhatStructure(item: DawahShubha): ShubuhatContractIssue[] {
  const issues: ShubuhatContractIssue[] = [];
  if (!item.slug?.trim()) issues.push({ code: "EMPTY_SLUG", field: "slug", message: "slug required" });
  if (!item.title?.trim()) issues.push({ code: "EMPTY_TITLE", field: "title", message: "title required" });
  if (!item.shubha_text?.trim()) {
    issues.push({ code: "EMPTY_QUESTION", field: "shubha_text", message: "exact question required" });
  }
  if (!item.short_answer?.trim()) {
    issues.push({ code: "EMPTY_SHORT", field: "short_answer", message: "concise answer required" });
  }
  if (!item.detailed_refutation?.trim()) {
    issues.push({ code: "EMPTY_DETAIL", field: "detailed_refutation", message: "detailed answer required" });
  }
  if (!item.updated_at?.trim()) {
    issues.push({ code: "EMPTY_UPDATED", field: "updated_at", message: "last updated required" });
  }
  if (!Array.isArray(item.evidences) || item.evidences.length === 0) {
    issues.push({ code: "NO_EVIDENCE", field: "evidences", message: "at least one evidence required" });
  }
  return issues;
}

export function shubuhatCompletenessTier(item: DawahShubha): ShubuhatCompletenessTier {
  const structural = validateShubuhatStructure(item);
  if (structural.length > 0) return "BLOCKED_INCOMPLETE";
  const hasSources = Array.isArray(item.sources) && item.sources.some((s) => s.title?.trim());
  const hasEvidenceText = item.evidences.some((e) => e.ref?.trim() && e.text?.trim());
  if (!hasEvidenceText) return "EVIDENCE_PARTIAL";
  if (!hasSources) return "PROVENANCE_PARTIAL";
  return "PROVENANCE_COMPLETE";
}

/** Public search may index only PROVENANCE_COMPLETE records. */
export function isShubuhatSearchEligible(item: DawahShubha): boolean {
  return shubuhatCompletenessTier(item) === "PROVENANCE_COMPLETE";
}

export function summarizeShubuhatCatalog(items: readonly DawahShubha[]): {
  total: number;
  structureOk: number;
  provenanceComplete: number;
  provenancePartial: number;
  blocked: number;
} {
  let structureOk = 0;
  let provenanceComplete = 0;
  let provenancePartial = 0;
  let blocked = 0;
  for (const item of items) {
    const tier = shubuhatCompletenessTier(item);
    if (tier === "BLOCKED_INCOMPLETE") blocked += 1;
    else structureOk += 1;
    if (tier === "PROVENANCE_COMPLETE") provenanceComplete += 1;
    if (tier === "PROVENANCE_PARTIAL" || tier === "EVIDENCE_PARTIAL") provenancePartial += 1;
  }
  return {
    total: items.length,
    structureOk,
    provenanceComplete,
    provenancePartial,
    blocked,
  };
}
