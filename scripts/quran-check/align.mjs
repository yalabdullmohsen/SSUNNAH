import fs from "node:fs"; import { sk2, ayahText, quran } from "./lib.mjs";
const Q = quran();
const name = (s) => Q.ayahs.find((x) => x.s === s && x.a === 1).name.replace(/^سُورَةُ\s*/, "");
const isMark = (w) => !/[ء-يٱ]/.test(w);
export function align(quote, ref) {
  const m = String(ref).match(/^(\d+):(\d+)(?:-(\d+))?$/); if (!m) return null;
  const s = +m[1], a = +m[2], b = +(m[3] || m[2]);
  const toks = []; for (let k = a; k <= b; k++) for (const w of (ayahText(s, k) || "").replace(/^﻿/, "").split(/\s+/)) if (w) toks.push({ w, k });
  const aw = toks.map((t) => (isMark(t.w) ? null : sk2(t.w)));
  const qw = quote.replace(/[﴿﴾{}()\[\]«»]/g, " ").split(/[\s،,.؛:]+/).map(sk2).filter(Boolean);
  const n = qw.length, mm = aw.length;
  const dp = Array.from({ length: n + 1 }, () => new Array(mm + 1).fill(0));
  for (let i = 1; i <= n; i++) for (let j = 1; j <= mm; j++) dp[i][j] = aw[j - 1] && qw[i - 1] === aw[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
  const hits = []; let i = n, j = mm;
  while (i > 0 && j > 0) { if (aw[j - 1] && qw[i - 1] === aw[j - 1]) { hits.push([i - 1, j - 1]); i--; j--; } else if (dp[i - 1][j] >= dp[i][j - 1]) i--; else j--; }
  if (!hits.length) return null;
  hits.reverse();
  let lo = hits[0][1], hi = hits[hits.length - 1][1] + (n - 1 - hits[hits.length - 1][0]);
  // اجعل النافذة على كلمات (لا علامات وقف) وضمن الحدود
  if (hits[0][0] > 0 && lo > 0) { const lead = qw.slice(0, hits[0][0]).join(""); let acc = ""; for (let t = lo - 1; t >= 0 && aw[t] !== undefined; t--) { if (aw[t] === null) break; acc = aw[t] + acc; if (lead.endsWith(acc)) { lo = t; if (lead === acc) break; } else break; } }
  let realLo = Math.max(0, lo), realHi = Math.min(mm - 1, hi);
  for (let t = 1; t <= 3 && realHi + t < mm; t++) { if (aw[realHi + t] === null) { realHi = realHi + t - 1; break; } if (t === 3) break; }
  if (realHi + 1 < mm && aw[realHi + 1] !== null && n - 1 > hits[hits.length - 1][0]) { let t = realHi + 1; while (t < mm && t - realHi <= 2 && aw[t] !== null) t++; if (t < mm && aw[t] === null) realHi = t - 1; }
  while (realLo < realHi && aw[realLo] === null) realLo++;
  while (realHi > realLo && aw[realHi] === null) realHi--;
  const win = toks.slice(realLo, realHi + 1);
  const k1 = win[0].k, k2 = win[win.length - 1].k;
  return { words: win.length, qn: n, hit: hits.length / n, text: win.map((t) => t.w).join(" "), ref: `${name(s)}: ${k1}${k2 !== k1 ? "-" + k2 : ""}` };
}
