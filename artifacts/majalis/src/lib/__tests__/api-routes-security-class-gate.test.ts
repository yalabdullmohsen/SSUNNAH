/**
 * كل مسار في API_ROUTES يملك تصنيفًا أمنيًا — المسار غير المصنّف يُغلق في الإنتاج برد 404
 * (fail-closed في api-security-guard)، كما حدث لـ /api/qf-chapter-audio.
 */
import assert from "node:assert/strict";
import { API_ROUTES } from "../../../lib/api-dispatch.mjs";

const unclassified = API_ROUTES.filter((r: { securityClass?: string | null }) => !r.securityClass).map(
  (r: { prefix: string }) => r.prefix,
);
assert.deepEqual(unclassified, [], `مسارات API بلا تصنيف أمني (ستُرجع 404 في الإنتاج): ${unclassified.join(", ")}`);
console.log(`api-routes-security-class-gate: ok (${API_ROUTES.length} routes)`);
