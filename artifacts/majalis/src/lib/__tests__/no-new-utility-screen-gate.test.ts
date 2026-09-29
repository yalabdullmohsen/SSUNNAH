/**
 * بوابة: لا UtilityScreen جديد خارج قائمة KEEP (إعدادات/أدوات).
 * Run: node --import tsx src/lib/__tests__/no-new-utility-screen-gate.test.ts
 */
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const majalisRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const srcRoot = resolve(majalisRoot, "src");

/** المستهلكون المسموحون — إعدادات/أدوات فقط + تعريف النمط (KEEP ≤ 3) */
const ALLOWLIST = new Set([
  "components/design-system/screens/patterns.tsx",
  "pages/account/ui/SettingsView.tsx",
  "pages/account/ui/NotificationSettingsView.tsx",
  "pages/worship/ui/AdhanSettingsView.tsx",
]);

const MAX_CONSUMERS = 3;

function walkTsx(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) {
      if (name === "__tests__" || name === "node_modules") continue;
      walkTsx(p, out);
    } else if (name.endsWith(".tsx") && !name.endsWith(".test.tsx")) {
      out.push(p);
    }
  }
  return out;
}

const consumers: string[] = [];
for (const file of walkTsx(srcRoot)) {
  const rel = relative(srcRoot, file).replace(/\\/g, "/");
  const text = readFileSync(file, "utf8");
  if (!text.includes("UtilityScreen")) continue;
  if (rel.endsWith("patterns.tsx")) {
    consumers.push(rel);
    continue;
  }
  consumers.push(rel);
}

const productConsumers = consumers.filter((c) => c !== "components/design-system/screens/patterns.tsx");
assert.ok(
  productConsumers.length <= MAX_CONSUMERS,
  `UtilityScreen consumers=${productConsumers.length} exceeds ceiling ${MAX_CONSUMERS}: ${productConsumers.join(", ")}`,
);

for (const rel of productConsumers) {
  assert.ok(
    ALLOWLIST.has(rel),
    `UtilityScreen outside allowlist: ${rel} — migrate to AppPage/DetailScreen/DashboardScreen or add to KEEP with contract`,
  );
}

const matrix = readFileSync(
  resolve(majalisRoot, "../../docs/design/UTILITYSCREEN_MIGRATION_MATRIX.md"),
  "utf8",
);
assert.match(matrix, /UTILITYSCREEN MIGRATION MATRIX/);
assert.match(matrix, /−119|Delta/);

console.log(
  `no-new-utility-screen-gate.test.ts: ok (product consumers=${productConsumers.length} ≤ ${MAX_CONSUMERS})`,
);
