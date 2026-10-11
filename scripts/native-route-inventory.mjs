#!/usr/bin/env node
// يولّد docs/native/ROUTE_TEMPLATE_MAP.json (+ هيكل FEATURE_PARITY.md إن لم يوجد) من AppRoutes.tsx.
// ما يُحذف من الجرد (تحويلات/مكرر/إدارة/تطوير) لا يُبنى في SwiftUI.
import { readFileSync, writeFileSync, existsSync } from "node:fs";
const SRC = "artifacts/majalis/src/AppRoutes.tsx";
const src = readFileSync(SRC, "utf8");
const routes = [];
for (const m of src.matchAll(/<Route\s+path="([^"]+)"\s*>([\s\S]*?)<\/Route>/g)) {
  const [, path, body] = m;
  const red = body.match(/<Redirect\s+to="([^"]+)"/);
  const comp = body.match(/component=\{(\w+)\}/);
  routes.push({ path, redirect: red?.[1] ?? null, component: comp?.[1] ?? null });
}
const dropped = [];
const kept = new Map(); // component → canonical route
const SECTIONS = [
  ["القرآن", /^(quran|mushaf|quran-hub|quran-engine|tafsir|ulum-quran|hifz|hifz-path|tajweed|miracles|surah|revelation|memorization|tasmee|mutashabihat|c)(-|$)/],
  ["الحديث والسنة", /^(hadith|arbaeen|sunnah|sunnah-studies|wasaya|dalail)/],
  ["الفقه والعبادات", /^(fiqh|worship|zakat|tahara|talaq|waqf|udhiya|mawarith|madhahib|prayer|hajj|ramadan|salah|sins|tawba|maqasid|jumuah|janaza|nikah|riba|sadaqa|sawm|sujood-sahw|ruqya|family|arkan|prophetic-medicine|fadail-aamal|amr-bil-maruf)/],
  ["العقيدة والتزكية", /^(tawhid|iman|tazkiya|tazkiya-topics|iman-topics|islamic-sects|discover-islam|usra|akhlaq|adab-talab-ilm|amrad-qalbiyya|arkan-iman|asma-husna|alamat-saah|janna-naar|malaika|raqaiq|hikam-salaf)/],
  ["السيرة والتاريخ والأعلام", /^(prophets|seerah|tarikh|islamic-landmarks|nations|scholars|sheikhs|teachers|fikr|sahabah|shamael|occasions|stories)/],
  ["الأذكار والأدعية", /^(adhkar|duas|dua|tasbih|azkar|daily-wird|sunan-yawmiyya|adhan-help|adhan-settings)/],
  ["الدروس والتعلم", /^(lessons|learn|durus|courses|competitions|quiz|universities|knowledge|path|annual-courses|kuwait-lessons|occasions-lessons|study-room|flashcards|reading-plans|my-learning|progress|institutions|researcher|fawaid)/],
  ["اللغة والمكتبة والبحث", /^(arabic-language|library|books|sources|search|academic-research|mawsuaat|terms|articles|islamic-glossary|islamic-directory|mind-map|cards|methodology|scientific-announcements|sitemap|sections|more)/],
  ["الحساب والإعدادات", /^(auth|account|profile|settings|support|about|updates|vault|upload|widget|notifications|privacy|terms-of-use|contact|data-licenses|fatwa-policy|feature-tour|login|register|my-submissions|submit|notification-settings|offline|stats|islam-stats|calendar|car-mode|mosque-mode|qibla)/],
];
const sectionOf = (p) => { const s = p.split("/")[1] ?? ""; return SECTIONS.find(([, re]) => re.test(s))?.[0] ?? "متفرقات"; };
const PRIVATE = /^\/(auth|account|profile|settings|vault|upload|widget-center|notifications|login|signup)/;
const DROP_PATH = /^\/(admin|debug|dev|owner|internal)(\/|$)/;
const templateOf = (path, comp) => {
  if (PRIVATE.test(path)) return "خاصة";
  const s = `${path} ${comp}`;
  if (/search|بحث/i.test(s)) return "بحث";
  if (/quiz|test|competition|exam|game|challenge/i.test(s)) return "اختبار";
  if (/audio|podcast|listen|recit|voice|transcribe|radio|tasmee|tilawa/i.test(s)) return "صوت";
  if (/:/.test(path)) return /article|research|story|stories|fatwa|blog|post/i.test(s) ? "مقال" : "تفاصيل";
  if (/article|research|story|stories|fatwa|blog/i.test(s)) return "مقال";
  if (/hub|index|lobby|home|sections|center/i.test(s)) return "أقسام";
  if (/map|grid|gallery|atlas|calendar/i.test(s)) return "شبكة";
  return "قائمة";
};
for (const r of routes) {
  if (r.redirect) { dropped.push({ path: r.path, reason: `تحويل إلى ${r.redirect}` }); continue; }
  if (!r.component) { dropped.push({ path: r.path, reason: DROP_PATH.test(r.path) ? "تطوير/تصحيح" : "بلا مكوّن صفحة" }); continue; }
  if (DROP_PATH.test(r.path)) { dropped.push({ path: r.path, reason: "إدارة/تطوير — خارج التطبيق" }); continue; }
  const prev = kept.get(r.component);
  if (prev) {
    const [keep, drop] = prev.path.length <= r.path.length ? [prev, r] : [r, prev];
    kept.set(r.component, keep);
    if (!keep.path.includes(":") === drop.path.includes(":") || true) dropped.push({ path: drop.path, reason: `مكرر لـ ${keep.path} (${r.component})` });
    continue;
  }
  kept.set(r.component, r);
}
const entries = [...kept.values()].map((r) => ({ path: r.path, component: r.component, section: sectionOf(r.path), template: templateOf(r.path, r.component) }))
  .sort((a, b) => a.section.localeCompare(b.section, "ar") || a.path.localeCompare(b.path));
