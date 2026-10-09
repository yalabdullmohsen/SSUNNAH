import SwiftUI
import SunnahWidgetKit
import WidgetKit

enum SunnahWidgetFamilySupport {
    static let prayerCurrent: [WidgetFamily] = [
        .systemSmall, .systemMedium, .accessoryRectangular,
    ]
    static let prayerNext: [WidgetFamily] = [
        .systemSmall, .systemMedium, .systemLarge, .accessoryInline, .accessoryCircular, .accessoryRectangular,
    ]
    static let prayerPrevious: [WidgetFamily] = [
        .systemSmall, .systemMedium, .accessoryInline, .accessoryRectangular,
    ]
    static let prayerPreviousNext: [WidgetFamily] = [
        .systemMedium, .systemLarge, .accessoryRectangular,
    ]
    static let prayerMorning: [WidgetFamily] = [.systemSmall, .systemMedium]
    static let prayerEvening: [WidgetFamily] = [.systemSmall, .systemMedium]
    static let prayerAll: [WidgetFamily] = [.systemLarge]
    static let prayerHijri: [WidgetFamily] = [
        .systemSmall, .systemMedium, .accessoryRectangular,
    ]
    static let calendarHijri: [WidgetFamily] = [
        .systemSmall, .systemMedium, .accessoryInline, .accessoryRectangular, .accessoryCircular,
    ]
    static let calendarDual: [WidgetFamily] = [
        .systemSmall, .systemMedium, .accessoryInline, .accessoryRectangular,
    ]
    static let calendarToday: [WidgetFamily] = [.systemSmall, .systemMedium]
    static let calendarRamadan: [WidgetFamily] = [.systemSmall, .systemMedium]
    static let calendarEvent: [WidgetFamily] = [
        .systemSmall, .systemMedium, .accessoryRectangular,
    ]
    static let adhkar: [WidgetFamily] = [
        .systemSmall, .systemMedium, .accessoryInline, .accessoryRectangular,
    ]
    static let adhkarStreak: [WidgetFamily] = [
        .systemSmall, .systemMedium, .accessoryCircular, .accessoryRectangular,
    ]
    static let custom: [WidgetFamily] = [.systemSmall, .systemMedium, .systemLarge]
    static let quran: [WidgetFamily] = [.systemMedium, .systemLarge]
    static let quranGoal: [WidgetFamily] = [
        .systemSmall, .systemMedium, .accessoryCircular, .accessoryRectangular,
    ]
    static let mushaf: [WidgetFamily] = [.systemSmall, .systemMedium]
    static let mushafQuickOpen: [WidgetFamily] = [.systemSmall, .systemMedium, .systemLarge]
    static let homeToday: [WidgetFamily] = [.systemMedium, .systemLarge]
    static let homeActions: [WidgetFamily] = [.systemMedium, .systemLarge]
    static let homeSpiritual: [WidgetFamily] = [.systemMedium, .systemLarge]
}

enum SunnahWidgetRegistry {
    static let platformName = "SunnahWidgetPlatform"
    static var kindCount: Int { Set(SunnahWidgetKind.allUnique).count }
}

struct SunnahWidgetChrome: ViewModifier {
    func body(content: Content) -> some View {
        content
            .environment(\.layoutDirection, .rightToLeft)
            .environment(\.locale, WidgetFormat.locale)
            .modifier(SunnahWidgetSurface())
    }
}

private struct SunnahWidgetSurface: ViewModifier {
    func body(content: Content) -> some View {
        if #available(iOSApplicationExtension 17.0, *) {
            content.containerBackground(for: .widget) { SunnahWidgetTheme.homeGradient }
        } else {
            content.background(SunnahWidgetTheme.homeGradient)
        }
    }
}

extension View {
    /// تخطيط البطاقة الموحّد: يملأ الودجة ويُرسي المحتوى عند بداية السطر (يمين في RTL) فلا يتوسّط ولا يُقصّ.
    func sunnahCardLayout(_ padding: CGFloat = 14) -> some View {
        self
            .padding(padding)
            .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
    }

    /// سقف لحجم الخط الديناميكي داخل الودجات حتى لا يُقصّ النص عند أحجام الإتاحة الكبيرة.
    func sunnahDynamicTypeCap() -> some View {
        dynamicTypeSize(...DynamicTypeSize.accessibility1)
    }
}

