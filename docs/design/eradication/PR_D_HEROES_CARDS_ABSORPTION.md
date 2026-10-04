# PR D — Heroes + Cards absorption

**Program:** SUNNAH_FULL_APPLICATION_LAYER_ERADICATION_AND_SINGLE_VISUAL_AUTHORITY  
**TASK_CLASSIFICATION:** SHARED_PLATFORM

## Scope

Strip unsafe `var(--token, #hex)` fallbacks and map remaining bare Hex on card/hero-adjacent CSS to `--mj-*` / `--cs-*` / `--sf-*` authorities. No Quran/mushaf content edits. No mass delete. No fourth token family. No ceiling raise.

## Files (primary)

- `components/sections/section-cards.css`
- `styles/card-system-v2.css`
- `styles/components/knowledge-summary-card.css`
- `styles/components/information-card.css`
- `styles/components/source-card.css`
- `styles/components/source-item-card.css`
- `styles/components/reading-section-card.css`
- `styles/section-cards-theme.css`
- `styles/components/bulk-download-card.css`
- `styles/components/university-card.css`
- `styles/card-decorative-strip-cleanup.css`
- `styles/pages/cards.css`
- `styles/sunnah-identity-cards.css`

## Measured delta (global)

- Hex in CSS: **5899 → 5763** (−136)
- Unsafe Hex fallbacks (eradication inventory): reduced on scoped card files to **0** local fallbacks
- Debt ceiling `hexInCss` lowered to **5763**
- Sync CSS imports: **14** (unchanged)

## Platform impacts

- WEB_IMPACT: card/section surfaces prefer token authorities
- IOS_APPLICATION_IMPACT: shared WebView CSS only; browser proof ≠ device proof
- APP_STORE_PRODUCT_IMPACT: no store actions
- SHARED_PLATFORM_IMPACT: continues single-authority color consolidation for cards
