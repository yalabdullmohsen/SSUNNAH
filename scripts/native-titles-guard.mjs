#!/usr/bin/env node
// titles-unique: لكل مسار مُجرَد (ROUTE_TEMPLATE_MAP) عنوان في سجل RouteTitles، ولا عنوانان متطابقان، ولا عنوان فارغ،
// ولا مسار في السجل خارج الجرد (عنوان لا يطابق مسار شاشة).
import { readFileSync } from "node:fs";
const REG = "artifacts/majalis/ios/App/SunnahNative/Sources/SunnahNative/Shell/RouteTitles.swift";
const MAP = "docs/native/ROUTE_TEMPLATE_MAP.json";
const EXTRA = new Set(["/", "/aqidah", "/library", "/profile", "/sirah", "/quran"]); // جذور تبويبات الشريط (AppTab.rootPath) المسجّلة خارج الجرد
const src = readFileSync(REG, "utf8");
const block = src.slice(src.indexOf("table: [String: String] = ["), src.indexOf("]\n\n    /// عنوان المسار"));
const table = new Map(); const dup = [];
for (const m of block.matchAll(/"(\/[^"]*)":\s*"([^"]*)"/g)) { if (table.has(m[1])) dup.push(`مسار مكرر في السجل: ${m[1]}`); table.set(m[1], m[2]); }
const routes = JSON.parse(readFileSync(MAP, "utf8")).routes.map((r) => r.path);
const errs = [...dup];
for (const p of routes) { const t = table.get(p); if (!t || !t.trim()) errs.push(`بلا عنوان: ${p}`); }
const byTitle = new Map();
for (const [p, t] of table) { if (!t.trim()) continue; (byTitle.get(t) ?? byTitle.set(t, []).get(t)).push(p); }
for (const [t, ps] of byTitle) if (ps.length > 1) errs.push(`عنوان «${t}» مكرر: ${ps.join(" ، ")}`);
const inv = new Set(routes);
for (const p of table.keys()) if (!inv.has(p) && !EXTRA.has(p)) errs.push(`في السجل خارج الجرد: ${p}`);
console.log(`مسارات الجرد ${routes.length} · عناوين السجل ${table.size} · مخالفات ${errs.length}`);
if (errs.length) { console.error(errs.slice(0, 40).join("\n")); process.exit(1); }
console.log("✓ titles-unique");
