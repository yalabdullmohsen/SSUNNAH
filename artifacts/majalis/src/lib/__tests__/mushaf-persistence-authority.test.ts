/**
 * عقد تخزين المصحف الحي — resolve · migration · repository.
 * تشغيل: node --import tsx src/lib/__tests__/mushaf-persistence-authority.test.ts
 */
import assert from "node:assert/strict";
import {
  MUSHAF_AYAH_MARKS_KEY,
  MUSHAF_AYAH_MARKS_LEGACY_KEY,
  MUSHAF_HYDRATE_BACKUP_PREFIX,
  MUSHAF_KHATMAH_PLANS_LEGACY_KEY,
  MUSHAF_KHATMAH_TRACKER_KEY,
  MUSHAF_PERSISTENCE_VERSION_KEY,
  MushafPersistenceRepository,
  resolveMushafStorageValue,
  runMushafPersistenceMigration,
} from "../mushaf-persistence";
import { clearOpsTelemetryForTests } from "../ops-telemetry";

const store = new Map<string, string>();
Object.defineProperty(globalThis, "localStorage", {
  value: {
    getItem: (k: string) => (store.has(k) ? store.get(k)! : null),
    setItem: (k: string, v: string) => {
      store.set(k, v);
    },
    removeItem: (k: string) => {
      store.delete(k);
    },
  },
  configurable: true,
});

clearOpsTelemetryForTests();

// مستخدم جديد
store.clear();
{
  const r = resolveMushafStorageValue({
    localValue: null,
    prefsValue: null,
    preferNative: true,
  });
  assert.equal(r.source, "none");
  assert.equal(r.value, null);
}

// مستخدم قديم — legacy ayah marks فقط
store.clear();
store.set(MUSHAF_AYAH_MARKS_LEGACY_KEY, "1");
{
  const report = runMushafPersistenceMigration();
  assert.equal(report.ayahMarksMigrated, true);
  assert.equal(store.get(MUSHAF_AYAH_MARKS_KEY), "1");
  assert.equal(store.get(MUSHAF_AYAH_MARKS_LEGACY_KEY), "1", "legacy retained");
}

// لا تستبدل قيمة كانونية أحدث
store.set(MUSHAF_AYAH_MARKS_KEY, "0");
store.set(MUSHAF_AYAH_MARKS_LEGACY_KEY, "1");
{
  const report = runMushafPersistenceMigration();
  assert.equal(report.ayahMarksMigrated, false);
  assert.equal(store.get(MUSHAF_AYAH_MARKS_KEY), "0");
}

// تعارض LS vs Preferences — prefer native
{
  const r = resolveMushafStorageValue({
    localValue: "10",
    prefsValue: "200",
    preferNative: true,
  });
  assert.equal(r.conflict, true);
  assert.equal(r.value, "200");
  assert.equal(r.source, "preferences");
  assert.equal(r.backedUp, true);
}

// متطابقان
{
  const r = resolveMushafStorageValue({
    localValue: "55",
    prefsValue: "55",
    preferNative: true,
  });
  assert.equal(r.conflict, false);
  assert.equal(r.source, "equal");
}

// فشل Preferences (null) → أبقِ LS
{
  const r = resolveMushafStorageValue({
    localValue: "77",
    prefsValue: null,
    preferNative: true,
  });
  assert.equal(r.value, "77");
  assert.equal(r.source, "local");
}

// khatma noted دون حذف
store.clear();
store.set(MUSHAF_KHATMAH_PLANS_LEGACY_KEY, JSON.stringify([{ id: "a" }]));
{
  const report = runMushafPersistenceMigration();
  assert.equal(report.khatmaNoted, true);
  assert.ok(store.has(MUSHAF_KHATMAH_PLANS_LEGACY_KEY));
  assert.equal(store.has(MUSHAF_KHATMAH_TRACKER_KEY), false);
}

// idempotent migration
store.set(MUSHAF_PERSISTENCE_VERSION_KEY, "1");
{
  const a = runMushafPersistenceMigration();
  const b = runMushafPersistenceMigration();
  assert.equal(a.version, b.version);
  assert.equal(store.get(MUSHAF_PERSISTENCE_VERSION_KEY), "1");
}

// repository ayah marks
store.clear();
assert.equal(MushafPersistenceRepository.getAyahMarksSync(), true);
MushafPersistenceRepository.setAyahMarks(false);
assert.equal(store.get(MUSHAF_AYAH_MARKS_KEY), "0");
assert.equal(MushafPersistenceRepository.getAyahMarksSync(), false);

// backup prefix contract
assert.ok(MUSHAF_HYDRATE_BACKUP_PREFIX.startsWith("mj.mushaf"));

console.log("mushaf-persistence-authority.test.ts: ok");
