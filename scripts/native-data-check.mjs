#!/usr/bin/env node
// فحص بيانات التطبيق الأصلي: يقارن MANIFEST.json بالملفات الفعلية.
//   MISSING     ملف في المانيفست غير موجود، أو sha256 لا يطابق، أو JSON غير صالح (يفشل)
//   WARN-EMPTY  ملف JSON فارغ ([] أو {}) (تحذير فقط)
// الاستثناءات من docs/native/data-exemptions.json:
//   computedInApp      → تُتجاوز في MISSING وWARN-EMPTY
//   intentionallyEmpty → تُتجاوز في WARN-EMPTY فقط
import { readFileSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dataDir = join(root, "ios-native/Data");
const manifest = JSON.parse(readFileSync(join(dataDir, "MANIFEST.json"), "utf8"));
const ex = JSON.parse(readFileSync(join(root, "docs/native/data-exemptions.json"), "utf8"));
const computed = new Set(ex.computedInApp ?? []);
const emptyOk = new Set(Object.keys(ex.intentionallyEmpty ?? {}));

const missing = [];
const warnEmpty = [];
for (const { path, sha256 } of manifest.files) {
  const key = path.replace(/\.json$/, "");
  const abs = join(dataDir, path);
  if (!existsSync(abs)) {
    if (!computed.has(key)) missing.push(`${path} (غير موجود)`);
    continue;
  }
  const buf = readFileSync(abs);
  if (sha256 && createHash("sha256").update(buf).digest("hex") !== sha256) {
    missing.push(`${path} (sha256 لا يطابق المانيفست)`);
    continue;
  }
  if (!path.endsWith(".json")) continue;
  let parsed;
  try { parsed = JSON.parse(buf.toString("utf8")); } catch { missing.push(`${path} (JSON غير صالح)`); continue; }
  const empty = Array.isArray(parsed) ? parsed.length === 0 : parsed && typeof parsed === "object" && Object.keys(parsed).length === 0;
  if (empty && !computed.has(key) && !emptyOk.has(key)) warnEmpty.push(path);
}

for (const m of missing) console.log(`MISSING ${m}`);
for (const w of warnEmpty) console.log(`WARN-EMPTY ${w}`);
console.log(`native-data-check: ${manifest.files.length} ملف، MISSING=${missing.length}، WARN-EMPTY=${warnEmpty.length}`);
process.exit(missing.length ? 1 : 0);