struct SunnahWidgetEmptyState: View {
    let message: String
    var body: some View {
        VStack(alignment: .leading, spacing: SunnahWidgetTheme.spacingSM) {
            Image(systemName: "arrow.up.forward.app")
                .font(.title3)
                .foregroundStyle(SunnahBrandColors.gold)
                .widgetAccentable()
                .accessibilityHidden(true)
            Text(message)
                .font(SunnahWidgetTheme.bodyFont)
                .foregroundStyle(SunnahWidgetTheme.primaryText)
                .multilineTextAlignment(.leading)
                .lineLimit(4)
                .minimumScaleFactor(0.8)
        }
        .sunnahCardLayout(SunnahWidgetTheme.spacingMD)
    }
}

struct SunnahWidgetErrorState: View {
    let message: String
    var body: some View {
        VStack(alignment: .leading, spacing: SunnahWidgetTheme.spacingSM) {
            Text(message)
                .font(SunnahWidgetTheme.bodyFont)
                .foregroundStyle(SunnahWidgetTheme.primaryText)
        }
        .padding(SunnahWidgetTheme.spacingMD)
    }
}

struct SunnahWidgetTimelineFactory {
    static func prayerTimeline(now: Date = Date()) -> Timeline<PrayerWidgetEntry> {
        let snapshot = SunnahSharedStore.loadCanonicalPrayer() ?? SunnahSharedStore.loadPrayer()
        let entry = PrayerWidgetEntry.make(date: now, snapshot: snapshot)
        let entries = PrayerWidgetTimelinePolicy.entryDates(now: now, entry: entry, snapshot: snapshot)
            .map { PrayerWidgetEntry.make(date: $0, snapshot: snapshot) }
        let policy: TimelineReloadPolicy
        if let next = entry.nextDate, next > now {
            policy = .after(next)
        } else if entry.needsAppOpenAction {
            policy = .after(now.addingTimeInterval(15 * 60))
        } else {
            policy = .after(now.addingTimeInterval(30 * 60))
        }
        return Timeline(entries: entries.isEmpty ? [entry] : Array(entries), policy: policy)
    }
}

struct CatalogWidgetEntry: TimelineEntry {
    let date: Date
    let presentation: SunnahWidgetPresentation
    let prayer: PrayerWidgetEntry
    let calendar: SharedCalendarPayload?
    let adhkar: SharedAdhkarPayload?
    let quran: SharedQuranPayload?
    let mushaf: SharedMushafPayload?
    let custom: SharedCustomContentPayload?
    let progress: SharedHomeProgressPayload?
    let content: SharedContentSpotlightPayload?
    let selectedCustomId: String?
    let isSampleData: Bool

    static func gallery() -> CatalogWidgetEntry {
        let prayer = PrayerWidgetEntry.galleryPreview()
        return CatalogWidgetEntry(
            date: Date(),
            presentation: .galleryPreview,
            prayer: prayer,
            calendar: SunnahWidgetPreviewFixtures.calendar(),
            adhkar: SunnahWidgetPreviewFixtures.adhkar,
            quran: SunnahWidgetPreviewFixtures.quran,
            mushaf: SunnahWidgetPreviewFixtures.mushaf,
            custom: SunnahWidgetPreviewFixtures.custom,
            progress: SunnahWidgetPreviewFixtures.progress,
            content: SunnahWidgetPreviewFixtures.content,
            selectedCustomId: SunnahWidgetPreviewFixtures.custom.items.first?.id,
            isSampleData: true
        )
    }

    static func placeholder() -> CatalogWidgetEntry {
        var entry = gallery()
        entry = CatalogWidgetEntry(
            date: entry.date,
            presentation: .placeholder,
            prayer: .placeholder(),
            calendar: entry.calendar,
            adhkar: entry.adhkar,
            quran: entry.quran,
            mushaf: entry.mushaf,
            custom: entry.custom,
            progress: entry.progress,
            content: entry.content,
            selectedCustomId: entry.selectedCustomId,
            isSampleData: true
        )
        return entry
    }

