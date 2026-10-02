# App Store Privacy Answers — Draft (aligned to PrivacyInfo.xcprivacy)

| Field | Value |
|-------|-------|
| Phase | T-048 |
| Source of truth (repo) | `artifacts/majalis/ios/App/App/PrivacyInfo.xcprivacy` |
| ASC console sync | **OWNER_ACTION** — do not claim ASC matches until owner confirms |

This draft maps **manifest → proposed ASC answers**. It does **not** assume App Store Connect already contains these values.

## Tracking

| Question | Proposed | Evidence |
|----------|----------|----------|
| Used for tracking? | **No** | `NSPrivacyTracking = false` |
| Tracking domains | none | — |

## Data collected

| Data type | Linked to user? | Used for tracking? | Purposes | Evidence |
|-----------|-----------------|--------------------|----------|----------|
| Email Address | Yes | No | App Functionality | PrivacyInfo · auth/signup |
| Coarse Location | No | No | App Functionality | PrivacyInfo · Qibla when-in-use |
| Audio Data | **Not collected** | — | — | AudioData removed; no mic usage string |
| Payment / Financial | No | — | — | Product claim: no ads/payments in listing |

## Required Reason APIs

| API | Reason | Evidence |
|-----|--------|----------|
| User Defaults | CA92.1 | PrivacyInfo |

## OWNER_ACTION before submit

1. Paste/confirm nutrition labels in ASC match this draft.  
2. If analytics/RUM ever ships with PII → update PrivacyInfo **and** ASC in the same change.  
3. Confirm no ATT / IDFA usage remains absent.
