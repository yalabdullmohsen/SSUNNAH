/**
 * Mushaf Button authority (M-BTN-1…4) — الأزرار الحية في /mushaf عبر Button الرسمي مع تكافؤ computed-style.
 * node --import tsx src/lib/__tests__/mushaf-button-authority-gate.test.ts
 * الدليل: docs/audit/MUSHAF_BUTTON_AUTHORITY.md
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const majalisRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const repoRoot = resolve(majalisRoot, "../..");
const read = (rel: string) => readFileSync(resolve(majalisRoot, rel), "utf8");
const rawCount = (src: string) => (src.match(/<button\b/g) || []).length;

/** مُحوَّلة: لا `<button` خام، تستورد Button، وكل Button فيها يمرّ عبر mushafButtonClass (تكافؤ الغلاف). */
const CONVERTED = [
  "src/features/mushaf-reader/MushafPageArrows.tsx",
  "src/features/mushaf-reader/MushafPageNumber.tsx",
  "src/features/mushaf-reader/MushafDisplayModeControl.tsx",
  "src/features/mushaf-reader/MushafPager.tsx",
  "src/features/mushaf-reader/NewMushafReader.tsx",
  "src/features/mushaf-reader/MushafControlsLayer.tsx",
  "src/features/mushaf-madinah/MushafSearchSheet.tsx",
  "src/features/mushaf-madinah/MushafTafsirSheet.tsx",
  "src/features/mushaf-madinah/quran-sheet/QuranSheetShell.tsx",
  "src/features/mushaf-madinah/MushafAudioDock.tsx",
  // موجة 2: مكوّنات غير مركّبة في /mushaf (VerifiedMushafReader الإرثي) — تحويل بنفس عقد التكافؤ
  "src/features/mushaf-reader/MushafExitControl.tsx",
  "src/features/mushaf-madinah/MushafSettingsSheet.tsx",
  "src/features/mushaf-madinah/AyahActionSheet.tsx",
] as const;

for (const rel of CONVERTED) {
  const src = read(rel);
  assert.equal(rawCount(src), 0, `${rel}: raw <button> must be 0`);
  assert.match(src, /import \{ Button \} from "@\/components\/ui\/button"/, `${rel}: imports Button`);
  assert.match(src, /mushafButtonClass/, `${rel}: uses mushafButtonClass parity`);
}

/** أزرار حوّلتها هذه الموجة تحديدًا (كل وسم Button فيها يحمل mushafButtonClass). */
const PARITY_ONLY = CONVERTED.filter((rel) => rel !== "src/features/mushaf-reader/MushafControlsLayer.tsx");
for (const rel of PARITY_ONLY) {
  const src = read(rel);
  const tags = [...src.matchAll(/<Button\b([\s\S]*?)>/g)];
  for (const [tag] of tags) {
    assert.match(tag, /mushafButtonClass\(/, `${rel}: Button without mushafButtonClass → ${tag.slice(0, 80)}`);
  }
}

/** KEEP_JUSTIFIED: MushafControls مركّب في VerifiedMushafReader الإرثي فقط (LEGACY_UNMOUNTED) — لا مسار إنتاجي. */
const KEEP: Record<string, number> = {
  "src/features/mushaf-madinah/MushafControls.tsx": 10,
};
for (const [rel, n] of Object.entries(KEEP)) {
  assert.equal(rawCount(read(rel)), n, `${rel}: KEEP_JUSTIFIED raw count ${n}`);
}
// الإرثي لا يُستورد من أي مسار خارج mushaf-madinah (البرميل index.ts غير مستخدم إنتاجيًا)
assert.doesNotMatch(read("src/pages/quran/MushafReaderPage.tsx"), /features\/mushaf-madinah/);
// غير مركّبة: NewMushafReader لا يستورد هذه المكوّنات
const reader = read("src/features/mushaf-reader/NewMushafReader.tsx");
assert.doesNotMatch(reader, /MushafExitControl|MushafSettingsSheet|AyahActionSheet|from "@\/features\/mushaf-madinah\/MushafControls"/);

// عقد التكافؤ: الغلاف <span class=""> يصبح شفافًا (display: contents + all: inherit) — في CSS عام قائم (لا ملف جديد)
const parityTs = read("src/features/mushaf-reader/mushaf-button-parity.ts");
assert.match(parityTs, /MUSHAF_BUTTON_CLASS = "mushaf-btn"/);
assert.ok(!existsSync(resolve(majalisRoot, "src/features/mushaf-reader/mushaf-button-parity.css")), "no extra CSS file");
const parityCss = read("src/styles/interaction-states.css");
const rule = parityCss.match(/\.mushaf-btn > span\[class=""\]\s*\{[^}]*\}/)?.[0] ?? "";
assert.match(rule, /all:\s*inherit;[^}]*display:\s*contents;/, "parity rule present");
assert.doesNotMatch(rule, /!important/);
assert.match(read("src/main.tsx"), /import "\.\/styles\/interaction-states\.css"/, "parity CSS loaded globally");

assert.ok(existsSync(resolve(repoRoot, "docs/audit/MUSHAF_BUTTON_AUTHORITY.md")), "audit doc exists");

const check = spawnSync(process.execPath, ["scripts/interaction-system-inventory.mjs", "--check"], {
  cwd: majalisRoot,
  encoding: "utf8",
});
assert.equal(check.status, 0, check.stderr || check.stdout);

console.log(
  `mushaf-button-authority-gate: ok (converted=${CONVERTED.length} files, keep=${Object.values(KEEP).reduce((a, b) => a + b, 0)} raw in ${Object.keys(KEEP).length} legacy files)`,
);