    static func live(now: Date = Date(), selectedCustomId: String? = nil) -> CatalogWidgetEntry {
        let envelope = SunnahSharedStore.loadEnvelope()
        let prayerSnap = SunnahSharedStore.loadCanonicalPrayer()
        let prayer = PrayerWidgetEntry.make(date: now, snapshot: prayerSnap)
        let tz = SunnahWidgetDayRollover.timeZone(envelope: envelope, prayer: prayerSnap)
        let customPresentation = CustomContentWidgetAdapter.presentation(forSelectedId: selectedCustomId)
        let presentation: SunnahWidgetPresentation = {
            if prayerSnap == nil && envelope == nil { return .liveNoData }
            if customPresentation == .configurationRequired && selectedCustomId != nil {
                return .configurationRequired
            }
            if prayer.presentation == .permissionRequired { return .permissionRequired }
            if prayer.presentation == .liveStale { return .liveStale }
            return prayer.presentation
        }()
        return CatalogWidgetEntry(
            date: now,
            presentation: presentation,
            prayer: prayer,
            calendar: SunnahWidgetDayRollover.calendar(envelope?.calendarPayload ?? SunnahWidgetDayRollover.seedCalendar(at: now, timeZone: tz), at: now),
            adhkar: envelope?.adhkarPayload.map { SunnahWidgetDayRollover.adhkar($0, at: now, timeZone: tz) },
            quran: envelope?.quranPayload.map { SunnahWidgetDayRollover.quran($0, at: now, timeZone: tz) },
            mushaf: envelope?.mushafPayload,
            custom: envelope?.customContentPayload,
            progress: envelope?.progressPayload.map { SunnahWidgetDayRollover.progress($0, at: now, timeZone: tz) },
            content: envelope?.contentSpotlightPayload,
            selectedCustomId: selectedCustomId,
            isSampleData: false
        )
    }
}

struct CatalogWidgetProvider: TimelineProvider {
    func placeholder(in context: Context) -> CatalogWidgetEntry { .placeholder() }

    func getSnapshot(in context: Context, completion: @escaping (CatalogWidgetEntry) -> Void) {
        if context.isPreview {
            completion(.gallery())
            return
        }
        let live = CatalogWidgetEntry.live()
        if live.prayer.isGlanceable || live.calendar != nil || live.adhkar != nil {
            completion(live)
        } else {
            completion(.gallery())
        }
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<CatalogWidgetEntry>) -> Void) {
        let now = Date()
        let live = CatalogWidgetEntry.live(now: now)
        var dates = [now]
        if let next = live.prayer.nextDate, next > now { dates.append(next) }
        let tz = SunnahWidgetDayRollover.timeZone(envelope: SunnahSharedStore.loadEnvelope(), prayer: live.prayer.snapshot)
        let midnight = SunnahWidgetDayRollover.nextMidnight(after: now, timeZone: tz)
        if let midnight { dates.append(midnight) }
        dates.append(contentsOf: SunnahWidgetDayRollover.adhkarWindowBoundaries(after: now, timeZone: tz))
        let entries = Array(Set(dates)).sorted().prefix(8).map { CatalogWidgetEntry.live(now: $0) }
        let policy: TimelineReloadPolicy = {
            if let next = live.prayer.nextDate, next > now { return .after(next) }
            if let midnight { return .after(midnight) }
            return .after(now.addingTimeInterval(6 * 3600))
        }()
        completion(Timeline(entries: Array(entries), policy: policy))
    }
}

/// Day/time-window rollover for envelope domains published once by the app.
/// Uses the same Umm al-Qura authority as the JS publisher (`islamic-umalqura`);
/// never touches prayer calculation. Without it, Calendar/Adhkar/Progress widgets
/// would keep yesterday's values until the app is reopened.
enum SunnahWidgetDayRollover {
    static let hijriMonthsAr = HijriCalendar.monthNamesAr

    static func timeZone(envelope: SunnahWidgetEnvelope?, prayer: SharedPrayerSnapshot?) -> TimeZone {
        let id = envelope?.calendarPayload?.timezoneIdentifier ?? prayer?.timeZoneIdentifier ?? envelope?.timezoneIdentifier
        return id.flatMap { TimeZone(identifier: $0) } ?? .current
    }

