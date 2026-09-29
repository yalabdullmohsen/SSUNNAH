/**
 * بوابة: التقويم + بطاقات الأحكام بلا ui-card وبلا soft-card مباشر.
 * node --import tsx src/lib/__tests__/calendar-rulings-soft-gate.test.ts
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const files = [
  "src/views/CalendarPage.tsx",
  "src/components/ui-common.tsx",
  "src/components/rulings/RulingDetailSections.tsx",
] as const;

for (const rel of files) {
  const src = readFileSync(resolve(root, rel), "utf8");
  if (rel.endsWith("ui-common.tsx")) {
    const start = src.indexOf("export function RulingCard");
    assert.ok(start >= 0, "RulingCard موجود");
    const chunk = src.slice(start, start + 800);
    assert.doesNotMatch(chunk, /\bui-card\b/, "RulingCard بلا ui-card");
    assert.doesNotMatch(chunk, /\bsoft-card\b/, "RulingCard بلا soft-card مباشر");
    continue;
  }
  assert.doesNotMatch(src, /\bui-card\b/, `${rel} بلا ui-card`);
  assert.doesNotMatch(src, /\bui-card-btn\b/, `${rel} بلا ui-card-btn`);
  assert.doesNotMatch(src, /\bsoft-card\b/, `${rel} بلا soft-card مباشر`);
}

const renderGate = readFileSync(resolve(root, "scripts/calendar-render-gate.mjs"), "utf8");
assert.match(renderGate, /\.cal-month\b/, "calendar-render-gate يبحث عن .cal-month");
assert.match(renderGate, /\.cal-week\b/, "calendar-render-gate يبحث عن .cal-week");
assert.match(renderGate, /\.cal-day\b/, "calendar-render-gate يبحث عن .cal-day");

console.log("calendar-rulings-soft-gate.test.ts: ok");
