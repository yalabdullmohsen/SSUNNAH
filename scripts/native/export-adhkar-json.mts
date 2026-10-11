// يصدّر الأذكار الموثّقة (بلا الضعيف) من adhkar-seed إلى JSON محزوم في التطبيق الأصلي كما هي.
// التشغيل: cd artifacts/majalis && cp ../../scripts/native/export-adhkar-json.mts _exp.mts && tsx _exp.mts && rm _exp.mts
import { writeFileSync } from "node:fs";
import { ADHKAR_CATEGORIES, getAllAdhkarItems } from "./src/lib/adhkar-seed";

const items = getAllAdhkarItems();
const used = new Set(items.map((i) => i.categoryId));
const categories = ADHKAR_CATEGORIES.filter((c) => used.has(c.id));
writeFileSync("../../ios-native/SunnahApp/Resources/data/adhkar.json", JSON.stringify({ categories, items }));
console.log(`categories=${categories.length} items=${items.length}`);
