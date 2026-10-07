/**
 * بوابة عنوان الخادم للحزمة المحلية — تشغيل: node --import tsx src/lib/__tests__/native-api-base.test.ts
 */
import assert from "node:assert/strict";
import { NATIVE_API_ORIGIN, resolveNativeApiUrl } from "../native-api-base.ts";

assert.equal(NATIVE_API_ORIGIN, "https://www.ssunnah.com");
assert.equal(resolveNativeApiUrl("/api/public-config"), "https://www.ssunnah.com/api/public-config");
assert.equal(resolveNativeApiUrl("/api/x?a=1&b=2"), "https://www.ssunnah.com/api/x?a=1&b=2");
assert.equal(resolveNativeApiUrl("/api/x", "https://staging.example"), "https://staging.example/api/x");
// ما ليس خادمًا يبقى محليًا
assert.equal(resolveNativeApiUrl("/data/quran-v2/p1.json"), "/data/quran-v2/p1.json");
assert.equal(resolveNativeApiUrl("/fonts/quran/p1.woff2"), "/fonts/quran/p1.woff2");
assert.equal(resolveNativeApiUrl("/apiary"), "/apiary");
assert.equal(resolveNativeApiUrl("https://other.com/api/x"), "https://other.com/api/x");

console.log("native-api-base: OK");

// التثبيت متزامن ومحروس بثابت البناء في main.tsx (قبل أي طلب، ويُطوى على الويب)
import { readFileSync } from "node:fs";
const main = readFileSync(new URL("../../main.tsx", import.meta.url), "utf8");
assert.match(main, /import \{ installNativeApiBase \} from "\.\/lib\/native-api-base"/);
assert.match(main, /if \(import\.meta\.env\.VITE_TARGET === "native"\) \{\s*installNativeApiBase\(\);/);
assert.ok(
  main.indexOf("installNativeApiBase();") < main.indexOf("runBootSequenceBeforeMount();"),
  "يجب تثبيت عنوان الخادم قبل تسلسل الإقلاع",
);
console.log("native-api-base: main.tsx wiring OK");
