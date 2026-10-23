import SwiftUI
import SunnahWidgetKit
import WidgetKit

private let prayerURL = PrayerWidgetDeepLink.prayerTimes

private struct SunnahWidgetBackground: ViewModifier {
    func body(content: Content) -> some View {
        if #available(iOSApplicationExtension 17.0, *) {
            content.containerBackground(for: .widget) { SunnahWidgetTheme.homeGradient }
        } else {
            content.background(SunnahWidgetTheme.homeGradient)
        }
    }
}

struct PrayerWidgetRootView: View {
    @SunnahFamily private var family
    let entry: PrayerWidgetEntry

    var body: some View {
        Group {
            switch family {
            case .systemSmall:
                SmallPrayerWidgetView(entry: entry)
            case .systemMedium:
                MediumPrayerWidgetView(entry: entry)
            case .systemLarge:
                LargePrayerWidgetView(entry: entry)
            case .accessoryInline:
                InlinePrayerWidgetView(entry: entry)
            case .accessoryCircular:
                CircularPrayerWidgetView(entry: entry)
            case .accessoryRectangular:
                RectangularPrayerWidgetView(entry: entry)
            default:
                SmallPrayerWidgetView(entry: entry)
            }
        }
        .environment(\.layoutDirection, .rightToLeft)
        .environment(\.locale, WidgetFormat.locale)
        .widgetURL(prayerURL)
        .redacted(reason: entry.presentation == .placeholder ? .placeholder : [])
    }
}

enum PrayerWidgetCopy {
    static let noData = "افتح سُنّة"
    static let stale = "حدّث من سُنّة"
    static let malformed = "افتح سُنّة"
    static let permission = "فعّل الموقع"
    static let sampleBadge = "معاينة"

    static func action(for entry: PrayerWidgetEntry) -> String {
        switch entry.dataState {
        case .staleData: return stale
        case .malformedData: return malformed
        case .permissionRequired: return permission
        default: return noData
        }
    }
}

/// مكوّن العدّ الحي الوحيد لكل ودجات الصلاة: تصاعدي منذ دخول الوقت، وتنازلي حتى التالية.
/// الحي بالثواني عبر النظام (بلا إعادة بناء Timeline كل ثانية)؛ وعند تعطيله يُعرض نص ثابت بالصيغة نفسها.
struct PrayerLiveClock: View {
    let mode: LiveClock.Mode
    let now: Date
    let live: Bool

    var body: some View {
        Group {
            switch mode {
            case .countUp(let since):
                if live { Text(since, style: .timer) } else { staticText }
            case .countDown(let until):
                if live {
                    Text(timerInterval: now...until, countsDown: true,
                         showsHours: LiveClock.showsHours(seconds: until.timeIntervalSince(now)))
                } else { staticText }
            case .started:
                Text("الآن")
            case .none:
                EmptyView()
            }
        }
        .monospacedDigit()
        .lineLimit(1)
        .minimumScaleFactor(CGFloat(WidgetTextBudget.minScale))
        // أرقام هندية موحّدة في النص الحي أيضًا.
        .environment(\.locale, WidgetFormat.locale)
    }

    @ViewBuilder private var staticText: some View {
        if let t = LiveClock.staticText(mode, now: now) { Text(t) }
    }
}

/// «مضى على الأذان» داخل النافذة (تسمية العدّاد التصاعدي فوقه) أو «مضى على <الحالية> mm:ss» بعدّاد تصاعدي حيّ بعدها.
struct PrayerElapsedCaption: View {
    let entry: PrayerWidgetEntry
    var size: CGFloat = 12

    var body: some View {
        if let src = entry.elapsedCaptionSource {
            Group {
                if let name = src.name {
                    Text(WidgetFormat.rtl("مضى على \(name) ")) + elapsed(since: src.start)
                } else {
                    Text(WidgetFormat.rtl("مضى على الأذان"))
                }
            }
            .font(WidgetType.secondary(size)).monospacedDigit()
            .foregroundStyle(PrayerHomeStyle.sub).lineLimit(1)
            .minimumScaleFactor(CGFloat(WidgetTextBudget.minScale))
            .environment(\.locale, WidgetFormat.locale)
        }
    }

