import fs from "node:fs"; import { ROOT, langIssues, writeJSON } from "./lib.mjs";
const issues = []; const add = (o) => issues.push({ section: "الدروس", ...o });
const today = "2026-10-09";
const chunk = JSON.parse(fs.readFileSync(`${ROOT}/public/data/lessons/chunk-000.json`, "utf8"));
const F1 = "public/data/lessons/chunk-000.json";
const seen = {};
for (const [i, l] of chunk.entries()) {
  const ref = `${l.id} (#${i})`;
  seen[l.id] = (seen[l.id] || 0) + 1;
  for (const k of ["title", "speaker_name", "city", "mosque", "day_of_week", "lesson_time", "category"]) if (!String(l[k] ?? "").trim() && !(k === "mosque" && /عن بعد/.test(l.delivery || ""))) add({ file: F1, ref, type: `حقل ناقص (${k})`, sev: "متوسط", fix: "" });
  if (l.end_date && l.end_date < today && l.status === "approved") add({ file: F1, ref, type: "درس منتهٍ ما زال معتمدًا", sev: "متوسط", fix: `end_date=${l.end_date}` });
  for (const k of ["live_url", "book_url", "maps_url"]) if (l[k] && !/^https:\/\//.test(l[k])) add({ file: F1, ref, type: `رابط غير صالح/غير آمن (${k})`, sev: "تحسين", fix: l[k] });
  if (l.day_of_week && l.schedule && !l.schedule.includes(l.day_of_week)) add({ file: F1, ref, type: "اليوم يخالف الجدول", sev: "متوسط", fix: `${l.day_of_week} / ${l.schedule}` });
  if (l.sheikhs?.name && l.speaker_name && l.sheikhs.name !== l.speaker_name) add({ file: F1, ref, type: "اسم الشيخ غير متسق", sev: "تحسين", fix: `${l.speaker_name} / ${l.sheikhs.name}` });
  for (const k of ["title", "description", "speaker_name", "mosque", "schedule", "lesson_time"]) for (const li of langIssues(l[k])) add({ file: F1, ref: `${ref} [${k}]`, type: li.type, sev: li.type === "رمز غير مرئي" ? "متوسط" : "تحسين", fix: li.detail });
}
for (const [id, n] of Object.entries(seen)) if (n > 1) add({ file: F1, ref: id, type: "معرّف مكرر", sev: "متوسط", fix: `${n}` });
const dupKey = {}; chunk.forEach((l) => { const k = [l.title, l.speaker_name, l.mosque, l.day_of_week].join("|"); (dupKey[k] = dupKey[k] || []).push(l.id); });
Object.values(dupKey).filter((v) => v.length > 1).forEach((v) => add({ file: F1, ref: v.join("، "), type: "درس مكرر (نفس العنوان والشيخ والمسجد واليوم)", sev: "متوسط", fix: "" }));
const feed = JSON.parse(fs.readFileSync(`${ROOT}/public/data/lessons/feed.json`, "utf8"));
const arr = Array.isArray(feed) ? feed : Object.values(feed).find(Array.isArray);
const F2 = "public/data/lessons/feed.json";
for (const [i, e] of arr.entries()) {
  const ref = `${e.id} (#${i})`;
  if (e.starts_at && e.starts_at.slice(0, 10) < today && e.schedule_kind !== "weekly" && e.schedule_kind !== "recurring") add({ file: F2, ref, type: "فعالية ماضية في الخلاصة", sev: "متوسط", fix: `starts_at=${e.starts_at} (${e.schedule_kind})` });
  if (!e.sources?.length) add({ file: F2, ref, type: "فعالية بلا مصدر", sev: "متوسط", fix: "" });
  if (e.register_url && !/^https:\/\//.test(e.register_url)) add({ file: F2, ref, type: "رابط تسجيل غير صالح", sev: "تحسين", fix: e.register_url });
  if (typeof e.confidence === "number" && e.confidence < 0.6) add({ file: F2, ref, type: "ثقة منخفضة في الاستخراج", sev: "متوسط", fix: String(e.confidence) });
  for (const k of ["title_ar", "summary_ar", "sheikh", "place", "time_text", "women_attendance_note"]) for (const li of langIssues(e[k])) add({ file: F2, ref: `${ref} [${k}]`, type: li.type, sev: li.type === "رمز غير مرئي" ? "متوسط" : "تحسين", fix: li.detail });
}
writeJSON("b4-events.json", issues);
const s = {}, t = {}; issues.forEach((x) => { s[x.sev] = (s[x.sev] || 0) + 1; t[x.type] = (t[x.type] || 0) + 1; });
console.log(chunk.length, arr.length, s, t, [...new Set(arr.map((e) => e.schedule_kind))]);
