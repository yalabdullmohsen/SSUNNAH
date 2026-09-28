#!/usr/bin/env node
/**
 * Interaction System inventory + decreasing debt budget.
 *
 *   node scripts/interaction-system-inventory.mjs
 *   node scripts/interaction-system-inventory.mjs --write-budget
 *   node scripts/interaction-system-inventory.mjs --check
 */
import { readdirSync, readFileSync, writeFileSync, statSync, mkdirSync, existsSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const majalisRoot = join(fileURLToPath(import.meta.url), "..", "..");
const srcRoot = join(majalisRoot, "src");
const reportsDir = join(majalisRoot, "reports");
const budgetPath = join(reportsDir, "interaction-system-debt-budget.json");
const snapshotPath = join(reportsDir, "interaction-system-baseline.json");

const args = new Set(process.argv.slice(2));
const writeBudget = args.has("--write-budget");
const checkOnly = args.has("--check");

function walk(dir, out = [], pred = () => true) {
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name === "dist") continue;
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
  return (text.match(re) || []).length;
}

const tsxFiles = walk(srcRoot, [], (n) => n.endsWith(".tsx"));
const cssFiles = walk(srcRoot, [], (n) => n.endsWith(".css"));

let rawButtonElements = 0;
let rawButtonFiles = 0;
let officialButtonImports = 0;
let actionButtonImports = 0;
let iconButtonImports = 0;
let divSpanOnClick = 0;
let buttonWithoutTypeInFormish = 0;
let fabMentions = 0;
let btnImportant = 0;
let btnHex = 0;

const OFFICIAL_IMPORT =
  /from\s+["']@\/components\/ui\/button["']|from\s+["']@\/components\/ui\/button\.tsx["']/;
const ACTION_IMPORT =
  /PrimaryButton|SecondaryButton|ActionButton|from\s+["']@\/components\/design-system/;
const ICON_IMPORT = /\bIconButton\b/;

for (const file of tsxFiles) {
  const text = readFileSync(file, "utf8");
  const rawCount = countMatches(text, /<button\b/g);
  if (rawCount > 0) {
    rawButtonFiles += 1;
    rawButtonElements += rawCount;
  }
  if (OFFICIAL_IMPORT.test(text)) officialButtonImports += 1;
  if (/ActionButton|PrimaryButton|SecondaryButton/.test(text) && !file.includes("/design-system/")) {
    actionButtonImports += 1;
  }
  if (ICON_IMPORT.test(text) && !file.endsWith("Buttons.tsx")) iconButtonImports += 1;
  divSpanOnClick += countMatches(text, /<(?:div|span)\b[^>]*\bonClick=/g);
  /* buttons missing type= inside same file that has <form */
  if (/<form\b/.test(text)) {
    const buttons = text.match(/<button\b[^>]*>/g) || [];
    for (const b of buttons) {
      if (!/\btype\s*=/.test(b)) buttonWithoutTypeInFormish += 1;
    }
  }
  if (/scroll-to-top|floating-back|data-floating|AssistantFloating|fab-|FloatingBack/i.test(text)) {
    fabMentions += 1;
  }
}

for (const file of cssFiles) {
  const text = readFileSync(file, "utf8");
  const chunks = text.split(/(?=[.#\[]?[a-zA-Z_-]*(?:button|btn|fab|action-btn|icon-btn))/g);
  for (const chunk of chunks.slice(0, 400)) {
    if (!/button|btn|fab|action-btn|icon-btn/i.test(chunk.slice(0, 80))) continue;
    btnImportant += countMatches(chunk.slice(0, 1200), /!important/g);
    btnHex += countMatches(chunk.slice(0, 1200), /#[0-9a-fA-F]{3,8}\b/g);
  }
}

const metrics = {
  measuredAt: new Date().toISOString(),
  scope: "artifacts/majalis/src",
  tsxFiles: tsxFiles.length,
  rawButtonFiles,
  rawButtonElements,
  officialButtonImportFiles: officialButtonImports,
  actionButtonConsumerFiles: actionButtonImports,
  iconButtonConsumerFiles: iconButtonImports,
  divSpanOnClick,
  formButtonsMissingType: buttonWithoutTypeInFormish,
  floatingControlFileMentions: fabMentions,
  buttonRelatedImportantApprox: btnImportant,
  buttonRelatedHexApprox: btnHex,
};

mkdirSync(reportsDir, { recursive: true });

const ceilingKeys = [
  "rawButtonFiles",
  "rawButtonElements",
  "divSpanOnClick",
  "formButtonsMissingType",
  "floatingControlFileMentions",
  "buttonRelatedImportantApprox",
  "buttonRelatedHexApprox",
];

const floorKeys = ["officialButtonImportFiles", "actionButtonConsumerFiles"];

function toBudget(m) {
  const ceilings = {};
  for (const k of ceilingKeys) ceilings[k] = m[k];
  const floors = {};
  for (const k of floorKeys) floors[k] = m[k];
  return {
    version: 1,
    policy: "decreasing-ceilings",
    note: "Ceilings must not rise; floors (canonical adoption) must not fall without documented exception.",
    ceilings,
    floors,
    updatedAt: m.measuredAt,
  };
}

writeFileSync(snapshotPath, `${JSON.stringify(metrics, null, 2)}\n`, "utf8");

if (writeBudget || !existsSync(budgetPath)) {
  writeFileSync(budgetPath, `${JSON.stringify(toBudget(metrics), null, 2)}\n`, "utf8");
  console.log("wrote", relative(majalisRoot, budgetPath));
}

if (checkOnly || args.has("--check")) {
  const budget = JSON.parse(readFileSync(budgetPath, "utf8"));
  const failures = [];
  for (const k of ceilingKeys) {
    if (metrics[k] > budget.ceilings[k]) failures.push(`${k}: ${metrics[k]} > ${budget.ceilings[k]}`);
  }
  for (const k of floorKeys) {
    if (metrics[k] < (budget.floors?.[k] ?? 0)) failures.push(`${k}: ${metrics[k]} < floor ${budget.floors[k]}`);
  }
  if (failures.length) {
    console.error("interaction-system-debt-budget FAIL:");
    for (const f of failures) console.error(" -", f);
    process.exit(1);
  }
  console.log("interaction-system-debt-budget: ok");
  console.log(JSON.stringify({ ceilings: budget.ceilings, floors: budget.floors, measured: metrics }, null, 2));
  process.exit(0);
}

console.log(JSON.stringify(metrics, null, 2));
