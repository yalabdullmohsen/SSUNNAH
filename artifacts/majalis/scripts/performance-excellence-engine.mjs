#!/usr/bin/env node
/**
 * Performance Excellence Engine (Phase BF–BJ).
 * Numbers / static signals first — no speculative fixes.
 *
 *   node scripts/performance-excellence-engine.mjs
 *   node scripts/performance-excellence-engine.mjs --check
 *
 * Outputs (docs/audit + reports):
 *   RENDER_COST_REPORT
 *   MUSHAF_BOTTLENECK_REPORT
 *   STARTUP_PERFORMANCE_REPORT
 *   NETWORK_EFFICIENCY_REPORT
 *   PERFORMANCE_BUDGET_REPORT (+ PERFORMANCE_DRIFT_ALERTS)
 */
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";

const majalis = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const repo = resolve(majalis, "../..");
const srcRoot = join(majalis, "src");
const check = process.argv.includes("--check");

function walk(dir, pred, out = []) {
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name === "dist" || name === "__tests__") continue;
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

function readJson(p, fallback = null) {
  if (!existsSync(p)) return fallback;
  return JSON.parse(readFileSync(p, "utf8"));
}

function countRe(text, re) {
  return (text.match(re) || []).length;
}

const updatedAt = new Date().toISOString();
const tsxFiles = walk(srcRoot, (n) => n.endsWith(".tsx") || n.endsWith(".ts"));

