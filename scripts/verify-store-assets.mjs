/**
 * verify:store-assets — Store Release asset / license gate.
 * Usage: node scripts/verify-store-assets.mjs
 * Dist media: STORE_CHECK_DIST=1 after pnpm run store:strip-unresolved-assets
 * Inventory: always runs build-store-asset-inventory --check-release
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { spawnSync } from "node:child_process";

const root = resolve(import.meta.dirname, "..");
const majalis = join(root, "artifacts/majalis");
const storeDir = join(root, "docs/store-release");
const failures = [];

function fail(msg) {
  failures.push(msg);
}

function walkFiles(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir)) {
    if (name === ".gitkeep" || name === "README.md" || name === "SOURCES.md") continue;
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walkFiles(p, out);
    else out.push(p);
  }
  return out;
}

function isExcludedMediaName(name) {
  return /\.(mp3|m4a|caf|wav|ogg)$/i.test(name);
}

for (const f of [
  "STORE_SOURCE_COMMIT.txt",
  "STORE_ASSET_MANIFEST.md",
  "STORE_LICENSE_DECISIONS.md",
  "STORE_EXCLUSION_REPORT.md",
  "excluded-asset-globs.json",
  "STORE_RELEASE_ALLOWLIST.json",
]) {
  if (!existsSync(join(storeDir, f))) fail(`missing docs/store-release/${f}`);
}

const allowlist = JSON.parse(readFileSync(join(storeDir, "STORE_RELEASE_ALLOWLIST.json"), "utf8"));
if (!allowlist.audioAllowlist?.locked) fail("STORE_RELEASE_ALLOWLIST audioAllowlist.locked must be true");
if (allowlist.qpc?.class !== "OWNER_DECISION_REQUIRED") {
  fail("QPC must be OWNER_DECISION_REQUIRED (no Licensed claim)");
}
if (allowlist.recitations?.class !== "STREAM_ONLY") fail("recitations must be STREAM_ONLY");
if (!existsSync(join(majalis, "scripts/native-strip-store-release-audio.mjs"))) {
  fail("native-strip-store-release-audio.mjs missing — required for Store Archive audio boundary");
}

const commit = readFileSync(join(storeDir, "STORE_SOURCE_COMMIT.txt"), "utf8").trim();
if (!/^[0-9a-f]{40}$/i.test(commit)) fail(`STORE_SOURCE_COMMIT invalid: ${commit}`);

const globs = JSON.parse(readFileSync(join(storeDir, "excluded-asset-globs.json"), "utf8"));
if (!Array.isArray(globs.excludedFromStoreBinary) || globs.excludedFromStoreBinary.length < 1) {
  fail("excluded-asset-globs.json missing excludedFromStoreBinary");
}

const catalogSrc = readFileSync(join(majalis, "src/lib/sunnah-audio-platform/adhan-catalog.ts"), "utf8");
if (!/id:\s*"system-default"/.test(catalogSrc)) fail("adhan-catalog must define system-default");

const fnMatch = catalogSrc.match(/export function listSelectableAdhanVoices\(\)[\s\S]*?^\}/m);
if (!fnMatch) {
  fail("listSelectableAdhanVoices not found");
} else {
  const body = fnMatch[0];
  if (!body.includes('licenseStatus === "verified_for_production"')) {
    fail("listSelectableAdhanVoices must filter verified_for_production only");
  }
  if (body.includes("style_only_preview") || body.includes("pending_owner_approval")) {
    fail("listSelectableAdhanVoices must not include style_only/pending");
  }
}

const rightsSrc = readFileSync(join(majalis, "src/lib/prayer-audio-rights-registry.ts"), "utf8");
if (!/audioId:\s*"field"/.test(rightsSrc) || !/audioId:\s*"field-full"/.test(rightsSrc)) {
  fail("rights registry must document CC0 field / field-full");
}
if (!/audioId:\s*"madinah"/.test(rightsSrc) || !/audioId:\s*"qatami"/.test(rightsSrc)) {
  fail("rights registry must keep madinah/qatami records (blocked)");
}
if (!/approvedForProduction:\s*false/.test(rightsSrc)) {
  fail("rights registry must retain non-production entries");
}
// madinah / qatami must stay approvedForProduction: false (no silent flip)
{
  const madinahBlock = rightsSrc.match(/audioId:\s*"madinah"[\s\S]*?celebrityNameRisk:/);
  const qatamiBlock = rightsSrc.match(/audioId:\s*"qatami"[\s\S]*?celebrityNameRisk:/);
  if (!madinahBlock || !/approvedForProduction:\s*false/.test(madinahBlock[0])) {
    fail("madinah must remain approvedForProduction: false");
  }
  if (!qatamiBlock || !/approvedForProduction:\s*false/.test(qatamiBlock[0])) {
    fail("qatami must remain approvedForProduction: false");
  }
  if (!qatamiBlock || !/status:\s*"rejected"/.test(qatamiBlock[0])) {
    fail("qatami must remain status rejected");
  }
}

const forbiddenName =
  /(?:^|\/)(?:adhan-)?(?:qatami|madinah)(?:[-_.]|$)|madinah-general|nasser-al-qatami/i;
for (const dir of [
  join(majalis, "public/audio/adhan"),
  join(majalis, "public/sounds/adhan"),
]) {
  for (const f of walkFiles(dir)) {
    const rel = relative(majalis, f);
    if (forbiddenName.test(rel) && isExcludedMediaName(f)) {
      fail(`blocked-license media must not exist in public tree: ${rel}`);
    }
  }
}

const manifest = readFileSync(join(storeDir, "STORE_ASSET_MANIFEST.md"), "utf8");
if (!/CC0/.test(manifest)) fail("STORE_ASSET_MANIFEST must document CC0 field packs");
if (!/madinah/i.test(manifest) || !/qatami/i.test(manifest)) {
  fail("STORE_ASSET_MANIFEST must document madinah/qatami exclusion");
}
if (!/field-full/i.test(manifest) || !/\bfield\b/i.test(manifest)) {
  fail("STORE_ASSET_MANIFEST must document field / field-full");
}
if (!/QPC/i.test(manifest) || !/Hisn|حصن/i.test(manifest)) {
  fail("STORE_ASSET_MANIFEST must document QPC and Hisn owner-pending blockers");
}
if (!existsSync(join(majalis, "scripts/native-strip-qpc-fonts.mjs"))) {
  fail("native-strip-qpc-fonts.mjs missing — required for store native QPC strip");
}

const dist = join(majalis, "dist");
const checkDist = process.env.STORE_CHECK_DIST === "1" || process.argv.includes("--check-dist");
const cc0Keep =
  /(?:^|\/)adhan-field(?:-short|-full)?\.(?:m4a|mp3)$|(?:^|\/)adhan-short-field(?:-full)?\.caf$/i;
if (checkDist && existsSync(dist)) {
  for (const dir of [join(dist, "sounds/adhan"), join(dist, "audio/adhan")]) {
    for (const f of walkFiles(dir).filter((p) => isExcludedMediaName(p))) {
      if (cc0Keep.test(f)) continue;
      fail(`store-forbidden adhan media in dist: ${relative(majalis, f)}`);
    }
  }
  if (existsSync(join(dist, "fonts/qpc-v2"))) {
    for (const f of walkFiles(join(dist, "fonts/qpc-v2")).filter((p) =>
      /\.(woff2?|ttf|otf)$/i.test(p),
    )) {
      fail(`store-forbidden QPC font in dist: ${relative(majalis, f)}`);
    }
  }
  for (const f of walkFiles(join(dist, "sheikhs")).filter((p) =>
    /\.(png|jpe?g|webp|gif)$/i.test(p),
  )) {
    fail(`store-forbidden UNKNOWN sheikh raster in dist: ${relative(majalis, f)}`);
  }
} else if (existsSync(dist)) {
  console.log("  note: dist present — skipped media/QPC scan (use --check-dist after strip)");
}

const inv = spawnSync(process.execPath, [join(root, "scripts/build-store-asset-inventory.mjs"), "--check-release"], {
  cwd: root,
  encoding: "utf8",
});
if (inv.status !== 0) {
  fail("build-store-asset-inventory --check-release failed");
  if (inv.stdout) console.error(inv.stdout);
  if (inv.stderr) console.error(inv.stderr);
}

if (failures.length) {
  console.error("verify:store-assets FAILED:");
  for (const f of failures) console.error(`  ✗ ${f}`);
  process.exit(1);
}

console.log("verify:store-assets OK");
console.log(`  STORE_SOURCE_COMMIT=${commit}`);
console.log("  policy: Store RC keeps CC0_APPROVED field packs only; strips INTERNAL/UNKNOWN/QPC/rasters");
if (inv.stdout) console.log(inv.stdout.trim().split("\n").map((l) => `  ${l}`).join("\n"));