    static func nextMidnight(after date: Date, timeZone: TimeZone) -> Date? {
        var cal = Calendar(identifier: .gregorian)
        cal.timeZone = timeZone
        return cal.nextDate(after: date, matching: DateComponents(hour: 0, minute: 0), matchingPolicy: .nextTime)
    }

    private static func dayKey(_ date: Date, _ tz: TimeZone) -> String {
        SunnahSharedStore.dayKey(for: date, timeZone: tz)
    }

    private static func dayKey(epochMs: Int64, _ tz: TimeZone) -> String {
        dayKey(Date(timeIntervalSince1970: TimeInterval(epochMs) / 1000), tz)
    }

    private static func daysBetween(_ fromKey: String, _ date: Date, _ tz: TimeZone) -> Int? {
        let parser = DateFormatter()
        parser.locale = Locale(identifier: "en_US_POSIX")
        parser.timeZone = tz
        parser.dateFormat = "yyyy-MM-dd"
        guard let from = parser.date(from: fromKey) else { return nil }
        var cal = Calendar(identifier: .gregorian)
        cal.timeZone = tz
        return cal.dateComponents([.day], from: cal.startOfDay(for: from), to: cal.startOfDay(for: date)).day
    }

    private static func arabicDate(_ date: Date, calendar id: Calendar.Identifier, tz: TimeZone, template: String) -> String {
        var cal = Calendar(identifier: id)
        cal.timeZone = tz
        let f = DateFormatter()
        f.calendar = cal
        f.locale = WidgetFormat.locale
        f.timeZone = tz
        f.setLocalizedDateFormatFromTemplate(template)
        return f.string(from: date)
    }

    /// تاريخ هجري/ميلادي من ساعة الجهاز فقط (أم القرى) حين لا ظرف بعد: الودجت يعمل قبل أول فتح.
    /// تاريخ النشر يُجعل أمس فيُعاد حسابه كاملًا بمسار `calendar(_:at:)` نفسه.
    static func seedCalendar(at date: Date, timeZone tz: TimeZone) -> SharedCalendarPayload {
        var gregorian = Calendar(identifier: .gregorian)
        gregorian.timeZone = tz
        let yesterday = gregorian.date(byAdding: .day, value: -1, to: date) ?? date
        return SharedCalendarPayload(
            schemaVersion: SharedCalendarPayload.currentSchema,
            timezoneIdentifier: tz.identifier,
            weekdayAr: "", hijriDay: 1, hijriMonth: 1, hijriMonthAr: "", hijriYear: 1400,
            hijriDisplay: "", gregorianDisplay: "", inRamadan: false, daysUntilRamadan: nil,
            ramadanLabelAr: "", gregorianDate: dayKey(yesterday, tz), calendarMode: "hijri",
            updatedAtEpochMs: 0
        )
    }

