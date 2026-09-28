/**
 * بوابة رسم استيراد المصحف الحي — لا استيراد ثابت من archived إلا CSS/شيتات lazy موثّقة.
 * تشغيل: node --import tsx src/lib/__tests__/mushaf-live-import-graph-gate.test.ts
 */
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const readerDir = join(root, "src/features/mushaf-reader");

function listTs(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    if (name.endsWith(".ts") || name.endsWith(".tsx")) out.push(join(dir, name));
  }
  return out;
}

const STATIC_MADINAH_IMPORT =
  /(?:^|\n)\s*import\s+[^;]*from\s+["']@\/features\/mushaf-madinah\/(?!mushaf-madinah\.css)[^"']+["']/;

const files = listTs(readerDir);
assert.ok(files.some((f) => f.endsWith("NewMushafReader.tsx")));

for (const file of files) {
  const src = readFileSync(file, "utf8");
  const staticHits = src.match(new RegExp(STATIC_MADINAH_IMPORT, "g"));
  assert.equal(
    staticHits,
    null,
    `${file} must not statically import mushaf-madinah (except documented CSS)`,
  );
}

const newReader = readFileSync(join(readerDir, "NewMushafReader.tsx"), "utf8");
assert.match(newReader, /@\/features\/mushaf-shared\//);
assert.match(newReader, /mushaf-madinah\.css/);
assert.match(newReader, /import\("@\/features\/mushaf-madinah\/MushafTafsirSheet"\)/);
assert.match(newReader, /import\("@\/features\/mushaf-madinah\/MushafSearchSheet"\)/);
assert.doesNotMatch(newReader, /VerifiedMushafReader/);

const sharedIdx = readFileSync(join(root, "src/features/mushaf-shared/index.ts"), "utf8");
assert.doesNotMatch(sharedIdx, /from\s+["']@\/features\/mushaf-madinah/);
assert.doesNotMatch(sharedIdx, /from\s+["']\.\/\.\.\/mushaf-madinah/);

console.log("mushaf-live-import-graph-gate.test.ts: ok");
