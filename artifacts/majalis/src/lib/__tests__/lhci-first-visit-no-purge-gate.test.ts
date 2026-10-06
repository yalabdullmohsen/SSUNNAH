/**
 * بوابة: أول زيارة لا تفرض مسح كاش/إعادة تحميل — حماية LCP لـ LHCI home mobile.
 * تشغيل: node --import tsx src/lib/__tests__/lhci-first-visit-no-purge-gate.test.ts
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "../../..");
const html = readFileSync(resolve(root, "index.html"), "utf8");
const boot = readFileSync(resolve(root, "src/lib/boot-sequence.ts"), "utf8");
const purge = readFileSync(resolve(root, "src/lib/runtime-cache-purge.ts"), "utf8");

assert.match(html, /v14-release-fresh-2026-09/);
assert.match(html, /var _prevDsv = localStorage\.getItem\("majalis-design-v"\)/);
assert.match(
  html,
  /if \(_prevDsv\) \{[\s\S]{0,280}?localStorage\.setItem\("majalis_force_cache_purge", "1"\)/,
  "لا تُضبط majalis_force_cache_purge في أول زيارة بلا design-v سابق",
);
/* لا version-boot حاجب: كان يخزّن 8 أحرف بينما الحزمة 7 → reload في أول زيارة */
assert.doesNotMatch(html, /boot-legacy-cache\.js/);

/* الإقلاع: أول زيارة (لا prev ولا force) لا تُفرغ ثم تعيد التحميل */
assert.match(purge, /if \(!force && !changed\)/);
assert.match(purge, /if \(version && !prev\)/);
assert.match(boot, /void purgeStaleRuntimeCaches\(\)/);
assert.doesNotMatch(boot, /reloadOnce/, "لا reload عند الإقلاع");

console.log("lhci-first-visit-no-purge-gate.test.ts: ok");
