/**
 * يمنع عودة عبارة «المجلس العلمي» من مصادر الحصاد إلى feed العام.
 * node scripts/harvest/__tests__/brand-scrub.test.mjs
 */
import assert from "node:assert/strict";
import {
  scrubForbiddenBrandPhrases,
  summaryFromText,
  stripEmojiFromTitle,
} from "../normalize.mjs";
import { curateStoredFeedItems } from "../quality-gate.mjs";

const raw =
  "ندعوكم الليلة لحضور المجلس العلمي شرح كتاب الروض المربع الشيخ حماد الأسلمي";

assert.equal(
  scrubForbiddenBrandPhrases(raw),
  "ندعوكم الليلة لحضور الدرس العلمي شرح كتاب الروض المربع الشيخ حماد الأسلمي",
);
assert.equal(scrubForbiddenBrandPhrases("درس عادي"), "درس عادي");
assert.match(stripEmojiFromTitle(`📌 ${raw}`), /الدرس العلمي/);
assert.doesNotMatch(stripEmojiFromTitle(`📌 ${raw}`), /المجلس العلمي/);
assert.doesNotMatch(summaryFromText(raw, 160), /المجلس العلمي/);
assert.match(summaryFromText(raw, 160), /الدرس العلمي/);

const { items } = curateStoredFeedItems([
  {
    id: "test-brand-scrub",
    type: "درس",
    title_ar: raw.slice(0, 70),
    summary_ar: `ندعوكم الليله لحضور المجلس العلمي: شرح كتاب الروض`,
    sheikh: "حماد الأسلمي",
    place: "مسجد",
    published_at: new Date().toISOString(),
    schedule_kind: "weekly",
    sources: [{ id: "telegram-DrosQ8", post_url: "https://t.me/DrosQ8/28151" }],
  },
]);
assert.ok(items.length >= 1, "card kept after scrub");
assert.doesNotMatch(items[0].title_ar, /المجلس العلمي/);
assert.doesNotMatch(items[0].summary_ar, /المجلس العلمي/);
assert.match(items[0].title_ar, /الدرس العلمي/);

console.log("harvest brand-scrub.test.mjs: ok");
