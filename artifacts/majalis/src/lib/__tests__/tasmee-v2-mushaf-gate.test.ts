/**
 * التسميع داخل المصحف (PR 2): التركيب تحت العلم، قراءة ?tasmee=1، وحالات الإخفاء/الإظهار
 * بلا تغيير تخطيط ولا قيم بصرية خام.
 * node --import tsx src/lib/__tests__/tasmee-v2-mushaf-gate.test.ts
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = join(import.meta.dirname, "..", "..");
const read = (p: string) => readFileSync(join(root, p), "utf8");

const reader = read("features/mushaf-reader/NewMushafReader.tsx");
assert.match(reader, /tasmeeV2Enabled = useTasmeeV2Enabled\(\)[\s\S]*\{tasmeeV2Enabled \?/, "الطبقة تحت علم tasmee_v2");
assert.match(read("features/tasmee-v2/useTasmeeV2Enabled.ts"), /resolveTasmeeV2Enabled\(\)/, "العلم الفعّال: مفاتيح الإيقاف + القناة + الملف الحي");
assert.match(reader, /<TasmeeV2Layer[\s\S]*startInTasmee=\{tasmeeRequested\}/);

const page = read("pages/quran/MushafReaderPage.tsx");
assert.match(page, /tasmeeRequested=\{wantsTasmeeFromSearch\(search\)\}/, "?tasmee=1 يصل إلى القارئ");

// قسم التسميع داخل ملف أنماط المصحف (من علامته إلى النهاية)
const readerCss = read("features/mushaf-reader/mushaf-reader.css");
const marker = readerCss.indexOf("التسميع v2 داخل المصحف");
assert.ok(marker > 0, "قسم التسميع v2 موجود في mushaf-reader.css");
const css = readerCss.slice(marker);
// لا hex ولا rgb خام: توكنات --sn-* فقط
assert.doesNotMatch(css, /#[0-9a-fA-F]{3,8}\b/, "لا hex خارج tokens.css");
assert.doesNotMatch(css, /\brgba?\(/, "لا rgb خام");
// الإخفاء بالشفافية فقط: لا display/visibility/height/margin/padding/border على الكلمات المخفية
const hideRules = css.match(/\.nm-page[^{]*\{[^}]*\}/g) ?? [];
assert.ok(hideRules.length >= 5, "قواعد طبقة العرض موجودة");
for (const rule of hideRules) {
  assert.doesNotMatch(rule, /\b(display|height|width|margin|padding|border(?!-radius)|position)\s*:/, `يغيّر التخطيط: ${rule}`);
}
// أسطر مسطّرة بخلفية متدرّجة لا border (لا تغيّر ارتفاع السطر)
assert.match(css, /data-tasmee-hide="1"\] \.nm-line \{\s*background-image: linear-gradient\(to top, var\(--sn-separator\)/);
// الحالات الأربع
for (const st of ["hidden", "ok", "wrong", "skipped"]) assert.match(css, new RegExp(`data-tasmee="${st}"`));
// النظرة الخاطفة
assert.match(css, /data-tasmee-peek="1"/);

const layer = read("features/tasmee-v2/TasmeeV2Layer.tsx");
// النظرة تُحسب تلميحًا لا خطأً
assert.match(layer, /dispatch\(\{ type: "peek" \}\)/);
assert.doesNotMatch(layer, /type: "mark"[^)]*peek/);
// أرقام لاتينية للمؤقّت والعدّاد
assert.match(layer, /padStart\(2, "0"\)/);
// أزرار الإخفاء بتنبيه قصير
const strings = read("features/tasmee-v2/strings.ts");
assert.match(strings, /الآيات المخفية: مفعّل/);
// الاستماع والاختبار معطّلان بعبارة هادئة حتى جاهزيتهما — لا صوت غير مرخّص
assert.match(strings, /يتوفر عند جاهزية الصوت المرخّص/);

// المسار القديم يحوّل إلى المصحف
const routes = read("AppRoutes.tsx");
assert.match(routes, /recitation-test-ai[\s\S]{0,80}Redirect to="\/mushaf\?tasmee=1"/);

console.log("tasmee-v2-mushaf-gate ✅");