    static func calendar(_ payload: SharedCalendarPayload, at date: Date) -> SharedCalendarPayload {
        let tz = TimeZone(identifier: payload.timezoneIdentifier) ?? .current
        let today = dayKey(date, tz)
        let published = payload.gregorianDate ?? payload.dayStartsAt ?? dayKey(epochMs: payload.updatedAtEpochMs, tz)
        guard published != today,
              let delta = daysBetween(published, date, tz), delta > 0
        else { return payload }
        var islamic = Calendar(identifier: .islamicUmmAlQura)
        islamic.timeZone = tz
        var gregorian = Calendar(identifier: .gregorian)
        gregorian.timeZone = tz
        let h = islamic.dateComponents([.year, .month, .day], from: date)
        let g = gregorian.dateComponents([.year, .month, .day], from: date)
        var out = payload
        let weekday = arabicDate(date, calendar: .gregorian, tz: tz, template: "EEEE")
        let hijriText = arabicDate(date, calendar: .islamicUmmAlQura, tz: tz, template: "d MMMM y")
        let gregorianText = arabicDate(date, calendar: .gregorian, tz: tz, template: "d MMMM y")
        out.hijriDay = h.day ?? payload.hijriDay
        out.hijriMonth = h.month ?? payload.hijriMonth
        out.hijriYear = h.year ?? payload.hijriYear
        out.hijriMonthAr = hijriMonthsAr.indices.contains(out.hijriMonth) ? hijriMonthsAr[out.hijriMonth] : payload.hijriMonthAr
        out.hijriDisplay = hijriText
        out.hijriDate = String(format: "%04d-%02d-%02d", out.hijriYear, out.hijriMonth, out.hijriDay)
        out.weekdayAr = weekday
        out.hijriWeekday = weekday
        out.gregorianWeekday = weekday
        out.gregorianDisplay = gregorianText
        out.gregorianDate = today
        out.dayStartsAt = today
        out.gregorianDay = g.day
        out.gregorianMonth = g.month
        out.gregorianYear = g.year
        switch payload.calendarMode {
        case "gregorian": out.displayDateArabic = gregorianText
        case "dual": out.displayDateArabic = "\(hijriText) · \(gregorianText)"
        default: out.displayDateArabic = hijriText
        }
        if out.hijriMonth == 9 {
            out.inRamadan = true
            out.daysUntilRamadan = 0
            out.ramadanLabelAr = "رمضان مبارك"
        } else if payload.inRamadan {
            out.inRamadan = false
            out.daysUntilRamadan = nil
            out.ramadanLabelAr = "باقي على رمضان"
        } else {
            out.daysUntilRamadan = payload.daysUntilRamadan.map { max(0, $0 - delta) }
        }
        if let days = payload.upcomingEventDays {
            let remaining = days - delta
            if remaining >= 0 {
                out.upcomingEventDays = remaining
            } else {
                // Event passed — never invent the next one; app republishes on open.
                out.upcomingEventDays = nil
                out.upcomingEventNameAr = nil
            }
        }
        return out
    }

    /// Product windows mirror JS `resolveTimeOfDay` → ADHKAR_BY_TIME (sunnah-widget-envelope-publish.ts).
    static func adhkarWindow(at date: Date, timeZone: TimeZone) -> (collection: String, title: String) {
        var cal = Calendar(identifier: .gregorian)
        cal.timeZone = timeZone
        let c = cal.dateComponents([.hour, .minute], from: date)
        let hour = Double(c.hour ?? 0) + Double(c.minute ?? 0) / 60
        switch hour {
        case 4..<11.5: return ("morning", "أذكار الصباح")
        case 11.5..<14.5: return ("after-salah", "أذكار بعد الصلاة")
        case 14.5..<21.5: return ("evening", "أذكار المساء")
        default: return ("sleep", "أذكار النوم")
        }
    }

    static func adhkarWindowBoundaries(after date: Date, timeZone: TimeZone) -> [Date] {
        var cal = Calendar(identifier: .gregorian)
        cal.timeZone = timeZone
        return [(4, 0), (11, 30), (14, 30), (21, 30)].compactMap { hm in
            cal.nextDate(after: date, matching: DateComponents(hour: hm.0, minute: hm.1), matchingPolicy: .nextTime)
        }
    }

    static func adhkar(_ payload: SharedAdhkarPayload, at date: Date, timeZone: TimeZone) -> SharedAdhkarPayload {
        var out = payload
        let window = adhkarWindow(at: date, timeZone: timeZone)
        out.activeCollection = window.collection
        out.activeTitleAr = window.title
        if dayKey(epochMs: payload.updatedAtEpochMs, timeZone) != dayKey(date, timeZone) {
            out.todayCompleted = false
        }
        return out
    }

    static func quran(_ payload: SharedQuranPayload, at date: Date, timeZone: TimeZone) -> SharedQuranPayload {
        guard dayKey(epochMs: payload.updatedAtEpochMs, timeZone) != dayKey(date, timeZone) else { return payload }
        var out = payload
        if out.pagesCompletedToday != nil { out.pagesCompletedToday = 0 }
        return out
    }

    static func progress(_ payload: SharedHomeProgressPayload, at date: Date, timeZone: TimeZone) -> SharedHomeProgressPayload {
        guard dayKey(epochMs: payload.updatedAtEpochMs, timeZone) != dayKey(date, timeZone) else { return payload }
        var out = payload
        out.morningAdhkarDone = false
        out.eveningAdhkarDone = false
        out.quranDone = false
        out.wirdDone = false
        out.pagesCompletedToday = 0
        out.currentAdhkarTitleAr = adhkarWindow(at: date, timeZone: timeZone).title
        return out
    }
}

