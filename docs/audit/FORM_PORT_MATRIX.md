# FORM PORT MATRIX — Public forms

| Field | Value |
|---|---|
| Date | 2026-09-29 |
| Authority | `Select` (`ui/select`) · `FieldLabel` (= `FormLabel`) · `FieldError` |
| Status | **IMPROVED** |

## Inventory

| Scope | Before | After |
|---|---:|---:|
| Native `<select` tsx files (all) | **68** | **67** |
| Non-admin public (approx) | ~34 listed | HijriMonthSelect ported |

Admin: **BLOCKED** (not touched).

## Ports this wave

| File | Action | Components |
|---|---|---|
| `components/HijriMonthSelect.tsx` | Native `<select>` → Radix `Select` | Select · SelectTrigger · SelectContent · SelectItem · FieldLabel |
| `components/design-system/FormFields.tsx` | Alias | `FieldLabel = FormLabel` exported |
| `components/design-system/index.ts` | Export FieldLabel | Authority surface |

## Remaining public candidates (follow-up)

DiscoverIslamContact · SubmitContent · Universities/Landmarks/Institutions filters · PrayerLocationPicker · LessonsView · AcademicResearch · Nations · Research* · Qibla/DailyWird/PrayerTimes (worship) · Quran hub selects · MawarithCalculator.

## Admin

BLOCKED — no ports.