const bySection = new Map();
for (const e of entries) bySection.set(e.section, (bySection.get(e.section) ?? 0) + 1);
const owners = {}; const load = { "ن2": 0, "ن3": 0 };
for (const [s, n] of [...bySection].sort((a, b) => b[1] - a[1])) { const o = load["ن2"] <= load["ن3"] ? "ن2" : "ن3"; owners[s] = o; load[o] += n; }
entries.forEach((e) => (e.owner = owners[e.section]));
const templates = {}; entries.forEach((e) => (templates[e.template] = (templates[e.template] ?? 0) + 1));
writeFileSync("docs/native/ROUTE_TEMPLATE_MAP.json", JSON.stringify({ source: SRC, totals: { routesInFile: routes.length, kept: entries.length, dropped: dropped.length }, templates, owners, routes: entries, dropped }, null, 1) + "\n");
if (!existsSync("docs/native/FEATURE_PARITY.md") || process.argv.includes("--md")) {
  let md = `# FEATURE_PARITY — جرد ميزات التطبيق للنقل إلى SwiftUI\n\nمولَّد من \`${SRC}\` عبر \`scripts/native-route-inventory.mjs\`. التأشير بـ[x] يدويًا عند اكتمال الميزة وفحصها؛ \`scripts/native-progress.mjs\` يحسب النسبة.\nما ليس هنا لا يُبنى (انظر «المحذوف» في الأسفل).\n\n`;
  for (const [s] of [...bySection].sort((a, b) => a[0].localeCompare(b[0], "ar"))) {
    const list = entries.filter((e) => e.section === s);
    md += `## ${s} — ${list.length} (المسؤول: ${owners[s]})\n\n` + list.map((e) => `- [ ] \`${e.path}\` — ${e.component} — ${e.template}`).join("\n") + "\n\n";
  }
  md += `## المحذوف من الجرد (${dropped.length})\n\n` + dropped.map((d) => `- \`${d.path}\` — ${d.reason}`).join("\n") + "\n";
  writeFileSync("docs/native/FEATURE_PARITY.md", md);
}
console.log(JSON.stringify({ routesInFile: routes.length, kept: entries.length, dropped: dropped.length, templates, load }));
