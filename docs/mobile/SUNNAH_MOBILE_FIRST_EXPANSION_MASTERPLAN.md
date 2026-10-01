# SUNNAH MOBILE FIRST EXPANSION — MASTERPLAN

| Field | Value |
|-------|-------|
| Program | **SUNNAH MOBILE FIRST EXPANSION** |
| Product | سُنّة — منصة إسلامية Native First |
| Relationship | **Extends** MRMP v1 · **Parallel** to UNIFIED U* (web) |
| Tip at plan | license evidence @ `CONTENT_LICENSE_CERTIFICATION.md` · tip `7a7db56c` MATCH |
| License posture | **`LICENSE_CERTIFICATION_REQUIRED`** — live A–P evidence in `CONTENT_LICENSE_CERTIFICATION.md` |
| Audio posture | **`AUDIO_LICENSE_PARTIAL`** — see `ADHAN_AUDIO_AUDIT.md` |
| **Plan status** | **`MOBILE_FIRST_MASTERPLAN_COMPLETE`** |
| Non-claims | no `STORE_GO` · no `CONTENT_CERTIFIED` · no `AUDIO_CERTIFIED` · no Watch/Widget shipped |

---

## 1. Architecture

### 1.1 Target surfaces

| Surface | Role | Baseline in repo (2026-10-01) |
|---------|------|-------------------------------|
| iPhone | Primary Capacitor shell | `ios/App` · appId `com.yousef.majlisilm` |
| iPad | Same shell + Split View | DEVICE_REQUIRED matrix open |
| Apple Watch | Independent watchOS app + complications | **NOT PRESENT** (architecture only) |
| Android phone/tablet | Capacitor Android | `applicationId` `com.majlisilm.app` ≠ iOS (**M1 HARD**) |
| Wear OS | Companion tiles/complications | **NOT PRESENT** |
| Home Screen Widgets | WidgetKit / App Widgets | **NOT PRESENT** (web home widgets ≠ OS widgets) |
| Live Activities | ActivityKit | **PARTIAL** — `PrayerLiveActivity` exists (prayer countdown) |
| Lock Screen / Dynamic Island | LA + Lock Screen widgets | Prayer LA only |
| CarPlay / Android Auto | Readiness study | **NOT STARTED** · entitlement + content license gated |

### 1.2 Native-first stack (target)

```text
┌─────────────────────────────────────────────────────────────┐
│  watchOS App / Wear OS          WidgetKit / App Widgets     │
│  Complications · Smart Stack    Lock Screen · Islands       │
├─────────────────────────────────────────────────────────────┤
│  ActivityKit Live Activities  ·  UNNotification / FCM       │
├─────────────────────────────────────────────────────────────┤
│  App Groups / DataStore shared models (Prayer · Progress)   │
├─────────────────────────────────────────────────────────────┤
│  Capacitor iOS/Android shell  ←→  WebView (artifacts/majalis)│
├─────────────────────────────────────────────────────────────┤
│  Supabase auth/session · optional offline caches (licensed) │
└─────────────────────────────────────────────────────────────┘
```

### 1.3 Shared domain modules (single SoT)

| Module | Owner | Consumers |
|--------|-------|-----------|
| PrayerEngine | existing prayer calc (sacred — no formula drift) | App · Watch · Widget · LA · Push |
| ProgressStore | reading/memorization/wird counters | App · Watch · Widget · Analytics |
| NotificationPlanner | smart schedule + quiet hours | App · Watch · OS |
| LicenseGate | blocks UNKNOWN content from native surfaces | All expanders |
| DeepLinkRouter | `sunnah://` + Universal/App Links | Push · Widget · Watch · LA tap |

### 1.4 Hard product boundaries

- لا تعديل نص القرآن / التشكيل / الرسم / QPC / page mapping / audio mapping.
- لا حساب صلاة جديد موازٍ — إعادة استخدام المحرك الحالي.
- لا محتوى فتوى/درس/صوت بلا ترخيص (`CONTENT_LICENSE_CERTIFICATION.md`).
- MRMP Success Contract يبقى إلزاميًا قبل Store.

---

## 2. Features (expansion catalog)

