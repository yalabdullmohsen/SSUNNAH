#!/usr/bin/env node
/**
 * SUNNAH_FULL_APPLICATION_LAYER_ERADICATION_AND_SINGLE_VISUAL_AUTHORITY
 * Phase 0–1 inventory engine (extend existing visual governance; no parallel DS).
 *
 * Modes:
 *   node scripts/application-layer-eradication-inventory.mjs
 *   node scripts/application-layer-eradication-inventory.mjs --check
 */
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const majalisRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = join(majalisRoot, "../..");
const srcRoot = join(majalisRoot, "src");
const outDir = join(majalisRoot, "reports", "eradication");
const docsDir = join(repoRoot, "docs", "design", "eradication");
const args = new Set(process.argv.slice(2));
const checkOnly = args.has("--check");

function walk(dir, pred = () => true, out = []) {
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name === "dist" || name === ".git") continue;
    const p = join(dir, name);
    let st;
    try {
      st = statSync(p);
    } catch {
      continue;
    }
    if (st.isDirectory()) walk(p, pred, out);
    else if (pred(name, p)) out.push(p);
  }
  return out;
}

function count(text, re) {
  return (text.match(re) || []).length;
}

function read(p) {
  return readFileSync(p, "utf8");
}

function relSrc(p) {
  return relative(srcRoot, p).replace(/\\/g, "/");
}

function classifyLayer(rel) {
  if (rel.includes("mushaf") || rel.includes("quran") || rel.includes("fonts-quran")) {
    return "SPECIAL_CASE";
  }
  if (rel.includes("admin") || rel.startsWith("styles/admin")) return "SPECIAL_CASE";
  if (
    rel.includes("sunnah-foundation-tokens") ||
    rel.includes("sunnah-foundation-v2") ||
    rel.includes("ssunnah-theme-api") ||
    rel === "app/styles/theme.css" ||
    rel.includes("motion-policy") ||
    rel.includes("z-index-layers") ||
    rel.includes("card-system-tokens") ||
    rel.includes("semantic-layer-tokens")
  ) {
    return "CANONICAL_AUTHORITY";
  }
  if (
    rel.includes("dark-mode-recovery") ||
    rel.includes("dark-mode-surfaces") ||
    rel.includes("dark-design-system") ||
    rel.includes("theme-aliases") ||
    rel.includes("design-tokens.css") ||
    rel.includes("visual-redesign-v2-tokens") ||
    rel.includes("brand-v4-contrast")
  ) {
    return "ACTIVE_COMPATIBILITY";
  }
  if (
    rel.includes("final-release") ||
    rel.includes("visual-identity-unify") ||
    rel.includes("sections-calm-polish") ||
    rel.includes("modern-ui-refresh") ||
    rel.includes("premium-dark-refine") ||
    rel.includes("design-system.css")
  ) {
    return "ABSORB_NOW";
  }
  if (rel.includes("capacitor") || rel.includes("ios-edge") || rel.includes("native-feel")) {
    return "IOS_ONLY";
  }
  if (rel.startsWith("styles/pages/")) return "KEEP_TEMPORARILY";
  return "SHARED_PLATFORM";
}

function platformFor(rel, classification) {
  if (classification === "IOS_ONLY") return "IOS_ONLY";
  if (rel.includes("admin")) return "WEB_ONLY";
  if (classification === "SPECIAL_CASE" && (rel.includes("mushaf") || rel.includes("quran"))) {
    return "SHARED_PLATFORM";
  }
  return "SHARED_PLATFORM";
}

const cssFiles = walk(srcRoot, (n) => n.endsWith(".css"));
const tsxFiles = walk(srcRoot, (n) => n.endsWith(".tsx"));
const tsFiles = walk(srcRoot, (n) => n.endsWith(".ts"));
const codeFiles = [...cssFiles, ...tsxFiles, ...tsFiles, join(srcRoot, "main.tsx")].filter(
  (p, i, a) => a.indexOf(p) === i,
);

