/** أول كتاب مذكور في source_name → معرّف collection (القاعدة الحرفية للمالك). */
const RULES = [
  ["bukhari", /^(?:صحيح\s+)?البخاري/],
  ["muslim", /^(?:صحيح\s+)?مسلم/],
  ["tirmidhi", /^(?:سنن\s+|جامع\s+)?(?:ال)?ترمذي/],
  ["abudawud", /^(?:سنن\s+)?أبي\s+داود/],
  ["nasai", /^(?:سنن\s+)?النسائي/],
  ["ibnmajah", /^(?:سنن\s+)?ابن\s+ماجه/],
];
export function firstBookCollection(sourceName) {
  const t = String(sourceName ?? "").trim();
  for (const [k, re] of RULES) if (re.test(t)) return k;
  return "various";
}
export const SAHIHAYN_COLLECTIONS = new Set(["mutafaq", "bukhari", "muslim"]);
export const isSahihayn = (c) => c === "bukhari" || c === "muslim";
