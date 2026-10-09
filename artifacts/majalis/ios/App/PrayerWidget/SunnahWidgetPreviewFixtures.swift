import Foundation
import SunnahWidgetKit

/// Sample-only fixtures. Never written to App Group live storage.
enum SunnahWidgetPreviewFixtures {
    /// يُحسب من تاريخ اليوم الفعلي (أم القرى) لا من قيم ثابتة، فلا يظهر في المعرض تاريخ قديم.
    static func calendar(now: Date = Date(), timeZone: TimeZone = .current) -> SharedCalendarPayload {
        let h = HijriCalendar.date(now, timeZone: timeZone)
        let f = DateFormatter()
        f.locale = WidgetFormat.locale
        f.timeZone = timeZone
        f.setLocalizedDateFormatFromTemplate("EEEE")
        let weekday = f.string(from: now)
        f.setLocalizedDateFormatFromTemplate("d MMMM y")
        let gregorian = f.string(from: now)
        let inRamadan = h.month == 9
        return SharedCalendarPayload(
            schemaVersion: SharedCalendarPayload.currentSchema,
            timezoneIdentifier: timeZone.identifier,
            weekdayAr: weekday,
            hijriDay: h.day,
            hijriMonth: h.month,
            hijriMonthAr: HijriCalendar.monthNamesAr[h.month],
            hijriYear: h.year,
            hijriDisplay: HijriCalendar.display(h),
            gregorianDisplay: gregorian,
            inRamadan: inRamadan,
            daysUntilRamadan: inRamadan ? nil : HijriCalendar.daysUntil(month: 9, day: 1, from: now, timeZone: timeZone),
            ramadanLabelAr: "باقي على رمضان",
            upcomingEventNameAr: "يوم عاشوراء",
            upcomingEventDays: HijriCalendar.daysUntil(month: 1, day: 10, from: now, timeZone: timeZone),
            upcomingEventPath: "/occasions",
            updatedAtEpochMs: 0
        )
    }

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
        rotatingPool: ["سُبْحَانَ اللَّهِ وَبِحَمْدِهِ", "لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ", "حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ", "أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ"],
        rotatingCollection: "أذكار الصباح",
        rotationDayKey: "preview",
        todayCompleted: true,
        streakDays: 7,
        hasCanonicalProgress: true,
        updatedAtEpochMs: 0
    )

    static let quran = SharedQuranPayload(
        schemaVersion: SharedQuranPayload.currentSchema,
        ayahText: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
        surahNameAr: "الفاتحة",
        surahNumber: 1,
        ayahNumber: 1,
        page: 1,
        deepLinkPath: "/mushaf?page=1&ayah=1:1",
        pagesCompletedToday: 1,
        dailyTarget: 1,
        hasCanonicalGoal: true,
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
        journeyPercent: 1,
        updatedAtEpochMs: 0
    )

    static let progress = SharedHomeProgressPayload(
        schemaVersion: SharedHomeProgressPayload.currentSchema,
        hasCanonicalTracking: true,
        morningAdhkarDone: true,
        eveningAdhkarDone: false,
        quranDone: true,
        wirdDone: true,
        adhkarStreakDays: 7,
        pagesCompletedToday: 1,
        dailyPageTarget: 1,
        mushafPercent: 12,
        currentAdhkarTitleAr: "أذكار الصباح",
        updatedAtEpochMs: 0
    )

    static let content = SharedContentSpotlightPayload(
        schemaVersion: SharedContentSpotlightPayload.currentSchema,
        hadithText: "إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ",
        hadithSource: "متفق عليه",
        hadithPath: "/hadith",
        faidahText: "النية شرط لصحة العمل وقبوله.",
        faidahSource: "ابن القيم",
        faidahPath: "/",
        duaText: "اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا",
        duaSource: "رواه الترمذي",
        duaPath: "/adhkar",
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
