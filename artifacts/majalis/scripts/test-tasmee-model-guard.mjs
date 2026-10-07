/**
 * حارس حزمة نموذج «تسميع»: يمنع تكرار عطل tokenizer.json المولَّد (ينقصه رموز الزمن فيُخرج WhisperKit نصًا فارغًا).
 * - tokenizer.json المرجعي (tools/tasmee-model/tokenizer) يطابق الرسمي: 1608 رمزًا مضافًا ومعرّفات الرموز الخاصة.
 * - كل model-manifest-*.json يذكر tokenizer.json وtokenizer_config.json بـSHA-256 مطابق للمرجعي، وgeneration_config.json.
 * - اختياري: TASMEE_MODEL_DIR=<مجلد نموذج> يفحص الملفات نفسها.
 * تشغيل: node scripts/test-tasmee-model-guard.mjs
 */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const tokDir = join(root, "tools/tasmee-model/tokenizer");
const sha = (buf) => createHash("sha256").update(buf).digest("hex");
const fp = JSON.parse(readFileSync(join(tokDir, "FINGERPRINT.json"), "utf8"));

/** يفحص tokenizer.json (نص) مقابل المواصفة الرسمية؛ يرمي عند أي اختلاف. */
export function assertOfficialTokenizer(jsonText, label = "tokenizer.json") {
  const t = JSON.parse(jsonText);
  const added = Object.fromEntries(t.added_tokens.map((x) => [x.content, x.id]));
  assert.equal(t.added_tokens.length, fp.addedTokensCount, `${label}: عدد الرموز المضافة ${t.added_tokens.length} ≠ ${fp.addedTokensCount} (رموز الزمن مفقودة؟)`);
  assert.equal(Object.keys(t.model.vocab).length, fp.vocabSize, `${label}: حجم vocab`);
  for (const [name, id] of Object.entries(fp.specialTokenIds)) assert.equal(added[name], id, `${label}: معرّف ${name}`);
  assert.equal(sha(Buffer.from(jsonText)), fp.tokenizerJsonSha256, `${label}: SHA-256 يخالف الرسمي`);
}

// 1) المرجعي نفسه رسمي
const canonical = readFileSync(join(tokDir, "tokenizer.json"));
assertOfficialTokenizer(canonical.toString("utf8"), "المرجعي");
assert.equal(sha(readFileSync(join(tokDir, "tokenizer_config.json"))), fp.tokenizerConfigSha256, "tokenizer_config المرجعي");
assert.equal(fp.addedTokensCount, 1608);
assert.deepEqual([fp.specialTokenIds["<|endoftext|>"], fp.specialTokenIds["<|startoftranscript|>"], fp.specialTokenIds["<|transcribe|>"], fp.specialTokenIds["<|notimestamps|>"]], [50257, 50258, 50359, 50363]);

// 2) الفاحص يرفض النسخة المولَّدة المعطوبة (بلا رموز الزمن) ويرفض تعديل معرّف خاص
{
  const t = JSON.parse(canonical.toString("utf8"));
  const broken = { ...t, added_tokens: t.added_tokens.filter((x) => !/^<\|\d+\.\d+\|>$/.test(x.content)) };
  assert.throws(() => assertOfficialTokenizer(JSON.stringify(broken), "معطوب"), /عدد الرموز المضافة/);
  const shifted = { ...t, added_tokens: t.added_tokens.map((x) => (x.content === "<|notimestamps|>" ? { ...x, id: 1 } : x)) };
  assert.throws(() => assertOfficialTokenizer(JSON.stringify(shifted), "معرّف"), /notimestamps/);
}

// 3) كل manifest نموذج يشحن tokenizer الرسمي بالبصمة نفسها
const docs = join(root, "docs/tasmee");
const manifests = readdirSync(docs).filter((f) => /^model-manifest-.*\.json$/.test(f));
assert.ok(manifests.length >= 1, "لا يوجد model-manifest في docs/tasmee");
for (const f of manifests) {
  const m = JSON.parse(readFileSync(join(docs, f), "utf8"));
  const entry = (name) => m.files.find((x) => x.path === name);
  assert.equal(entry("tokenizer.json")?.sha256, fp.tokenizerJsonSha256, `${f}: tokenizer.json ليس الرسمي`);
  assert.equal(entry("tokenizer_config.json")?.sha256, fp.tokenizerConfigSha256, `${f}: tokenizer_config.json ليس الرسمي`);
  assert.ok(entry("generation_config.json"), `${f}: generation_config.json مفقود (suppress_tokens)`);
  for (const need of ["AudioEncoder.mlmodelc", "TextDecoder.mlmodelc", "MelSpectrogram.mlmodelc"]) {
    assert.ok(m.files.some((x) => x.path.startsWith(need + "/")), `${f}: ${need} مفقود`);
  }
}

// 4) اختياري: مجلد نموذج فعلي
if (process.env.TASMEE_MODEL_DIR) {
  const p = join(process.env.TASMEE_MODEL_DIR, "tokenizer.json");
  assert.ok(existsSync(p), "tokenizer.json غائب عن مجلد النموذج");
  assertOfficialTokenizer(readFileSync(p, "utf8"), p);
}
console.log(`test-tasmee-model-guard: ok (${manifests.join(", ")})`);
