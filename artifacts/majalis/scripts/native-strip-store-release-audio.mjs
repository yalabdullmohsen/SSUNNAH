#!/usr/bin/env node
/**
 * Store RC — أزل أصوات الأذان غير المدرجة في AUDIO allowlist من iOS Sounds.
 * يُشغَّل فقط لمسار Store Archive (ليس verify:ci الافتراضي).
 * الاستعادة: git checkout -- artifacts/majalis/ios/App/App/Sounds
 *
 *   node scripts/native-strip-store-release-audio.mjs
 */
import { existsSync, readdirSync, readFileSync, rmSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const appRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = join(appRoot, "../..");
const allowlist = JSON.parse(
  readFileSync(join(repoRoot, "docs/store-release/STORE_RELEASE_ALLOWLIST.json"), "utf8"),
);

const keep = new Set();
for (const row of allowlist.audioAllowlist?.inReleaseBinary || []) {
  for (const f of row.files || []) {
    const base = f.split("/").pop();
    if (base && /\.caf$/i.test(base)) keep.add(base.toLowerCase());
  }
}
keep.add("adhan-short-field.caf");
keep.add("adhan-short-field-full.caf");

const soundsDir = join(appRoot, "ios/App/App/Sounds");
if (!existsSync(soundsDir)) {
  console.log("native-strip-store-release-audio: Sounds absent — skip");
  process.exit(0);
}

let removed = 0;
for (const name of readdirSync(soundsDir)) {
  const p = join(soundsDir, name);
  if (!statSync(p).isFile() || !/\.caf$/i.test(name)) continue;
  if (keep.has(name.toLowerCase())) continue;
  rmSync(p, { force: true });
  removed += 1;
  console.log(`  removed ${relative(appRoot, p)}`);
}

console.log(
  removed > 0
    ? `✓ native-strip-store-release-audio: removed ${removed} non-allowlisted CAF (keep CC0 field shorts only)`
    : "native-strip-store-release-audio: nothing to remove",
);
