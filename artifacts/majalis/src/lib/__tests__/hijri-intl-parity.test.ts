/**
 * مقارنة كل تحويلات الهجري في src/lib بمرجع Intl أم القرى
 * (ar-SA-u-ca-islamic-umalqura، Asia/Kuwait) لكل يوم 2020-01-01..2030-12-31.
 *
 * - gregorianToHijri (hijri-utils) = Intl أم القرى ⇒ يجب أن يطابق 100%.
 * - toHijri (daily-context، حساب جدولي)، estimateHijriDate (islamic-occasions-seed،
 *   حساب جدولي)، formatHijriDate (lesson-time، تقويم "islamic" لا أم القرى):
 *   تختلف عن أم القرى، فلم تُستبدل. الحدّ أدناه سقف تراجع (ratchet) لا قبول:
 *   يجب أن يهبط إلى 0 عند ترحيلها إلى Intl أم القرى، ولا يُرفع أبدًا.
 *
 * تشغيل: node --import tsx src/lib/__tests__/hijri-intl-parity.test.ts
 */
import assert from "node:assert/strict";
import { gregorianToHijri } from "@/lib/hijri-utils";
import { toHijri } from "@/lib/daily-context";
import { estimateHijriDate } from "@/lib/islamic-occasions-seed";
import { formatHijriDate } from "@/lib/lesson-time";

type Ymd = { year: number; month: number; day: number };
const OPTS = { timeZone: "Asia/Kuwait", day: "numeric", month: "numeric", year: "numeric" } as const;
const REF = new Intl.DateTimeFormat("ar-SA-u-ca-islamic-umalqura-nu-latn", OPTS);
const REF_LONG = new Intl.DateTimeFormat("ar-SA-u-ca-islamic-umalqura", {
  timeZone: "Asia/Kuwait", day: "numeric", month: "long", year: "numeric",
});
const DAY = 86_400_000;

function ref(d: Date): Ymd {
  const parts = REF.formatToParts(d);
  const g = (t: string) => parseInt(parts.find((p) => p.type === t)?.value.replace(/\D/g, "") ?? "0", 10);
  return { year: g("year"), month: g("month"), day: g("day") };
}
const key = (h: Ymd) => `${h.year}-${h.month}-${h.day}`;

/** إزاحة الأيام بين القيمة المحسوبة والمرجع (±40)، أو NaN إن لم تُوجد. */
function offset(d: Date, got: Ymd): number {
  const g = key(got);
  for (let k = 0; k <= 40; k++) {
    for (const s of k ? [k, -k] : [0]) if (key(ref(new Date(d.getTime() + s * DAY))) === g) return s;
  }
  return NaN;
}

const start = Date.UTC(2020, 0, 1, 9); // 12:00 بتوقيت الكويت
const end = Date.UTC(2030, 11, 31, 9);

type Row = { mismatches: number; samples: string[]; offsets: Map<number, number> };
const rows: Record<string, Row> = {};
const track = (name: string, d: Date, ok: boolean, detail: () => string, off?: () => number) => {
  const r = (rows[name] ??= { mismatches: 0, samples: [], offsets: new Map() });
  if (ok) return;
  r.mismatches++;
  if (r.samples.length < 5) r.samples.push(`${d.toISOString().slice(0, 10)} ${detail()}`);
  if (off) { const o = off(); r.offsets.set(o, (r.offsets.get(o) ?? 0) + 1); }
};

let days = 0;
for (let t = start; t <= end; t += DAY) {
  const d = new Date(t);
  const r = ref(d);
  days++;
  const u = gregorianToHijri(d);
  assert.ok(u, "gregorianToHijri returned null");
  track("gregorianToHijri", d, key(u) === key(r), () => `ref=${key(r)} got=${key(u)}`);
  const a = toHijri(d);
  track("daily-context.toHijri", d, key(a) === key(r), () => `ref=${key(r)} got=${key(a)}`, () => offset(d, a));
  const b = estimateHijriDate(d);
  track("estimateHijriDate", d, key(b) === key(r), () => `ref=${key(r)} got=${key(b)}`, () => offset(d, b));
  const f = formatHijriDate(d);
  const fr = REF_LONG.format(d);
  track("lesson-time.formatHijriDate", d, f === fr, () => `ref=«${fr}» got=«${f}»`);
}
assert.equal(days, 4018);

console.log(`Hijri vs Intl Umm al-Qura — ${days} days (2020-01-01..2030-12-31)`);
for (const [name, r] of Object.entries(rows)) {
  const offs = [...r.offsets].sort((x, y) => y[1] - x[1]).map(([o, n]) => `${o > 0 ? "+" : ""}${o}d×${n}`).join(" ");
  console.log(`  ${name}: ${r.mismatches} mismatches${offs ? ` [${offs}]` : ""}`);
  for (const s of r.samples) console.log(`      ${s}`);
}

// Intl أم القرى هي السلطة: مطابقة تامة.
assert.equal(rows.gregorianToHijri.mismatches, 0, "gregorianToHijri must match Intl Umm al-Qura 100%");

// سقوف تراجع للحسابات غير المطابقة (لا تُرفع؛ تهبط إلى 0 عند الترحيل لـ Intl).
const CEILING: Record<string, number> = {
  "daily-context.toHijri": 0,
  estimateHijriDate: 0,
  "lesson-time.formatHijriDate": 0,
};
for (const [name, max] of Object.entries(CEILING)) {
  assert.ok(rows[name].mismatches <= max, `${name}: ${rows[name].mismatches} > ceiling ${max}`);
}
console.log("✓ hijri-intl-parity");