    private func elapsed(since start: Date) -> Text { entry.elapsedText(since: start) }
}

extension PrayerWidgetEntry {
    /// «منذ الأذان»: عدّاد تصاعدي حيّ عبر النظام (Text(timerInterval:)) أو نص ثابت للمعاينة.
    func elapsedText(since start: Date) -> Text {
        let end = max(nextDate ?? start.addingTimeInterval(86_400), date.addingTimeInterval(1))
        if allowsLiveCountdown {
            return Text(timerInterval: start...end, pauseTime: nil, countsDown: false,
                        showsHours: LiveClock.showsHours(seconds: end.timeIntervalSince(start)))
        }
        return Text(LiveClock.format(seconds: date.timeIntervalSince(start)))
    }
}

/// شريط تقدّم اليوم بين صلاتين؛ حيّ عبر النظام داخل النافذة وثابت خارجها. (مكوّن العدّ الحي الوحيد خارج PrayerLiveClock.)
struct PrayerDayProgressBar: View {
    let entry: PrayerWidgetEntry
    let from: Date
    let to: Date

    var body: some View {
        Group {
            if entry.allowsLiveCountdown, entry.date >= from, entry.date < to {
                ProgressView(timerInterval: from...to, countsDown: false) { EmptyView() } currentValueLabel: { EmptyView() }
            } else {
                Gauge(value: WidgetTextBudget.progress(now: entry.date, from: from, to: to)) { EmptyView() }
            }
        }
        .tint(SunnahBrandColors.gold)
        .widgetAccentable()
    }
}

struct PrayerCountdownText: View {
    let entry: PrayerWidgetEntry

    var body: some View {
        if entry.clockMode == .none {
            Text(entry.dataState == .staleData ? PrayerWidgetCopy.stale : "حدّث المواقيت")
        } else {
            PrayerLiveClock(mode: entry.clockMode, now: entry.date, live: entry.allowsLiveCountdown)
        }
    }
}

// MARK: - Home

private enum PrayerHomeStyle {
    static let ink = SunnahWidgetTheme.primaryText
    static let sub = SunnahWidgetTheme.secondaryText
}

/// الصغيرة: عدّاد كبير + اسم الصلاة ووقتها. لا آيات ولا نصوص طويلة.
struct SmallPrayerWidgetView: View {
    let entry: PrayerWidgetEntry

    var body: some View {
        Group {
            if entry.needsAppOpenAction {
                SunnahCalmCard().foregroundStyle(PrayerHomeStyle.ink)
            } else {
                VStack(alignment: .leading, spacing: 8) {
                    Text(WidgetFormat.rtl(entry.stateTitle))
                        .font(WidgetType.thuluth(13))
                        .foregroundStyle(PrayerHomeStyle.sub)
                    SunnahCounterFace(entry: entry, size: 26, showsIcon: false)
                        .foregroundStyle(entry.homeCounterColor)
                    PrayerElapsedCaption(entry: entry, size: 12)
                    Spacer(minLength: 0)
                    if let key = entry.focus.key {
                        PrayerNameTime(key: key, date: entry.focus.date, timeZone: entry.displayTimeZone,
                                       nameSize: 17, timeSize: 15, filled: entry.focus.isCurrent)
                            .foregroundStyle(PrayerHomeStyle.ink)
                    }
                }
                .sunnahCardLayout(12)
            }
        }
        .modifier(SunnahWidgetBackground())
        .accessibilityLabel(Text(PrayerCounterA11y.label(entry)))
    }
}

/// المتوسطة: منطقتان RTL؛ اليمنى العدّاد، واليسرى اسم الصلاة ووقتها.
struct MediumPrayerWidgetView: View {
    let entry: PrayerWidgetEntry

