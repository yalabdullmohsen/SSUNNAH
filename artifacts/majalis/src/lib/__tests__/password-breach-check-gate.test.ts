/**
 * فحص HIBP بـk-anonymity عند التسجيل وتغيير كلمة المرور (بديل «Prevent leaked passwords» في الخطة المجانية).
 * node --import tsx src/lib/__tests__/password-breach-check-gate.test.ts
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  checkPasswordBreached,
  countInHibpRange,
  PASSWORD_BREACHED_AR,
  sha1Hex,
  splitHibpHash,
} from "../password-breach-check";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const read = (rel: string) => readFileSync(resolve(root, rel), "utf8");

// SHA-1("password") — قيمة مرجعية معروفة
assert.equal(await sha1Hex("password"), "5BAA61E4C9B93F3F0682250B6CF8331B7EE68FD8");
const { prefix, suffix } = splitHibpHash(await sha1Hex("password"));
assert.equal(prefix, "5BAA6");
assert.equal(suffix, "1E4C9B93F3F0682250B6CF8331B7EE68FD8");

// تحليل الردّ: يطابق اللاحقة ويتجاهل الحشو (count=0)
const body = `0018A45C4D1DEF81644B54AB7F969B88D65:1\r\n${suffix}:3730471\r\nFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF:0`;
assert.equal(countInHibpRange(body, suffix), 3730471);
assert.equal(countInHibpRange(body, "ABCDEF0123456789ABCDEF0123456789ABC"), 0);
assert.equal(countInHibpRange("X:0", "X"), 0);

// k-anonymity: يُرسَل 5 محارف فقط، لا اللاحقة ولا كلمة المرور
const calls: string[] = [];
const okFetch = (async (url: string) => {
  calls.push(String(url));
  return new Response(body, { status: 200 });
}) as unknown as typeof fetch;
const hit = await checkPasswordBreached("password", okFetch);
assert.deepEqual([hit.breached, hit.checked], [true, true]);
assert.equal(calls.length, 1);
assert.equal(calls[0], "https://api.pwnedpasswords.com/range/5BAA6");
assert.ok(!calls[0].includes(suffix), "اللاحقة لا تغادر الجهاز");
assert.match(calls[0], /\/range\/[0-9A-F]{5}$/, "5 محارف فقط");

// كلمة غير مسرّبة
const missFetch = (async () => new Response("0018A45C4D1DEF81644B54AB7F969B88D65:1", { status: 200 })) as unknown as typeof fetch;
const miss = await checkPasswordBreached("correct-horse-battery-9X!", missFetch);
assert.deepEqual([miss.breached, miss.checked], [false, true]);

// فشل الشبكة / خطأ الخادم / كلمة فارغة = لا يمنع المستخدم (fail-open)
const failFetch = (async () => { throw new Error("offline"); }) as unknown as typeof fetch;
assert.deepEqual(await checkPasswordBreached("password", failFetch), { breached: false, count: 0, checked: false });
const err500 = (async () => new Response("x", { status: 503 })) as unknown as typeof fetch;
assert.equal((await checkPasswordBreached("password", err500)).breached, false);
assert.equal((await checkPasswordBreached("", okFetch)).checked, false);

// رسالة عربية واضحة
assert.match(PASSWORD_BREACHED_AR, /تسريبات/);
assert.match(PASSWORD_BREACHED_AR, /اختر كلمة مرور أخرى/);

// التوصيل: التسجيل (واجهتان) وتغيير كلمة المرور فقط؛ تسجيل الدخول بلا فحص (لا أثر على الحاليين)
for (const f of ["src/pages/account/ui/LoginView.tsx", "src/design-system/screens/AuthScreen.tsx"]) {
  const src = read(f);
  const reg = src.indexOf("checkPasswordBreached(password)");
  assert.ok(reg > 0, `${f} يفحص عند التسجيل`);
  assert.ok(reg < src.indexOf("await register("), `${f}: الفحص قبل إنشاء الحساب`);
  assert.equal(src.split("checkPasswordBreached(").length - 1, 1, `${f}: مرة واحدة فقط (التسجيل)`);
}
const upd = read("src/views/UpdatePasswordPage.tsx");
assert.ok(upd.indexOf("checkPasswordBreached(password)") < upd.indexOf("await updatePassword("), "فحص قبل تغيير كلمة المرور");

// CSP يسمح بنطاق HIBP حصرًا للاتصال
const vercel = read("vercel.json");
assert.match(vercel, /connect-src[^"]*https:\/\/api\.pwnedpasswords\.com/);

console.log("password-breach-check-gate: ok");
