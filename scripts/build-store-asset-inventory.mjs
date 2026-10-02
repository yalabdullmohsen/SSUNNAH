/**
 * T-026/T-047 — Store Asset Inventory + Release Flavor Unknown=0 gate.
 *
 * Usage:
 *   node scripts/build-store-asset-inventory.mjs
 *   node scripts/build-store-asset-inventory.mjs --check-release
 *
 * Writes: reports/store-asset-inventory.json
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join, relative, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const majalis = join(root, "artifacts/majalis");
const allowlistPath = join(root, "docs/store-release/STORE_RELEASE_ALLOWLIST.json");
const outPath = join(root, "reports/store-asset-inventory.json");
const checkRelease = process.argv.includes("--check-release");
const checkDist =
  process.env.STORE_CHECK_DIST === "1" || process.argv.includes("--check-dist");

const allowlist = JSON.parse(readFileSync(allowlistPath, "utf8"));

function walk(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir)) {
    if (name === ".DS_Store" || name === ".gitkeep") continue;
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

function relMaj(p) {
  return relative(majalis, p).split("\\").join("/");
}

function isMedia(name) {
  return /\.(mp3|m4a|caf|wav|ogg|webm)$/i.test(name);
}
function isFont(name) {
  return /\.(woff2?|ttf|otf)$/i.test(name);
}
function isRasterImage(name) {
  return /\.(png|jpe?g|webp|gif)$/i.test(name);
}
function isSvg(name) {
  return /\.svg$/i.test(name);
}

const audioKeep = new Set();
for (const row of allowlist.audioAllowlist.inReleaseBinary) {
  for (const f of row.files || []) audioKeep.add(f.replace(/^artifacts\/majalis\//, ""));
}

const assets = [];

function push(entry) {
  assets.push(entry);
}

// --- Adhan public ---
for (const f of walk(join(majalis, "public/audio/adhan"))) {
  if (!isMedia(f)) continue;
  const path = relMaj(f);
  const base = path.split("/").pop() || "";
  let cls = "INTERNAL";
  let releaseAction = "STRIP_FROM_RELEASE";
  if (/madinah|qatami/i.test(base)) {
    cls = "EXCLUDED";
  } else if (/adhan-field(-short|-full)?\.m4a$/i.test(base)) {
    cls = "CC0_APPROVED";
    releaseAction = "KEEP_IN_RELEASE";
  } else if (/haram|soft-alert/i.test(base)) {
    cls = "UNKNOWN";
  }
  push({
    id: `audio:${base}`,
    path,
    domain: "adhan",
    class: cls,
    releaseAction,
    inReleaseFlavor: releaseAction === "KEEP_IN_RELEASE",
  });
}

for (const f of walk(join(majalis, "public/sounds/adhan"))) {
  if (!isMedia(f)) continue;
  const path = relMaj(f);
  const base = path.split("/").pop() || "";
  push({
    id: `sounds:${base}`,
    path,
    domain: "adhan",
    class: /madinah|qatami/i.test(base) ? "EXCLUDED" : "INTERNAL",
    releaseAction: "STRIP_FROM_RELEASE",
    inReleaseFlavor: false,
  });
}

// --- iOS CAF ---
for (const f of walk(join(majalis, "ios/App/App/Sounds"))) {
  if (!/\.caf$/i.test(f)) continue;
  const path = relMaj(f);
  const base = path.split("/").pop() || "";
  let cls = "UNKNOWN";
  let releaseAction = "STRIP_FROM_RELEASE";
  if (/^adhan-short-field(-full)?\.caf$/i.test(base)) {
    cls = "CC0_APPROVED";
    releaseAction = "KEEP_IN_RELEASE";
  } else if (/^adhan-/i.test(base) || /^prayer_(aqsa|egypt|makkah)\.caf$/i.test(base)) {
    cls = "UNKNOWN";
  } else {
    cls = "STRIP_FROM_RELEASE";
  }
  push({
    id: `ios-caf:${base}`,
    path,
    domain: "adhan-ios",
    class: cls,
    releaseAction,
    inReleaseFlavor: releaseAction === "KEEP_IN_RELEASE",
    note: releaseAction === "STRIP_FROM_RELEASE" ? "Exclude from Store Archive Copy Bundle Resources / native strip" : undefined,
  });
}

// --- QPC fonts (sample one row + count) ---
const qpcFiles = walk(join(majalis, "public/fonts/qpc-v2")).filter((f) => isFont(f));
push({
  id: "qpc-v2-fonts",
  path: "public/fonts/qpc-v2/**",
  domain: "fonts",
  class: "OWNER_DECISION_REQUIRED",
  releaseAction: "STRIP_FROM_RELEASE",
  inReleaseFlavor: false,
  fileCount: qpcFiles.length,
  grantPath: allowlist.qpc.grantPath,
  stripPath: allowlist.qpc.stripPath,
  licensedClaim: false,
});

// --- UI OFL fonts ---
for (const f of walk(join(majalis, "public/fonts/ui"))) {
  if (!isFont(f) && !/OFL\.txt$/i.test(f)) continue;
  const path = relMaj(f);
  push({
    id: `font-ui:${path.split("/").pop()}`,
    path,
    domain: "fonts",
    class: "OFL_APPROVED",
    releaseAction: "KEEP_IN_RELEASE",
    inReleaseFlavor: true,
  });
}

// --- Images ---
const imageRoots = [
  join(majalis, "public/brand"),
  join(majalis, "public/images"),
  join(majalis, "public/sheikhs"),
];
for (const rootDir of imageRoots) {
  for (const f of walk(rootDir)) {
    if (!isRasterImage(f) && !isSvg(f)) continue;
    const path = relMaj(f);
    let cls = "APPROVED_FOR_RELEASE";
    let releaseAction = "KEEP_IN_RELEASE";
    if (path.startsWith("public/sheikhs/") && isRasterImage(f)) {
      cls = "UNKNOWN";
      releaseAction = "STRIP_FROM_RELEASE";
    }
    push({
      id: `img:${path}`,
      path,
      domain: "images",
      class: cls,
      releaseAction,
      inReleaseFlavor: releaseAction === "KEEP_IN_RELEASE",
    });
  }
}

// Root brand rasters
for (const name of readdirSync(join(majalis, "public"))) {
  const p = join(majalis, "public", name);
  if (!statSync(p).isFile()) continue;
  if (!isRasterImage(name) && !isSvg(name) && !/\.ico$/i.test(name)) continue;
  push({
    id: `img-root:${name}`,
    path: `public/${name}`,
    domain: "images",
    class: "APPROVED_FOR_RELEASE",
    releaseAction: "KEEP_IN_RELEASE",
    inReleaseFlavor: true,
  });
}

// --- Logical / non-file rows ---
const logical = [
  {
    id: "recitations-remote",
    path: null,
    domain: "recitations",
    class: "STREAM_ONLY",
    releaseAction: "STREAM_ONLY",
    inReleaseFlavor: false,
    forbidden: allowlist.recitations.forbidden,
  },
  {
    id: "lessons-corpus",
    path: null,
    domain: "content",
    class: "METADATA_ONLY",
    releaseAction: "METADATA_ONLY",
    inReleaseFlavor: false,
  },
  {
    id: "books-corpus",
    path: null,
    domain: "content",
    class: "METADATA_ONLY",
    releaseAction: "METADATA_ONLY",
    inReleaseFlavor: false,
  },
  {
    id: "fatwa-corpus",
    path: null,
    domain: "content",
    class: "METADATA_ONLY",
    releaseAction: "METADATA_ONLY",
    inReleaseFlavor: false,
  },
  {
    id: "hisn-muslim",
    path: null,
    domain: "content",
    class: "OWNER_DECISION_REQUIRED",
    releaseAction: "STRIP_FROM_RELEASE",
    inReleaseFlavor: false,
  },
  {
    id: "istanbul-cc0-rejected",
    path: null,
    domain: "adhan",
    class: "CC0_ADHAN_REJECTED_QUALITY",
    releaseAction: "STRIP_FROM_RELEASE",
    inReleaseFlavor: false,
    note: "CC0_ADHAN_REJECTED_QUALITY (T-027) — not in binary; Store v1 = system-default",
  },
  {
    id: "prayer-calculation-engine",
    path: null,
    domain: "product",
    class: "APPROVED_FOR_RELEASE",
    releaseAction: "KEEP_IN_RELEASE",
    inReleaseFlavor: true,
  },
  {
    id: "system-default-notification",
    path: null,
    domain: "adhan",
    class: "APPROVED_FOR_RELEASE",
    releaseAction: "KEEP_IN_RELEASE",
    inReleaseFlavor: true,
  },
];
for (const row of logical) push(row);

const releaseFlavor = assets.filter((a) => a.inReleaseFlavor);
const releaseUnknown = releaseFlavor.filter((a) => a.class === "UNKNOWN" || a.class === "MISSING_EVIDENCE");
const treeUnknown = assets.filter((a) => a.class === "UNKNOWN" || a.class === "MISSING_EVIDENCE");
const stripped = assets.filter((a) => a.releaseAction === "STRIP_FROM_RELEASE");
const streamOnly = assets.filter((a) => a.class === "STREAM_ONLY");
const ownerDecisions = assets.filter((a) => a.class === "OWNER_DECISION_REQUIRED");
const cc0Approved = assets.filter((a) => a.class === "CC0_APPROVED");
const oflApproved = assets.filter((a) => a.class === "OFL_APPROVED");

const summary = {
  totalAssets: assets.length,
  releaseFlavorCount: releaseFlavor.length,
  releaseFlavorUnknownCount: releaseUnknown.length,
  treeUnknownCount: treeUnknown.length,
  strippedCount: stripped.length,
  streamOnlyCount: streamOnly.length,
  ownerDecisionCount: ownerDecisions.length,
  cc0ApprovedCount: cc0Approved.length,
  oflApprovedCount: oflApproved.length,
  audioAllowlistLocked: Boolean(allowlist.audioAllowlist?.locked),
  qpcClass: allowlist.qpc.class,
  RELEASE_BINARY_HAS_ZERO_UNKNOWN_ASSETS: releaseUnknown.length === 0,
  AUDIO_RELEASE_ALLOWLIST_LOCKED: Boolean(allowlist.audioAllowlist?.locked),
  STORE_RELEASE_CONTENT_CLEARED:
    releaseUnknown.length === 0 && Boolean(allowlist.audioAllowlist?.locked),
  THIRD_PARTY_NOTICES_COMPLETE: existsSync(join(root, "docs/store-release/THIRD_PARTY_NOTICES.md")),
  ATTRIBUTIONS_COMPLETE: existsSync(join(root, "docs/store-release/ATTRIBUTIONS.md")),
};

const report = {
  schemaVersion: 2,
  phase: "T-047",
  generatedAtUtc: new Date().toISOString(),
  allowlistPath: "docs/store-release/STORE_RELEASE_ALLOWLIST.json",
  summary,
  releaseFlavor,
  stripped,
  streamOnly,
  ownerDecisions,
  treeUnknown,
  audioAllowlist: allowlist.audioAllowlist,
  qpc: allowlist.qpc,
  assets,
};

mkdirSync(join(root, "reports"), { recursive: true });
writeFileSync(outPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

console.log("store-asset-inventory OK → reports/store-asset-inventory.json");
console.log(`  total=${summary.totalAssets} releaseFlavor=${summary.releaseFlavorCount} releaseUnknown=${summary.releaseFlavorUnknownCount}`);
console.log(`  stripped=${summary.strippedCount} streamOnly=${summary.streamOnlyCount} ownerDecisions=${summary.ownerDecisionCount}`);
console.log(`  AUDIO_RELEASE_ALLOWLIST_LOCKED=${summary.AUDIO_RELEASE_ALLOWLIST_LOCKED}`);
console.log(`  RELEASE_BINARY_HAS_ZERO_UNKNOWN_ASSETS=${summary.RELEASE_BINARY_HAS_ZERO_UNKNOWN_ASSETS}`);
console.log(`  STORE_RELEASE_CONTENT_CLEARED=${summary.STORE_RELEASE_CONTENT_CLEARED}`);

if (checkRelease) {
  const failures = [];
  if (releaseUnknown.length) {
    failures.push(`release flavor still has UNKNOWN: ${releaseUnknown.map((a) => a.id).join(", ")}`);
  }
  if (!allowlist.audioAllowlist?.locked) {
    failures.push("audioAllowlist.locked must be true");
  }
  if (allowlist.qpc?.class !== "OWNER_DECISION_REQUIRED") {
    failures.push("QPC must remain OWNER_DECISION_REQUIRED (no Licensed claim)");
  }
  if (allowlist.qpc?.licensedClaimForbidden !== true) {
    failures.push("QPC licensedClaimForbidden must be true");
  }
  if (allowlist.recitations?.class !== "STREAM_ONLY") {
    failures.push("recitations must remain STREAM_ONLY");
  }
  // Istanbul must not be in binary keep list (T-027 rejected quality)
  const istanbulInBinary = (allowlist.audioAllowlist.inReleaseBinary || []).some((r) => r.id === "istanbul");
  if (istanbulInBinary) failures.push("istanbul must not be inReleaseBinary");
  const istanbulRow = (allowlist.audioAllowlist.candidatesNotInBinary || []).find((r) => r.id === "istanbul");
  if (!istanbulRow || istanbulRow.inBinary === true) {
    failures.push("istanbul must remain candidatesNotInBinary with inBinary=false");
  }
  const istanbulOk =
    istanbulRow &&
    (istanbulRow.class === "CC0_ADHAN_REJECTED_QUALITY" || istanbulRow.class === "CC0_CANDIDATE");
  if (!istanbulOk) {
    failures.push("istanbul class must be CC0_ADHAN_REJECTED_QUALITY (or legacy CC0_CANDIDATE)");
  }
  if (!existsSync(join(root, "docs/store-release/THIRD_PARTY_NOTICES.md"))) {
    failures.push("missing docs/store-release/THIRD_PARTY_NOTICES.md");
  }
  if (!existsSync(join(root, "docs/store-release/ATTRIBUTIONS.md"))) {
    failures.push("missing docs/store-release/ATTRIBUTIONS.md");
  }
  if (summary.THIRD_PARTY_NOTICES_COMPLETE !== true || summary.ATTRIBUTIONS_COMPLETE !== true) {
    failures.push("THIRD_PARTY_NOTICES_COMPLETE and ATTRIBUTIONS_COMPLETE required");
  }

  // Dist binary scan only after store:strip (STORE_CHECK_DIST / --check-dist)
  const dist = join(majalis, "dist");
  if (checkDist) {
    if (!existsSync(dist)) {
      failures.push("STORE_CHECK_DIST set but artifacts/majalis/dist missing");
    } else {
      for (const f of walk(join(dist, "audio/adhan")).concat(walk(join(dist, "sounds/adhan")))) {
        if (!isMedia(f)) continue;
        const name = f.split("/").pop() || "";
        const keep =
          /^adhan-field(-short|-full)?\.(m4a|mp3)$/i.test(name) ||
          /^adhan-short-field(-full)?\.(caf|m4a)$/i.test(name);
        if (!keep) {
          failures.push(`dist still has non-allowlisted adhan media: ${relative(majalis, f)}`);
        }
      }
      if (existsSync(join(dist, "fonts/qpc-v2"))) {
        const left = walk(join(dist, "fonts/qpc-v2")).filter((f) => isFont(f));
        if (left.length) failures.push(`dist/fonts/qpc-v2 still has ${left.length} font file(s)`);
      }
      for (const f of walk(join(dist, "sheikhs"))) {
        if (isRasterImage(f)) {
          failures.push(`dist has UNKNOWN sheikh raster: ${relative(majalis, f)}`);
        }
      }
    }
  } else {
    console.log("  note: skipped dist binary scan (use STORE_CHECK_DIST=1 after store:strip)");
  }

  if (failures.length) {
    console.error("store-asset-inventory --check-release FAILED:");
    for (const f of failures) console.error(`  ✗ ${f}`);
    process.exit(1);
  }
  console.log("store-asset-inventory --check-release PASS");
}
