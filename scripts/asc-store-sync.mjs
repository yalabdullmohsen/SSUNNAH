#!/usr/bin/env node
// مزامنة بيانات App Store Connect عبر API (بلا Submit for Review أبدًا).
// الاستعمال: node scripts/asc-store-sync.mjs <status|sync> [--apply]
// المتغيرات: APP_STORE_CONNECT_API_KEY_ID / _ISSUER_ID / _KEY (محتوى .p8) ، اختياري ASC_REVIEW_DEMO_PASSWORD
import { createSign } from "node:crypto";
import { readFileSync } from "node:fs";

const BUNDLE_ID = "com.yousef.majlisilm";
const cmd = process.argv[2] ?? "status";
const apply = process.argv.includes("--apply");
const meta = JSON.parse(readFileSync("store/asc/metadata-1.1.0.json", "utf8"));
const env = (k) => process.env[k] || (console.error(`ناقص: ${k}`), process.exit(2));

function token() {
  const b64 = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");
  const head = b64({ alg: "ES256", kid: env("APP_STORE_CONNECT_API_KEY_ID"), typ: "JWT" });
  const now = Math.floor(Date.now() / 1000);
  const body = b64({ iss: env("APP_STORE_CONNECT_ISSUER_ID"), iat: now, exp: now + 900, aud: "appstoreconnect-v1" });
  const sig = createSign("SHA256").update(`${head}.${body}`).sign({ key: env("APP_STORE_CONNECT_API_KEY_KEY"), dsaEncoding: "ieee-p1363" });
  return `${head}.${body}.${sig.toString("base64url")}`;
}
const JWT = token();
async function api(method, path, body) {
  const res = await fetch(path.startsWith("http") ? path : `https://api.appstoreconnect.apple.com${path}`, {
    method,
    headers: { Authorization: `Bearer ${JWT}`, "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  const json = text ? JSON.parse(text) : {};
  if (!res.ok) throw new Error(`${method} ${path} → ${res.status} ${JSON.stringify(json.errors?.map((e) => e.detail) ?? json).slice(0, 400)}`);
  return json;
}
const log = (s) => console.log(s);
const changes = [];
async function write(label, method, path, body) {
  changes.push(label);
  if (!apply) return log(`  [dry-run] ${label}`);
  await api(method, path, body);
  log(`  ✓ ${label}`);
}

const app = (await api("GET", `/v1/apps?filter[bundleId]=${BUNDLE_ID}`)).data[0];
if (!app) throw new Error("التطبيق غير موجود");
log(`التطبيق: ${app.attributes.name} (${app.id})`);

const versions = (await api("GET", `/v1/apps/${app.id}/appStoreVersions?limit=10`)).data;
for (const v of versions) log(`  إصدار ${v.attributes.versionString} — ${v.attributes.appStoreState}`);
const builds = (await api("GET", `/v1/builds?filter[app]=${app.id}&sort=-uploadedDate&limit=5`)).data;
for (const b of builds) log(`  بناء ${b.attributes.version} — ${b.attributes.processingState} — ${b.attributes.uploadedDate}${b.attributes.expired ? " (منتهٍ)" : ""}`);
if (cmd === "status") process.exit(0);

// ---- sync ----
const EDITABLE = ["PREPARE_FOR_SUBMISSION", "DEVELOPER_REJECTED", "REJECTED", "METADATA_REJECTED", "INVALID_BINARY"];
let ver = versions.find((v) => v.attributes.versionString === meta.versionString);
if (!ver) {
  if (!apply) log(`  [dry-run] إنشاء إصدار ${meta.versionString}`);
  else {
    ver = (await api("POST", "/v1/appStoreVersions", { data: { type: "appStoreVersions", attributes: { versionString: meta.versionString, platform: "IOS" }, relationships: { app: { data: { type: "apps", id: app.id } } } } })).data;
    log(`  ✓ أُنشئ الإصدار ${meta.versionString}`);
  }
}
if (ver && !EDITABLE.includes(ver.attributes.appStoreState)) throw new Error(`الإصدار ${ver.attributes.versionString} في حالة ${ver.attributes.appStoreState} (غير قابل للتعديل)`);

if (ver) {
  const locs = (await api("GET", `/v1/appStoreVersions/${ver.id}/appStoreVersionLocalizations`)).data;
  const loc = locs.find((l) => l.attributes.locale === meta.locale);
  const attrs = meta.versionLocalization;
  if (loc) await write("تحديث وصف/كلمات/ما الجديد", "PATCH", `/v1/appStoreVersionLocalizations/${loc.id}`, { data: { type: "appStoreVersionLocalizations", id: loc.id, attributes: attrs } });
  else await write("إنشاء توطين الإصدار", "POST", "/v1/appStoreVersionLocalizations", { data: { type: "appStoreVersionLocalizations", attributes: { locale: meta.locale, ...attrs }, relationships: { appStoreVersion: { data: { type: "appStoreVersions", id: ver.id } } } } });

  // ملاحظات المراجعة (لا تسجيل دخول مطلوبًا، بلا أسرار)
  const rd = meta.reviewDetail;
  const a = { contactFirstName: rd.contactFirstName, contactLastName: rd.contactLastName, contactEmail: rd.contactEmail, contactPhone: process.env.ASC_REVIEW_CONTACT_PHONE || undefined, demoAccountRequired: false, notes: readFileSync(rd.notesFile, "utf8") };
  Object.keys(a).forEach((k) => a[k] === undefined && delete a[k]);
  const cur = (await api("GET", `/v1/appStoreVersions/${ver.id}/appStoreReviewDetail`).catch(() => ({}))).data;
  if (cur) await write("تحديث تفاصيل المراجعة", "PATCH", `/v1/appStoreReviewDetails/${cur.id}`, { data: { type: "appStoreReviewDetails", id: cur.id, attributes: a } });
  else await write("إنشاء تفاصيل المراجعة", "POST", "/v1/appStoreReviewDetails", { data: { type: "appStoreReviewDetails", attributes: a, relationships: { appStoreVersion: { data: { type: "appStoreVersions", id: ver.id } } } } });

  // ربط أحدث بناء صالح
  const good = builds.find((b) => b.attributes.processingState === "VALID" && !b.attributes.expired);
  if (good) await write(`ربط البناء ${good.attributes.version}`, "PATCH", `/v1/appStoreVersions/${ver.id}/relationships/build`, { data: { type: "builds", id: good.id } });
  else log("  ⚠️ لا بناء VALID لربطه");
}

// معلومات التطبيق (العنوان الفرعي + رابط الخصوصية)
const infos = (await api("GET", `/v1/apps/${app.id}/appInfos`)).data;
const info = infos.find((i) => EDITABLE.includes(i.attributes.appStoreState)) ?? infos[0];
if (info) {
  const il = (await api("GET", `/v1/appInfos/${info.id}/appInfoLocalizations`)).data.find((l) => l.attributes.locale === meta.locale);
  if (il) await write("تحديث العنوان الفرعي ورابط الخصوصية", "PATCH", `/v1/appInfoLocalizations/${il.id}`, { data: { type: "appInfoLocalizations", id: il.id, attributes: meta.appInfoLocalization } });
}
log(`${apply ? "طُبّق" : "جاف"}: ${changes.length} تغييرًا. لم يُرسَل شيء للمراجعة.`);
