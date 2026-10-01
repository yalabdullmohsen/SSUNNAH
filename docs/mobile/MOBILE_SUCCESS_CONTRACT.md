# MOBILE SUCCESS CONTRACT — سُنّة (MRMP v1)

لا يُعتبر التطبيق جاهزًا للمتجر حتى تتحقق **كل** البنود التالية بدليل (جهاز / TestFlight / Play Internal / توقيع).  
لا نسب تقديرية. الحالة الافتراضية لكل بند: ☐.

| # | Clause | Evidence class | Status |
|---|--------|----------------|--------|
| 1 | Native Shell Stable | M1 + cold/warm shell on device | ☐ |
| 2 | App Startup Stable | M2 — no white/blank/reload loop/theme flash | ☐ |
| 3 | Deep Links Stable | M3 — sunnah:// + https + UL/App Links | ☐ |
| 4 | Push Notifications Stable | M8 — FG/BG/killed/cold/tap | ☐ |
| 5 | Prayer Notifications Stable | M7 — FG/BG/terminated/lock screen | ☐ |
| 6 | Adhan Background Stable | M7 — delivery + interruption | ☐ |
| 7 | Offline Stable | M5 — online/offline/reconnect/kill | ☐ |
| 8 | Mushaf Long Session Stable | M6 — 25/50/100 turns + audio | ☐ |
| 9 | Memory Stable | M6 + M11 — no OOM on matrix | ☐ |
| 10 | Battery Acceptable | M11 — owner-accepted drain band | ☐ |
| 11 | Safe Areas Stable | M2/M10 — notch/home indicator/cutout | ☐ |
| 12 | Keyboard Stable | M2/M4 — forms + search + resize | ☐ |
| 13 | RTL Stable | All M* — Arabic RTL primary | ☐ |
| 14 | VoiceOver Stable | M9 — iOS | ☐ |
| 15 | TalkBack Stable | M9 — Android | ☐ |
| 16 | Crash Free Validation | M13 — TF/Play session window | ☐ |
| 17 | TestFlight Evidence | M13 — build + notes + pass log | ☐ |
| 18 | Play Internal Evidence | M13 — AAB + pass log | ☐ |
| 19 | Store Compliance | M12 — privacy/metadata/licenses | ☐ |
| 20 | Signing Complete | M12 — OWNER secrets + certs | ☐ |
| 21 | Device Matrix Complete | M10 — iPhone/iPad/Android rows filled | ☐ |

**Rule:** أي ☐ على بنود P0 (1–8, 16–21) ⇒ يمنع `STORE_GO`.  
**Program:** `docs/mobile/MRMP_V1_MASTER_PROGRAM.md`.
