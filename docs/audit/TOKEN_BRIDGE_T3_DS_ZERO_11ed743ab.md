# T3 — Zero-consumer deferred `--ds-*` aliases

TASK_CLASSIFICATION: SHARED_PLATFORM

Removed from `index-deferred-pages.css` (var()=0):
- spacing scale `--ds-1`…`--ds-16`
- `--ds-r-xl` / `--ds-r-2xl`
- `--ds-gold-grad` / `--ds-hero-grad`

Kept: `--ds-base` (css-authority + startup typography gates).

| Metric | Before | After |
|---|---:|---:|
| hexInCss | 5557 | **5553** (−4) |

NO_NEW_TOKEN_FAMILY · NO_CEILING_RAISE
