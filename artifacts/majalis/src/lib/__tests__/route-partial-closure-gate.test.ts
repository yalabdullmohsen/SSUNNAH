/**
 * PHASE D — إغلاق مسارات PARTIAL في ROUTE_DEBT_FULL_CLASSIFICATION (دين المستودع لا الجهاز).
 *
 * يثبت:
 *  1) إصلاحات لوحة المفاتيح (Tabs بالأسهم + roving tabIndex · Escape/تركيز/حبس في حوارات التأكيد ·
 *     عدم خطف Enter/Space من الأزرار في عداد التسبيح · لوحات tabpanel لأهداف aria-controls).
 *  2) التباين محسوبًا من قيم التوكنات الفعلية (WCAG AA ≥4.5:1 نهارًا وليلًا).
 *  3) Startup CLS: هندسة الهيدر/هيكل /prophets تصل مع App، وملاحظة المزامنة لا تُدرج فوق المحتوى.
 *  4) أدلة تشغيلية (axe/Tab/Reflow/CLS) لكل مسار + تحديث المصفوفات + تصنيف مُعاد توليده بلا انحراف.
 *  Keyboard/Contrast/StartupCLS/RTL الجهازية تبقى DEVICE_REQUIRED (لا اعتماد مزيّف).
 *
 * node --import tsx src/lib/__tests__/route-partial-closure-gate.test.ts
 */
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const majalisRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const repoRoot = resolve(majalisRoot, "../..");
const src = (rel: string) => readFileSync(resolve(majalisRoot, "src", rel), "utf8");
const readRepo = (rel: string) => readFileSync(resolve(repoRoot, rel), "utf8");

const PARTIAL_ROUTES = [
  "/settings",
  "/login",
  "/register",
  "/about",
  "/privacy",
  "/terms",
  "/prophets",
  "/tasbih",
  "/adhan-help",
] as const;

// ─── 1. لوحة المفاتيح ─────────────────────────────────────────────────────────
const tablist = src("lib/tablist-keyboard.ts");
for (const key of ["ArrowLeft", "ArrowRight", "Home", "End"]) assert.match(tablist, new RegExp(`"${key}"`));
assert.match(tablist, /direction === "rtl"/, "الأسهم تحترم اتجاه RTL");
assert.match(tablist, /\.focus\(\)[\s\S]*\.click\(\)/, "تفعيل تلقائي للتبويب المُركَّز");

const tabSystem = src("components/design-system/TabSystem.tsx");
assert.match(tabSystem, /role="tab"[\s\S]{0,400}onKeyDown=\{onTablistKeyDown\}/, "ContentTabs: التبويبات غير النشطة (tabIndex=-1) تُبلغ بالأسهم");
assert.match(tabSystem, /tabIndex=\{active \? 0 : -1\}/);

const dialogHook = src("hooks/useDialogKeyboard.ts");
assert.match(dialogHook, /e\.key === "Escape"/);
assert.match(dialogHook, /trapFocus/);
assert.match(dialogHook, /e\.key !== "Tab"/);
assert.match(dialogHook, /returnFocusRef/);
assert.match(dialogHook, /active !== document\.body/, "المُشغِّل المُزال لا يُعاد إليه التركيز (body)");

const tasbih = src("pages/worship/ui/TasbihView.tsx");
assert.match(tasbih, /`tasbih-wird-pill\$\{item\.id === active\?\.id \? " is-active" : ""\}`/, "مسافة قبل is-active");
assert.doesNotMatch(tasbih, /\? "is-active" : ""/);
assert.match(tasbih, /role="tablist"[\s\S]{0,800}role="tab"[\s\S]{0,600}onKeyDown=\{onTablistKeyDown\}/);
assert.match(tasbih, /tabIndex=\{item\.id === active\?\.id \? 0 : -1\}/);
assert.match(tasbih, /id="tasbih-wird-panel"\s+role="tabpanel"/);
assert.match(tasbih, /useDialogKeyboard\(confirmDelete, confirmRef, closeConfirm/);
assert.match(tasbih, /ref=\{confirmRef\} className="tasbih-confirm" role="alertdialog"/);
assert.doesNotMatch(tasbih, /tasbih-sync-note/, "ملاحظة المزامنة لا تُدرج فوق المحتوى (CLS)");
assert.match(tasbih, /className="tasbih-offline-note" role="status"[\s\S]{0,200}syncNote/);

const counter = src("components/reading/TasbeehCounter.tsx");
assert.match(counter, /const INTERACTIVE_TARGET =[\s\S]*button[\s\S]*a\[href\][\s\S]*\[role="tab"\]/);
assert.match(counter, /target\?\.closest\?\.\(INTERACTIVE_TARGET\)\) return;/, "Enter/Space على زر لا تتحول إلى تسبيح");

