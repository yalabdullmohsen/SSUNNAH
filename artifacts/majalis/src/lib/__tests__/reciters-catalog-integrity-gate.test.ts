/**
 * بوابة سلامة كتالوج القرّاء (ساكنة — بلا شبكة).
 * الفحص الشبكي الفعلي: node scripts/audit-reciters-playability.mjs [--deep]
 * التقرير: docs/audit/RECITERS_PLAYABILITY.md
 * تشغيل: node --import tsx src/lib/__tests__/reciters-catalog-integrity-gate.test.ts
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const store = new Map<string, string>();
(globalThis as { localStorage?: unknown }).localStorage = {
  getItem: (k: string) => store.get(k) ?? null,
  setItem: (k: string, v: string) => void store.set(k, String(v)),
  removeItem: (k: string) => void store.delete(k),
};

const {
  RECITERS,
  RETIRED_AYAH_RECITER_IDS,
  migrateStoredReciterId,
  loadReciterId,
  listAyahAudioUrls,
  getIslamicNetworkAyahUrl,
} = await import("../quran-audio");
const { DEFAULT_VERIFIED_RECITER_IDS, isVerifiedReciterId } = await import("../audio-registry");
const { VERIFIED_RECITER_IDS } = await import("../../config/quranReciters");
const { MURATTAL_RECITER_CATALOG } = await import("../sunnah-audio-platform/quran-murattal-catalog");
const { __setQuranAudioRemoteConfigForTests } = await import("../quran-audio-remote-config");
__setQuranAudioRemoteConfigForTests(null);

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "../../..");
const src = (p: string) => readFileSync(resolve(root, p), "utf8");

/* ١) لا معرّفات مكرّرة ولا مصادر مكرّرة، ولكل قارئ اسم ورابط أساس */
const ids = RECITERS.map((r) => r.id);
assert.equal(new Set(ids).size, ids.length, "معرّفات قرّاء مكرّرة");
const folders = RECITERS.map((r) => r.everyayahFolder).filter(Boolean);
assert.equal(new Set(folders).size, folders.length, "مجلد everyayah مكرّر بين قارئين");
const bases = RECITERS.map((r) => r.surahBaseUrl);
assert.equal(new Set(bases).size, bases.length, "رابط سور mp3quran مكرّر بين قارئين");
for (const r of RECITERS) {
  assert.ok(r.nameAr.trim().length > 1, `${r.id}: اسم عربي مفقود`);
  assert.ok(r.nameEn.trim().length > 1, `${r.id}: اسم إنجليزي مفقود`);
  assert.match(r.surahBaseUrl, /^https:\/\/[^/]+\.mp3quran\.net\/[^\s]+[^/]$/, `${r.id}: رابط سور https مطلوب`);
  if (r.everyayahFolder !== null) assert.match(r.everyayahFolder, /^[\w.-]+$/, `${r.id}: مجلد everyayah غير صالح`);
}

/* ٢) المعرّفات المُزالة لا تبقى في أي مصدر آية-بآية أو قائمة معروضة */
assert.ok(RETIRED_AYAH_RECITER_IDS.includes("mustafa_ismail"), "mustafa_ismail يجب أن يبقى مُدرجًا كمُزال");
for (const id of RETIRED_AYAH_RECITER_IDS) {
  const r = RECITERS.find((x) => x.id === id);
  assert.ok(!r || r.everyayahFolder === null, `${id}: لا يزال له مجلد everyayah بعد إزالته`);
  assert.equal(listAyahAudioUrls(1, 1, id).length, 0, `${id}: لا يزال يبني روابط آية`);
  assert.ok(!(DEFAULT_VERIFIED_RECITER_IDS as readonly string[]).includes(id), `${id}: في القائمة المُحقَّقة`);
  assert.ok(!(VERIFIED_RECITER_IDS as readonly string[]).includes(id), `${id}: في VERIFIED_RECITER_IDS`);
  assert.ok(!MURATTAL_RECITER_CATALOG.some((m) => m.catalogId === id), `${id}: في كتالوج المرتّل`);
}
const registry = JSON.parse(src("public/data/audio/audio-registry.json")) as {
  reciters: { id: string; verified?: boolean; folder?: string }[];
};
const regIds = registry.reciters.map((r) => r.id);
assert.equal(new Set(regIds).size, regIds.length, "audio-registry.json: معرّفات مكرّرة");
for (const r of registry.reciters) {
  assert.ok(!RETIRED_AYAH_RECITER_IDS.includes(r.id), `audio-registry.json: ${r.id} مُزال`);
  const cat = RECITERS.find((x) => x.id === r.id);
  assert.ok(cat, `audio-registry.json: ${r.id} غير موجود في RECITERS`);
  if (r.folder) assert.equal(cat!.everyayahFolder, r.folder, `audio-registry.json: مجلد ${r.id} لا يطابق الكتالوج`);
}
for (const m of MURATTAL_RECITER_CATALOG) {
  assert.ok(ids.includes(m.catalogId), `كتالوج المرتّل: ${m.catalogId} غير موجود في RECITERS`);
}
const murattalIds = MURATTAL_RECITER_CATALOG.map((m) => m.id);
assert.equal(new Set(murattalIds).size, murattalIds.length, "كتالوج المرتّل: معرّفات مكرّرة");

