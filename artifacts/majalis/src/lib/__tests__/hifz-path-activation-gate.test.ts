/**
 * تفعيل مسار الحفظ للعامة: كتالوج مصحف حقيقي، تقدّم محفوظ (ضيف + حساب)، مراجعة SM-2 عبر srs.ts، ومدخل في تبويب القرآن.
 * node --import tsx src/lib/__tests__/hifz-path-activation-gate.test.ts
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const read = (rel: string) => readFileSync(resolve(root, rel), "utf8");

const mp = await import("../memorization-path/index.ts");
const store = await import("../memorization-path/progress-store.ts");
const sync = await import("../memorization-path/cloud-sync.ts");
const { getSurahMeta } = await import("../quran-api.ts");
const { schedule } = await import("../srs.ts");

mp.resetMemorizationResearchFlags();
store.resetHifzProgressStoreForTests();

console.log("=== الكتالوج: 4 مسارات مصحف حقيقية بلا نص مخزّن ===");
{
  const paths = mp.listPublishedHifzPaths();
  assert.deepEqual(paths.map((p) => p.slug).sort(), ["juz-amma", "juz-qad-sami", "juz-tabarak", "surat-al-fatiha"]);
  for (const p of paths) {
    assert.equal(p.licenseStatus, "PROJECT_QURAN");
    assert.equal(p.category, "quran");
    assert.equal(p.units.length, p.estimatedUnits);
    assert.ok(p.reviewNote && /المالك/.test(p.reviewNote), "اعتماد المالك موثّق صراحةً");
    for (const u of p.units) {
      assert.equal(u.verifiedTextReference.kind, "quran");
      const ref = u.verifiedTextReference as { surah: number; ayahFrom: number; ayahTo: number };
      assert.equal(ref.ayahFrom, 1);
      assert.equal(ref.ayahTo, getSurahMeta(ref.surah).ayahs, `${u.unitId}: عدد الآيات من بيانات المصحف`);
      assert.equal(u.title, `سورة ${getSurahMeta(ref.surah).name}`);
      assert.ok(!("text" in u) && !("ayahText" in u), "لا نص قرآني مخزّن");
    }
  }
  const amma = mp.getPublishedHifzPathBySlug("juz-amma")!;
  assert.equal(amma.units.length, 37, "جزء عمّ = 37 سورة (78–114)");
  assert.equal((amma.units[0].verifiedTextReference as { surah: number }).surah, 114);
  assert.equal((amma.units[36].verifiedTextReference as { surah: number }).surah, 78);
  assert.equal(mp.getPublishedHifzPathBySlug("juz-tabarak")!.units.length, 11, "الجزء 29 = 67–77");
  assert.equal(mp.getPublishedHifzPathBySlug("juz-qad-sami")!.units.length, 9, "الجزء 28 = 58–66");
  assert.equal(mp.getPublishedHifzPathBySlug("surat-al-fatiha")!.units.length, 1);
  // ما يحتاج ترخيص المالك يبقى غير منشور
  for (const cat of ["adhkar", "aqidah", "fiqh", "hadith-mutun", "jawami-hadith", "arabic", "talib-ilm"] as const) {
    assert.equal(mp.listPublishedHifzPathsByCategory(cat).length, 0, `${cat} DRAFT`);
  }
}

console.log("=== الأعلام: مفعّل افتراضيًا ويمكن إطفاؤه ===");
assert.equal(mp.isHifzPathEnabled(), true);
assert.equal(mp.isHifzPathPracticeEnabled(), true);
assert.equal(mp.isScholarlyResearchEnabled(), false);
mp.setMemorizationResearchFlagsForTests({ hifzPathEnabled: false });
assert.equal(mp.isHifzPathEnabled(), false);
mp.resetMemorizationResearchFlags();

console.log("=== المراجعة تعتمد SM-2 من lib/srs.ts لا فترات مكرّرة ===");
{
  const input = { pathSlug: "juz-amma", pathTitle: "جزء عمّ", unitId: "s114", unitTitle: "سورة الناس" };
  const first = store.markHifzUnitSelfReported(input);
  const expected = schedule({ interval: 0, ease: 2.5, reps: 0, lapses: 0 }, "ok");
  assert.equal(first.nextReviewAt, `${expected.dueOn}T00:00:00.000Z`);
  assert.equal(first.srsInterval, expected.interval);
  const second = store.markHifzUnitReviewed(input, "ok");
  assert.equal(second.srsReps, expected.reps + 1);
  assert.ok((second.srsInterval ?? 0) >= (first.srsInterval ?? 0), "الفاصل ينمو مع المراجعات الناجحة");
  const reinforce = store.markHifzUnitReviewed(input, "needs_reinforcement");
  assert.equal(reinforce.srsLapses, 1, "النسيان يُحسب lapse");
  assert.equal(reinforce.srsInterval, 1);
  // فترات الوحدة المخصّصة تبقى مدعومة عند تحديدها
  const custom = store.markHifzUnitSelfReported({ ...input, unitId: "s113" }, { revisionIntervals: [2, 5] });
  assert.ok(custom.nextReviewAt);
  assert.equal(custom.srsInterval, undefined);
}

console.log("=== المزامنة: الأحدث يفوز، لا حذف، صفوف user_progress ===");
{
  store.resetHifzProgressStoreForTests();
  const base = { pathSlug: "juz-amma", pathTitle: "جزء عمّ", unitId: "s112", unitTitle: "سورة الإخلاص", state: "IN_PROGRESS" as const, repetitionCount: 2, reviewCycle: 0 };
  assert.equal(store.mergeRemoteHifzRecords([{ ...base, updatedAt: "2026-10-01T10:00:00.000Z" }]), 1, "سحابي جديد يُضاف");
  assert.equal(store.mergeRemoteHifzRecords([{ ...base, repetitionCount: 1, updatedAt: "2026-09-30T10:00:00.000Z" }]), 0, "الأقدم لا يستبدل");
  assert.equal(store.mergeRemoteHifzRecords([{ ...base, repetitionCount: 9, updatedAt: "2026-10-05T10:00:00.000Z" }]), 1, "الأحدث يستبدل");
  assert.equal(store.getUnitProgress("juz-amma", "s112")!.repetitionCount, 9);
  assert.equal(store.mergeRemoteHifzRecords([{ pathSlug: 5 as unknown as string }]), 0, "صف تالف يُتجاهل");
  assert.equal(store.exportHifzProgressForSync().length, 1, "لا حذف محلي");
  const rec = store.getUnitProgress("juz-amma", "s112")!;
  const row = sync.toHifzCloudRow("00000000-0000-0000-0000-000000000001", rec);
  assert.equal(row.content_type, "hifz_unit");
  assert.equal(row.content_id, "juz-amma:s112");
  assert.equal(row.content_url, "/hifz-path/p/juz-amma/u/s112");
  assert.equal(sync.parseHifzCloudRow({ content_type: "hifz_unit", last_position: rec })?.unitId, "s112");
  assert.equal(sync.parseHifzCloudRow({ content_type: "quran", last_position: rec }), null, "نوع آخر يُتجاهل");
  // سحب/دفع بعميل وهمي
  const upserts: unknown[] = [];
  const fake = {
    auth: { getSession: async () => ({ data: { session: null } }) },
    from: () => ({
      select: () => ({ eq: () => ({ eq: async () => ({ data: [{ content_type: "hifz_unit", last_position: { ...base, unitId: "s111", unitTitle: "سورة المسد", updatedAt: "2026-10-06T10:00:00.000Z" } }], error: null }) }) }),
      upsert: async (rows: unknown, opts: unknown) => { upserts.push([rows, opts]); return { error: null }; },
    }),
  };
  assert.equal(await sync.pullHifzProgress(fake as never, "u1"), 1);
  assert.equal(store.exportHifzProgressForSync().length, 2, "سحب سحابي يضيف الوحدة");
  assert.equal(await sync.pushHifzProgress(fake as never, "u1"), 2);
  assert.deepEqual((upserts[0] as [unknown, { onConflict: string }])[1], { onConflict: "user_id,content_type,content_id" });
}

console.log("=== التوصيل ===");
{
  const merge = read("src/lib/guest-cloud-merge.ts");
  assert.match(merge, /memorization-path\/cloud-sync/);
  assert.match(merge, /syncHifzProgressNow\(userId\)/);
  assert.match(merge, /startHifzCloudSync\(\)/);
  assert.match(read("src/lib/user-progress-service.ts"), /\.in\("content_type", \["lesson", "course", "quran", "lesson_detail"\]\)/, "صفوف الحفظ لا تتسرب إلى «تابع»");
  assert.match(read("src/lib/memorization-path/progress-store.ts"), /HIFZ_PROGRESS_CHANGED_EVENT/);
  const hub = read("src/design-system/screens/QuranHubScreen.tsx");
  assert.match(hub, /isHifzPathEnabled\(\)/);
  assert.match(hub, /href="\/hifz-path"/, "مدخل واضح في تبويب القرآن");
  assert.match(read("src/lib/feature-registry.ts"), /id:\s*"hifz-path"[^}]*status:\s*"active"/);
  assert.match(read("src/AppRoutes.tsx"), /path="\/hifz-path"/);
  assert.doesNotMatch(read("src/lib/memorization-path/catalog.ts"), /ayahText|quranText|verseText/, "لا نص قرآني في الكتالوج");
}

console.log("hifz-path-activation-gate: ok");
