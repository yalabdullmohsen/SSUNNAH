#!/usr/bin/env node
// يحوّل تقويم الأوقاف (CSV) إلى Resources/awqaf-calendar.json لاختبار KuwaitAreasTests.
// الأعمدة (عربية أو إنجليزية): المنطقة|area، التاريخ|date (YYYY-MM-DD أو DD/MM/YYYY)،
// الفجر|fajr، الشروق|sunrise، الظهر|dhuhr، العصر|asr، المغرب|maghrib، العشاء|isha. الأوقات HH:mm (يقبل ص/م وأرقامًا عربية).
// الاستعمال: node scripts/native-awqaf-to-json.mjs in.csv [out.json] [المنطقة الافتراضية]
import { readFileSync, writeFileSync } from "node:fs";
const [, , inp, out = "artifacts/majalis/ios/App/SunnahPrayer/Tests/SunnahPrayerTests/Resources/awqaf-calendar.json", defArea = "مدينة الكويت"] = process.argv;
if (!inp) { console.error("usage: native-awqaf-to-json.mjs in.csv [out.json] [area]"); process.exit(2); }
const digits = s => s.replace(/[٠-٩]/g, d => "٠١٢٣٤٥٦٧٨٩".indexOf(d)).replace(/[۰-۹]/g, d => "۰۱۲۳۴۵۶۷۸۹".indexOf(d));
const KEYS = { fajr: ["fajr", "الفجر"], sunrise: ["sunrise", "الشروق"], dhuhr: ["dhuhr", "الظهر"], asr: ["asr", "العصر"], maghrib: ["maghrib", "المغرب"], isha: ["isha", "العشاء"] };
const rows = digits(readFileSync(inp, "utf8")).split(/\r?\n/).filter(l => l.trim()).map(l => l.split(/[,;\t]/).map(c => c.trim().replace(/^"|"$/g, "")));
const head = rows.shift().map(h => h.toLowerCase());
const col = names => head.findIndex(h => names.includes(h));
const iArea = col(["area", "المنطقة"]), iDate = col(["date", "التاريخ"]);
if (iDate < 0) { console.error("عمود التاريخ غير موجود"); process.exit(1); }
const idx = Object.fromEntries(Object.entries(KEYS).map(([k, n]) => [k, col(n)]));
const missing = Object.entries(idx).filter(([, i]) => i < 0).map(([k]) => k);
if (missing.length) { console.error("أعمدة ناقصة:", missing.join(",")); process.exit(1); }
const day = d => { const m = d.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/) || d.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/); if (!m) throw new Error("تاريخ غير مفهوم: " + d); const [y, mo, dd] = m[1].length === 4 ? [m[1], m[2], m[3]] : [m[3], m[2], m[1]]; return `${y}-${mo.padStart(2, "0")}-${dd.padStart(2, "0")}`; };
const hm = (t, key) => { const m = t.match(/(\d{1,2}):(\d{2})\s*([apAP]|ص|م)?/); if (!m) throw new Error("وقت غير مفهوم: " + t); let h = +m[1]; const pm = m[3] && /^(p|م)/i.test(m[3]); const am = m[3] && /^(a|ص)/i.test(m[3]); if (pm && h < 12) h += 12; if (am && h === 12) h = 0; if (!m[3] && h < 12 && (key === "asr" || key === "maghrib" || key === "isha")) h += 12; return `${String(h).padStart(2, "0")}:${m[2]}`; };
const data = rows.map(r => ({ area: iArea >= 0 && r[iArea] ? r[iArea] : defArea, day: day(r[iDate]), times: Object.fromEntries(Object.entries(idx).map(([k, i]) => [k, hm(r[i], k)])) }));
writeFileSync(out, JSON.stringify(data, null, 2) + "\n");
console.log(`${data.length} صفًا → ${out}`);