// ═══════════════════════════════════════════
// 1) REACT_RENDER_COST_AUDIT (static proxies)
// ═══════════════════════════════════════════
const SURFACES = [
  { id: "Mushaf", re: /features\/mushaf|pages\/quran\/.*Mushaf|NewMushafReader|VerifiedMushaf/i },
  { id: "Prayer", re: /prayer-times|PrayerTimes|adhan|HomeCompactPrayer/i },
  { id: "Home", re: /pages\/account\/ui\/Home|components\/home\// },
  { id: "Search", re: /SearchView|GlobalSearch|unified-search|SearchInput/ },
  { id: "Lesson player", re: /LessonDetail|lesson.*player|AudioPlayer|lessons\/ui/i },
  { id: "Admin", re: /admin-v3\// },
];

function scoreRenderRisk(text, rel) {
  const signals = [];
  let score = 0;
  const useEffects = countRe(text, /\buseEffect\s*\(/g);
  const useStates = countRe(text, /\buseState\s*\(/g);
  const contexts = countRe(text, /\buseContext\s*\(|createContext\s*\(/g);
  const inlineObj = countRe(text, /(?:style|value)=\{(\{|\()/g);
  const inlineFn = countRe(text, /on[A-Z]\w+=\{\s*(?:\([^)]*\)|[A-Za-z_]\w*)\s*=>/g);
  const noMemoCb = countRe(text, /\buseCallback\s*\(/g);
  const intervals = countRe(text, /\bsetInterval\s*\(/g);
  const listeners = countRe(text, /\baddEventListener\s*\(/g);
  const providers = countRe(text, /<[A-Z]\w*Provider[\s>]/g);

  if (useEffects >= 8) {
    score += useEffects * 2;
    signals.push(`useEffect×${useEffects}`);
  } else if (useEffects >= 4) {
    score += useEffects;
    signals.push(`useEffect×${useEffects}`);
  }
  if (useStates >= 12) {
    score += Math.round(useStates * 1.5);
    signals.push(`useState×${useStates}`);
  }
  if (contexts >= 3) {
    score += contexts * 4;
    signals.push(`context×${contexts}`);
  }
  if (inlineObj >= 10) {
    score += 8;
    signals.push(`inlineObjectProp×${inlineObj}`);
  }
  if (inlineFn >= 15 && noMemoCb < 3) {
    score += 10;
    signals.push(`inlineHandlers×${inlineFn} weak-useCallback`);
  }
  if (intervals) {
    score += intervals * 6;
    signals.push(`setInterval×${intervals}`);
  }
  if (listeners >= 3) {
    score += listeners * 3;
    signals.push(`addEventListener×${listeners}`);
  }
  if (providers >= 2) {
    score += providers * 5;
    signals.push(`Provider×${providers}`);
  }
  if (/React\.memo|memo\(/.test(text)) score = Math.max(0, score - 5);

  return { rel, score, signals, useEffects, useStates, contexts, intervals, listeners };
}

const renderBySurface = [];
for (const surface of SURFACES) {
  const files = [];
  for (const abs of tsxFiles) {
    const rel = relative(srcRoot, abs).replace(/\\/g, "/");
    if (!surface.re.test(rel)) continue;
    if (!/\.(tsx)$/.test(rel) && !/use[A-Z].*\.ts$/.test(rel)) continue;
    const text = readFileSync(abs, "utf8");
    const row = scoreRenderRisk(text, rel);
    if (row.score > 0) files.push(row);
  }
  files.sort((a, b) => b.score - a.score);
  const total = files.reduce((a, f) => a + f.score, 0);
  renderBySurface.push({
    surface: surface.id,
    riskScore: total,
    hotFiles: files.slice(0, 8),
    fileCountScored: files.length,
  });
}
renderBySurface.sort((a, b) => b.riskScore - a.riskScore);

const RENDER_COST_REPORT = {
  version: 1,
  updatedAt,
  REACT_RENDER_COST_AUDIT: true,
  method: "static proxies (hooks/effects/handlers/context) — NOT wall-clock CPU",
  deviceRequired: "React Profiler / performance.measure on device for absolute CPU",
  surfaces: renderBySurface,
  highestCpuConsumersProxy: renderBySurface.slice(0, 4).map((s) => s.surface),
};

// ═══════════════════════════════════════════
// 2) MUSHAF_PERFORMANCE_DEEP_DIVE
// ═══════════════════════════════════════════
const mushafFiles = tsxFiles.filter((abs) =>
  /features\/mushaf|MushafReader|VerifiedMushaf|NewMushaf/i.test(relative(srcRoot, abs)),
);

const mushafAgg = {
  useEffect: 0,
  useState: 0,
  setInterval: 0,
  addEventListener: 0,
  subscribe: 0,
  requestAnimationFrame: 0,
  ResizeObserver: 0,
  MutationObserver: 0,
};
const mushafHot = [];
for (const abs of mushafFiles) {
  const rel = relative(srcRoot, abs).replace(/\\/g, "/");
  const text = readFileSync(abs, "utf8");
  const row = {
    path: rel,
    useEffect: countRe(text, /\buseEffect\s*\(/g),
    useState: countRe(text, /\buseState\s*\(/g),
    setInterval: countRe(text, /\bsetInterval\s*\(/g),
    addEventListener: countRe(text, /\baddEventListener\s*\(/g),
    subscribe: countRe(text, /\.subscribe\s*\(|subscribe[A-Z]\w*\s*\(/g),
    rAF: countRe(text, /\brequestAnimationFrame\s*\(/g),
    observers: countRe(text, /\b(?:Resize|Intersection|Mutation)Observer\s*\(/g),
  };
  for (const k of Object.keys(mushafAgg)) {
    if (k === "requestAnimationFrame") mushafAgg.requestAnimationFrame += row.rAF;
    else if (k === "ResizeObserver" || k === "MutationObserver") continue;
    else if (row[k] != null) mushafAgg[k] += row[k];
  }
  mushafAgg.ResizeObserver += countRe(text, /\bResizeObserver\s*\(/g);
  mushafAgg.MutationObserver += countRe(text, /\bMutationObserver\s*\(/g);
  const weight =
    row.useEffect * 2 +
    row.setInterval * 8 +
    row.addEventListener * 3 +
    row.subscribe * 4 +
    row.rAF * 3 +
    row.observers * 5;
  if (weight > 0) mushafHot.push({ ...row, weight });
}
mushafHot.sort((a, b) => b.weight - a.weight);

const mushafMeasured = {
  pageTurnLatencyMs: "NOT_MEASURED_THIS_RUN — use mushaf-turn-telemetry (DEVICE_REQUIRED)",
  layoutCost: "See docs/mushaf/MUSHAF_INTERNAL_PERFORMANCE_BASELINE.md (geometry prior measure)",
  fontLoading: "QPC pack gates — see test:qpc-font-pack",
  domNodeCount: "NOT_MEASURED_THIS_RUN",
  subscriptions: mushafAgg.subscribe,
  selectionRendering: "AyahSelectionOverlay / highlight modules — profile DEVICE_REQUIRED",
  routeChunkGzipKiB_documented: 24.51,
  routeChunkSource: "docs/mushaf/MUSHAF_INTERNAL_PERFORMANCE_BASELINE.md (commit ead50727)",
  softCeilingGzipKiB: 40,
};

const MUSHAF_BOTTLENECK_REPORT = {
  version: 1,
  updatedAt,
  MUSHAF_PERFORMANCE_DEEP_DIVE: true,
  policy: "No speculative fixes — numbers first",
  staticAggregates: mushafAgg,
  hotModules: mushafHot.slice(0, 15),
  measured: mushafMeasured,
  rankedBottleneckProxies: mushafHot.slice(0, 8).map((h) => ({
    path: h.path,
    weight: h.weight,
    drivers: [
      h.useEffect && `useEffect×${h.useEffect}`,
      h.setInterval && `interval×${h.setInterval}`,
      h.addEventListener && `listeners×${h.addEventListener}`,
      h.subscribe && `subscribe×${h.subscribe}`,
      h.rAF && `rAF×${h.rAF}`,
      h.observers && `observers×${h.observers}`,
    ].filter(Boolean),
  })),
};

// ═══════════════════════════════════════════
// 3) STARTUP_PERFORMANCE_ELIMINATION
// ═══════════════════════════════════════════
const mainPath = join(srcRoot, "main.tsx");
const mainText = existsSync(mainPath) ? readFileSync(mainPath, "utf8") : "";
const syncCss = [...mainText.matchAll(/^\s*import\s+[\"'][^\"']+\.css[\"']/gm)].map((m) =>
  m[0].replace(/^\s*import\s+[\"']/, "").replace(/[\"'];?$/, ""),
);
const deferredHints = countRe(mainText, /loadNonCriticalCss|scheduleOnIdle|import\(/g);
const baseline = readJson(join(majalis, "reports/visual-system-baseline.json"), {});
const lhciBudget = readJson(join(majalis, "performance-budget.json"), {});
const startupEvidence = {
  prodCls: 0.0004,
  prodMatch: "CURRENT_PROJECT_STATUS Batch A · STARTUP_CHROME_STABLE · LHCI_HOME_MOBILE_CLOSED",
  unusedCss: "0×3 (documented)",
  forcedReflow: "1×3 (documented)",
};

const STARTUP_PERFORMANCE_REPORT = {
  version: 1,
  updatedAt,
  STARTUP_PERFORMANCE_ELIMINATION: true,
  syncCssImportsInMain: syncCss.length,
  syncCssList: syncCss,
  deferredMechanismHints: deferredHints,
  visualBaseline: {
    mainSyncCssImports: baseline.mainSyncCssImports,
    mainDeferredCssImports: baseline.mainDeferredCssImports,
  },
  budgets: lhciBudget.webVitals || {},
  documentedField: startupEvidence,
  waterfall: [
    { stage: "HTML shell + critical CSS", costProxy: "critical-css ≤60KiB gzip gate", rank: 1 },
    { stage: "Sync CSS in main.tsx", costProxy: `${syncCss.length} imports`, rank: 2 },
    { stage: "Boot sequence / splash", costProxy: "boot-sequence + splash controller gates", rank: 3 },
    { stage: "Home hydration", costProxy: "startup-pr5 hero hydration gate", rank: 4 },
    { stage: "Deferred CSS/JS", costProxy: `mainDeferred≈${baseline.mainDeferredCssImports}`, rank: 5 },
  ],
  notMeasuredThisRun: ["FP/FCP/LCP wall-clock", "hydration CPU ms", "startup network bytes"],
  deviceRequired: "LHCI mobile home + Capacitor cold start",
};

// ═══════════════════════════════════════════
// 4) NETWORK_EFFICIENCY_PROGRAM
// ═══════════════════════════════════════════
const net = {
  supabaseFrom: 0,
  fetchCalls: 0,
  setIntervalPoll: 0,
  refetchInterval: 0,
  selectStar: 0,
  files: [],
};
for (const abs of tsxFiles) {
  const rel = relative(srcRoot, abs).replace(/\\/g, "/");
  if (/__tests__|\.test\.|scripts\//.test(rel)) continue;
  const text = readFileSync(abs, "utf8");
  const supabase = countRe(text, /\.from\(\s*["'`]/g) + countRe(text, /supabase\.from/g);
  const fetchN = countRe(text, /\bfetch\s*\(/g);
  const poll = countRe(text, /refetchInterval\s*:/g);
  const interval = countRe(text, /\bsetInterval\s*\(/g);
  const star = countRe(text, /\.select\(\s*["'`]?\*["'`]?\s*\)/g);
  if (supabase || poll || star || (interval && /prayer|search|lesson|supabase/i.test(rel))) {
    net.supabaseFrom += supabase;
    net.fetchCalls += fetchN;
    net.refetchInterval += poll;
    net.setIntervalPoll += interval;
    net.selectStar += star;
    net.files.push({
      path: rel,
      supabase,
      fetch: fetchN,
      refetchInterval: poll,
      setInterval: interval,
      selectStar: star,
      weight: supabase * 2 + poll * 8 + star * 10 + interval * 3,
    });
  }
}
net.files.sort((a, b) => b.weight - a.weight);

const NETWORK_EFFICIENCY_REPORT = {
  version: 1,
  updatedAt,
  NETWORK_EFFICIENCY_PROGRAM: true,
  totals: {
    supabaseFromApprox: net.supabaseFrom,
    fetchApprox: net.fetchCalls,
    refetchInterval: net.refetchInterval,
    setInterval: net.setIntervalPoll,
    selectStar: net.selectStar,
  },
  hotFiles: net.files.slice(0, 25),
  findings: [
    net.selectStar
      ? {
          kind: "overfetch",
          detail: `select('*') ×${net.selectStar}`,
          priority: "P0",
        }
      : null,
    net.refetchInterval
      ? {
          kind: "polling",
          detail: `refetchInterval ×${net.refetchInterval}`,
          priority: "P1",
        }
      : null,
    {
      kind: "dedupe",
      detail: "Prefer React Query / single-flight (existing lessons-inflight-dedup gates)",
      priority: "P1",
    },
  ].filter(Boolean),
  notMeasuredThisRun: ["duplicate request waterfall at runtime", "image bytes"],
};

// ═══════════════════════════════════════════
// 5) PERFORMANCE_BUDGET_ENFORCEMENT
// ═══════════════════════════════════════════
const budgetFile = readJson(join(majalis, "performance-budget.json"), {});
const assetsDir = join(majalis, "dist", "assets");
let bundleLive = null;
if (existsSync(assetsDir)) {
  const files = readdirSync(assetsDir).filter((f) => f.endsWith(".js") || f.endsWith(".css"));
  const rows = files.map((f) => {
    const buf = readFileSync(join(assetsDir, f));
    return { f, gz: gzipSync(buf, { level: 9 }).length };
  });
  const entry = rows.filter((r) => /^index-.*\.js$/.test(r.f)).sort((a, b) => b.gz - a.gz)[0];
  const css = rows.filter((r) => /^index-.*\.css$/.test(r.f)).sort((a, b) => b.gz - a.gz)[0];
  const mushaf = rows.filter((r) => /MushafReaderPage.*\.js$/.test(r.f)).sort((a, b) => b.gz - a.gz)[0];
  bundleLive = {
    entryJsGzipKiB: entry ? +(entry.gz / 1024).toFixed(2) : null,
    cssGzipKiB: css ? +(css.gz / 1024).toFixed(2) : null,
    mushafPageJsGzipKiB: mushaf ? +(mushaf.gz / 1024).toFixed(2) : null,
  };
}

const declaredBudgets = {
  jsInitialGzipKb: budgetFile.assets?.jsInitialGzipKb ?? 250,
  cssInitialGzipKb: budgetFile.assets?.cssInitialGzipKb ?? 80,
  entryJsGzipKiB_buildGate: 120,
  mushafRouteJsGzipKiB_soft: 40,
  criticalCssGzipKiB: 60,
  webVitals: budgetFile.webVitals || {},
  lighthouse: budgetFile.lighthouse || {},
};

const driftAlerts = [];
if (bundleLive?.entryJsGzipKiB != null && bundleLive.entryJsGzipKiB > declaredBudgets.entryJsGzipKiB_buildGate) {
  driftAlerts.push({
    metric: "entryJsGzipKiB",
    current: bundleLive.entryJsGzipKiB,
    budget: declaredBudgets.entryJsGzipKiB_buildGate,
    severity: "FAIL",
  });
}
if (bundleLive?.mushafPageJsGzipKiB != null && bundleLive.mushafPageJsGzipKiB > declaredBudgets.mushafRouteJsGzipKiB_soft) {
  driftAlerts.push({
    metric: "mushafRouteJsGzipKiB",
    current: bundleLive.mushafPageJsGzipKiB,
    budget: declaredBudgets.mushafRouteJsGzipKiB_soft,
    severity: "WARN",
  });
}
if ((baseline.mainSyncCssImports || 0) > 16) {
  driftAlerts.push({
    metric: "mainSyncCssImports",
    current: baseline.mainSyncCssImports,
    budget: 16,
    severity: "WARN",
  });
}
if (RENDER_COST_REPORT.surfaces[0]?.riskScore > 200) {
  driftAlerts.push({
    metric: "topSurfaceRenderRiskProxy",
    current: RENDER_COST_REPORT.surfaces[0].riskScore,
    surface: RENDER_COST_REPORT.surfaces[0].surface,
    budget: 200,
    severity: "INFO",
  });
}
if (!bundleLive) {
  driftAlerts.push({
    metric: "distBundle",
    current: null,
    severity: "INFO",
    note: "dist/ missing — run build for live gzip enforcement (test:bundle-budget / check-performance-budget)",
  });
}

const PERFORMANCE_BUDGET_REPORT = {
  version: 1,
  updatedAt,
  PERFORMANCE_BUDGET_ENFORCEMENT: true,
  source: "artifacts/majalis/performance-budget.json + test-bundle-budget.mjs",
  declaredBudgets,
  liveBundle: bundleLive,
  ciHooks: [
    "pnpm --filter @workspace/majalis run test:bundle-budget (post-build)",
    "node scripts/check-performance-budget.mjs",
    "node scripts/test-critical-css-budget.mjs",
    "test:lhci-budget / verify:lhci-threshold-calibration",
    "test:performance-excellence (this engine — static + alerts)",
  ],
  PERFORMANCE_DRIFT_ALERTS: driftAlerts,
};

// Write artifacts
mkdirSync(join(repo, "docs/audit"), { recursive: true });
mkdirSync(join(majalis, "reports"), { recursive: true });

const bundle = {
  updatedAt,
  RENDER_COST_REPORT,
  MUSHAF_BOTTLENECK_REPORT,
  STARTUP_PERFORMANCE_REPORT,
  NETWORK_EFFICIENCY_REPORT,
  PERFORMANCE_BUDGET_REPORT,
};

writeFileSync(join(majalis, "reports/performance-excellence-engine.json"), JSON.stringify(bundle, null, 2) + "\n");

function md(name, body) {
  writeFileSync(join(repo, "docs/audit", name), body);
}

md(
  "RENDER_COST_REPORT.md",
  [
    "# RENDER_COST_REPORT",
    "",
    `Generated: ${updatedAt}`,
    "",
    "**Method:** static proxies — NOT wall-clock CPU. DEVICE_REQUIRED for Profiler.",
    "",
    `Highest consumers (proxy): ${RENDER_COST_REPORT.highestCpuConsumersProxy.join(" · ")}`,
    "",
    `| Surface | Risk score | Hot files |`,
    `|---|---:|---:|`,
    ...renderBySurface.map(
      (s) => `| ${s.surface} | ${s.riskScore} | ${s.fileCountScored} |`,
    ),
    "",
    "## Hot files by surface",
    "",
    ...renderBySurface.flatMap((s) => [
      `### ${s.surface}`,
      "",
      ...s.hotFiles
        .slice(0, 5)
        .map((f) => `- \`${f.rel}\` score=${f.score} · ${f.signals.join(", ")}`),
      "",
    ]),
  ].join("\n"),
);

md(
  "MUSHAF_BOTTLENECK_REPORT.md",
  [
    "# MUSHAF_BOTTLENECK_REPORT",
    "",
    `Generated: ${updatedAt}`,
    "",
    "Policy: **No speculative fixes — numbers first.**",
    "",
    "## Static aggregates",
    "",
    `| Signal | Count |`,
    `|---|---:|`,
    ...Object.entries(mushafAgg).map(([k, v]) => `| ${k} | ${v} |`),
    "",
    "## Ranked bottleneck proxies",
    "",
    ...MUSHAF_BOTTLENECK_REPORT.rankedBottleneckProxies.map(
      (h, i) => `${i + 1}. \`${h.path}\` weight=${h.weight} · ${h.drivers.join(", ")}`,
    ),
    "",
    "## Measured / documented",
    "",
    `| Item | Value |`,
    `|---|---|`,
    ...Object.entries(mushafMeasured).map(([k, v]) => `| ${k} | ${v} |`),
    "",
    "Evidence: `docs/mushaf/MUSHAF_INTERNAL_PERFORMANCE_BASELINE.md` · turn telemetry.",
    "",
  ].join("\n"),
);

md(
  "STARTUP_PERFORMANCE_REPORT.md",
  [
    "# STARTUP_PERFORMANCE_REPORT",
    "",
    `Generated: ${updatedAt}`,
    "",
    `Sync CSS imports in main.tsx: **${syncCss.length}**`,
    "",
    "## Ranked startup cost proxies",
    "",
    ...STARTUP_PERFORMANCE_REPORT.waterfall.map(
      (w) => `${w.rank}. **${w.stage}** — ${w.costProxy}`,
    ),
    "",
    "## Documented field (prod)",
    "",
    `- CLS ${startupEvidence.prodCls}`,
    `- ${startupEvidence.prodMatch}`,
    `- unused-css ${startupEvidence.unusedCss}`,
    `- forced-reflow ${startupEvidence.forcedReflow}`,
    "",
    "## Not measured this run",
    "",
    ...STARTUP_PERFORMANCE_REPORT.notMeasuredThisRun.map((n) => `- ${n}`),
    "",
    "Budgets (performance-budget.json webVitals):",
    "",
    "```json",
    JSON.stringify(declaredBudgets.webVitals, null, 2),
    "```",
    "",
  ].join("\n"),
);

md(
  "NETWORK_EFFICIENCY_REPORT.md",
  [
    "# NETWORK_EFFICIENCY_REPORT",
    "",
    `Generated: ${updatedAt}`,
    "",
    `| Signal | Count |`,
    `|---|---:|`,
    ...Object.entries(NETWORK_EFFICIENCY_REPORT.totals).map(([k, v]) => `| ${k} | ${v} |`),
    "",
    "## Findings",
    "",
    ...NETWORK_EFFICIENCY_REPORT.findings.map((f) => `- **${f.priority}** ${f.kind}: ${f.detail}`),
    "",
    "## Hot files",
    "",
    ...NETWORK_EFFICIENCY_REPORT.hotFiles
      .slice(0, 15)
      .map(
        (f) =>
          `- \`${f.path}\` w=${f.weight}` +
          (f.selectStar ? ` select*×${f.selectStar}` : "") +
          (f.refetchInterval ? ` refetchInterval×${f.refetchInterval}` : "") +
          (f.supabase ? ` from×${f.supabase}` : ""),
      ),
    "",
  ].join("\n"),
);

md(
  "PERFORMANCE_BUDGET_REPORT.md",
  [
    "# PERFORMANCE_BUDGET_REPORT",
    "",
    `Generated: ${updatedAt}`,
    "",
    "## Declared budgets",
    "",
    `| Budget | Value |`,
    `|---|---|`,
    `| JS initial gzip (perf JSON) | ${declaredBudgets.jsInitialGzipKb} KiB |`,
    `| CSS initial gzip (perf JSON) | ${declaredBudgets.cssInitialGzipKb} KiB |`,
    `| Entry JS gzip (build gate) | ${declaredBudgets.entryJsGzipKiB_buildGate} KiB |`,
    `| Mushaf route JS soft | ${declaredBudgets.mushafRouteJsGzipKiB_soft} KiB |`,
    `| Critical CSS gzip | ${declaredBudgets.criticalCssGzipKiB} KiB |`,
    `| LCP | ${declaredBudgets.webVitals.lcpMs} ms |`,
    `| CLS | ${declaredBudgets.webVitals.cls} |`,
    "",
    "## Live bundle",
    "",
    bundleLive
      ? Object.entries(bundleLive)
          .map(([k, v]) => `- ${k}: **${v}** KiB`)
          .join("\n")
      : "_dist/ not present — NOT_MEASURED_NO_DIST_",
    "",
    "## PERFORMANCE_DRIFT_ALERTS",
    "",
    driftAlerts.length
      ? driftAlerts
          .map(
            (a) =>
              `- **${a.severity}** \`${a.metric}\`${a.current != null ? ` current=${a.current}` : ""}${a.budget != null ? ` budget=${a.budget}` : ""}${a.note ? ` — ${a.note}` : ""}`,
          )
          .join("\n")
      : "- none",
    "",
    "## CI hooks",
    "",
    ...PERFORMANCE_BUDGET_REPORT.ciHooks.map((h) => `- ${h}`),
    "",
  ].join("\n"),
);

console.log(
  `performance-excellence: renderTop=${renderBySurface[0]?.surface}:${renderBySurface[0]?.riskScore} mushafHot=${mushafHot.length} syncCss=${syncCss.length} netFiles=${net.files.length} alerts=${driftAlerts.length} dist=${bundleLive ? "yes" : "no"}`,
);

if (check) {
  const miss = [
    "RENDER_COST_REPORT.md",
    "MUSHAF_BOTTLENECK_REPORT.md",
    "STARTUP_PERFORMANCE_REPORT.md",
    "NETWORK_EFFICIENCY_REPORT.md",
    "PERFORMANCE_BUDGET_REPORT.md",
    "docs/design/PERFORMANCE_EXCELLENCE_PROGRAM.md",
  ]
    .map((f) =>
      f.startsWith("docs/") ? join(repo, f) : join(repo, "docs/audit", f),
    )
    .filter((p) => !existsSync(p));
  const failAlerts = driftAlerts.filter((a) => a.severity === "FAIL");
  if (miss.length || failAlerts.length) {
    console.error("performance-excellence --check FAIL", { miss, failAlerts });
    process.exit(1);
  }
  if (!RENDER_COST_REPORT.surfaces.length) {
    console.error("performance-excellence --check FAIL: no surfaces");
    process.exit(1);
  }
  console.log("performance-excellence --check: ok");
}
