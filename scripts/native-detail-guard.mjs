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
// زر «إبلاغ عن خطأ» (AccountTexts يعد به أسفل كل صفحة محتوى): القالبان يحملانه، وغيرهما يستدعيه أو يُعفى بسبب.
const REPORT_VIA = /DetailTemplate\(|ArticleTemplate\(|SunnahContentFooter\(|reportID:/;
const REPORT_EXCEPT = {
  MutashabihatDetailView: "آيات متقابلة بلا نص محتوى يُبلَّغ عنه",
  QuranCircleDetailView: "بيانات حلقة لا محتوى علمي",
  LibrarySourceDetailView: "بطاقة مصدر ببيانات منظَّمة",
};
const walk = (d) => readdirSync(d).flatMap((f) => { const p = join(d, f); return statSync(p).isDirectory() ? walk(p) : p.endsWith(".swift") ? [p] : []; });
const bad = [];
// قاعدة الذيل الموحّد: القوالب المشتركة وشاشتا الحديث تحمل SunnahContentFooter (أيقونتا «!» والإبلاغ الصغيرتان)،
// ولا تضع زر SunnahReportIssueButton الكبير داخل الصفحة.
for (const f of ["Templates/DetailTemplate.swift", "Templates/ArticleTemplate.swift", "Special/HadithScreens.swift", "Special/WeakHadithScreens.swift"]) {
  const src = readFileSync(join(SRC, f), "utf8");
  if (!/SunnahContentFooter\(/.test(src)) bad.push(`${f}: بلا الذيل الموحّد SunnahContentFooter`);
  if (/SunnahReportIssueButton\(/.test(src)) bad.push(`${f}: زر SunnahReportIssueButton الكبير ممنوع داخل الصفحة (الذيل الموحّد يكفي)`);
}
// إفصاح الذكاء الاصطناعي: النص الحرفي في SunnahDisclosure.short، والإشعار يُعرض في ورقة «!» لا فوق الزر.
const SHORT = "أُعدّ محتوى هذا التطبيق بمساعدة الذكاء الاصطناعي اعتمادًا على مصادر مذكورة في كل صفحة، وقد يقع فيه خطأ. للفتوى والأحكام الشرعية ارجعوا إلى أهل العلم. إن وجدتم خطأً فاضغطوا «إبلاغ عن خطأ».";
if (!readFileSync(join(SRC, "Support", "SunnahDisclosure.swift"), "utf8").includes(SHORT)) bad.push("Support/SunnahDisclosure.swift: نص short ليس الحرفي المعتمد");
const btn = readFileSync(join(SRC, "Components", "SunnahReportIssueButton.swift"), "utf8");
if (/SunnahDisclosureNotice\(/.test(btn)) bad.push("Components/SunnahReportIssueButton.swift: إشعار الإفصاح (SunnahDisclosureNotice) ممنوع فوق الزر؛ الإفصاح في ورقة تُفتح بضغطة المستخدم");
if (!/SunnahDisclosure\.short/.test(readFileSync(join(SRC, "Support", "SunnahDisclosure.swift"), "utf8").split("struct SunnahDisclosureNotice")[1] ?? "")) bad.push("SunnahDisclosureNotice لا يعرض SunnahDisclosure.short");
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
    else if (!delegates && !REPORT_VIA.test(body) && !REPORT_EXCEPT[name]) bad.push(`${relative(".", f)}: ${name} (بلا زر الإبلاغ عن خطأ)`);
  }
}
if (bad.length) { console.error("✗ شاشات تفصيل خارج المكوّن المشترك (أدخلوها أو أضيفوا استثناءً بسبب في native-detail-guard.mjs):\n  " + bad.join("\n  ")); process.exit(1); }
console.log("✓ كل شاشات التفصيل تمرّ بالمكوّن المشترك أو باستثناء معلن");
