# تدقيق سلسلة التسميع v2 — من الميكروفون إلى التلوين

> 2026-10-09 (ن5). لكل حلقة: الملف، والاختبار الذي يغطيها، وهل يعمل في CI، والفجوة.
> «CI» = مُدرج في `test:tasmee` ضمن `test:ci-unit` أو بوابة workflow.

| # | الحلقة | الملف | الاختبار | CI | الفجوة |
|---|---|---|---|---|---|
| 1 | الميكروفون وجلسة الصوت (AVAudioEngine، المقاطعة، المسار، الحرارة) | `ios/App/App/Tasmee/TasmeeEngine.swift` | لا اختبار وحدة Swift؛ المحاكي يتجاوز الميكروفون بملف | — | **جهاز حقيقي فقط** (قائمة يوسف C1–C5/E1–E5) |
| 2 | VAD والنوافذ | `TasmeeEngine.swift` + مرآته `lib/tasmee-v2/engine/vad.ts` | `tasmee-v2-engine` (المرآة TS) + اختبار المحاكي (السويفت الفعلي) | ✓ / يدوي | تطابق المرآة مع Swift غير مُثبت آليًا |
| 3 | تحميل النموذج base-q6 (تنزيل، SHA-256، Wi-Fi فقط) | `TasmeeModelStore`، `model-config.ts` | `tasmee-v2-model-download`، `test-tasmee-model-guard`، `test-tasmee-zip-swift` | ✓ | — |
| 4 | فك WhisperKit → `tasmeePartial` | `TasmeeEngine.swift`، `TasmeeEnginePlugin.swift` | اختبار المحاكي (36/36، حقن 5:9) | يدوي | لا CI (لا نموذج ولا محاكٍ بزمن حقيقي)؛ مقبول بقرار |
| 5 | تسجيل الإضافة في الجسر (Capacitor 8) | `MainBridgeViewController.swift` | `test-ios-capacitor-gates` | ✓ (`ios-capacitor-gates.yml`) | أُغلقت بعد #2844 |
| 6 | الجسر JS (`registerPlugin`، المستمعات) | `lib/tasmee/engine-plugin.ts` | `tasmee-v2-flag-and-wiring` (جزئيًا) | ✓ | أُدرج في `test:tasmee` (هذا الـPR) |
| 7 | فلتر الهلوسة | `lib/tasmee/hallucination-guard.ts` | `tasmee-hallucination` | ✓ | — |
| 8 | المتتبّع (تعليق، confirmWords=2، استرداد) | `lib/tasmee-v2/engine/recitation-tracker.ts` | `tasmee-v2-engine` (5 سيناريوهات)، `tasmee-v2-flag-and-wiring` | ✓ | المعايير ثابتة بقرار المالك |
| 9 | تطبيق الأحداث + إحصاءات القياس (latency، alerts) | `features/tasmee-v2/useTasmeeEngine.ts` (`applyTrackerEvents`) | `tasmee-v2-flag-and-wiring` | ✓ | أُدرج في `test:tasmee` |
| 10 | الـreducer وحالة الجلسة (الإخفاء، العلامات، الرجوع) | `lib/tasmee-v2/session-state.ts` | `tasmee-v2-session-state` | ✓ | أُدرج في `test:tasmee` |
| 11 | التلوين: `data-tasmee` على `.nm-word` بلا تغيير تخطيط | `TasmeeV2Layer.tsx`، `mushaf-reader.css` | `tasmee-v2-mushaf-gate` + المحاكي | ✓ / يدوي | أُدرج في `test:tasmee`؛ visual-snapshot لا يفتح وضع التسميع |
| 12 | العلم وسياسة القناة (App Store مغلق) | `flags.ts`، `useTasmeeV2Enabled.ts`، `tasmee-flags.json` | `tasmee-v2-flag-and-wiring` | ✓ | كانت أخطر فجوة (إغلاق App Store بلا حارس في CI)؛ أُدرج في `test:tasmee` |
| 13 | لا خروج للصوت | كل السلسلة | `tasmee-v2-no-audio-egress` | ✓ | دائم |
| 14 | التشخيص (لوحة القياس، feed، bench-real) | `TASMEE_DIAGNOSTICS`، `feed-harness.ts`، `scripts/tasmee-v2-bench-real.ts` | المحاكي + bench-real | يدوي | أرقام القبول تنتظر جهاز يوسف |
| 15 | الخصوصية (Manifest، Info.plist) | `PrivacyInfo.xcprivacy`، `NSMicrophoneUsageDescription` | `app-store-readiness-gate`، `release-lockdown-gate` | ✓ | البند «و» يتحقق من المطابقة |

## الإصلاح
- أُدرجت `tasmee-v2-session-state` و`tasmee-v2-flag-and-wiring` و`tasmee-v2-mushaf-gate` في `test:tasmee` (ضمن `test:ci-unit` في ci.yml)، فأُغلقت الحلقات 6 و9–12.
- الحلقات 1 و4 و14: جهاز حقيقي (البند هـ) — لا بديل آلي.