    var body: some View {
        Group {
            if entry.needsAppOpenAction {
                SunnahCalmCard().foregroundStyle(PrayerHomeStyle.ink)
            } else {
                SunnahTwoZone {
                    VStack(alignment: .leading, spacing: 4) {
                        Text(WidgetFormat.rtl(entry.stateTitle))
                            .font(WidgetType.thuluth(14))
                            .foregroundStyle(PrayerHomeStyle.sub)
                        SunnahCounterFace(entry: entry, size: 34, showsIcon: false)
                            .foregroundStyle(entry.homeCounterColor)
                        PrayerElapsedCaption(entry: entry, size: 13)
                    }
                } secondary: {
                    if let key = entry.focus.key {
                        PrayerNameTime(key: key, date: entry.focus.date, timeZone: entry.displayTimeZone,
                                       nameSize: 17, timeSize: 15, filled: entry.focus.isCurrent)
                            .foregroundStyle(PrayerHomeStyle.ink)
                    }
                }
                .padding(14)
                .frame(maxWidth: .infinity, maxHeight: .infinity)
            }
        }
        .modifier(SunnahWidgetBackground())
        .accessibilityLabel(Text(PrayerCounterA11y.label(entry)))
    }
}

/// الكبيرة: العدّاد في الأعلى ثم شبكة المواقيت الستة 3×2.
struct LargePrayerWidgetView: View {
    let entry: PrayerWidgetEntry

    var body: some View {
        Group {
            if entry.needsAppOpenAction {
                SunnahCalmCard().foregroundStyle(PrayerHomeStyle.ink)
            } else {
                VStack(alignment: .leading, spacing: 12) {
                    VStack(alignment: .leading, spacing: 4) {
                        Text(WidgetFormat.rtl(entry.stateTitle))
                            .font(WidgetType.thuluth(17))
                            .foregroundStyle(PrayerHomeStyle.sub)
                            .lineLimit(1)
                        SunnahCounterFace(entry: entry, size: 42)
                            .foregroundStyle(entry.homeCounterColor)
                        PrayerElapsedCaption(entry: entry, size: 14)
                    }
                    PrayerSixGrid(entry: entry, fillsHeight: true)
                        .foregroundStyle(PrayerHomeStyle.ink)
                }
                .sunnahCardLayout(16)
            }
        }
        .modifier(SunnahWidgetBackground())
        .accessibilityLabel(Text(PrayerCounterA11y.label(entry)))
    }
}

enum PrayerCounterA11y {
    static func label(_ entry: PrayerWidgetEntry) -> String {
        if entry.needsAppOpenAction { return "افتح تطبيق سُنّة لتهيئة مواقيت الصلاة" }
        let focus = entry.focus
        let name = focus.key?.nameAr ?? "الصلاة"
        if focus.isCurrent, let start = focus.date {
            return "مضى \(LiveClock.format(seconds: entry.date.timeIntervalSince(start))) على أذان \(name)"
        }
        if let end = focus.date, end > entry.date {
            return "متبقٍ \(LiveClock.format(seconds: end.timeIntervalSince(entry.date))) على \(name)"
        }
        return "حان وقت \(name)"
    }
}

extension PrayerWidgetEntry {
    /// التنازلي ≤ 10 دقائق: يتغير الشكل بلون التنبيه (ذهبي الهوية).
    var isAlertWindow: Bool {
        guard !focus.isCurrent, let end = focus.date else { return false }
        let left = end.timeIntervalSince(date)
        return left > 0 && left <= 10 * 60
    }

    /// تقدم الفترة بين الصلاة السابقة والقادمة (أو بين الأذان ونهاية النافذة أثناء العدّ التصاعدي).
    var intervalProgress: Double {
        if let s = elapsedStart, let e = elapsedEnd, e > s {
            return min(1, max(0, date.timeIntervalSince(s) / e.timeIntervalSince(s)))
        }
        guard let p = currentDate ?? previousDate, let n = nextDate, n > p else { return 0 }
        return min(1, max(0, date.timeIntervalSince(p) / n.timeIntervalSince(p)))
    }

    var focusTimeText: String? { focus.date.map { timeText($0) } }

    /// رمز شاشة القفل: جرس عند التنبيه (لا ألوان ثابتة على القفل؛ النظام يلوّن).
    var lockSymbol: String {
        isAlertWindow ? "bell.fill" : (focus.key?.symbol(filled: focus.isCurrent) ?? "moon")
    }

    /// لون العدّاد على الخلفية الزمردية: أبيض ← تنبيه عنبري (≤10د) ← ذهبي بعد الأذان.
    var homeCounterColor: Color {
        isAlertWindow ? SunnahWidgetTheme.alertText : (focus.isCurrent ? SunnahBrandColors.gold : SunnahWidgetTheme.primaryText)
    }

