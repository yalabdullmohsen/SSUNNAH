/**
 * يولّد محتوى ودجت «آية أو دعاء» المحلي (يعمل بلا فتح التطبيق) حرفيًا من المصدرين الحاكمين:
 * مخزون الآيات القصيرة المحمي (widget-daily-pool) وأذكار التطبيق (adhkar-seed). لا نص يُكتب يدويًا.
 *   node --import tsx scripts/gen-widget-local-content.ts   ← يحدّث الملف
 * اختبار ios-widget-local-content.test.ts يفشل عند أي انحراف بين الملف والمصدرين.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { WIDGET_SHORT_AYAH_POOL } from "../src/lib/widget-daily-pool";
import { ADHKAR_ITEMS } from "../src/lib/adhkar-seed";

export const LOCAL_CONTENT_SWIFT = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../ios/App/PrayerWidget/SunnahContentExperienceCatalog.swift",
);
export const BEGIN = "// BEGIN GENERATED: widget-local-content";
export const END = "// END GENERATED: widget-local-content";
export const DUA_MAX_WORDS = 10;

const words = (t: string) => t.trim().split(/\s+/).length;
const DUA_START = /^(اللَّهُمَّ|رَبِّ|رَبَّنَا)/;

export function localDuas() {
  const seen = new Set<string>();
  return ADHKAR_ITEMS.filter((i) => {
    const text = i.text.trim();
    if (/^سورة/.test(i.source ?? "") || words(text) > DUA_MAX_WORDS || !DUA_START.test(text)) return false;
    if (seen.has(text)) return false;
    seen.add(text);
    return true;
  }).map((i) => ({ text: i.text.trim(), source: (i.source ?? "").trim() }));
}

export function localAyahs() {
  return WIDGET_SHORT_AYAH_POOL.map((a) => ({
    text: a.text.trim(),
    surah: a.surah.replace(/^سورة\s+/, ""),
    n: a.ayahNumber,
  }));
}

export function renderLocalContent(): string {
  const ayahs = localAyahs()
    .map((a) => `        .init(text: ${JSON.stringify(a.text)}, source: ${JSON.stringify(`${a.surah} · ${a.n}`)}),`)
    .join("\n");
  const duas = localDuas()
    .map((d) => `        .init(text: ${JSON.stringify(d.text)}, source: ${JSON.stringify(d.source)}),`)
    .join("\n");
  return `${BEGIN}
enum WidgetLocalContent {
    struct Item: Hashable {
        let text: String
        let source: String
    }

    static let ayahs: [Item] = [
${ayahs}
    ]

    static let duas: [Item] = [
${duas}
    ]
}
${END}`;
}

export function spliceGenerated(swift: string): string {
  const a = swift.indexOf(BEGIN);
  const b = swift.indexOf(END);
  if (a < 0 || b < 0) throw new Error("علامات التوليد مفقودة");
  return swift.slice(0, a) + renderLocalContent() + swift.slice(b + END.length);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  writeFileSync(LOCAL_CONTENT_SWIFT, spliceGenerated(readFileSync(LOCAL_CONTENT_SWIFT, "utf8")));
}