const settings = src("pages/account/ui/SettingsView.tsx");
assert.match(settings, /role="alertdialog"/);
assert.match(settings, /ref=\{deleteDialogRef\}/);
assert.match(
  settings,
  /useDialogKeyboard\(deleteDialogOpen, deleteDialogRef, closeDeleteDialog, \{\s*initialFocusRef: deleteCancelRef,\s*trapFocus: true,/,
  "حوار حذف الحساب: تركيز على إلغاء · Escape · حبس Tab",
);
assert.match(settings, /ref=\{deleteCancelRef\}/);

const prophets = src("views/ProphetStoriesPage.tsx");
assert.match(prophets, /role="tablist" aria-label="طريقة عرض قصص الأنبياء">[\s\S]{0,400}onKeyDown=\{onTablistKeyDown\}/);
assert.match(prophets, /aria-controls=\{view === t\.id \? `pst-panel-\$\{t\.id\}` : undefined\}/);
assert.match(prophets, /tabIndex=\{view === t\.id \? 0 : -1\}/);
for (const id of ["grid", "timeline", "ulul-azm", "miracles", "compare"]) {
  assert.match(prophets, new RegExp(`role="tabpanel" id="pst-panel-${id}" aria-labelledby="pst-tab-${id}"`), `tabpanel ${id}`);
}
assert.match(prophets, /ref=\{questionRef\} tabIndex=\{-1\}/, "الاختبار: التركيز يتبع السؤال الجديد");
assert.match(prophets, /prevViewRef\.current === "quiz"/, "الخروج من الاختبار يعيد التركيز للتبويب");

const login = src("pages/account/ui/LoginView.tsx");
assert.match(login, /role: "tabpanel",\s*id: `login-panel-\$\{/, "هدف aria-controls لتبويبات الحساب");
assert.match(login, /function keepAuthTabFocus/);
assert.match(login, /keepAuthTabFocus\(next\)/);

const adhanHelp = src("pages/worship/ui/AdhanHelpView.tsx");
assert.match(adhanHelp, /<h2 className="ads-card__head" id=\{`help-\$\{s\.id\}`\}>/, "عناوين أقسام المساعدة دلالية");
assert.match(src("styles/pages/adhan-settings.css"), /h2\.ads-card__head \{\s*margin: 0;/);

// ─── 2. التباين من قيم التوكنات ───────────────────────────────────────────────
type RGBA = { r: number; g: number; b: number; a: number };
type TokenMap = Map<string, string>;

function stripAtBlocks(css: string): string {
  let out = "";
  let i = 0;
  while (i < css.length) {
    const at = css.indexOf("@media", i);
    if (at < 0) {
      out += css.slice(i);
      break;
    }
    out += css.slice(i, at);
    const open = css.indexOf("{", at);
    let depth = 1;
    let j = open + 1;
    while (j < css.length && depth > 0) {
      if (css[j] === "{") depth++;
      else if (css[j] === "}") depth--;
      j++;
    }
    i = j;
  }
  return out.replace(/\/\*[\s\S]*?\*\//g, "");
}

const DARK_SEL = /^(html|:root)?(\.dark|\[data-theme="dark"\]|\.theme-dark)$/;
function tokenMaps(files: string[]): { light: TokenMap; dark: TokenMap } {
  const light: TokenMap = new Map();
  const dark: TokenMap = new Map();
  for (const f of files) {
    const css = stripAtBlocks(src(f));
    for (const m of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
      const parts = m[1]!.split(",").map((s) => s.trim());
      const target = parts.every((p) => p === ":root") ? light : parts.every((p) => DARK_SEL.test(p)) ? dark : null;
      if (!target) continue;
      for (const d of m[2]!.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) target.set(d[1]!, d[2]!.trim());
    }
  }
  return { light, dark };
}

function splitTop(s: string): string[] {
  const out: string[] = [];
  let depth = 0;
  let cur = "";
  for (const ch of s) {
    if (ch === "(") depth++;
    if (ch === ")") depth--;
    if (ch === "," && depth === 0) {
      out.push(cur.trim());
      cur = "";
    } else cur += ch;
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
}

function parseColor(v: string, map: TokenMap, depth = 0): RGBA {
  assert.ok(depth < 25, `token cycle: ${v}`);
  const s = v.trim();
  if (s === "transparent") return { r: 0, g: 0, b: 0, a: 0 };
  const hex = s.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (hex) {
    const h = hex[1]!.length === 3 ? hex[1]!.replace(/./g, (c) => c + c) : hex[1]!;
    return { r: parseInt(h.slice(0, 2), 16), g: parseInt(h.slice(2, 4), 16), b: parseInt(h.slice(4, 6), 16), a: 1 };
  }
  const rgb = s.match(/^rgba?\(([^)]+)\)$/);
  if (rgb) {
    const [r, g, b, a] = rgb[1]!.split(/[\s,/]+/).filter(Boolean).map(Number);
    return { r: r!, g: g!, b: b!, a: a ?? 1 };
  }
  if (s.startsWith("var(")) {
    const [name, ...fb] = splitTop(s.slice(4, -1));
    const own = map.get(name!);
    if (own !== undefined && !own.includes(`var(${name})`)) return parseColor(own, map, depth + 1);
    assert.ok(fb.length, `unresolved token ${name}`);
    return parseColor(fb.join(","), map, depth + 1);
  }
  if (s.startsWith("color-mix(")) {
    const [space, a, b] = splitTop(s.slice(10, -1));
    assert.equal(space, "in srgb");
    const pa = a!.match(/^(.*?)\s+([\d.]+)%$/);
    const pb = b!.match(/^(.*?)\s+([\d.]+)%$/);
    const wa = pa ? Number(pa[2]) / 100 : pb ? 1 - Number(pb[2]) / 100 : 0.5;
    const ca = parseColor(pa ? pa[1]! : a!, map, depth + 1);
    const cb = parseColor(pb ? pb[1]! : b!, map, depth + 1);
    const alpha = ca.a * wa + cb.a * (1 - wa);
    if (alpha === 0) return { r: 0, g: 0, b: 0, a: 0 };
    const ch = (k: "r" | "g" | "b") => (ca[k] * ca.a * wa + cb[k] * cb.a * (1 - wa)) / alpha;
    return { r: ch("r"), g: ch("g"), b: ch("b"), a: alpha };
  }
  throw new Error(`unsupported color: ${s}`);
}

const over = (fg: RGBA, bg: RGBA): RGBA => ({
  r: fg.r * fg.a + bg.r * (1 - fg.a),
  g: fg.g * fg.a + bg.g * (1 - fg.a),
  b: fg.b * fg.a + bg.b * (1 - fg.a),
  a: 1,
});
const lum = (c: RGBA) => {
  const f = (v: number) => {
    const x = v / 255;
    return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b);
};
const ratio = (fg: RGBA, bg: RGBA) => {
  const f = lum(over(fg, bg));
  const b = lum(bg);
  return (Math.max(f, b) + 0.05) / (Math.min(f, b) + 0.05);
};

const { light, dark: darkOnly } = tokenMaps([
  "styles/sunnah-foundation-tokens.css",
  "styles/theme-aliases.css",
  "styles/visual-redesign-v2-tokens.css",
  "styles/card-system-tokens.css",
]);
const dark: TokenMap = new Map([...light, ...darkOnly]);
const THEMES = { light, dark } as const;
const AA = 4.5;
const contrastLog: string[] = [];
function expectAA(label: string, fg: RGBA, bg: RGBA) {
  const r = ratio(fg, bg);
  contrastLog.push(`${label}=${r.toFixed(2)}`);
  assert.ok(r >= AA, `${label}: ${r.toFixed(2)}:1 < ${AA}:1`);
}

// (أ) زر الإجراء المدمّر (/tasbih «حذف الورد») — النص مُمزوج بالحبر فوق خلفية الخطر 12%/18%
const polish = src("styles/ssunnah-ux-polish.css");
const destructiveColor = polish.match(/\.ss-action-btn--destructive \{[^}]*?\n\s*color: ([^;]+);/)?.[1];
assert.equal(destructiveColor, "color-mix(in srgb, var(--mj-danger) 78%, var(--mj-ink))");
for (const [theme, map] of Object.entries(THEMES)) {
  for (const pct of [12, 18]) {
    for (const surface of ["--mj-surface", "--mj-surface-2"]) {
      const bg = over(parseColor(`color-mix(in srgb, var(--mj-danger) ${pct}%, transparent)`, map), parseColor(`var(${surface})`, map));
      expectAA(`destructive:${theme}:${pct}%:${surface}`, parseColor(destructiveColor!, map), bg);
    }
  }
}

// (ب) كروم هيرو الحبر (.section-hero) — رجوع + مسار التنقل (نهارًا؛ ليلًا قواعد dark-mode-surfaces)
const cardSystem = src("styles/card-system.css");
assert.match(cardSystem, /\.section-hero \.page-hero-mj__back \{\s*color: var\(--cs-on-ink\) !important;/);
assert.match(cardSystem, /\.section-hero \.topic-page__crumb,\s*\.section-hero \.topic-page__crumb a \{\s*color: var\(--cs-on-ink-body\);/);
expectAA("hero-back:light", parseColor("var(--cs-on-ink)", light), parseColor("var(--cs-ink-hero)", light));
expectAA("hero-crumb:light", parseColor("var(--cs-on-ink-body)", light), parseColor("var(--cs-ink-hero)", light));

// (ج) قصص الأنبياء — الرقاقة/الرقم/اسم المعجزة ليلًا · عدد الذكر في جدول المقارنة نهارًا وليلًا
const prophetCss = src("styles/pages/prophet-stories.css");
assert.match(prophetCss, /html\[data-v2-stories="1"\]\[data-theme="dark"\] \.prophet-lux-card__chip \{\s*color: var\(--v2-color-ink\);/);
expectAA(
  "prophet-chip:dark",
  parseColor("var(--v2-color-ink)", dark),
  parseColor("color-mix(in srgb, var(--v2-color-emerald, #0f5c45) 34%, var(--v2-color-night-surface, #12261f))", dark),
);
const hexMap = (name: string) => {
  const block = prophets.match(new RegExp(`const ${name}[^=]*=\\s*\\{([\\s\\S]*?)\\};`))?.[1] ?? "";
  return [...block.matchAll(/#[0-9a-f]{6}/gi)].map((m) => m[0]);
};
const hues = hexMap("PROPHET_HUE");
const accents = hexMap("PROPHET_ACCENT");
assert.ok(hues.length >= 20 && accents.length >= 20, "لوحتا ألوان الأنبياء");
assert.match(prophetCss, /\.nb-miracle-nabi \{\s*color: color-mix\(in srgb, var\(--prophet-color, var\(--ps-emerald\)\) 30%, var\(--mj-ink\)\);/);
assert.match(prophetCss, /color: color-mix\(in srgb, var\(--prophet-accent, var\(--ps-emerald\)\) 40%, var\(--mj-ink\)\);/);
assert.match(prophetCss, /\.nb-miracle-ref \{[^}]*color: var\(--mj-ink-2, var\(--mj-muted\)\);/);
const darkCard = parseColor("var(--v2-color-night-surface)", dark);
for (const hue of new Set(hues)) {
  const fg = parseColor(`color-mix(in srgb, ${hue} 30%, var(--mj-ink))`, dark);
  expectAA(`prophet-num:dark:${hue}`, fg, over(parseColor(`color-mix(in srgb, ${hue} 14%, transparent)`, dark), darkCard));
  expectAA(`miracle-nabi:dark:${hue}`, fg, parseColor("var(--mj-surface)", dark));
}
for (const accent of new Set(accents)) {
  for (const [theme, map] of Object.entries(THEMES)) {
    const fg = parseColor(`color-mix(in srgb, ${accent} 40%, var(--mj-ink))`, map);
    for (const hue of new Set(hues)) {
      const rowHover = parseColor(`color-mix(in srgb, ${hue} 7%, var(--mj-surface-2))`, map);
      expectAA(`compare-count:${theme}:${accent}/${hue}`, fg, rowHover);
    }
    expectAA(`compare-count:${theme}:${accent}:surface`, fg, parseColor("var(--mj-surface)", map));
  }
}

// (د) شفافية كانت تُسقط النص الثانوي تحت AA
assert.doesNotMatch(src("components/quran/ReciterDownloadManager.tsx"), /<small style=\{\{[^}]*opacity/, "/settings: نص سقف التنزيل بلا opacity");
assert.doesNotMatch(
  src("styles/pages/auth.css").match(/\.password-policy__label-en \{[^}]*\}/)?.[0] ?? "opacity",
  /opacity/,
  "/register: تسمية السياسة الإنجليزية بلا opacity",
);

// (هـ) الروابط داخل النص تتميّز بغير اللون (WCAG 1.4.1)
assert.match(src("styles/ssunnah-ux-polish.css"), /\.legal-section p a,\s*\.legal-section li a \{\s*text-decoration: underline;/);
assert.match(src("styles/components/topic-page.css"), /\.topic-page__crumb a \{\s*color: inherit;\s*text-decoration: underline;/);

// ─── 3. Startup CLS ───────────────────────────────────────────────────────────
const boot = src("styles/components/chrome-boot-ph.css");
assert.match(src("App.tsx"), /import "@\/styles\/components\/chrome-boot-ph\.css";/, "CSS الإقلاع متزامن مع App");
assert.match(boot, /\.chrome-boot-ph \.navbar-v3__inner \{\s*display: grid;\s*grid-template-columns: auto minmax\(0, 1fr\) auto;/, "صف الهيدر لا يُرسم مكدّسًا (تخطيط NavBar النهائي)");
assert.match(boot, /\.chrome-boot-ph \.navbar-v3__start,\s*\.chrome-boot-ph \.navbar-v3__end \{\s*display: flex;/);
assert.match(boot, /\.lrf-wrap\.lrf-wrap--prophets,\s*\.lrf-wrap\.lrf-wrap--prophet-detail \{\s*width: 100%;\s*min-height: 100dvh;/, "هيكل /prophets بهندسته النهائية");
assert.match(boot, /#main-content\.app-main:has\(\.lrf-wrap--prophets\),\s*#main-content\.app-main:has\(\.lrf-wrap--prophet-detail\) \{\s*padding-inline: 0;/);

// ─── 4. أدلة تشغيلية + المصفوفات + التصنيف ───────────────────────────────────
const evidencePath = "docs/audit/ROUTE_PARTIAL_CLOSURE_EVIDENCE.json";
assert.ok(existsSync(resolve(repoRoot, evidencePath)), `missing ${evidencePath} (scripts/audit-route-partial-closure.mjs)`);
const evidence = JSON.parse(readRepo(evidencePath)) as {
  tool: string;
  routes: Record<
    string,
    {
      startupCls: number;
      axe: Record<"light" | "dark", unknown[]>;
      focus: Record<"light" | "dark", { stops: number; noVisibleFocus: string[] }>;
      states: Record<string, unknown[]>;
      reflow: Record<string, number>;
    }
  >;
};
assert.match(evidence.tool, /axe-core/);
for (const route of PARTIAL_ROUTES) {
  const e = evidence.routes[route];
  assert.ok(e, `evidence ${route}`);
  for (const theme of ["light", "dark"] as const) {
    assert.deepEqual(e.axe[theme], [], `${route} axe ${theme}`);
    assert.ok(e.focus[theme].stops > 5, `${route} tab stops ${theme}`);
    assert.deepEqual(e.focus[theme].noVisibleFocus, [], `${route} visible focus ${theme}`);
  }
  for (const [state, v] of Object.entries(e.states)) assert.deepEqual(v, [], `${route} axe ${state}`);
  for (const mode of ["tablet768", "zoom200_640", "reflow320", "largeText200"]) {
    assert.ok(e.reflow[mode]! <= 1, `${route} reflow ${mode}=${e.reflow[mode]}`);
  }
  assert.ok(e.startupCls < 0.1, `${route} startup CLS ${e.startupCls}`);
}

const qm = JSON.parse(readRepo("docs/audit/ROUTE_QUALITY_MATRIX.json")) as { routes: Record<string, unknown>[] };
const qmBy = new Map(qm.routes.map((r) => [r.route as string, r]));
const A11Y_RESPONSIVE = ["accessibility", "a11y", "mobile", "tablet", "desktop", "largeText", "zoom200"];
for (const route of PARTIAL_ROUTES) {
  const row = qmBy.get(route)!;
  assert.ok(row, `QM ${route}`);
  for (const k of A11Y_RESPONSIVE) assert.notEqual(row[k], "PARTIAL", `QM ${route}.${k}`);
  assert.equal(row.routePartialClosureTestRef, "route-partial-closure-gate.test.ts");
  assert.equal(row.routePartialClosureEvidence, evidencePath);
}

const u9 = JSON.parse(readRepo("docs/audit/ROUTE_UNIFICATION_MATRIX.json")) as {
  routes: { route: string; fields: Record<string, { status: string; note: string }> }[];
};
const adhanU9 = u9.routes.find((r) => r.route === "/adhan-help")!;
assert.equal(adhanU9.fields.Canvas!.status, "PASS", "/adhan-help Canvas: DetailScreen chrome لا سطح صلاة");
assert.doesNotMatch(adhanHelp.replace(/href="[^"]*"/g, ""), /prayer-times|adhan-scheduler|prayer-calc|computePrayer|schedule/i, "/adhan-help نص ثابت بلا حساب/جدولة");
assert.match(adhanHelp, /<DetailScreen compose="mark">/);
for (const f of ["RTL", "Keyboard", "Contrast", "StartupCLS"]) {
  assert.equal(adhanU9.fields[f]!.status, "KEEP_JUSTIFIED", `/adhan-help ${f} يبقى جهازيًا`);
}

execFileSync(process.execPath, [resolve(majalisRoot, "scripts/route-debt-full-classification.mjs"), "--check"], {
  stdio: "pipe",
});
const cls = JSON.parse(readRepo("docs/audit/ROUTE_DEBT_FULL_CLASSIFICATION.json")) as {
  totals: Record<string, number>;
  items: { route: string; trackClass: string; debtFields: string[] }[];
};
const clsBy = new Map(cls.items.map((i) => [i.route, i]));
for (const route of PARTIAL_ROUTES) {
  const item = clsBy.get(route)!;
  assert.equal(item.trackClass, "DEVICE_REQUIRED", `${route} → DEVICE_REQUIRED (جهاز فقط)`);
  assert.ok(item.debtFields.every((f) => ["RTL", "Keyboard", "Contrast", "StartupCLS"].includes(f)));
}
assert.equal(clsBy.get("/account")!.trackClass, "OWNER_ACTION", "/account قرار مالك — لا إغلاق ذاتي");
assert.equal(cls.totals.PARTIAL ?? 0, 0);

console.log(
  `route-partial-closure-gate.test.ts: ok (routes=${PARTIAL_ROUTES.length}, contrastChecks=${contrastLog.length}, minRatio=${Math.min(
    ...contrastLog.map((l) => Number(l.split("=").pop())),
  ).toFixed(2)}, totals=${JSON.stringify(cls.totals)})`,
);
