# Mushaf Staged Loading — Performance Closure

**Program:** Mushaf Performance Closure  
**Reader:** `NewMushafReader` · Route: `/mushaf` (lazy via `MushafReaderPage`)  
**Contract:** `artifacts/majalis/src/features/mushaf-reader/mushaf-staged-boot.ts` (`MUSHAF_BOOT_STAGES`, `MUSHAF_STAGED_BUDGETS`)

**Audio deferral:** `ensureMushafAudioSession()`  
**Gate:** `test:mushaf-staged-loading`

لا أرقام مخترعة. القياسات القديمة من `MUSHAF_INTERNAL_PERFORMANCE_BASELINE.md` تبقى مرجعًا؛ يُحدَّث `route-chunks.json` عند إعادة تشغيل سكربت القياس.

---

## Boot stages (إلزامي)

| Stage | Name | Behavior |
|---:|---|---|
| 1 | shell | `MushafPager` / viewport shell |
| 2 | page | Quran page layout + paint |
| 3 | font | QPC page font readiness |
| 4 | reading | Controls triad / selection / arrows |
| 5 | bookmarks | Composer / markers / sheet — **lazy** |
| 6 | audio | Engine + dock — **dynamic import on first use** |
| 7 | search | Search sheet — **lazy** |
| 8 | tafsir | Tafsir sheet — **lazy** |
| 9 | memorization | Practice controls inside audio sheet (after Stage 6) |

The page must be readable before Stages 5–9 finish.

---

## Budgets (locked / soft)

| Metric | Budget | Enforcement |
|---|---:|---|
| Entry JS gzip | ≤ 120 KiB + 320 B | `test:bundle-budget` (locked) |
| MushafReaderPage JS gzip | ≤ **40 KiB** soft | `MUSHAF_STAGED_BUDGETS` + internal-perf PR-1 |
| MushafReaderPage CSS gzip | ≤ **32 KiB** soft | documented; capture via baseline script |

---

## Structural rules

1. `/mushaf` must **not** appear in `HOME_WARM_ROUTES`.
2. `main.tsx` must not import Mushaf reader CSS/JS.
3. `NewMushafReader` must not statically import Search / Tafsir / AudioPlayer / Bookmark modules.
4. Audio engine loads only via `ensureMushafAudioSession()` on first recitation interaction.
5. `reader-bookmarks.css` and `quran-audio-chrome.css` load with their feature modules — not on the critical reader CSS path.

---

## Commands

```bash
PORT=24216 BASE_PATH=/ pnpm --filter @workspace/majalis run build
node artifacts/majalis/scripts/mushaf-internal-perf-baseline.mjs --write
pnpm --filter @workspace/majalis run test:mushaf-staged-loading
pnpm --filter @workspace/majalis run test:mushaf-internal-perf-pr1
pnpm run verify:preflight && pnpm run verify:ci
```
