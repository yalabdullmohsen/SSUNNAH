import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT = resolve(dirname(fileURLToPath(import.meta.url)), "../native-content-footer-guard.sh");
const run = (src) => spawnSync("bash", [SCRIPT], { env: { ...process.env, FOOTER_GUARD_SRC: src }, encoding: "utf8" });

test("المستودع الحالي: كل شاشات المحتوى الشرعي تستعمل الذيل", () => {
  const r = spawnSync("bash", [SCRIPT], { encoding: "utf8" });
  assert.equal(r.status, 0, r.stdout + r.stderr);
});

test("مصدر فارغ: الملفات المطلوبة مفقودة فيفشل", () => {
  const r = run(mkdtempSync(join(tmpdir(), "footer-guard-")));
  assert.notEqual(r.status, 0);
  assert.match(r.stdout, /ملف مطلوب غير موجود/);
});

test("استعمال مباشر لزر الإبلاغ خارج Components يفشل", () => {
  const src = mkdtempSync(join(tmpdir(), "footer-guard-"));
  mkdirSync(join(src, "Special"));
  writeFileSync(join(src, "Special/X.swift"), 'SunnahReportIssueButton(title: "a", id: "b", section: "c")\n');
  const r = run(src);
  assert.notEqual(r.status, 0);
  assert.match(r.stdout, /استعمال مباشر/);
});

test("نص التنبيه الكامل داخل صفحة محتوى يفشل", () => {
  const src = mkdtempSync(join(tmpdir(), "footer-guard-"));
  mkdirSync(join(src, "Special"));
  writeFileSync(join(src, "Special/Y.swift"), "Text(SunnahDisclosure.short)\n");
  const r = run(src);
  assert.match(r.stdout, /نص التنبيه الكامل داخل صفحة محتوى/);
});

test("فتح Sheet التنبيه تلقائيًا (onAppear أو حالة true) يفشل", () => {
  const src = mkdtempSync(join(tmpdir(), "footer-guard-"));
  mkdirSync(join(src, "Support"));
  writeFileSync(join(src, "Support/SunnahDisclosure.swift"),
    "struct SunnahDisclosureInfoButton: View {\n @State private var showing = true\n var body: some View { X().onAppear { showing = true } }\n}\n");
  const r = run(src);
  assert.match(r.stdout, /حالة العرض يجب أن تبدأ false/);
  assert.match(r.stdout, /فتح تلقائي ممنوع/);
});