| ID | Feature | Priority | License gate |
|----|---------|----------|--------------|
| F-WATCH | Apple Watch app | P0 | L/M |
| F-WIDGETS | Full widget family | P0 | M |
| F-LA | Live Activities suite | P0 | M |
| F-SMART-NOTIF | Smart notifications | P0 | N |
| F-MINDMAP | Interactive learning maps | P1 | J |
| F-FATWA | Licensed fatwa index only | P1 | G/H |
| F-AUDIO | Adhan/audio certification | P0 | D |
| F-QURAN-XP | Goals/khatma/hifz analytics | P0 | A/B/C (no text edits) |
| F-WEAR | Wear OS companion | P2 | L-analog |
| F-AUTO | CarPlay / Android Auto readiness | P3 | Store + license |

---

## 3. Native Integrations

| Integration | API | Phase | Notes |
|-------------|-----|-------|-------|
| App Groups | iOS | MF1 | Share prayer times + progress |
| WidgetKit | iOS 17+ timelines | MF2 | All sizes + Lock Screen |
| ActivityKit | iOS | MF2 | Extend beyond prayer |
| WatchConnectivity | iPhone↔Watch | MF3 | Fallback: independent fetch |
| App Intents / Action Button | watchOS / iOS | MF3 | Quick adhkar / mark wird |
| FCM + APNs | Push | MF2 | Align MRMP M8 |
| AlarmManager / exact alarms | Android | MF2 | Align MRMP M7 |
| Glance / Wear tiles | Wear OS | MF5 | After phone widgets |
| CarPlay audio entitlement | iOS | MF6 | Study only until license OK |

Existing: `PrayerLiveActivity/*` · Capacitor plugins · deep links · adhan scheduler.

---

## 4. Watch App (architecture + delivery)

### 4.1 Screens

| Screen | Content |
|--------|---------|
| Watch Home | Next prayer · countdown · shortcut tiles |
| Prayer | All times today · current · remaining |
| Daily Dhikr | Selected adhkar set (licensed corpus only) |
| Reading Progress | Pages/ayah goals (counts only — no Quran glyphs on watch unless license OK) |
| Memorization Progress | Hifz streak / portion |
| Favorite Lessons | Titles + deep link open on phone |

### 4.2 Capabilities

- Complications (circular / rectangular / inline) — next prayer + countdown  
- Smart Stack relevance  
- Action Button → mark wird / open dhikr (when hardware supports)  
- watchOS latest APIs: App Intents, WidgetKit on watch, independent networking with phone sync  

### 4.3 Sync

```text
iPhone PrayerEngine → App Group shared JSON (times, location label, prefs)
Watch reads App Group; if stale > N min → WatchConnectivity request / HTTPS (licensed endpoints only)
Push to Watch via complication reload
```

### 4.4 License rule (Watch)

حتى إكمال قسم L في `CONTENT_LICENSE_CERTIFICATION.md`:  
عرض **أوقات الصلاة + أرقام التقدم + عناوين** فقط — **ممنوع** تضمين خطوط QPC أو نص مصحف أو تلاوة مجمّعة على الساعة.

---

## 5. Widgets

### 5.1 Size matrix

| Family | Sizes |
|--------|-------|
| Home Screen | Small · Medium · Large · Extra Large |
| Lock Screen | Circular · Inline · Rectangular |

### 5.2 Content widgets (each = separate kind or configurable)

1. مواقيت الصلاة  
2. الصلاة القادمة  
3. عدّ تنازلي  
4. آية اليوم — **فقط** إن رُخّص عرض الآية خارج التطبيق  
5. حديث اليوم — مرخّص  
6. فائدة علمية — مرخّصة  
7. الورد القرآني (عداد)  
8. متابعة الحفظ  
9. متابعة الدروس  
10. متابعة الختمة  

### 5.3 Implementation notes

- Timeline provider refreshes at prayer boundaries + user prefs.  
- Deep link each tap → Capacitor route.  
- Android: App Widgets + Material 3 glance where feasible.  
- Open PR `#2299` (native widgets) is **CONFLICTING** — do not merge blindly; rebase into MF2 or supersede.

---

## 6. Live Activities

| Activity | Island | Lock Screen | Refresh |
|----------|--------|-------------|---------|
| صلاة قادمة | **EXISTS** (`PrayerLiveActivity`) | Yes | Timer + push |
| وقت الأذان المتبقي | Extend current | Yes | Timer |
| بث مباشر | New | Yes | Push start/end |
| جلسة قراءة قرآن | New | Yes | Heartbeat / end |
| جلسة حفظ | New | Yes | Heartbeat / end |

