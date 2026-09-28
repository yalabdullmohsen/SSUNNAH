#!/usr/bin/env node
/**
 * Visual System Inventory + decreasing debt budget gate (PR-1).
 *
 * Modes:
 *   node scripts/visual-system-inventory.mjs              # print + write reports
 *   node scripts/visual-system-inventory.mjs --write-budget  # freeze ceilings = current
 *   node scripts/visual-system-inventory.mjs --check       # fail if any ceiling exceeded
 *
 * Budgets are ceilings: existing debt is allowed; growth is not.
 * Mushaf CSS is counted in totals but never mutated by this script.
 */
import { readdirSync, readFileSync, writeFileSync, statSync, mkdirSync, existsSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const majalisRoot = join(fileURLToPath(import.meta.url), "..", "..");
const srcRoot = join(majalisRoot, "src");
const reportsDir = join(majalisRoot, "reports");
const budgetPath = join(reportsDir, "visual-system-debt-budget.json");
const snapshotPath = join(reportsDir, "visual-system-baseline.json");

const args = new Set(process.argv.slice(2));
const writeBudget = args.has("--write-budget");
const checkOnly = args.has("--check");

function walk(dir, out = [], pred = () => true) {
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
    if (st.isDirectory()) walk(p, out, pred);
    else if (pred(name, p)) out.push(p);
  }
  return out;
}

function countMatches(text, re) {
  const m = text.match(re);
  return m ? m.length : 0;
}

function readUtf(p) {
  return readFileSync(p, "utf8");
}

const cssFiles = walk(srcRoot, [], (n) => n.endsWith(".css"));
const tsxFiles = walk(srcRoot, [], (n) => n.endsWith(".tsx"));
const tsFiles = walk(srcRoot, [], (n) => n.endsWith(".ts"));
const codeFiles = [...cssFiles, ...tsxFiles, ...tsFiles];

let important = 0;
let hex = 0;
let rgbHsl = 0;
let mjUse = 0;
let sfUse = 0;
let ssUse = 0;
let mjDecl = 0;
let sfDecl = 0;
let ssDecl = 0;
let boxShadow = 0;
let zIndexRaw = 0;
let borderRadiusPx = 0;
let ruleApprox = 0;

