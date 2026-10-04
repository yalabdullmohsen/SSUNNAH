# PR C — Public surface color absorption

**Program:** SUNNAH_FULL_APPLICATION_LAYER_ERADICATION_AND_SINGLE_VISUAL_AUTHORITY  
**TASK_CLASSIFICATION:** SHARED_PLATFORM

## Scope

File-by-file strip of unsafe `var(--token, #hex)` fallbacks on highest-traffic public surfaces where tokens already exist. No Quran/mushaf content edits. No mass delete. No fourth token family.

## Files

- `pages/lessons.css`
- `pages/fiqh-hub.css`
- `pages/search.css`
- `pages/prophet-stories.css`
- `pages/app-shell-v2.css`
- `components/home-universal-search.css`
- `components/filters.css`
- `islamic-landmarks.css`
- `knowledge-experience.css`
- `index-deferred-pages.css`

## Measured delta (global)

- Hex in CSS: **6189 → 5899** (−287)
- Unsafe Hex fallbacks: **3090 → 2801** (−287)
- Debt ceiling `hexInCss` lowered to **5899**
- Sync CSS imports: **14** (unchanged)

## Platform impacts

- WEB_IMPACT: public route CSS prefers token authorities
- IOS_APPLICATION_IMPACT: shared WebView CSS only; browser proof ≠ device proof
- APP_STORE_PRODUCT_IMPACT: no store actions
- SHARED_PLATFORM_IMPACT: continues single-authority color consolidation