Policy: لا نص مصحف داخل Island إلا بترخيص قسم M. الافتراضي: عنوان السورة/الصفحة كأرقام فقط.

---

## 7. Smart Notifications

| Type | Trigger |
|------|---------|
| الصلاة القادمة | PrayerEngine schedule |
| الأذكار | User windows |
| الورد اليومي | Incomplete goal |
| التذكير بالحفظ | Streak risk |
| التذكير بالدروس | Resume unfinished |
| ختمة القرآن | Plan pace |
| مناسبات إسلامية | Curated calendar (licensed) |

Properties: Quiet Hours · Preferences · Smart Scheduling · ar-SA localization · Deep Links.  
Align with MRMP M7/M8 device certification.

---

## 8. Mind Maps (Mindful Learning)

### 8.1 Types

Tree · Knowledge Graph · Concept Map · Learning Path · Topic Relations · Scholar Map · Madhhab Map · Hadith Classification · Fiqh Relations · Aqeedah Map  

### 8.2 Domains

عقيدة · فقه · حديث · تفسير · أصول · سيرة · علوم قرآن  

### 8.3 Baseline

موجود جزئيًا على الويب: `/mind-map` · `KnowledgeGraphPage` — **ليس** منظومة تفاعلية أصلية بعد.  
MF4: محرّك عرض تفاعلي (Canvas/SVG) + بيانات مملوكة للمشروع فقط (قسم J).

---

## 9. Fatwa Platform

### 9.1 Scope (licensed only)

فهرسة · بحث · تصنيف موضوعي · تصنيف فقهي · علماء · ربط دروس · ربط مراجع  

### 9.2 Forbidden

- لا استيراد آلي من مواقع بلا إذن  
- لا تخزين نصوص محمية  
- لا نسب للجنة الدائمة أو غيرها دون قناة موثّقة (قسم G/H)  

### 9.3 Existing product cues

مسارات `/fatwa*` · `/rulings` · سياسات جودة المحتوى — إعادة استخدام كـ **index + deep link** بعد الترخيص، لا ككسح محتوى.

---

## 10. Audio Audit

المصدر التفصيلي: **`docs/mobile/ADHAN_AUDIO_AUDIT.md`**.

خلاصة:

| Class | Count (approx) |
|-------|----------------|
| CC0 / OPEN | field + field-full (+ CAF shorts) |
| INTERNAL_PENDING_OWNER | معظم حزمة makkah/egypt/aqsa/gulf |
| MISSING_EVIDENCE | haram-full · soft-alert · أغلب CAF غير CC0 |
| EXCLUDED | madinah · qatami (already removed) |

استبدال الجودة المنخفضة (16–22 kHz) بمصادر مرخّصة ≥44.1 kHz = مرحلة MF-AUDIO-2.

---

## 11. Quran Experience (no sacred asset edits)

| Feature | Notes |
|---------|-------|
| أهداف يومية | Counters + reminders |
| خطط ختم | Pace engine |
| مسارات حفظ | Existing memorization research path reuse |
| متابعة التقدم | Multi-device via account |
| إحصاءات شخصية | Local + optional sync |
| تذكيرات ذكية | Notification planner |
| مزامنة أجهزة | Supabase session + conflict-free counters |

**Never touch:** Quran text · Uthmani · QPC · page mapping · audio mapping.

---

## 12. Mobile Roadmap (excellence map)

| Item | Cost | Risk | Dependencies | Platforms | Priority |
|------|------|------|--------------|-----------|----------|
| Widgets P0 set | M | License of ayah/hadith cards | App Groups · MF1 | iOS/Android | P0 |
| Watch app | H | Battery · license · UX density | PrayerEngine · App Groups | watchOS | P0 |
| Live Activities expand | M | Push token / budget | ActivityKit existing | iOS | P0 |
| Offline improvements | H | License offline packages | MRMP M5 · LicenseGate | All | P0 |
| Push enhancements | M | OS limits | MRMP M8 | All | P0 |
| Deep Links harden | S | Associated domains | MRMP M3 | All | P0 |
| Smart Search native shell | M | Ranking quality | Web search SoT | All | P1 |
| Personal learning paths | M | Content license | Fatwa/lessons gates | All | P1 |
| Reading analytics | S | Privacy | ProgressStore | All | P1 |
| Memorization analytics | M | Pedagogy accuracy | Memorization modules | All | P1 |
| Wear OS | H | Fragmentation | Android widgets first | Wear | P2 |
| CarPlay / Android Auto | H | Entitlements · audio license | OWNER · audio cert | Auto | P3 |

