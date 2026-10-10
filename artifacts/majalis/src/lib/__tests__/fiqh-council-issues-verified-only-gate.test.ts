/**
 * حارس: لا استهلاك لـfiqh_council_issues من أي سطح عام إلا بشرط documentation_level='official_verified'
 * أو reviewer. (الشارة المرئية مؤجلة بعد الإطلاق — docs/DECISIONS_PENDING.md)
 * تشغيل: node --import tsx src/lib/__tests__/fiqh-council-issues-verified-only-gate.test.ts
 */
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const walk = (d: string): string[] =>
  readdirSync(d).flatMap((n) => {
    const p = join(d, n);
    if (statSync(p).isDirectory()) return ["__tests__", "node_modules", "admin"].includes(n) ? [] : walk(p);
    return /\.(ts|tsx|mjs|js)$/.test(n) ? [p] : [];
  });

let reads = 0;
for (const dir of ["src", "lib", "api"]) {
  let files: string[];
  try { files = walk(join(root, dir)); } catch { continue; }
  for (const f of files) {
    const text = readFileSync(f, "utf8");
    for (const m of text.matchAll(/\.from\(\s*["']fiqh_council_issues["']\s*\)/g)) {
      const chain = text.slice(m.index!, text.indexOf(";", m.index!));
      if (/\.(insert|update|upsert|delete)\(/.test(chain)) continue;
      reads++;
      assert.match(chain, /documentation_level["']\s*,\s*["']official_verified|reviewer/, `${f}: قراءة fiqh_council_issues بلا official_verified أو reviewer`);
    }
  }
}
console.log(`fiqh-council-issues-verified-only-gate: ${reads} قراءة (لا استهلاك حاليًا)`);
