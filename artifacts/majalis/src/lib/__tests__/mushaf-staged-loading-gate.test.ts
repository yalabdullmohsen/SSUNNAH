/**
 * بوابة الإقلاع المرحلي للمصحف — قراءة أولًا، أنظمة اختيارية كسولة.
 * Run: node --import tsx src/lib/__tests__/mushaf-staged-loading-gate.test.ts
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const repoRoot = resolve(root, "../..");
const read = (rel: string) => readFileSync(resolve(root, rel), "utf8");
const readRepo = (rel: string) => readFileSync(resolve(repoRoot, rel), "utf8");

const reader = read("src/features/mushaf-reader/NewMushafReader.tsx");
const session = read("src/features/mushaf-reader/mushaf-audio-session.ts");
const staged = read("src/features/mushaf-reader/mushaf-staged-boot.ts");
const prefetch = read("src/lib/prefetch-route.ts");
const mainTsx = read("src/main.tsx");
const appRoutes = read("src/AppRoutes.tsx");

console.log("=== Stage contract ===");
assert.match(staged, /MUSHAF_BOOT_STAGES/);
assert.match(staged, /"shell"/);
assert.match(staged, /"page"/);
assert.match(staged, /"font"/);
assert.match(staged, /"reading"/);
assert.match(staged, /"bookmarks"/);
assert.match(staged, /"audio"/);
assert.match(staged, /"search"/);
assert.match(staged, /"tafsir"/);
assert.match(staged, /"memorization"/);
assert.match(staged, /MUSHAF_STAGED_BUDGETS/);
assert.match(staged, /mushafReaderPageJsGzipBytesSoft:\s*40\s*\*\s*1024/);

console.log("=== Optional systems are lazy ===");
for (const mod of [
  "MushafSearchSheet",
  "MushafTafsirSheet",
  "QuranAudioPlayer",
  "MushafBookmarkComposer",
  "MushafPageBookmarkSheet",
  "MushafBookmarkMarkers",
]) {
  assert.match(reader, new RegExp(`lazy\\([\\s\\S]*${mod}`));
  assert.doesNotMatch(
    reader,
    new RegExp(`import\\s*\\{[^}]*\\b${mod}\\b[^}]*\\}\\s*from`),
  );
}

console.log("=== Audio deferred (Stage 6) ===");
assert.match(session, /ensureMushafAudioSession/);
assert.match(session, /import\("@\/core\/audio\/AudioEngine"\)/);
assert.match(session, /import\("@\/lib\/quran\/quranRecitationService"\)/);
assert.doesNotMatch(reader, /import\s*\{[^}]*getAudioEngine/);
assert.doesNotMatch(reader, /getQuranRecitationService/);
assert.match(reader, /audioArmed/);
assert.match(reader, /armAudioSession/);
assert.match(reader, /audioDockOpen \|\| audioArmed/);
assert.doesNotMatch(reader, /import\s+"@\/styles\/components\/quran-audio-chrome\.css"/);
assert.doesNotMatch(reader, /import\s+"@\/styles\/reader-bookmarks\.css"/);

console.log("=== Home isolation preserved ===");
const warm = prefetch.slice(prefetch.indexOf("HOME_WARM_ROUTES"));
assert.doesNotMatch(warm, /^\s*"\/mushaf"\s*,/m);
assert.doesNotMatch(mainTsx, /mushaf-reader\.css/);
assert.doesNotMatch(mainTsx, /mushaf-madinah\.css/);
assert.doesNotMatch(mainTsx, /NewMushafReader/);
const quranLazy = read("src/app/routes/lazy/quran.tsx");
assert.match(appRoutes, /MushafReaderPage/);
assert.match(quranLazy, /lazy\(\(\)\s*=>\s*import\("@\/pages\/quran\/MushafReaderPage"\)\)/);

console.log("=== Budget doc ===");
const doc = readRepo("docs/mushaf/MUSHAF_STAGED_LOADING.md");
assert.match(doc, /MUSHAF_BOOT_STAGES/);
assert.match(doc, /ensureMushafAudioSession/);
assert.match(doc, /40 KiB/);

console.log("mushaf-staged-loading-gate.test.ts: ok");