Cost: S=&lt;1w · M=1–3w · H=&gt;3w (engineering weeks, single track).

---

## 13. Dependencies

| Dependency | Blocks |
|------------|--------|
| MRMP M1 (native ID alignment) | Store + consistent App Groups naming |
| `LICENSE_CERTIFICATION_REQUIRED` closure | Watch/Widget/LA content beyond prayer times |
| U3/U4 web theme/chrome (optional parallel) | WebView flicker on phone |
| OWNER signing / ASC / Play | Any TestFlight/Play Internal |
| PrayerLiveActivity expansion | Xcode capability + push |
| `#2299` resolve or supersede | Widgets train |

---

## 14. Risks

| Risk | Class | Mitigation |
|------|-------|------------|
| Shipping UNKNOWN audio/fonts | HARD legal | LicenseGate · strip · audit |
| Android/iOS appId mismatch | HARD store | M1 |
| Quran glyphs on Watch/Widget without QPC grant | HARD | Numbers-only until OWNER |
| Live Activity spam / battery | SOFT | Relevance + budgets |
| Fatwa corpus scrape | HARD | Licensed sources only |
| Scope explosion vs MRMP RC | SOFT | Phases MF1→MF6 sequential |

---

## 15. Licensing Requirements

الملف الملزم: `docs/mobile/CONTENT_LICENSE_CERTIFICATION.md`.

قبل أي بناء Store/Watch/Widget بمحتوى:

1. لا `UNKNOWN`  
2. `AUDIO_CERTIFIED` للأصوات المضمّنة  
3. `CONTENT_CERTIFIED` للنصوص المعروضة خارج التطبيق  
4. إسنادات ثالثة مكتملة  
5. ثم فقط مسار MRMP → `STORE_SUBMISSION_READY`

---

## 16. Delivery Phases

| Phase | Exit | Deliverables |
|-------|------|--------------|
| **MF0** | `MOBILE_FIRST_MASTERPLAN_COMPLETE` | هذا الملف · Audio Audit · License Certification checklist |
| **MF1** | `NATIVE_SHARED_CORE_READY` | App Groups models · LicenseGate · DeepLink contract · M1 ID decision |
| **MF2** | `WIDGETS_AND_LA_V1` | Prayer/countdown widgets · extend Live Activities · Lock Screen |
| **MF3** | `WATCH_V1` | Watch app screens · complications · sync |
| **MF4** | `LEARNING_MAPS_V1` | Interactive maps (owned data) |
| **MF5** | `FATWA_INDEX_V1` | Licensed fatwa index only |
| **MF6** | `QURAN_XP_AND_ANALYTICS` | Goals/khatma/hifz analytics (no asset edits) |
| **MF7** | `WEAR_AND_AUTO_READY_STUDY` | Wear OS tiles · CarPlay/Android Auto readiness doc |
| **MF-AUDIO** | `AUDIO_CERTIFIED` | Replace/strip per `ADHAN_AUDIO_AUDIT.md` |
| **MF-LIC** | `CONTENT_CERTIFIED` | Close all ☐ in license checklist |

Execution order when app is P0 (aligned with MRMP):

```text
MF0 (done this PR)
→ License critical path (MF-LIC / MF-AUDIO) in parallel with MRMP M1
→ MF1 shared core
→ MF2 Widgets+LA
→ MF3 Watch
→ MRMP M6/M7/M5/M8 device certs
→ MF4–MF6 product expansion
→ MF7 auto/wear
→ MRMP M12–M13 → STORE_GO (Owner)
```

---

## Final status

```text
MOBILE_FIRST_MASTERPLAN_COMPLETE
LICENSE_CERTIFICATION_REQUIRED
AUDIO_LICENSE_PARTIAL
MOBILE_PARTIALLY_READY   ← MRMP unchanged
```

Next executable engineering slice: **MF1 Native Shared Core** + **MF-AUDIO-1** registry gaps (`adhan-haram-full` / `adhan-soft-alert`) on independent PRs — لا خلط مع UNIFIED U5–U13.
