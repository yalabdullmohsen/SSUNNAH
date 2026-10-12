/**
 * /ulum-quran → Data/quran/ulum-quran.json: ثوابت صفحة الموقع (UlumQuranView.tsx) كما هي بلا إضافة نص.
 * التبويب في tags؛ لا يمسّ نص القرآن ولا الترقيم (الآيات المقتبسة داخل النصوص كما عرضها الموقع).
 */
import { loadConsts } from "../lib/ts-literal.mjs";

export default async function exportUlumQuran({ json, held, reject, counts, appRoot }) {
  const get = loadConsts(`${appRoot}/src/pages/quran/ui/UlumQuranView.tsx`);
  const rows = [];
  const add = (tab, id, title, body, subtitle) => {
    const rid = `ulum-${tab}-${id}`;
    if (held(rid)) { reject("ulum-quran", "محجوز"); return; }
    rows.push({ id: rid, title, subtitle: subtitle || undefined, body: body || undefined, tags: [tab] });
  };
  get("NUZUL_FACTS").forEach((x, i) => add("النزول والتنجيم", `fact-${i + 1}`, x.label, x.value));
  get("NUZUL_TYPES").forEach((x, i) => add("النزول والتنجيم", `type-${i + 1}`, x.title, [x.desc, x.dalil].filter(Boolean).join("\n\n")));
  get("JAM_STAGES").forEach((x, i) => add("الجمع والتدوين", `stage-${i + 1}`, x.stage, x.items.join("\n")));
  get("TAFSIR_TYPES").forEach((x, i) => add("التفسير وأنواعه", `type-${i + 1}`, x.title, x.desc, x.ex));
  get("MUFASSIRUN").forEach((x, i) => add("التفسير وأنواعه", `mufassir-${i + 1}`, x.name, x.note, [x.kitab, x.era].join(" — ")));
  get("IJAZ_TYPES").forEach((x, i) => add("الإعجاز القرآني", `type-${i + 1}`, x.title, x.desc));
  const mm = get("MUHKAM_MUTASHABIH");
  for (const k of Object.keys(mm)) add("أحكام القرآن", k, mm[k].title, [mm[k].def, ...mm[k].ex].join("\n"));
  get("NASKH_TYPES").forEach((x, i) => add("أحكام القرآن", `naskh-${i + 1}`, x.title, x.desc, x.ex));
  get("QIRAAT_SABA").forEach((x, i) => add("القراءات السبع", `qari-${i + 1}`, x.name, `${x.note}\nالراويان: ${x.rawi1}، ${x.rawi2}`, `${x.imam} — ${x.died} — ${x.origin}`));
  get("QIRAAT_USUL").forEach((x, i) => add("القراءات السبع", `usul-${i + 1}`, x.title, x.desc));
  get("ADAWAT_CARDS").forEach((x, i) => add("آداب وأدوات", `card-${i + 1}`, x.title, x.desc));
  json("quran/ulum-quran.json", rows);
  (counts.quran ??= {})["ulum-quran"] = rows.length;
}