const HEX_RE = /#(?:[0-9a-fA-F]{3,8})\b/g;
const RGB_HSL_RE = /\b(?:rgba?|hsla?)\s*\(/g;
const IMPORTANT_RE = /!important/g;
const SHADOW_RE = /box-shadow\s*:/g;
const Z_RAW_RE = /z-index\s*:\s*-?\d+/g;
const RADIUS_PX_RE = /border-radius\s*:\s*[^;]*\d+px/g;
const RULE_RE = /\{/g;
const SF_USE = /var\(\s*--sf-/g;
const SS_USE = /var\(\s*--ss-/g;
const MJ_USE = /var\(\s*--mj-/g;
const SF_DECL = /--sf-[\w-]+\s*:/g;
const SS_DECL = /--ss-[\w-]+\s*:/g;
const MJ_DECL = /--mj-[\w-]+\s*:/g;
const HEX_FALLBACK = /var\(\s*--[a-zA-Z0-9-]+\s*,\s*#[0-9a-fA-F]{3,8}/g;

let cssBytes = 0;
let important = 0;
let hex = 0;
let rgbHsl = 0;
let shadow = 0;
let zRaw = 0;
let radius = 0;
let rules = 0;
let sfUse = 0;
let ssUse = 0;
let mjUse = 0;
let sfDecl = 0;
let ssDecl = 0;
let mjDecl = 0;
let unsafeHexFallback = 0;
const perFile = [];

for (const file of cssFiles) {
  const text = read(file);
  const bytes = Buffer.byteLength(text);
  cssBytes += bytes;
  const row = {
    file: relSrc(file),
    bytes,
    hex: count(text, HEX_RE),
    rgbHsl: count(text, RGB_HSL_RE),
    important: count(text, IMPORTANT_RE),
    shadow: count(text, SHADOW_RE),
    zRaw: count(text, Z_RAW_RE),
    radiusPx: count(text, RADIUS_PX_RE),
    rules: count(text, RULE_RE),
    sfUse: count(text, SF_USE),
    ssUse: count(text, SS_USE),
    mjUse: count(text, MJ_USE),
    sfDecl: count(text, SF_DECL),
    ssDecl: count(text, SS_DECL),
    mjDecl: count(text, MJ_DECL),
    unsafeHexFallback: count(text, HEX_FALLBACK),
  };
  important += row.important;
  hex += row.hex;
  rgbHsl += row.rgbHsl;
  shadow += row.shadow;
  zRaw += row.zRaw;
  radius += row.radiusPx;
  rules += row.rules;
  sfUse += row.sfUse;
  ssUse += row.ssUse;
  mjUse += row.mjUse;
  sfDecl += row.sfDecl;
  ssDecl += row.ssDecl;
  mjDecl += row.mjDecl;
  unsafeHexFallback += row.unsafeHexFallback;
  row.classification = classifyLayer(row.file);
  row.platform = platformFor(row.file, row.classification);
  perFile.push(row);
}

const mainTsx = read(join(srcRoot, "main.tsx"));
const syncCssList = [
  ...mainTsx
    .split("function loadNonCriticalCss")[0]
    .matchAll(/^\s*import\s+["'](\.\/[^"']+\.css)["']/gm),
].map((m) => m[1].replace(/^\.\//, ""));
const deferredCssList = [...mainTsx.matchAll(/import\(\s*["'](\.\/[^"']+\.css)["']\s*\)/g)].map(
  (m) => m[1].replace(/^\.\//, ""),
);

const codeBlob = codeFiles.map((f) => {
  try {
    return read(f);
  } catch {
    return "";
  }
}).join("\n");

const consumerMap = {};
for (const row of perFile) {
  const base = row.file.split("/").pop();
  const stem = base.replace(/\.css$/, "");
  const needles = [base, row.file, `./${row.file}`, `@/${row.file}`, stem];
  let hits = 0;
  for (const n of needles) {
    let idx = 0;
    while (true) {
      const at = codeBlob.indexOf(n, idx);
      if (at < 0) break;
      hits += 1;
      idx = at + n.length;
      if (hits > 50) break;
    }
    if (hits > 50) break;
  }
  consumerMap[row.file] = {
    referenceHitsApprox: hits,
    classification: row.classification,
    platform: row.platform,
  };
}

const tokenAliasGraph = {
  foundation: "--sf-*",
  application: "--ss-*",
  bridgeLegacyControlled: "--mj-*",
  forbiddenNewFamilies: true,
  declarationCounts: { sf: sfDecl, ss: ssDecl, mj: mjDecl },
  useCounts: { sf: sfUse, ss: ssUse, mj: mjUse },
  canonicalFiles: [
    "styles/sunnah-foundation-tokens.css",
    "styles/sunnah-foundation-v2.css",
    "styles/ssunnah-theme-api.css",
    "app/styles/theme.css",
    "styles/theme-aliases.css",
    "styles/design-tokens.css",
  ],
};

const classificationCounts = {};
for (const row of perFile) {
  classificationCounts[row.classification] = (classificationCounts[row.classification] || 0) + 1;
}

const routeHints = {};
for (const f of tsxFiles) {
  const rel = relSrc(f);
  if (!/pages?\//i.test(rel) && !/routes?\//i.test(rel)) continue;
  const text = read(f);
  const cssImports = [...text.matchAll(/import\s+["']([^"']+\.css)["']/g)].map((m) => m[1]);
  if (cssImports.length) routeHints[rel] = cssImports;
}

const ownershipMap = {
  WEB_PLATFORM: {
    syncCss: syncCssList,
    deferredCss: deferredCssList.filter((p) => !/capacitor|ios-edge|native-feel/.test(p)),
  },
  IOS_APPLICATION: {
    nativeCss: deferredCssList.filter((p) => /capacitor|ios-edge|native-feel/.test(p)),
    note: "Capacitor WebView consumes shared CSS + native overlays; browser proof ≠ iOS proof",
  },
  APP_STORE_PRODUCT: {
    note: "No store actions in this program; risk tracked separately from build success",
  },
  SHARED_PLATFORM: {
    tokenAuthorities: ["--sf-*", "--ss-*", "--mj-*"],
    componentAuthorities: [
      "Button",
      "AppCard",
      "Dialog",
      "Feedback V2",
      "ListSystem",
      "Form controls",
    ],
  },
};

let inlineColor = 0;
let rawButtonFiles = 0;
let officialButtonFiles = 0;
for (const f of tsxFiles) {
  const t = read(f);
  inlineColor += count(
    t,
    /style=\{\{[\s\S]{0,240}?(?:color|background|backgroundColor|borderColor)\s*:/g,
  );
  if (/from\s+["']@\/components\/ui\/button["']/.test(t)) officialButtonFiles += 1;
  if (/<button\b/.test(t)) rawButtonFiles += 1;
}

const baseline = {
  id: "FULL_VISUAL_BASELINE",
  program: "SUNNAH_FULL_APPLICATION_LAYER_ERADICATION_AND_SINGLE_VISUAL_AUTHORITY",
  measuredAt: new Date().toISOString(),
  scope: "artifacts/majalis/src",
  cssFileCount: cssFiles.length,
  cssTotalBytes: cssBytes,
  synchronousCssImports: syncCssList.length,
  deferredCssImports: deferredCssList.length,
  selectorRuleBlocksApprox: rules,
  hexCount: hex,
  rgbHslCount: rgbHsl,
  unsafeHexFallbackCount: unsafeHexFallback,
  importantCount: important,
  rawShadowCount: shadow,
  rawRadiusPxCount: radius,
  rawZIndexCount: zRaw,
  tokenDeclarations: { sf: sfDecl, ss: ssDecl, mj: mjDecl },
  tokenUses: { sf: sfUse, ss: ssUse, mj: mjUse },
  inlineColorStyleMatches: inlineColor,
  officialButtonImportFiles: officialButtonFiles,
  rawButtonFiles,
  classificationCounts,
  tokenAuthoritiesAllowed: ["--sf-*", "--ss-*", "--mj-*"],
  forbidden: ["new token family", "ceiling raise", "mass delete"],
};

const styleDependencyGraph = {
  id: "FULL_STYLE_DEPENDENCY_GRAPH",
  syncLoadOrder: syncCssList,
  deferredLoadOrder: deferredCssList,
  layers: perFile
    .map((r) => ({
      file: r.file,
      classification: r.classification,
      platform: r.platform,
      bytes: r.bytes,
      hex: r.hex,
      consumersApprox: consumerMap[r.file]?.referenceHitsApprox ?? 0,
    }))
    .sort((a, b) => b.hex - a.hex),
};

const cssLoadOrderMap = {
  id: "CSS_LOAD_ORDER_MAP",
  synchronous: syncCssList.map((f, i) => ({ order: i + 1, file: f, phase: "sync-critical" })),
  deferred: deferredCssList.map((f, i) => ({ order: i + 1, file: f, phase: "deferred-noncritical" })),
  darkBoot: "ensure-dark-layers (ensureDarkLayersForBoot / ensureDarkCoreLayers)",
  iosNative: ["styles/capacitor-native-ux.css", "styles/ios-edge.css"],
};

const componentConsumerMap = {
  id: "COMPONENT_CONSUMER_MAP",
  note: "Approx static reference hits; dynamic selectors require runtime proof before delete",
  files: consumerMap,
};

const routeToStyleMap = {
  id: "ROUTE_TO_STYLE_MAP",
  pageLocalCssImports: routeHints,
  globalCascade: {
    sync: syncCssList,
    deferred: deferredCssList,
  },
};

mkdirSync(outDir, { recursive: true });
mkdirSync(docsDir, { recursive: true });

const artifacts = {
  "FULL_VISUAL_BASELINE.json": baseline,
  "FULL_STYLE_DEPENDENCY_GRAPH.json": styleDependencyGraph,
  "CSS_LOAD_ORDER_MAP.json": cssLoadOrderMap,
  "TOKEN_ALIAS_GRAPH.json": tokenAliasGraph,
  "COMPONENT_CONSUMER_MAP.json": componentConsumerMap,
  "ROUTE_TO_STYLE_MAP.json": routeToStyleMap,
  "WEB_IOS_SHARED_OWNERSHIP_MAP.json": ownershipMap,
  "HEX_FILE_RANKING.json": {
    id: "HEX_FILE_RANKING",
    files: perFile
      .filter((r) => r.hex > 0)
      .sort((a, b) => b.hex - a.hex)
      .map((r) => ({
        file: r.file,
        hex: r.hex,
        unsafeHexFallback: r.unsafeHexFallback,
        classification: r.classification,
        platform: r.platform,
      })),
  },
};

if (!checkOnly) {
  for (const [name, data] of Object.entries(artifacts)) {
    writeFileSync(join(outDir, name), `${JSON.stringify(data, null, 2)}\n`, "utf8");
  }
}

const required = Object.keys(artifacts);
const failures = [];
for (const name of required) {
  if (!existsSync(join(outDir, name))) failures.push(`missing report ${name}`);
}
if (!existsSync(join(docsDir, "SUNNAH_APPLICATION_LAYER_ERADICATION_PROGRAM.md"))) {
  failures.push("missing program charter doc");
}
if (!existsSync(join(docsDir, "FULL_VISUAL_BASELINE.md"))) {
  failures.push("missing FULL_VISUAL_BASELINE.md");
}

if (checkOnly) {
  if (failures.length) {
    console.error("application-layer-eradication-inventory FAIL:");
    for (const f of failures) console.error(" -", f);
    process.exit(1);
  }
  const b = JSON.parse(read(join(outDir, "FULL_VISUAL_BASELINE.json")));
  if (b.cssFileCount < 1 || b.synchronousCssImports !== 14) {
    console.error("baseline integrity fail", {
      cssFileCount: b.cssFileCount,
      sync: b.synchronousCssImports,
    });
    process.exit(1);
  }
  if (!Array.isArray(b.tokenAuthoritiesAllowed) || b.tokenAuthoritiesAllowed.length !== 3) {
    console.error("token authorities must be exactly --sf/--ss/--mj");
    process.exit(1);
  }
  console.log("application-layer-eradication-inventory: ok");
  console.log(
    JSON.stringify(
      {
        cssFiles: b.cssFileCount,
        hex: b.hexCount,
        sync: b.synchronousCssImports,
        deferred: b.deferredCssImports,
        unsafeHexFallback: b.unsafeHexFallbackCount,
      },
      null,
      2,
    ),
  );
  process.exit(0);
}

console.log("wrote eradication inventory →", relative(majalisRoot, outDir));
console.log(
  JSON.stringify(
    {
      cssFiles: baseline.cssFileCount,
      hex: baseline.hexCount,
      sync: baseline.synchronousCssImports,
      deferred: baseline.deferredCssImports,
      unsafeHexFallback: baseline.unsafeHexFallbackCount,
      classificationCounts,
    },
    null,
    2,
  ),
);
