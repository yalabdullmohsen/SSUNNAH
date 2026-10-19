#!/usr/bin/env node
// حارس tabbar-cover: لا محتوى يختفي خلف شريط التبويب العائم. فحص ثابت لعقد الغلاف:
// (1) الشريط داخل safeAreaInset(.bottom) ويُستثنى منه المصحف فقط، (2) هامش سفلي بارتفاع الشريط لكل محتوى قابل للتمرير في الغلاف،
// (3) لا ignoresSafeArea سفلي خارج الغلاف/المصحف/المقدمة، (4) كل مسار من الـ212 يقع تحت الغلاف أو في المصحف الغامر المعلن.
// الدَّين المعلن (يفشل الحارس إن زاد أو إن زال دون تحديث القائمة): fallback الإصدار 16.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const SRC = "artifacts/majalis/ios/App/SunnahNative/Sources/SunnahNative";
const DEBT = { "ios16-fallback": "TabBarScrollMargin بلا هامش على iOS 16 (contentMargins من 17)؛ يُعالَج ببند المساحة السفلية" };
const found = new Set(); const bad = [];
const root = readFileSync(join(SRC, "Shell/RootTabView.swift"), "utf8");

const ins = root.match(/\.safeAreaInset\(edge: \.bottom[\s\S]*?\n        \}/)?.[0] ?? "";
if (!/SunnahTabBar\(/.test(ins)) bad.push("RootTabView: SunnahTabBar ليس داخل safeAreaInset(.bottom)");
if (!/tabBarShown/.test(ins) || !/hidesTabBar/.test(root)) bad.push("RootTabView: إخفاء الشريط لشاشات القراءة الكاملة (immersiveReader) غير مربوط بالشريط");
if (!/\.environment\(\\\.immersiveReader, immersive\)/.test(root)) bad.push("RootTabView: حالة immersiveReader غير محقونة في البيئة");
const reader = readFileSync(join(SRC, "Mushaf/MushafReaderView.swift"), "utf8");
if (!/\.immersiveReader\(revealed: (showChrome|false)\)/.test(reader)) bad.push("MushafReaderView: لا يعلن .immersiveReader(revealed: false) (الشريط مخفي طوال القراءة، #3462)");
if (/hasPrefix\("\/mushaf"\)/.test(root)) bad.push("RootTabView: استثناء الشريط بالمسار (hasPrefix) ممنوع؛ استعمل .immersiveReader()");
if (!/TabBarScrollMargin\(height: tabBarShown \? SunnahTabBar\.reservedHeight : 0\)/.test(root)) bad.push("RootTabView: هامش التمرير السفلي بارتفاع الشريط غير مطبَّق");
if (!/contentMargins\(\.bottom, height, for: \.scrollContent\)/.test(root)) bad.push("TabBarScrollMargin: contentMargins(.bottom) مفقود");
const mod = root.match(/struct TabBarScrollMargin[\s\S]*$/)?.[0] ?? "";
if (/else \{ content \}/.test(mod)) found.add("ios16-fallback");
// شاشات «القراءة الكاملة»: كل ملف يبني MushafReaderView خارج المصحف يصل إلى قارئ يعلن .immersiveReader، والقارئ نفسه يعلنه،
// فلا يتقاطع الشريط مع إطار النص ولا مع رقم الصفحة أيًّا كان مسار الفتح (/mushaf أو /quran أو بحث القرآن).
// الدرج: لا أيقونة مكررة بين عناصره، الصف ≥ 52pt، الرأس تحت safe area (لا ignoresSafeArea في الدرج إلا لخلفية الرأس الخضراء `.background{…}.ignoresSafeArea(edges: .top)` — المحتوى يبقى تحت شريط الحالة)، والمحدَّد يُبرَز لا يُعتَّم.
const drawer = readFileSync(join(SRC, "Components/SunnahDrawer.swift"), "utf8");
const icons = [...drawer.matchAll(/Item\(title: "[^"]+", icon: "([^"]+)"/g)].map((m) => m[1]);
const dup = icons.filter((x, i) => icons.indexOf(x) !== i);
if (icons.length < 10) bad.push(`SunnahDrawer: عناصر قليلة (${icons.length}) أو تغيّرت صيغة Item`);
if (dup.length) bad.push(`SunnahDrawer: أيقونة مكررة: ${[...new Set(dup)].join(", ")}`);
if (/ignoresSafeArea/.test(drawer.replace(/\/\/.*$/gm, "").replace(/\.background\s*\{[^\n]*\}\.ignoresSafeArea\(edges: \.top\)/g, ""))) bad.push("SunnahDrawer: ignoresSafeArea ممنوع (الرأس يغطي شريط الحالة)");
if (/ignoresSafeArea\(edges: \.vertical\)/.test(root)) bad.push("RootTabView: الدرج بـignoresSafeArea(.vertical) يمتد تحت شريط الحالة");
const rows = readFileSync(join(SRC, "Components/SunnahGroupedList.swift"), "utf8");
if (!/minHeight: CGFloat = 52/.test(rows)) bad.push("SunnahCompactRow: الحد الأدنى للارتفاع ليس 52");
if (/opacity\([^)]*\)[^\n]*selected|selected[^\n]*\.opacity\(/.test(rows)) bad.push("SunnahCompactRow: المحدَّد يُعتَّم بدل أن يُبرَز");
const nav = root.indexOf(".navigationDestination"), mar = root.indexOf(".modifier(TabBarScrollMargin");
if (nav < 0 || mar < nav) bad.push("الهامش لا يغلّف NavigationStack بوجهاته");

const walk = (d) => readdirSync(d).flatMap((n) => { const p = join(d, n); return statSync(p).isDirectory() ? walk(p) : p.endsWith(".swift") ? [p] : []; });
for (const f of walk(SRC)) {
  const r = relative(SRC, f);
  if (r.startsWith("Mushaf/") || r === "Shell/RootTabView.swift" || r === "Intro/IntroView.swift") continue;
  readFileSync(f, "utf8").split("\n").forEach((l0, i) => {
    // خلفية لون فقط تمتد تحت الحواف (`.background(X.ignoresSafeArea())` أو `.background { X.ignoresSafeArea() }`) لا تحرّك المحتوى ولا تغطي الشريط: مستثناة.
    const l = l0.replace(/\.background\(\s*[\w.]+\.ignoresSafeArea\(\)\s*\)/g, "").replace(/\.background\s*\{\s*[\w.]+\.ignoresSafeArea\(\)\s*\}/g, "");
    if (/ignoresSafeArea/.test(l) && !/edges:\s*\.top/.test(l) && !/\/\//.test(l.split("ignoresSafeArea")[0])) bad.push(`${r}:${i + 1}: ignoresSafeArea سفلي قد يغطّي شريط التبويب`);
  });
}

const routes = JSON.parse(readFileSync("docs/native/ROUTE_TEMPLATE_MAP.json", "utf8")).routes;
const immersive = routes.filter((r) => r.path.startsWith("/mushaf")).length;
for (const k of found) if (!DEBT[k]) bad.push(`دَين غير معلن: ${k}`);
for (const k of Object.keys(DEBT)) if (!found.has(k)) bad.push(`دَين معلن زال (${k}): احذفه من القائمة`);
console.log(`مسارات ${routes.length} · تحت الغلاف ${routes.length - immersive} · مصحف غامر ${immersive} · دَين معلن ${found.size} · مخالفات ${bad.length}`);
if (bad.length) { console.error(bad.join("\n")); process.exit(1); }
console.log("✓ tabbar-cover");