    /// عنوان الحالة (يلحقه اسم الصلاة): «بقي على» قبل الأذان وبعد نافذته، «حان وقت» من الأذان إلى نهاية النافذة.
    var stateTitle: String { focus.isCurrent ? "حان وقت" : "بقي على" }

    /// الصلاة التي يُعدّ مضيّ الوقت على أذانها في السطر الثانوي: الجارية داخل النافذة أو آخر أذان مضى بعدها (nil قبل أول أذان).
    var elapsedCaptionSource: (name: String?, start: Date)? {
        if focus.isCurrent, let start = focus.date { return (nil, start) }
        guard let name = currentNameAr, let start = currentDate, start <= date else { return nil }
        return (name, start)
    }
}

// MARK: - Lock Screen

struct InlinePrayerWidgetView: View {
    let entry: PrayerWidgetEntry

    var body: some View {
        if entry.needsAppOpenAction {
            Text("افتح سُنّة")
        } else {
            let name = entry.focus.key?.nameAr ?? "الصلاة"
            Label {
                HStack(spacing: 4) {
                    if entry.focus.isCurrent, let src = entry.elapsedCaptionSource {
                        // «مضى على <الصلاة>» بعدّاد تصاعدي حيّ يحسبه النظام (Text(timerInterval:)) بلا إعادة تحميل.
                        Text(WidgetFormat.rtl("مضى على \(name)"))
                        entry.elapsedText(since: src.start).monospacedDigit().environment(\.locale, WidgetFormat.locale)
                    } else {
                        Text(WidgetFormat.rtl("\(name) بعد"))
                        PrayerLiveClock(mode: entry.clockMode, now: entry.date, live: entry.allowsLiveCountdown)
                    }
                }
            } icon: {
                Image(systemName: entry.focus.key?.symbol(filled: entry.focus.isCurrent) ?? "moon")
            }
            .environment(\.layoutDirection, .rightToLeft)
            .environment(\.locale, WidgetFormat.locale)
            .accessibilityLabel(Text(PrayerCounterA11y.label(entry)))
        }
    }
}

struct CircularPrayerWidgetView: View {
    let entry: PrayerWidgetEntry

    var body: some View {
        ZStack {
            AccessoryWidgetBackground()
            if entry.needsAppOpenAction {
                Image(systemName: "moon")
                    .font(WidgetType.icon(20))
                    .widgetAccentable()
            } else {
                Gauge(value: entry.intervalProgress) {
                    Text(entry.focus.key?.nameAr ?? "الصلاة")
                } currentValueLabel: {
                    VStack(spacing: 0) {
                        Text(entry.focus.key?.nameAr ?? "الصلاة")
                            .font(WidgetType.thuluth(WidgetType.minSize))
                            .lineLimit(1)
                            .minimumScaleFactor(CGFloat(WidgetTextBudget.minScale))
                        if let src = entry.elapsedCaptionSource {
                            entry.elapsedText(since: src.start)
                                .font(WidgetType.secondary(WidgetType.minSize)).monospacedDigit()
                                .lineLimit(1)
                                .minimumScaleFactor(CGFloat(WidgetTextBudget.minScale))
                                .environment(\.locale, WidgetFormat.locale)
                        }
                    }
                }
                .gaugeStyle(.accessoryCircularCapacity)
                                .padding(2)
            }
        }
        .accessibilityLabel(Text(PrayerCounterA11y.label(entry)))
    }
}

struct RectangularPrayerWidgetView: View {
    let entry: PrayerWidgetEntry

