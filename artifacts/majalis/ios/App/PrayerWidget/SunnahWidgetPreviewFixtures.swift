import Foundation

/// Sample-only fixtures. Never written to App Group live storage.
enum SunnahWidgetPreviewFixtures {
    static let calendar = SharedCalendarPayload(
        schemaVersion: SharedCalendarPayload.currentSchema,
        timezoneIdentifier: "Asia/Riyadh",
        weekdayAr: "الأحد",
        hijriDay: 12,
        hijriMonth: 3,
        hijriMonthAr: "ربيع الأول",
        hijriYear: 1447,
        hijriDisplay: "١٢ ربيع الأول ١٤٤٧",
        gregorianDisplay: "٤ أكتوبر ٢٠٢٦",
        inRamadan: false,
        daysUntilRamadan: 54,
        ramadanLabelAr: "باقي على رمضان",
        updatedAtEpochMs: 0
    )

    static let adhkar = SharedAdhkarPayload(
        schemaVersion: SharedAdhkarPayload.currentSchema,
        activeCollection: "morning",
        activeTitleAr: "أذكار الصباح",
        morningTitleAr: "أذكار الصباح",
        eveningTitleAr: "أذكار المساء",
        morningActionAr: "ابدأ ورد الصباح",
        eveningActionAr: "ابدأ ورد المساء",
        rotatingText: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ",
        rotatingSource: "رواه مسلم",
        rotatingCollection: "أذكار الصباح",
        rotationDayKey: "preview",
        updatedAtEpochMs: 0
    )

    static let quran = SharedQuranPayload(
        schemaVersion: SharedQuranPayload.currentSchema,
        ayahText: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
        surahNameAr: "الفاتحة",
        surahNumber: 1,
        ayahNumber: 1,
        page: 1,
        deepLinkPath: "/mushaf/page/1?ayah=1:1",
        updatedAtEpochMs: 0
    )

    static let mushaf = SharedMushafPayload(
        schemaVersion: SharedMushafPayload.currentSchema,
        lastSurahNameAr: "البقرة",
        lastSurahNumber: 2,
        lastPage: 2,
        lastAyahNumber: nil,
        bookmarkSurahNameAr: "البقرة",
        bookmarkSurahNumber: 2,
        bookmarkPage: 2,
        bookmarkAyahNumber: 5,
        hasProgress: true,
        hasBookmark: true,
        updatedAtEpochMs: 0
    )

    static let custom = SharedCustomContentPayload(
        schemaVersion: SharedCustomContentPayload.currentSchema,
        items: [
            SharedCustomContentItem(
                id: "preview-dhikr",
                contentType: "dhikr",
                titleAr: "ذكر",
                text: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ",
                source: "رواه مسلم",
                deepLinkPath: "/adhkar/morning"
            ),
        ],
        updatedAtEpochMs: 0
    )
}
