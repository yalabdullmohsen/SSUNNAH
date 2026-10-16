// عنوان الفائدة: قصّ عند أقرب حدّ جملة/كلمة لا وسط كلمة (النص الكامل يبقى في body).
export const titleOf = (t, n = 90) => {
  const x = String(t ?? "").replace(/\s+/g, " ").trim();
  if (x.length <= n) return x;
  const w = x.slice(0, n - 1), c = Math.max(w.lastIndexOf("،"), w.lastIndexOf("؛"), w.lastIndexOf("."), w.lastIndexOf(":"));
  const cut = c >= 40 ? w.slice(0, c) : w.slice(0, Math.max(w.lastIndexOf(" "), 1));
  return `${cut.replace(/[\s،؛:.\-–—]+$/u, "")}…`;
};