    var body: some View {
        if entry.needsAppOpenAction {
            SunnahCalmCard(compact: true).modifier(SunnahAccessoryInset())
        } else {
            VStack(alignment: .leading, spacing: 0) {
                HStack(spacing: 4) {
                    Image(systemName: entry.lockSymbol)
                        .font(WidgetType.icon(WidgetType.minSize))
                        .accessibilityHidden(true)
                    Text(WidgetFormat.stateAndName(entry.stateTitle, entry.focus.key?.nameAr ?? ""))
                        .environment(\.layoutDirection, .rightToLeft)
                        .font(WidgetType.thuluth(14))
                        .lineLimit(1)
                        .minimumScaleFactor(CGFloat(WidgetTextBudget.minScale))
                }
                PrayerLiveClock(mode: entry.clockMode, now: entry.date, live: entry.allowsLiveCountdown)
                    .font(WidgetType.primary(26))
                    .lineLimit(1)
                    .minimumScaleFactor(CGFloat(WidgetTextBudget.minScale))
                if entry.elapsedCaptionSource != nil {
                    PrayerElapsedCaption(entry: entry, size: WidgetType.minSize)
                } else if let t = entry.focusTimeText {
                    Text(t)
                        .font(WidgetType.secondary(WidgetType.minSize))
                        .lineLimit(1)
                }
            }
            .widgetAccentable()
            .frame(maxWidth: .infinity, alignment: .leading)
            .modifier(SunnahAccessoryInset())
            .accessibilityElement(children: .ignore)
            .accessibilityLabel(Text(PrayerCounterA11y.label(entry)))
        }
    }
}

// MARK: - تصاميم الصغير والمتوسط (يختارها المستخدم من إعداد الودجت)

/// تصاميم ودجت الصلاة. الخطوط المضمَّنة فقط (الثلث والرقعة)؛ الافتراضي = الكلاسيكي.
enum PrayerWidgetDesign: String, CaseIterable {
    case classic, calligraphy, previous, bigNumber, previousNext   // الصغير
    case fiveDaily, split                                          // المتوسط (والكلاسيكي والخطاطي مشتركان)

    func resolved(for family: WidgetFamily) -> PrayerWidgetDesign {
        switch family {
        case .systemSmall: return [.classic, .calligraphy, .previous, .bigNumber, .previousNext].contains(self) ? self : .classic
        case .systemMedium: return [.classic, .calligraphy, .fiveDaily, .split].contains(self) ? self : .classic
        default: return .classic
        }
    }
}

struct PrayerStyledEntry: TimelineEntry {
    let base: PrayerWidgetEntry
    let design: PrayerWidgetDesign
    var date: Date { base.date }
    var relevance: TimelineEntryRelevance? { base.relevance }
}

struct PrayerStyledRootView: View {
    @SunnahFamily private var family
    let entry: PrayerWidgetEntry
    let design: PrayerWidgetDesign

    var body: some View {
        let d = design.resolved(for: family)
        Group {
            if d == .classic || entry.needsAppOpenAction {
                PrayerWidgetRootView(entry: entry)
            } else {
                Group {
                    switch family {
                    case .systemMedium: MediumDesignedPrayerView(entry: entry, design: d)
                    default: SmallDesignedPrayerView(entry: entry, design: d)
                    }
                }
                .environment(\.layoutDirection, .rightToLeft)
                .environment(\.locale, WidgetFormat.locale)
                .widgetURL(prayerURL)
                .redacted(reason: entry.presentation == .placeholder ? .placeholder : [])
            }
        }
    }
}

/// صف «السابقة»: «مضى على <الاسم>» + عدّاد تصاعدي حي، أو nil قبل أول أذان.
private struct PrayerPreviousBlock: View {
    let entry: PrayerWidgetEntry
    var counterSize: CGFloat = 26
    var body: some View {
        if let name = entry.currentNameAr, let start = entry.currentDate, start <= entry.date {
            VStack(alignment: .leading, spacing: 2) {
                Text(WidgetFormat.rtl("مضى على \(name)"))
                    .font(WidgetType.ruqaa(14))
                    .foregroundStyle(PrayerHomeStyle.sub)
                    .lineLimit(1).minimumScaleFactor(CGFloat(WidgetTextBudget.minScale))
                entry.elapsedText(since: start)
                    .font(WidgetType.primary(counterSize))
                    .foregroundStyle(SunnahBrandColors.gold)
                    .lineLimit(1).minimumScaleFactor(CGFloat(WidgetTextBudget.minScale))
                    .environment(\.locale, WidgetFormat.locale)
            }
        } else {
            VStack(alignment: .leading, spacing: 2) {
                Text(WidgetFormat.rtl(entry.stateTitle)).font(WidgetType.ruqaa(14)).foregroundStyle(PrayerHomeStyle.sub)
                SunnahCounterFace(entry: entry, size: counterSize, showsIcon: false)
                    .foregroundStyle(entry.homeCounterColor)
            }
        }
    }
}