/// Smart Stack relevance: higher as the next prayer approaches or while its «مضى على الأذان» window is open.
/// Pure function of entry dates, so it is testable and never touches prayer calculation.
enum SunnahWidgetRelevance {
    static func score(now: Date, nextDate: Date?, elapsedStart: Date?, elapsedEnd: Date?) -> Float {
        if let s = elapsedStart, let e = elapsedEnd, now >= s, now < e { return 80 }
        guard let next = nextDate, next > now else { return 10 }
        let remaining = next.timeIntervalSince(now)
        if remaining <= 15 * 60 { return 100 }
        if remaining <= 60 * 60 { return 60 }
        return 20
    }
}

extension PrayerWidgetEntry {
    var relevance: TimelineEntryRelevance? {
        TimelineEntryRelevance(score: SunnahWidgetRelevance.score(
            now: date, nextDate: nextDate, elapsedStart: elapsedStart, elapsedEnd: elapsedEnd))
    }
}

extension CatalogWidgetEntry {
    var relevance: TimelineEntryRelevance? { prayer.relevance }
}

// MARK: - Unified widget type & shared prayer components (v5)

/// خط واحد للواجهة (خط النظام العربي SF Arabic؛ IBM Plex Sans Arabic غير مضمَّن في امتداد الودجة)،
/// وزنان فقط: Semibold للعنصر الرئيسي وRegular للثانوي، بأرقام جدولية، وحدّ أدنى 11pt.
enum WidgetType {
    static let minSize = CGFloat(WidgetTextBudget.minFontSize)

    static func primary(_ size: CGFloat) -> Font {
        .system(size: max(size, minSize), weight: .semibold).monospacedDigit()
    }

    static func secondary(_ size: CGFloat) -> Font {
        .system(size: max(size, minSize), weight: .regular).monospacedDigit()
    }

    /// أيقونة SF Symbols بنمط موحّد.
    static func icon(_ size: CGFloat) -> Font {
        .system(size: max(size, minSize), weight: .semibold)
    }
}

extension PrayerSlotKey {
    /// مملوءة للصلاة الحالية، ومحيطية للقادمة.
    func symbol(filled: Bool) -> String {
        filled ? symbolName : symbolName.replacingOccurrences(of: ".fill", with: "")
    }
}

/// بؤرة الودجة: الصلاة الجارية داخل نافذة الـ30 دقيقة، وإلا الصلاة القادمة.
struct PrayerFocus: Equatable {
    let key: PrayerSlotKey?
    let date: Date?
    let isCurrent: Bool
}

extension PrayerWidgetEntry {
    var focus: PrayerFocus {
        if let key = elapsedKey, let start = elapsedStart {
            return PrayerFocus(key: key, date: start, isCurrent: true)
        }
        return PrayerFocus(key: nextKey, date: nextDate, isCurrent: false)
    }

    var displayTimeZone: TimeZone {
        TimeZone(identifier: snapshot?.timeZoneIdentifier ?? "") ?? .current
    }

    func timeText(_ date: Date) -> String {
        WidgetFormat.time(date, timeZone: displayTimeZone)
    }
}

/// العدّاد الموحّد: أيقونة الصلاة + ساعة حيّة لاتينية فقط (بلا اسم ولا نص آخر).
struct SunnahCounterFace: View {
    let entry: PrayerWidgetEntry
    var size: CGFloat = 24
    var showsIcon = true

    var body: some View {
        let focus = entry.focus
        ViewThatFits(in: .horizontal) {
            row(size: size, focus: focus)
            row(size: size * 0.85, focus: focus)
            row(size: size * 0.72, focus: focus)
        }
    }

    private func row(size: CGFloat, focus: PrayerFocus) -> some View {
        HStack(spacing: 6) {
            if showsIcon, let key = focus.key {
                Image(systemName: key.symbol(filled: focus.isCurrent))
                    .font(WidgetType.icon(size * 0.7))
                    .widgetAccentable()
                    .accessibilityHidden(true)
            }
            PrayerLiveClock(mode: entry.clockMode, now: entry.date, live: entry.allowsLiveCountdown)
                .font(WidgetType.primary(size))
        }
    }
}

