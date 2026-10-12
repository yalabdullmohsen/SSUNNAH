/**
 * مصادر TS المنشورة في الموقع → Data/quran/*.json (تجويد، قصص السور، مسارات الحفظ، إحصاءات، قراءات، أحرف).
 * يُحوَّل عبر tsx بلا تعديل نص. ما بلا مصدر/اعتماد يُحجَب ويُسجَّل (reject) ولا يُنشر.
 */
import { execFileSync } from "node:child_process";

const Q = "quran";
const GENERIC_STORY = /^(محور بارز في السورة|تركّز على|تتضمن|ترتبط)/;

export default async function exportQuranTs({ json, reject, counts, appRoot }) {
  const out = execFileSync(`${appRoot}/node_modules/.bin/tsx`, ["--tsconfig", "tsconfig.json", "scripts/native/lib/quran-ts-dump.ts"], { cwd: appRoot, maxBuffer: 64 << 20 });
  const d = JSON.parse(out.toString("utf8"));
  const c = (counts.quran ??= {});
  const has = (v) => typeof v === "string" && v.trim().length > 0;

  // التجويد: الاعتماد = مصدر موثّق لكل فصل
  const chapters = [];
  for (const ch of d.tajweed.chapters) {
    if (!has(ch.source) || !has(ch.title) || !(ch.body ?? []).length) { reject(`${Q}-tajweed`, "بلا مصدر/نص"); continue; }
    chapters.push({ id: ch.id, order: ch.order, title: ch.title, summary: ch.summary, body: ch.body, source: ch.source, quizHint: ch.quizHint ?? null,
      examples: (ch.examples ?? []).map((e) => ({ text: e.text, note: e.note ?? null, surah: e.ayahRef.surah, ayah: e.ayahRef.ayah })) });
  }
  const intro = has(d.tajweed.intro?.source) ? d.tajweed.intro : null;
  if (!intro) reject(`${Q}-tajweed`, "مدخل بلا مصدر");
  json("quran/tajweed.json", { intro, chapters: chapters.sort((a, b) => a.order - b.order) });
  c.tajweed = chapters.length;

  // قصص السور: تُحجَب الأسطر العامة المولَّدة (غير المحرَّرة)؛ السورة تُنشر فقط إن بقي لها محتوى محرَّر ومصدر
  const stories = [];
  for (const s of d.stories) {
    if (!s.extReady || !has(s.extSource)) { reject(`${Q}-surah-stories`, "بلا بيانات موثّقة/مصدر"); continue; }
    const generic = /غالباً بأول آية بارزة/.test(s.namingReason);
    const virtGeneric = /^الفضل العام لتلاوة القرآن/.test(s.virtues);
    const mainStories = s.mainStories.filter((t) => !GENERIC_STORY.test(t));
    if (s.mainStories.length !== mainStories.length) reject(`${Q}-surah-stories-filler`, "سطر عام غير محرَّر");
    if (generic) reject(`${Q}-surah-stories-filler`, "سبب تسمية عام");
    if (virtGeneric) reject(`${Q}-surah-stories-filler`, "فضل عام");
    const themes = s.mainThemes;
    if (!themes.length && !mainStories.length) { reject(`${Q}-surah-stories`, "بلا محتوى محرَّر"); continue; }
    stories.push({ number: s.number, name: s.name, namingReason: generic ? null : s.namingReason, revelationPlace: s.revelationPlace, ayahCount: s.ayahCount,
      mainThemes: themes, mainStories, lessons: s.lessons, virtues: virtGeneric ? null : s.virtues, source: s.extSource, lastReviewed: s.lastReviewed });
  }
  json("quran/surah-stories.json", stories);
  c["surah-stories"] = stories.length;

  // مسارات الحفظ: PUBLISHED + مراجعة معتمدة + ترخيص مسموح؛ مراجع فقط بلا نص آيات
  const OKREV = new Set(["APPROVED", "APPROVED_WITH_CORRECTION"]);
  const OKLIC = new Set(["PROJECT_QURAN", "PROJECT_LICENSED", "EXTERNAL_PERMITTED"]);
  const paths = [];
  for (const p of d.hifz) {
    if (p.publicationStatus !== "PUBLISHED" || !OKREV.has(p.reviewStatus) || !OKLIC.has(p.licenseStatus) || !p.searchVisibility) { reject(`${Q}-hifz`, `مسار محجوز: ${p.publicationStatus}/${p.reviewStatus}/${p.licenseStatus}`); continue; }
    const units = [];
    for (const u of p.units.slice().sort((a, b) => a.sequence - b.sequence)) {
      if (u.publicationStatus !== "PUBLISHED" || !OKREV.has(u.reviewStatus)) { reject(`${Q}-hifz-units`, "وحدة محجوزة"); continue; }
      const r = u.verifiedTextReference;
      units.push({ id: u.unitId, title: u.title, sequence: u.sequence, ref: r.kind === "quran" ? { surah: r.surah, ayahFrom: r.ayahFrom, ayahTo: r.ayahTo } : null,
        completionCriteria: u.completionCriteria ?? null, repetitionTarget: u.repetitionTarget ?? null });
    }
    paths.push({ id: p.id, slug: p.slug, title: p.title, shortDescription: p.shortDescription ?? null, category: p.category, level: p.level,
      source: p.sourceReference ?? p.sourceId ?? null, learningObjectives: p.learningObjectives ?? [], units });
  }
  json("quran/hifz-paths.json", paths);
  c["hifz-paths"] = paths.length;

  // إحصاءات القرآن: مصدر مطبوع + مرجع إلزاميان
  const stats = [];
  for (const s of d.stats) {
    if (!has(s.source?.book) || !has(s.source?.ref)) { reject(`${Q}-stats`, "بلا مصدر/مرجع"); continue; }
    stats.push({ id: s.id, label: s.label, value: String(s.value), note: s.note ?? null, kind: s.kind, group: s.group, method: s.method ?? null, detail: s.detail ?? null,
      source: { book: s.source.book, author: s.source.author, ref: s.source.ref },
      variants: (s.variants ?? []).map((v) => ({ value: v.value, attribution: v.attribution, source: v.source })) });
  }
  json("quran/stats.json", stats);
  c.stats = stats.length;

  // القراءات: كل عنصر بمصدر
  const q = d.qiraat;
  const sections = q.sections.filter((x) => has(x.source) || (reject(`${Q}-qiraat`, "قسم بلا مصدر"), false));
  const ashara = q.ashara.filter((x) => has(x.source) || (reject(`${Q}-qiraat`, "قارئ بلا مصدر"), false))
    .map((x) => ({ id: x.id, name: x.name, nisba: x.nisba, deathYearHijri: x.deathYearHijri ?? null, bio: x.bio, rawis: x.rawis.map((r) => r.name), source: x.source }));
  const diffs = q.diffs.filter((x) => has(x.source) || (reject(`${Q}-qiraat`, "مثال بلا مصدر"), false))
    .map((x) => ({ id: x.id, kind: x.kind, description: x.description, surah: x.ayahRef.surah, ayah: x.ayahRef.ayah, source: x.source }));
  json("quran/qiraat.json", { sections, ashara, diffs });
  c.qiraat = sections.length + ashara.length + diffs.length;

  // الأحرف السبعة: كل قسم بمصادر
  const ahruf = d.ahruf.filter((x) => (x.sources ?? []).length || (reject(`${Q}-ahruf`, "قسم بلا مصادر"), false));
  json("quran/ahruf.json", ahruf);
  c.ahruf = ahruf.length;

  // إشارات كونية للتأمل: المحرَّر (verified) وله مصدر علمي فقط؛ needs_review يُحجَب
  const miracles = [];
  for (const m of d.miracles) {
    if (m.verification_status !== "verified" || !has(m.scholarly_source) || !has(m.reference) || !has(m.body)) { reject(`${Q}-miracles`, "غير محرَّر/بلا مصدر علمي"); continue; }
    miracles.push({ id: m.id, slug: m.slug, title: m.title, category: m.category, sourceType: m.source_type, reference: m.reference, verse: m.verse ?? null,
      body: m.body, tafsirSummary: m.tafsir_summary ?? null, scholarlySource: m.scholarly_source });
  }
  json("quran/miracles.json", miracles);
  c.miracles = miracles.length;

  // المتشابهات: مراجع (سورة/آية) فقط مع مصادرها العلمية؛ نص الآية يُقرأ من المصحف المحزوم لا من الملف
  const msh = d.mutashabihat.filter((p) => (p.refs ?? []).length >= 2 && has(p.title) || (reject(`${Q}-mutashabihat`, "أقل من آيتين"), false))
    .map((p) => ({ id: p.id, title: p.title, description: p.description, category: p.category, hint: p.hint ?? null, refs: p.refs }));
  json("quran/mutashabihat.json", msh);
  c.mutashabihat = msh.length;
}