private struct PrayerNextBlock: View {
    let entry: PrayerWidgetEntry
    var counterSize: CGFloat = 22
    var body: some View {
        VStack(alignment: .leading, spacing: 2) {
            Text("القادمة").font(WidgetType.ruqaa(13)).foregroundStyle(PrayerHomeStyle.sub)
            if let key = entry.nextKey {
                Text("\(key.nameAr)")
                    .font(WidgetType.ruqaa(20, bold: true))
                    .foregroundStyle(PrayerHomeStyle.ink)
                    .lineLimit(1).minimumScaleFactor(CGFloat(WidgetTextBudget.minScale))
                if let d = entry.nextDate { PrayerTimeText(date: d, timeZone: entry.displayTimeZone, size: 15).foregroundStyle(PrayerHomeStyle.sub) }
            }
            if entry.clockMode != .none, !entry.focus.isCurrent {
                PrayerLiveClock(mode: entry.clockMode, now: entry.date, live: entry.allowsLiveCountdown)
                    .font(WidgetType.primary(counterSize)).foregroundStyle(PrayerHomeStyle.ink)
            }
        }
    }
}

/// «حان وقت العشاء» نصًّا واحدًا بـRLM واتجاه RTL صريح (HStack يعكس الترتيب في سياقات LTR كشاشة القفل).
private extension PrayerWidgetEntry {
    func stateAndName(_ key: PrayerSlotKey, size: CGFloat) -> some View {
        Text(WidgetFormat.stateAndName(stateTitle, key.nameAr))
        .environment(\.layoutDirection, .rightToLeft)
        .font(WidgetType.ruqaa(size)).foregroundStyle(PrayerHomeStyle.sub)
        .lineLimit(1).minimumScaleFactor(CGFloat(WidgetTextBudget.minScale))
    }
}

struct SmallDesignedPrayerView: View {
    let entry: PrayerWidgetEntry
    let design: PrayerWidgetDesign

    var body: some View {
        content
            .sunnahCardLayout(12)
            .modifier(SunnahWidgetBackground())
            .accessibilityLabel(Text(PrayerCounterA11y.label(entry)))
    }

    @ViewBuilder private var content: some View {
        let focus = entry.focus
        switch design {
        case .calligraphy:
            VStack(alignment: .leading, spacing: 4) {
                Text(WidgetFormat.rtl(entry.stateTitle)).font(WidgetType.ruqaa(15)).foregroundStyle(PrayerHomeStyle.sub)
                if let key = focus.key {
                    Text(key.nameAr)
                        .font(WidgetType.ruqaa(34, bold: true))
                        .foregroundStyle(PrayerHomeStyle.ink)
                        .lineLimit(1).minimumScaleFactor(CGFloat(WidgetTextBudget.minScale))
                }
                Spacer(minLength: 0)
                SunnahCounterFace(entry: entry, size: 24, showsIcon: false).foregroundStyle(entry.homeCounterColor)
                if let d = focus.date { PrayerTimeText(date: d, timeZone: entry.displayTimeZone, size: 15).foregroundStyle(PrayerHomeStyle.sub) }
            }
        case .previous:
            VStack(alignment: .leading, spacing: 8) {
                PrayerPreviousBlock(entry: entry, counterSize: 28)
                Spacer(minLength: 0)
                if let key = entry.nextKey {
                    Text("القادمة").font(WidgetType.ruqaa(13)).foregroundStyle(PrayerHomeStyle.sub)
                    PrayerNameTime(key: key, date: entry.nextDate, timeZone: entry.displayTimeZone, nameSize: 17, timeSize: 15)
                        .foregroundStyle(PrayerHomeStyle.ink)
                }
            }
        case .bigNumber:
            VStack(alignment: .leading, spacing: 4) {
                if let key = focus.key {
                    entry.stateAndName(key, size: 16)
                }
                Spacer(minLength: 0)
                SunnahCounterFace(entry: entry, size: 40, showsIcon: false).foregroundStyle(entry.homeCounterColor)
                Spacer(minLength: 0)
                if let d = focus.date { PrayerTimeText(date: d, timeZone: entry.displayTimeZone, size: 15).foregroundStyle(PrayerHomeStyle.sub) }
            }
        default: // previousNext
            VStack(alignment: .leading, spacing: 10) {
                if let k = entry.currentKey ?? entry.previousKey, let d = entry.currentDate ?? entry.previousDate {
                    row(title: "السابقة", key: k, date: d, dim: true)
                }
                if let k = entry.nextKey, let d = entry.nextDate { row(title: "القادمة", key: k, date: d, dim: false) }
                Spacer(minLength: 0)
            }
        }
    }