/* ٣) احتياط islamic.network: لا مسارات ثبت أنها 403، ولا معرّفات يتيمة */
const audioSrc = src("src/lib/quran-audio.ts");
const editionBlock = audioSrc.slice(audioSrc.indexOf("const ISLAMIC_NETWORK_EDITION"));
const editions = [...editionBlock.slice(0, editionBlock.indexOf("};")).matchAll(/(\w+):\s*"([^"]+)"/g)];
assert.ok(editions.length > 0, "تعذّر قراءة ISLAMIC_NETWORK_EDITION");
for (const [, id, ed] of editions) {
  assert.ok(ids.includes(id!), `ISLAMIC_NETWORK_EDITION: ${id} يتيم (لا قارئ بهذا المعرّف)`);
  assert.match(ed!, /^(32|40|48|64|128|192)\/ar\.[a-z]+$/, `ISLAMIC_NETWORK_EDITION: ${id} يجب أن يحمل المعدّل`);
}
for (const dead of ["128/ar.abdulsamad", "128/ar.ghamadi", "128/ar.abdurrahmaansudais", "128/ar.saoodshuraym"]) {
  assert.ok(!audioSrc.includes(`"${dead}"`), `مسار islamic.network ميت (403) عاد: ${dead}`);
}
assert.equal(getIslamicNetworkAyahUrl(1, 1, "ghamdi"), "", "الغامدي بلا احتياط islamic.network عامل");
assert.equal(
  getIslamicNetworkAyahUrl(2, 255, "abdulsamad"),
  "https://cdn.islamic.network/quran/audio/192/ar.abdulbasitmurattal/262.mp3",
);

/* ٤) ترحيل التفضيل عند القراءة (localStorage + IndexedDB) */
for (const id of [...RETIRED_AYAH_RECITER_IDS, "ghost_reciter", "", null, undefined]) {
  const out = migrateStoredReciterId(id);
  assert.ok(isVerifiedReciterId(out), `ترحيل ${String(id)} → ${out} ليس قارئًا مُحقَّقًا`);
  assert.ok(!RETIRED_AYAH_RECITER_IDS.includes(out));
}
assert.equal(migrateStoredReciterId("dosari"), "dosari", "قارئ مُحقَّق يبقى كما هو");
store.set("mj-quran-reciter-v3", "mustafa_ismail");
const loaded = loadReciterId();
assert.ok(isVerifiedReciterId(loaded), "loadReciterId يرحّل القارئ المُزال");
assert.equal(store.get("mj-quran-reciter-v3"), loaded, "loadReciterId يكتب القيمة المُرحَّلة");
assert.match(
  src("src/core/quran/QuranEngineContext.ts"),
  /migrateStoredReciterId\(reciter/,
  "hydratePreferences يجب أن يرحّل preferredReciterId المخزَّن في IndexedDB",
);

/* ٥) كل قارئ مُحقَّق يبني رابط آية https لنفس الشيخ */
for (const id of DEFAULT_VERIFIED_RECITER_IDS) {
  const urls = listAyahAudioUrls(112, 1, id);
  assert.ok(urls.length > 0, `${id}: بلا رابط آية`);
  for (const u of urls) assert.match(u, /^https:\/\//, `${id}: رابط غير آمن ${u}`);
}

console.log(`reciters-catalog-integrity-gate: ok (reciters=${RECITERS.length}, retired=${RETIRED_AYAH_RECITER_IDS.length})`);