/// وقت الصلاة بأرقام لاتينية؛ لاحقة ص/م أصغر وبصيغة واحدة في كل مكان.
struct PrayerTimeText: View {
    let date: Date
    let timeZone: TimeZone
    var size: CGFloat = 17

    var body: some View {
        let parts = WidgetFormat.timeParts(date, timeZone: timeZone)
        HStack(alignment: .firstTextBaseline, spacing: 2) {
            Text(parts.clock)
                .font(WidgetType.primary(size))
                .lineLimit(1)
                .minimumScaleFactor(CGFloat(WidgetTextBudget.minScale))
            Text(parts.suffix)
                .font(WidgetType.secondary(size * 0.6))
                .lineLimit(1)
        }
        .fixedSize(horizontal: true, vertical: false)
        .accessibilityElement(children: .ignore)
        .accessibilityLabel(WidgetFormat.time(date, timeZone: timeZone))
    }
}

/// اسم + وقت صلاة (بطاقة): الاسم Semibold، الوقت تحته.
struct PrayerNameTime: View {
    let key: PrayerSlotKey
    let date: Date?
    let timeZone: TimeZone
    var nameSize: CGFloat = 17
    var timeSize: CGFloat = 17
    var filled = false

    var body: some View {
        VStack(alignment: .leading, spacing: 2) {
            HStack(spacing: 4) {
                Image(systemName: key.symbol(filled: filled))
                    .font(WidgetType.icon(nameSize * 0.8))
                    .widgetAccentable()
                    .accessibilityHidden(true)
                Text(key.nameAr)
                    .font(WidgetType.primary(nameSize))
                    .lineLimit(1)
                    .minimumScaleFactor(CGFloat(WidgetTextBudget.minScale))
            }
            if let date {
                PrayerTimeText(date: date, timeZone: timeZone, size: timeSize)
            }
        }
    }
}

/// تخطيط المستطيل (~160×72): منطقتان RTL، اليمنى رئيسية كبيرة واليسرى ثانوية أصغر، بينهما فاصل رفيع.
struct SunnahTwoZone<Primary: View, Secondary: View>: View {
    @ViewBuilder let primary: Primary
    @ViewBuilder let secondary: Secondary

    var body: some View {
        HStack(spacing: 8) {
            primary.frame(maxWidth: .infinity, alignment: .leading)
            Rectangle()
                .fill(.primary.opacity(0.3))
                .frame(width: 1)
                .padding(.vertical, 4)
                .accessibilityHidden(true)
            secondary
        }
    }
}

/// حالة فارغة مصمَّمة: أيقونة + عبارة واحدة قصيرة، بلا شرح.
struct SunnahCalmCard: View {
    var symbol = "moon.stars"
    var phrase = "افتح سُنّة"
    var compact = false

    var body: some View {
        VStack(spacing: 6) {
            Image(systemName: symbol)
                .font(WidgetType.icon(compact ? 18 : 26))
                .widgetAccentable()
                .accessibilityHidden(true)
            Text(phrase)
                .font(WidgetType.primary(compact ? 13 : 15))
                .lineLimit(1)
                .minimumScaleFactor(CGFloat(WidgetTextBudget.minScale))
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .accessibilityElement(children: .ignore)
        .accessibilityLabel(phrase)
    }
}

/// رقم كبير واحد داخل حلقة نظيفة + تسمية ≤ كلمتين (هدف القرآن، سلسلة الأذكار).
struct SunnahRingStat: View {
    let value: String
    let fraction: Double
    let caption: String
    var lockScreen = false

    private var clamped: Double { min(1, max(0, fraction)) }