    private func row(title: String, key: PrayerSlotKey, date: Date, dim: Bool) -> some View {
        VStack(alignment: .leading, spacing: 2) {
            Text(title).font(WidgetType.ruqaa(13)).foregroundStyle(PrayerHomeStyle.sub)
            HStack(alignment: .firstTextBaseline, spacing: 6) {
                Text(key.nameAr).font(WidgetType.thuluth(20)).lineLimit(1)
                    .minimumScaleFactor(CGFloat(WidgetTextBudget.minScale))
                PrayerTimeText(date: date, timeZone: entry.displayTimeZone, size: 15)
            }
            .foregroundStyle(PrayerHomeStyle.ink)
            .opacity(dim ? 0.7 : 1)
        }
    }
}

struct MediumDesignedPrayerView: View {
    let entry: PrayerWidgetEntry
    let design: PrayerWidgetDesign

    var body: some View {
        content
            .padding(14)
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .modifier(SunnahWidgetBackground())
            .accessibilityLabel(Text(PrayerCounterA11y.label(entry)))
    }

    @ViewBuilder private var content: some View {
        let focus = entry.focus
        switch design {
        case .fiveDaily:
            VStack(alignment: .leading, spacing: 12) {
                Spacer(minLength: 0)
                HStack(alignment: .firstTextBaseline) {
                    if let key = focus.key {
                        entry.stateAndName(key, size: 17)
                    }
                    Spacer(minLength: 4)
                    SunnahCounterFace(entry: entry, size: 26, showsIcon: false).foregroundStyle(entry.homeCounterColor)
                }
                HStack(spacing: 4) {
                    let upcoming = focus.isCurrent ? entry.currentKey : entry.nextKey
                    ForEach([PrayerSlotKey.fajr, .dhuhr, .asr, .maghrib, .isha], id: \.self) { key in
                        let d = entry.slot(for: key)?.date
                        PrayerGridCell(key: key, date: d, timeZone: entry.displayTimeZone,
                                       isUpcoming: key == upcoming,
                                       isPast: (d.map { $0 <= entry.date } ?? false) && key != upcoming)
                    }
                }
                .foregroundStyle(PrayerHomeStyle.ink)
                Spacer(minLength: 0)
            }
        case .split:
            SunnahTwoZone {
                PrayerPreviousBlock(entry: entry, counterSize: 34)
            } secondary: {
                PrayerNextBlock(entry: entry)
            }
        default: // calligraphy
            SunnahTwoZone {
                VStack(alignment: .leading, spacing: 4) {
                    Text(WidgetFormat.rtl(entry.stateTitle)).font(WidgetType.ruqaa(16)).foregroundStyle(PrayerHomeStyle.sub)
                    SunnahCounterFace(entry: entry, size: 34, showsIcon: false).foregroundStyle(entry.homeCounterColor)
                    PrayerElapsedCaption(entry: entry, size: 13)
                }
            } secondary: {
                if let key = focus.key {
                    VStack(alignment: .leading, spacing: 2) {
                        Text(key.nameAr).font(WidgetType.ruqaa(30, bold: true)).foregroundStyle(PrayerHomeStyle.ink)
                            .lineLimit(1).minimumScaleFactor(CGFloat(WidgetTextBudget.minScale))
                        if let d = focus.date { PrayerTimeText(date: d, timeZone: entry.displayTimeZone, size: 15).foregroundStyle(PrayerHomeStyle.sub) }
                    }
                }
            }
        }
    }
}
