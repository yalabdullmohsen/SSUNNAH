/**
 * U4 — STARTUP_CHROME_STABLE structural contract.
 * Run: node --import tsx src/lib/__tests__/u4-startup-chrome-gate.test.ts
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const read = (rel: string) => readFileSync(resolve(root, rel), "utf8");

const html = read("index.html");
const crit = read("src/styles/critical-first-paint.css");
const pack = readFileSync(
  resolve(root, "../../docs/remediation/U4_STARTUP_CHROME_CLS_READY_PACK.md"),
  "utf8",
);

console.log("=== U4 removal timing ===");
assert.match(html, /isStartupChromeReady/, "ready predicate present");
assert.match(html, /hasHeader && hasBottom/, "standard routes wait header+bottom");
assert.match(html, /prayer[\s\S]*hasBottom/, "prayer waits bottom only");
assert.match(html, /mushaf[\s\S]*return true/, "mushaf ready without chrome");
assert.match(html, /أبقِ data-sc/, "keep data-sc after skeleton remove");
assert.doesNotMatch(
  html,
  /removeAttribute\("data-sc"\)/,
  "boot must not clear data-sc (CLS on app-shell)",
);
assert.doesNotMatch(
  html,
  /إزالة الهيكل عند أول commit لـ #root/,
  "no first-commit strip policy",
);
const app = read("src/App.tsx");
assert.match(app, /dataset\.sc\s*=\s*"top"/, "App keeps data-sc on standard routes");

console.log("=== U4 flow reserve ===");
assert.match(html, /dataset\.sc\s*=\s*"top"/, "data-sc=top wired");
assert.match(html, /dataset\.sc\s*=\s*"bottom"/, "data-sc=bottom for prayer");
assert.match(
  html,
  /html\[data-sc=top\] #root\{padding-top:var\(--app-top-chrome-h\)/,
  "critical inline reserves header flow on #root",
);
assert.match(
  html,
  /html\[data-sc=top\] \.app-top-chrome\{position:fixed/,
  "React chrome fixed while skeleton active (no double height)",
);
/* القفل = 65/113 عند inset صفري + ما يزيد من safe-area-inset-top عن 12px (الهيدر يحشو max(inset,12px)) —
   بلا ذلك يختفي أعلى المحتوى تحت الهيدر الثابت على iPhone. */
assert.match(html, /data-home-chrome="0"\]\{--app-top-chrome-h:calc\(65px \+ max\(var\(--inset-top,0px\) - 12px,0px\)\)\}/, "non-home header lock 65 + safe-area excess");
assert.match(html, /data-home-chrome="1"\]\{--app-top-chrome-h:calc\(113px \+ max\(var\(--inset-top,0px\) - 12px,0px\)\)\}/, "home header lock 113 + safe-area excess");
assert.match(html, /#mj-startup-bottom\{[^}]*height:64px/, "bottom lock 64px not clobberable --nav-h");
assert.match(html, /html\.pts-immersive #mj-startup-header/, "prayer hides header ph");
assert.match(html, /html\.chrome-immersive #mj-startup-chrome/, "mushaf hides full ph");
assert.doesNotMatch(
  crit,
  /data-startup-chrome|data-sc=top/,
  "U4 reserve stays in mj-lcp-critical only (CLS budget)",
);

/* المكتب: الرئيسية 880–1279 هيدر + صف تيكّر (121px)، ≥1280 التيكّر داخل الهيدر (65px كباقي الصفحات) */
assert.match(html, /@media \(min-width:880px\)\{html\[data-sc=top\]\[data-home-chrome="1"\]\{--app-top-chrome-h:calc\(121px/);
assert.match(html, /@media \(min-width:1280px\)\{html\[data-sc=top\]\[data-home-chrome="1"\]\{--app-top-chrome-h:calc\(65px/);

console.log("=== U4 placeholders ===");
assert.match(html, /id="mj-startup-header"/);
assert.match(html, /id="mj-startup-hero-ph"/);
assert.match(html, /id="mj-startup-bottom"/);
assert.match(html, /id="mj-home-flow-reserve"/, "home flow reserve in #root");
assert.match(html, /#mj-startup-hero-ph\{display:none\}/, "absolute hero-ph never paints (flow reserve owns layout)");
assert.match(
  html,
  /\[data-home-chrome="1"\] #mj-home-flow-reserve\{display:block\}/,
  "home shows in-flow reserve at FP",
);
assert.match(
  html,
  /#mj-home-flow-hero-ph\{[^}]*min-height:18rem/,
  "flow hero matches real hero geometry",
);
assert.match(
  html,
  /#mj-home-flow-hero-ph\{[^}]*(?:background-color|background):#0f5c45/,
  "flow hero paints final emerald at FP",
);
assert.match(
  html,
  /#mj-home-flow-start-ph\{min-height:12\.5rem/,
  "flow start-here matches real band geometry",
);
assert.match(
  html,
  /#mj-startup-bottom[^}]*#0a4530|\.bottom-nav\{background:#0a4530/,
  "prayer bottom chrome matches final nav surface",
);
assert.match(
  html,
  /__rs === "mushaf-immersive"[\s\S]*removeChild/,
  "mushaf strips full skeleton",
);
assert.match(
  html,
  /__rs === "prayer-dark"[\s\S]*mj-startup-header[\s\S]*remove/,
  "prayer keeps bottom placeholder",
);

console.log("=== U4 geometry contracts in critical ===");
assert.match(crit, /\.home-page-hero\.page-hero-mj[\s\S]*min-height:\s*18rem/);
assert.match(crit, /\.app-top-chrome[\s\S]*min-height:\s*var\(--app-top-chrome-h/);
assert.match(
  html,
  /--header-h:calc\(var\(--header-chrome\)\+max\(var\(--inset-top,0px\),12px\)/,
  "header-h includes navbar pad max(inset,12)",
);
/* حجز صف الشريط = الارتفاع النهائي (شريط + .25rem = 46.4px) من الرمز الوحيد — انظر ticker-row-token-gate */
assert.match(html, /--ticker-row-h:calc\(var\(--ticker-h\) \+ \.25rem\)/);
assert.match(html, /__hc !== "1"[\s\S]*mj-startup-hero-ph/, "strip hero node off-home");
assert.match(
  html,
  /mj-home-flow-reserve[\s\S]*homeChrome !== "1"[\s\S]*remove\(\)/,
  "strip home flow reserve off-home (no false hero presence)",
);
assert.match(html, /\.app-back-btn--bar\.fixed-back-bar/);

console.log("=== U4 ready pack status ===");
assert.match(pack, /STARTUP_CHROME_STABLE|CHROME_FP_EQUALS_FINAL/);

console.log("u4-startup-chrome-gate: ok");
