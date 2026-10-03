/**
 * Mirror of SQL relevance weights in arabic_search_hadith_source_infra_v4.sql
 * Used for offline regression tests (no Production DB required).
 */

export type HadithSearchDoc = {
  id: string;
  title?: string | null;
  text?: string | null;
  narrator?: string | null;
  source_name?: string | null;
  collection?: string | null;
  chapter?: string | null;
  hadith_number?: string | null;
};

export type RankedHit = {
  id: string;
  matched_field: string;
  relevance_score: number;
};

/** Lightweight normalize aligned with public.ar_normalize / normalizeArabic core rules. */
export function arNormalizeLite(input: string | null | undefined): string {
  if (input == null) return "";
  return input
    .replace(/ئو/g, "وو")
    .replace(/[ً-ٟٓ-ٕؐ-ؚۖ-ۜ۟-ۤۧ-ٰۭـ]/g, "")
    .toLowerCase()
    .replace(/[أإآٱةىؤئک]/g, (ch) => {
      const map: Record<string, string> = {
        أ: "ا",
        إ: "ا",
        آ: "ا",
        ٱ: "ا",
        ة: "ه",
        ى: "ي",
        ؤ: "و",
        ئ: "ي",
        ک: "ك",
      };
      return map[ch] ?? ch;
    })
    .replace(/ء/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function trigramSim(a: string, b: string): number {
  if (!a || !b) return 0;
  if (a === b) return 1;
  const grams = (s: string) => {
    const t = `  ${s} `;
    const out = new Set<string>();
    for (let i = 0; i < t.length - 2; i++) out.add(t.slice(i, i + 3));
    return out;
  };
  const A = grams(a);
  const B = grams(b);
  let inter = 0;
  for (const g of A) if (B.has(g)) inter++;
  return inter / Math.max(A.size + B.size - inter, 1);
}

export function scoreHadithDoc(doc: HadithSearchDoc, rawQuery: string): RankedHit {
  const qn = arNormalizeLite(rawQuery);
  const title = arNormalizeLite(doc.title);
  const number = arNormalizeLite(doc.hadith_number);
  const narrator = arNormalizeLite(doc.narrator);
  const source = arNormalizeLite(doc.source_name);
  const blob = arNormalizeLite(
    [doc.title, doc.hadith_number, doc.narrator, doc.source_name, doc.collection, doc.chapter, doc.text]
      .filter(Boolean)
      .join(" "),
  );

  let score = 0;
  let matched = "none";
  if (!qn) return { id: doc.id, matched_field: "empty", relevance_score: 0 };

  if (title === qn) {
    score += 1000;
    matched = "title_exact";
  } else if (number === qn) {
    score += 900;
    matched = "hadith_number";
  } else if (title.startsWith(qn)) {
    score += 700;
    matched = "title_prefix";
  } else if (narrator === qn) {
    score += 500;
    matched = "narrator_exact";
  } else if (source === qn) {
    score += 450;
    matched = "source_name_exact";
  } else if (blob.includes(qn)) {
    score += 200 * Math.min(1, qn.length / Math.max(blob.length, 1) * 20);
    matched = "fts";
  }

  const trgm = Math.max(
    trigramSim(blob, qn),
    trigramSim(title, qn),
    trigramSim(narrator, qn),
    trigramSim(source, qn),
  );
  score += 100 * trgm;
  if (matched === "none" && trgm > 0.2) matched = "trgm";

  return { id: doc.id, matched_field: matched, relevance_score: score };
}

export function rankHadithDocs(docs: HadithSearchDoc[], rawQuery: string): RankedHit[] {
  return docs
    .map((d) => scoreHadithDoc(d, rawQuery))
    .sort((a, b) => b.relevance_score - a.relevance_score || a.id.localeCompare(b.id));
}

/** Keyset page: score DESC, id ASC */
export function keysetPage(
  ranked: RankedHit[],
  limit: number,
  cursor?: { score: number; id: string } | null,
): RankedHit[] {
  const filtered = cursor
    ? ranked.filter(
        (r) =>
          r.relevance_score < cursor.score ||
          (r.relevance_score === cursor.score && r.id > cursor.id),
      )
    : ranked;
  return filtered.slice(0, limit);
}
