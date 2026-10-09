/**
 * حارس: أي قراءة (جلب أو عدّ) لأذكار قاعدة البيانات من التطبيق العام يجب أن تقيّد verification_status='verified'.
 * السبب: 51 ذكرًا مستوردًا ظلّ معروضًا لأن الشرط كان «غير المرفوض» ثم لأن العدّاد لم يقيّد الحالة أصلًا.
 * تشغيل: node --import tsx src/lib/__tests__/adhkar-db-verified-only-gate.test.ts
 */
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const src = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const walk = (d: string): string[] =>
  readdirSync(d).flatMap((n) => {
    const p = join(d, n);
    if (statSync(p).isDirectory()) return n === "__tests__" || n === "admin" ? [] : walk(p);
    return /\.(ts|tsx)$/.test(n) ? [p] : [];
  });

const reads: string[] = [];
for (const f of walk(src)) {
  const text = readFileSync(f, "utf8");
  for (const m of text.matchAll(/\.from\(\s*["']verified_adhkar_items["']\s*\)/g)) {
    const chain = text.slice(m.index!, text.indexOf(";", m.index!));
    if (/\.(insert|update|upsert|delete)\(/.test(chain)) continue;
    reads.push(f);
    assert.match(chain, /\.eq\(\s*["']verification_status["']\s*,\s*["']verified["']\s*\)/, `${f}: قراءة verified_adhkar_items بلا شرط verified`);
    assert.doesNotMatch(chain, /\.neq\(\s*["']verification_status["']/, `${f}: neq على verification_status ممنوع`);
  }
}
assert.ok(reads.length >= 2, "لم تُرصد دوال الجلب والعدّ — تغيّر النمط؟");
console.log(`adhkar-db-verified-only-gate: ${reads.length} قراءة مقيّدة`);