const HEX_RE = /#(?:[0-9a-fA-F]{3,8})\b/g;
const RGB_HSL_RE = /\b(?:rgba?|hsla?)\s*\(/g;
const MJ_USE_RE = /--mj-[\w-]+/g;
const SF_USE_RE = /--sf-[\w-]+/g;
const SS_USE_RE = /--ss-[\w-]+/g;
const MJ_DECL_RE = /--mj-[\w-]+\s*:/g;
const SF_DECL_RE = /--sf-[\w-]+\s*:/g;
const SS_DECL_RE = /--ss-[\w-]+\s*:/g;
const IMPORTANT_RE = /!important/g;
const SHADOW_RE = /box-shadow\s*:/g;
const Z_RAW_RE = /z-index\s*:\s*\d+/g;
const RADIUS_PX_RE = /border-radius\s*:\s*[^;]*\d+px/g;
const RULE_RE = /\{/g;

const foundationCss = join(srcRoot, "styles", "sunnah-foundation-tokens.css");
const themeApiCss = join(srcRoot, "styles", "ssunnah-theme-api.css");

for (const file of cssFiles) {
  const text = readUtf(file);
  important += countMatches(text, IMPORTANT_RE);
  hex += countMatches(text, HEX_RE);
  rgbHsl += countMatches(text, RGB_HSL_RE);
  mjUse += countMatches(text, MJ_USE_RE);
  sfUse += countMatches(text, SF_USE_RE);
  ssUse += countMatches(text, SS_USE_RE);
  mjDecl += countMatches(text, MJ_DECL_RE);
  sfDecl += countMatches(text, SF_DECL_RE);
  ssDecl += countMatches(text, SS_DECL_RE);
  boxShadow += countMatches(text, SHADOW_RE);
  zIndexRaw += countMatches(text, Z_RAW_RE);
  borderRadiusPx += countMatches(text, RADIUS_PX_RE);
  ruleApprox += countMatches(text, RULE_RE);
}

let inlineColorStyles = 0;
let buttonImportFiles = 0;
let rawButtonFiles = 0;
const buttonImportRe = /from\s+["']@\/components\/ui\/button["']/;
const rawButtonRe = /<button\b/;

for (const file of [...tsxFiles, ...tsFiles]) {
  const text = readUtf(file);
  mjUse += countMatches(text, MJ_USE_RE);
  sfUse += countMatches(text, SF_USE_RE);
  ssUse += countMatches(text, SS_USE_RE);
  if (/\.tsx$/.test(file)) {
    if (buttonImportRe.test(text)) buttonImportFiles += 1;
    if (rawButtonRe.test(text)) rawButtonFiles += 1;
    inlineColorStyles += countMatches(
      text,
      /style=\{\{[\s\S]{0,240}?(?:color|background|backgroundColor|borderColor)\s*:/g,
    );
  }
}

/* New --mj-* declarations outside theme/identity allowlist (prevention for growth) */
const MJ_DECL_ALLOW = new Set([
  "app/styles/theme.css",
  "styles/theme-aliases.css",
  "styles/tokens.css",
  "styles/design-tokens.css",
  "styles/brand-v4.css",
  "styles/ssunnah-theme-api.css",
]);

let mjDeclOutsideAllow = 0;
const mjDeclOutsideFiles = [];
for (const file of cssFiles) {
  const rel = relative(srcRoot, file).replace(/\\/g, "/");
  if (MJ_DECL_ALLOW.has(rel) || rel.startsWith("app/styles/")) continue;
  const text = readUtf(file);
  const n = countMatches(text, MJ_DECL_RE);
  if (n > 0) {
    mjDeclOutsideAllow += n;
    mjDeclOutsideFiles.push({ file: rel, count: n });
  }
}

const mainTsx = readUtf(join(srcRoot, "main.tsx"));
const syncCssImports = countMatches(mainTsx, /import\s+["']\.\/[^"']+\.css["']/g);
const deferredCssHints = countMatches(mainTsx, /import\(["']\.\/[^"']+\.css["']\)/g);

const metrics = {
  measuredAt: new Date().toISOString(),
  scope: "artifacts/majalis/src",
  cssFiles: cssFiles.length,
  tsxFiles: tsxFiles.length,
  ruleBlocksApprox: ruleApprox,
  important,
  hexInCss: hex,
  rgbHslInCss: rgbHsl,
  mjTokenRefs: mjUse,
  sfTokenRefs: sfUse,
  ssTokenRefs: ssUse,
  mjDeclarations: mjDecl,
  sfDeclarations: sfDecl,
  ssDeclarations: ssDecl,
  mjDeclOutsideAllowlist: mjDeclOutsideAllow,
  boxShadowDecls: boxShadow,
  zIndexRawDecls: zIndexRaw,
  borderRadiusPxDecls: borderRadiusPx,
  inlineColorStyleMatches: inlineColorStyles,
  officialButtonImportFiles: buttonImportFiles,
  rawButtonFiles,
  mainSyncCssImports: syncCssImports,
  mainDeferredCssImports: deferredCssHints,
  foundationFilePresent: existsSync(foundationCss),
  themeApiFilePresent: existsSync(themeApiCss),
};

mkdirSync(reportsDir, { recursive: true });

const budgetKeys = [
  "cssFiles",
  "important",
  "hexInCss",
  "rgbHslInCss",
  "mjDeclarations",
  "mjDeclOutsideAllowlist",
  "boxShadowDecls",
  "zIndexRawDecls",
  "borderRadiusPxDecls",
  "inlineColorStyleMatches",
  "rawButtonFiles",
];

function toBudget(m) {
  const ceilings = {};
  for (const k of budgetKeys) ceilings[k] = m[k];
  return {
    version: 1,
    policy: "decreasing-ceilings",
    note: "Ceilings must not rise. Lower intentionally in later waves; never raise without documented exception.",
    floors: {
      officialButtonImportFiles: m.officialButtonImportFiles,
      sfTokenRefs: m.sfTokenRefs,
      ssTokenRefs: m.ssTokenRefs,
    },
    ceilings,
    updatedAt: m.measuredAt,
  };
}

if (writeBudget) {
  const budget = toBudget(metrics);
  writeFileSync(budgetPath, `${JSON.stringify(budget, null, 2)}\n`, "utf8");
  writeFileSync(snapshotPath, `${JSON.stringify(metrics, null, 2)}\n`, "utf8");
  console.log("wrote", relative(majalisRoot, budgetPath));
  console.log("wrote", relative(majalisRoot, snapshotPath));
}

writeFileSync(snapshotPath, `${JSON.stringify(metrics, null, 2)}\n`, "utf8");

if (!existsSync(budgetPath) && !writeBudget) {
  writeFileSync(budgetPath, `${JSON.stringify(toBudget(metrics), null, 2)}\n`, "utf8");
  console.log("initialized budget", relative(majalisRoot, budgetPath));
}

if (checkOnly || args.has("--check")) {
  if (!existsSync(budgetPath)) {
    console.error("visual-system-debt-budget: missing budget file");
    process.exit(1);
  }
  const budget = JSON.parse(readUtf(budgetPath));
  const failures = [];
  for (const k of budgetKeys) {
    const ceiling = budget.ceilings?.[k];
    if (typeof ceiling !== "number") {
      failures.push(`budget missing ceiling for ${k}`);
      continue;
    }
    if (metrics[k] > ceiling) {
      failures.push(`${k}: ${metrics[k]} > ceiling ${ceiling}`);
    }
  }
  const floors = budget.floors || {};
  for (const [k, floor] of Object.entries(floors)) {
    if (typeof floor === "number" && typeof metrics[k] === "number" && metrics[k] < floor) {
      failures.push(`${k}: ${metrics[k]} < floor ${floor} (canonical adoption must not regress)`);
    }
  }
  if (failures.length) {
    console.error("visual-system-debt-budget FAIL:");
    for (const f of failures) console.error(" -", f);
    process.exit(1);
  }
  console.log("visual-system-debt-budget: ok (within ceilings; floors held)");
  console.log(JSON.stringify({ ceilings: budget.ceilings, measured: Object.fromEntries(budgetKeys.map((k) => [k, metrics[k]])) }, null, 2));
  process.exit(0);
}

console.log(JSON.stringify(metrics, null, 2));
if (mjDeclOutsideFiles.length) {
  console.log("mjDeclOutsideAllowlist sample:", mjDeclOutsideFiles.slice(0, 15));
}
