/**
 * store-strip-unresolved-assets — prepare Store Release Flavor from dist.
 *
 * Keeps only AUDIO allowlist CC0_APPROVED media under dist/{audio,sounds}/adhan.
 * Strips: INTERNAL / UNKNOWN adhan · QPC fonts · UNKNOWN sheikh rasters.
 * Does not delete source files in public/ (web may still use them outside store RC).
 *
 * Usage: node scripts/store-strip-unresolved-assets.mjs
 */
import { existsSync, readdirSync, rmSync, statSync, readFileSync } from "node:fs";
import { join, relative, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const dist = join(root, "artifacts/majalis/dist");
const allowlistPath = join(root, "docs/store-release/STORE_RELEASE_ALLOWLIST.json");

if (!existsSync(dist)) {
  console.log("store-strip: no dist yet — skip");
  process.exit(0);
}

const allowlist = JSON.parse(readFileSync(allowlistPath, "utf8"));
const keepNames = new Set();
for (const row of allowlist.audioAllowlist?.inReleaseBinary || []) {
  for (const f of row.files || []) {
    const base = f.split("/").pop();
    if (base) keepNames.add(base.toLowerCase());
  }
}
/* CC0 web masters also map to short names */
for (const n of [
  "adhan-field.m4a",
  "adhan-field-short.m4a",
  "adhan-field-full.m4a",
  "adhan-short-field.caf",
  "adhan-short-field-full.caf",
]) {
  keepNames.add(n);
}

let removed = 0;

function wipeDirMedia(dir, { keepAllowlisted = false } = {}) {
  if (!existsSync(dir)) return;
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) {
      wipeDirMedia(p, { keepAllowlisted });
      continue;
    }
    if (!/\.(mp3|m4a|caf|wav|ogg|webm)$/i.test(name)) continue;
    if (keepAllowlisted && keepNames.has(name.toLowerCase())) continue;
    rmSync(p, { force: true });
    removed += 1;
    console.log(`  removed ${relative(dist, p)}`);
  }
}

function wipeRasters(dir) {
  if (!existsSync(dir)) return;
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) {
      wipeRasters(p);
      continue;
    }
    if (/\.(png|jpe?g|webp|gif)$/i.test(name)) {
      rmSync(p, { force: true });
      removed += 1;
      console.log(`  removed ${relative(dist, p)} (UNKNOWN raster)`);
    }
  }
}

for (const t of [join(dist, "sounds/adhan"), join(dist, "audio/adhan")]) {
  wipeDirMedia(t, { keepAllowlisted: true });
}

const qpcDir = join(dist, "fonts/qpc-v2");
if (existsSync(qpcDir)) {
  rmSync(qpcDir, { recursive: true, force: true });
  removed += 1;
  console.log(`  removed ${relative(dist, qpcDir)}/ (QPC — OWNER_DECISION_REQUIRED Strip Path)`);
}

wipeRasters(join(dist, "sheikhs"));

console.log(`store-strip: removed ${removed} store-forbidden path(s) from dist`);
console.log(`  kept CC0 allowlisted names: ${[...keepNames].filter((n) => n.includes("field")).join(", ")}`);
