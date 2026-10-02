# Store Release Allowlist Report — T-026

| Field | Value |
|-------|-------|
| Phase | T-026 `LICENSE_SAFE_RELEASE_BINARY` |
| Tip base | `origin/main` @ branch start |
| SoT allowlist | `docs/store-release/STORE_RELEASE_ALLOWLIST.json` |
| Inventory | `reports/store-asset-inventory.json` |
| Related | `CONTENT_LICENSE_CERTIFICATION.md` · `ADHAN_AUDIO_AUDIT.md` · `RELEASE_ASSET_LICENSE_MATRIX.md` · `STORE_100_PERCENT_READINESS.md` |

## Exit claims

| Claim | Result |
|-------|--------|
| `RELEASE_BINARY_HAS_ZERO_UNKNOWN_ASSETS` | **PASS** (releaseFlavorUnknownCount = 0) |
| `AUDIO_RELEASE_ALLOWLIST_LOCKED` | **PASS** (`audioAllowlist.locked = true`) |
| `STORE_RELEASE_CONTENT_CLEARED` | **PASS** (inventory + strip boundary) |
| `AUDIO_CERTIFIED` | **false** (not claimed) |
| `CONTENT_CERTIFIED` | **false** (not claimed) |
| QPC Licensed | **forbidden** — `OWNER_DECISION_REQUIRED` only |

---

## 1) Approved Assets (in Release Flavor)

| Class | Items |
|-------|-------|
| `APPROVED_FOR_RELEASE` | Product brand/icons/splash · `system-default` OS sound · prayer calculation engine · original UI / mind-map UI / summaries · poster SVGs · live SVGs · sheikh SVG avatars · npm MIT/Apache (gate) |
| `CC0_APPROVED` | `adhan-field.m4a` · `adhan-field-short.m4a` · `adhan-field-full.m4a` · `adhan-short-field.caf` · `adhan-short-field-full.caf` |
| `OFL_APPROVED` | `public/fonts/ui/*` (Amiri / Aref Ruqaa / Noto Naskh / Scheherazade + `OFL.txt`) |

Inventory: **releaseFlavor = 83** · **releaseUnknown = 0**.

---

## 2) Stripped Assets (Release Flavor)

| Class | Action | Examples |
|-------|--------|----------|
| `INTERNAL` | `STRIP_FROM_RELEASE` | makkah / egypt / aqsa / gulf / takbeerat packs + `public/sounds/adhan/*` mirrors |
| `UNKNOWN` | `STRIP_FROM_RELEASE` | `adhan-haram-full` · `adhan-soft-alert` · non-CC0 iOS CAF · sheikh **rasters** (jpg/webp) |
| `EXCLUDED` | stay out | madinah · qatami |
| `STRIP_FROM_RELEASE` | Archive tones | provisional `prayer-*.caf` / rings (prefer OS default) |
| `OWNER_DECISION_REQUIRED` | Strip Path active | QPC V2 fonts · Hisn full-body packaging |
| `METADATA_ONLY` | no full body / offline / watch / widget | lessons · books · fatwa |

**Tools:** `store:strip-unresolved-assets` · `native-strip-qpc-fonts` · `native-strip-store-release-audio` · `mobile:sync:store`.

---

## 3) Stream Only Assets

| Source | Class | Forbidden |
|--------|-------|-----------|
| everyayah / mp3quran / Quran.com / AlQuran Cloud | `STREAM_ONLY` | binary packaging · offline bundle · watch · widget |

No remote recitation MP3 corpus in app binary (policy enforced).

---

## 4) Owner Decisions

### QPC (`OWNER_DECISION_REQUIRED`) — not Licensed

| Path | Detail |
|------|--------|
| **Grant Path** | Written QUL/KFGQPC redistribute grant → `docs/store-release/license-evidence/` · LIC-01 → then class may become `APPROVED_FOR_RELEASE` |
| **Strip Path (ACTIVE for RC)** | `store-strip` removes `dist/fonts/qpc-v2` · `native-strip-qpc-fonts.mjs` after `cap sync` |

### Other OWNER rows

| Asset | Decision ID | RC action |
|-------|-------------|-----------|
| Hisn corpus | LIC-06 | `STRIP_FROM_RELEASE` / no offline package |
| Quran offline redistribute (Tanzil) | — | no store offline package claim |
| Istanbul adhan | — | remains `CC0_ADHAN_CANDIDATE` until Human QA |

---

## 5) Audio Allowlist (locked)

| In binary | Class |
|-----------|-------|
| `system-default` | `APPROVED_FOR_RELEASE` |
| field / field-short / field-full (+ CC0 CAF shorts) | `CC0_APPROVED` |

| Not in binary | Class |
|---------------|-------|
| Istanbul | `CC0_CANDIDATE` (`CC0_ADHAN_CANDIDATE`) |
| INTERNAL packs | `INTERNAL` → strip |
| haram / soft-alert | `UNKNOWN` → strip |
| madinah / qatami | `EXCLUDED` |

Store UI selectable voices remain **system-default only** (`listSelectableAdhanVoices`).

---

## 6) Binary Boundary

```text
Release Candidate webDir (dist after strip)
  ✅ CC0 field masters only under audio/adhan
  ✅ no INTERNAL/UNKNOWN adhan
  ✅ no QPC fonts
  ✅ no UNKNOWN sheikh rasters
  ✅ OFL UI fonts
  ✅ product brand assets

iOS Archive prep (mobile:sync:store)
  ✅ native-strip-qpc-fonts
  ✅ native-strip-store-release-audio → CC0 field CAF only
  ✅ restore Sounds via git after archive if needed
```

Commands:

```bash
pnpm run store:inventory
PORT=24216 BASE_PATH=/ pnpm --filter @workspace/majalis run build
pnpm run store:strip-unresolved-assets
STORE_CHECK_DIST=1 pnpm run verify:store-assets -- --check-dist
# Archive lane:
pnpm --filter @workspace/majalis run mobile:sync:store
```

---

## 7) Final Verification

| Check | Result |
|-------|--------|
| `pnpm run store:inventory` | PASS · releaseUnknown=0 |
| `pnpm run verify:store-assets` | PASS |
| `store-release-assets-gate` | PASS |
| Post-strip dist sample | removed 21 forbidden paths; kept CC0 field |
| Thresholds / debt ceilings raised? | **No** |
| Widgets / Watch / Push started? | **No** |

### Inventory snapshot

| Metric | Value |
|-------:|------:|
| totalAssets | 131 |
| releaseFlavor | 83 |
| releaseUnknown | **0** |
| stripped | 44 |
| streamOnly | 1 |
| ownerDecisions | 2 |

---

## Exit Decision

**PASS** — `RELEASE_BINARY_HAS_ZERO_UNKNOWN_ASSETS` · `AUDIO_RELEASE_ALLOWLIST_LOCKED` · `STORE_RELEASE_CONTENT_CLEARED`

Remaining (do **not** block this phase claim; block Store GO / later phases):

1. Human QA for Istanbul → optional promote to `CC0_APPROVED`
2. QPC Grant Path if reader fonts must ship in binary (else keep Strip Path)
3. Archive operator must run `mobile:sync:store` (not default `mobile:sync`) before signing
4. ASC metadata / device notification proof (out of T-026)
