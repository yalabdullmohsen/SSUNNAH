# Select Port Status — Wave 3

| Field | Value |
|---|---|
| Date | 2026-09-29 |
| Authority | FORM_FEEDBACK — `Select` + `FieldLabel` (+ `FieldError` when validation) |
| Scope | Public product pages only · Admin untouched · Mushaf internals deferred |

## Counts

| Scope | Before W3 (post-W2) | After W3 |
|---|---:|---:|
| Public `<select>` files (excl. admin) | **26** | **16** |
| Admin `<select>` | unchanged | unchanged |

## Ports this wave

| File | Notes |
|---|---|
| `pages/lessons/ui/LessonsView.tsx` | 8 facet filters → Radix Select + FieldLabel |
| `views/ResearchSubmitPage.tsx` | Form selects · empty → `__none__` sentinel |
| `views/ResearchAssistantPage.tsx` | Category select |
| `pages/worship/ui/QiblaView.tsx` | City picker |
| `pages/fiqh/ui/MawarithCalculatorView.tsx` | Advanced fiqh option |
| `components/prayer/PrayerLocationPicker.tsx` | Country / admin |
| `components/prayer/PrayerAnnualTimetable.tsx` | Mode / month |
| `components/citation/CitationModal.tsx` | Citation style |
| `pages/worship/ui/DailyWirdView.tsx` | Surah picker |
| `pages/worship/ui/PrayerTimesView.tsx` | Calc method / madhab / high-lat |

## Remaining public native `<select>` (intentional HOLD)

| Bucket | Files | Reason |
|---|---|---|
| Settings / audio | SettingsView, NotificationSettings*, Adhan*, AudioPrompts, SunnahChannels | Settings KEEP · behavior-sensitive |
| Mushaf / Quran chrome | MushafAudioDock, AyahActionSheet, MiniPlayer, Hifz*, Quran* hubs, MushafBookmarks | **MUSHAF_SPECIAL** · no behavior change this wave |

## Support matrix (ported)

| Concern | Status |
|---|---|
| RTL | SelectContent / dir=rtl on triggers |
| Dark / Light | Radix + theme tokens |
| Mobile | `min-h-11 text-base` |
| Large text | inherits UI type scale |
| Filter behavior | preserved (same values / handlers) |

## Forbidden

- Admin domain ports
- Blind codemod
- Behavior / filter logic changes
