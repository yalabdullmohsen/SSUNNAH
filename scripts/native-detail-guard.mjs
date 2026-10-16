#!/usr/bin/env node
// حارس شاشات التفصيل: كل struct اسمه *Detail* من نوع View يجب أن يمرّ بالمكوّن المشترك (قوالب التفصيل أو القسم المطوي)،
// وإلا فبقائمة استثناءات معلنة بسبب. يفشل عند أي شاشة جديدة خارجهما.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const SRC = "artifacts/majalis/ios/App/SunnahNative/Sources/SunnahNative";
const SHARED = /DetailTemplate\(|ArticleTemplate\(|SunnahSectionedMarkdown\(|LearnDetailPage\(|QuranDocView\(|DetailHero\(/;
// الاسم ← السبب (لا نص طويل يُطوى في الشاشة)
const EXCEPT = {
  DetailTemplate: "هو القالب المشترك نفسه",
  DetailHero: "جزء من القالب المشترك",
  MutashabihatDetailView: "آيات متقابلة بوصف قصير؛ لا أقسام نصية",
  QuranCircleDetailView: "بطاقة معلومات حلقة بلا نص طويل",
  LibrarySourceDetailView: "بطاقة مصدر ببيانات منظَّمة (تُمرَّر عبر ترويسة التفصيل)",
};
const walk = (d) => readdirSync(d).flatMap((f) => { const p = join(d, f); return statSync(p).isDirectory() ? walk(p) : p.endsWith(".swift") ? [p] : []; });
const bad = [];
for (const f of walk(SRC)) {
  if (f.includes("/Mushaf/")) continue; // ملك ن3
  const s = readFileSync(f, "utf8");
  const re = /^\s*(?:public |private |fileprivate )?struct (\w*Detail\w*)\s*:\s*View\b/gm;
  let m;
  while ((m = re.exec(s))) {
    const name = m[1];
    if (EXCEPT[name]) continue;
    const rest = s.slice(m.index);
    const nxt = rest.slice(10).search(/^\s*(?:public |private |fileprivate )?(?:struct|enum|extension|final class) /m);
    const body = nxt < 0 ? rest : rest.slice(0, nxt + 10);
    // *Screen يحمّل ثم يُسلّم لشاشة *Detail ← تُحتسب الأخيرة؛ المُسلِّم يُعفى إن استدعى struct *Detail*
    const delegates = new RegExp(`\\b\\w*Detail\\w*\\(`).test(body.slice(body.indexOf("var body")).replace(new RegExp(`\\b${name}\\b`, "g"), ""));
    if (!SHARED.test(body) && !delegates) bad.push(`${relative(".", f)}: ${name}`);
  }
}
if (bad.length) { console.error("✗ شاشات تفصيل خارج المكوّن المشترك (أدخلوها أو أضيفوا استثناءً بسبب في native-detail-guard.mjs):\n  " + bad.join("\n  ")); process.exit(1); }
console.log("✓ كل شاشات التفصيل تمرّ بالمكوّن المشترك أو باستثناء معلن");