    var body: some View {
        VStack(spacing: lockScreen ? 0 : 6) {
            ZStack {
                Circle()
                    .stroke(.primary.opacity(0.25), lineWidth: lockScreen ? 3 : 8)
                Circle()
                    .trim(from: 0, to: clamped)
                    .stroke(.primary, style: StrokeStyle(lineWidth: lockScreen ? 3 : 8, lineCap: .round))
                    .rotationEffect(.degrees(-90))
                    .widgetAccentable()
                Text(value)
                    .font(WidgetType.primary(lockScreen ? 16 : 30))
                    .lineLimit(1)
                    .minimumScaleFactor(CGFloat(WidgetTextBudget.minScale))
                    .padding(lockScreen ? 4 : 12)
            }
            .aspectRatio(1, contentMode: .fit)
            if !lockScreen {
                Text(caption)
                    .font(WidgetType.secondary(13))
                    .lineLimit(1)
                    .minimumScaleFactor(CGFloat(WidgetTextBudget.minScale))
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .accessibilityElement(children: .ignore)
        .accessibilityLabel("\(value) \(caption)")
    }
}

/// موضع المصحف: أيقونة + «السورة · الصفحة» (سطر واحد، وإن ضاق فسطران بلا اقتطاع) + تلميح قصير.
struct SunnahMushafPositionCard: View {
    let surah: String?
    let page: Int
    let cue: String
    var symbol = "book.fill"

    private var numberText: String { WidgetFormat.digits(page) }

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Image(systemName: symbol)
                .font(WidgetType.icon(22))
                .foregroundStyle(SunnahBrandColors.gold)
                .widgetAccentable()
                .accessibilityHidden(true)
            Spacer(minLength: 0)
            ViewThatFits(in: .horizontal) {
                Text(oneLine)
                    .font(WidgetType.primary(22))
                    .lineLimit(1)
                    .fixedSize(horizontal: true, vertical: false)
                VStack(alignment: .leading, spacing: 2) {
                    if let surah {
                        Text(surah)
                            .font(WidgetType.primary(20))
                            .lineLimit(2)
                            .minimumScaleFactor(CGFloat(WidgetTextBudget.minScale))
                    }
                    Text(numberText)
                        .font(WidgetType.primary(20))
                }
            }
            Text(cue)
                .font(WidgetType.secondary(13))
                .lineLimit(1)
                .minimumScaleFactor(CGFloat(WidgetTextBudget.minScale))
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
        .accessibilityElement(children: .ignore)
        .accessibilityLabel("\(surah ?? "المصحف") \(numberText) \(cue)")
    }

    private var oneLine: String {
        if let surah { return "\(surah) · \(numberText)" }
        return numberText
    }
}

/// خلية وقت في الشبكة: الاسم فوق الوقت؛ القادمة بكبسولة مملوءة، والمنتهية بشفافية أقل.
struct PrayerGridCell: View {
    let key: PrayerSlotKey
    let date: Date?
    let timeZone: TimeZone
    let isUpcoming: Bool
    let isPast: Bool

    var body: some View {
        VStack(spacing: 2) {
            Text(key.nameAr)
                .font(WidgetType.secondary(13))
                .lineLimit(1)
                .minimumScaleFactor(CGFloat(WidgetTextBudget.minScale))
            if let date {
                PrayerTimeText(date: date, timeZone: timeZone, size: 15)
            }
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 6)
        .background(Capsule().fill(isUpcoming ? SunnahWidgetTheme.selectedFill : Color.clear))
        .opacity(isPast ? 0.55 : 1)
        .accessibilityElement(children: .ignore)
        .accessibilityLabel("\(key.nameAr) \(date.map { WidgetFormat.time($0, timeZone: timeZone) } ?? "")\(isUpcoming ? "، التالية" : "")")
    }
}

/// شبكة 3×2: الفجر، الشروق، الظهر | العصر، المغرب، العشاء.
struct PrayerSixGrid: View {
    let entry: PrayerWidgetEntry
    var keys: [PrayerSlotKey] = [.fajr, .sunrise, .dhuhr, .asr, .maghrib, .isha]

    var body: some View {
        let tz = entry.displayTimeZone
        let upcoming = entry.focus.isCurrent ? entry.currentKey : entry.nextKey
        let rows = stride(from: 0, to: keys.count, by: 3).map { Array(keys[$0..<min($0 + 3, keys.count)]) }
        VStack(spacing: 6) {
            ForEach(rows.indices, id: \.self) { r in
                HStack(spacing: 6) {
                    ForEach(rows[r], id: \.self) { key in
                        let date = entry.slot(for: key)?.date
                        PrayerGridCell(
                            key: key,
                            date: date,
                            timeZone: tz,
                            isUpcoming: key == upcoming,
                            isPast: (date.map { $0 <= entry.date } ?? false) && key != upcoming
                        )
                    }
                }
            }
        }
    }
}
