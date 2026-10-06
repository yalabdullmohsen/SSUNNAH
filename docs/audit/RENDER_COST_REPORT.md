# RENDER_COST_REPORT

Generated: 2026-10-06T19:04:02.654Z

**Method:** static proxies — NOT wall-clock CPU. DEVICE_REQUIRED for Profiler.

Highest consumers (proxy): Mushaf · Prayer · Lesson player · Home

| Surface | Risk score | Hot files |
|---|---:|---:|
| Mushaf | 142 | 8 |
| Prayer | 56 | 4 |
| Lesson player | 52 | 4 |
| Home | 36 | 6 |
| Admin | 30 | 4 |
| Search | 14 | 1 |

## Hot files by surface

### Mushaf

- `features/mushaf-reader/NewMushafReader.tsx` score=61 · useEffect×18, useState×20
- `features/mushaf-madinah/VerifiedMushafReader.tsx` score=34 · useEffect×17
- `pages/quran/MushafReaderPage.tsx` score=16 · useEffect×8
- `features/mushaf-reader/useMushafPager.ts` score=12 · addEventListener×4
- `features/mushaf-madinah/AyahActionSheet.tsx` score=10 · useEffect×5, inlineHandlers×23 weak-useCallback

### Prayer

- `pages/worship/ui/AdhanSettingsView.tsx` score=26 · useEffect×8, inlineHandlers×29 weak-useCallback
- `components/adhan/PrayerRespectBanner.tsx` score=20 · useEffect×5, setInterval×1, addEventListener×3
- `components/adhan/MuezzinPicker.tsx` score=6 · setInterval×1
- `components/home/HomeCompactPrayer.tsx` score=4 · useEffect×4

### Lesson player

- `pages/lessons/ui/LessonsView.tsx` score=25 · useEffect×8, addEventListener×3
- `components/lessons/LessonRecordingPlayer.tsx` score=13 · useEffect×4, addEventListener×3
- `components/admin/review-hub/WaveformAudioPlayer.tsx` score=9 · addEventListener×3
- `pages/lessons/ui/LessonDetailView.tsx` score=5 · useEffect×5

### Home

- `components/home/HomeLocalResumeCard.tsx` score=9 · addEventListener×3
- `pages/account/ui/HomeView.tsx` score=7 · useEffect×7
- `components/home/HomeHeroLcp.tsx` score=6 · setInterval×1
- `components/home/HomeLiveNowBanner.tsx` score=6 · setInterval×1
- `components/home/HomeCompactPrayer.tsx` score=4 · useEffect×4

### Admin

- `admin-v3/domains/content/EntityCrudPage.tsx` score=10 · inlineHandlers×19 weak-useCallback
- `admin-v3/domains/content/RemainingEntityCrudPage.tsx` score=10 · inlineHandlers×35 weak-useCallback
- `admin-v3/domains/analytics/AnalyticsPlatformPage.tsx` score=6 · setInterval×1
- `admin-v3/domains/ops/AutomationHubPage.tsx` score=4 · useEffect×4

### Search

- `components/GlobalSearchModal.tsx` score=14 · useEffect×5, addEventListener×3
