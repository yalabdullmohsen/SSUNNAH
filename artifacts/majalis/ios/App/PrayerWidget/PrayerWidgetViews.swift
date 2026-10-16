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
                    Text(entry.stateTitle)
                        .font(WidgetType.secondary(13))
                        .foregroundStyle(PrayerHomeStyle.sub)
                    SunnahCounterFace(entry: entry, size: 26, showsIcon: false)
                        .foregroundStyle(entry.homeCounterColor)
                    if let c = entry.stateCaption {
                        Text(c).font(WidgetType.secondary(12)).foregroundStyle(PrayerHomeStyle.sub).lineLimit(1)
                    }
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
                        Text(entry.stateTitle)
                            .font(WidgetType.secondary(14))
                            .foregroundStyle(PrayerHomeStyle.sub)
                        SunnahCounterFace(entry: entry, size: 34, showsIcon: false)
                            .foregroundStyle(entry.homeCounterColor)
                        if let c = entry.stateCaption {
                            Text(c).font(WidgetType.secondary(13)).foregroundStyle(PrayerHomeStyle.sub).lineLimit(1)
                        }
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
                VStack(alignment: .leading, spacing: 16) {
                    SunnahCounterFace(entry: entry, size: 42)
                        .foregroundStyle(entry.homeCounterColor)
                    PrayerSixGrid(entry: entry)
                        .foregroundStyle(PrayerHomeStyle.ink)
                    Spacer(minLength: 0)
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
        guard let p = previousDate, let n = nextDate, n > p else { return 0 }
        return min(1, max(0, date.timeIntervalSince(p) / n.timeIntervalSince(p)))
    }

    var focusTimeText: String? { focus.date.map { timeText($0) } }

    /// رمز شاشة القفل: جرس عند التنبيه (لا ألوان ثابتة على القفل؛ النظام يلوّن).
    var lockSymbol: String {
        isAlertWindow ? "bell.fill" : (focus.key?.symbol(filled: focus.isCurrent) ?? "moon.stars")
    }

    /// لون العدّاد على الخلفية الزمردية: أبيض ← تنبيه عنبري (≤10د) ← ذهبي بعد الأذان.
    var homeCounterColor: Color {
        isAlertWindow ? SunnahWidgetTheme.alertText : (focus.isCurrent ? SunnahBrandColors.gold : SunnahWidgetTheme.primaryText)
    }

    /// عنوان الحالة (يلحقه اسم الصلاة): «بقي على» قبل الأذان وبعد نافذته، «حان وقت» من الأذان إلى نهاية النافذة.
    var stateTitle: String { focus.isCurrent ? "حان وقت" : "بقي على" }

    /// سطر ثانوي: «مضى على الأذان» داخل النافذة، وبعدها «مضى على <الحالية>» (nil قبل أول أذان في اليوم).
    var stateCaption: String? {
        if focus.isCurrent { return "مضى على الأذان" }
        guard let name = previousNameAr, let start = previousDate, start <= date else { return nil }
        return "مضى على \(name)"
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
                    Text(entry.focus.isCurrent ? "\(name) منذ" : "\(name) بعد")
                    PrayerLiveClock(mode: entry.clockMode, now: entry.date, live: entry.allowsLiveCountdown)
                }
            } icon: {
                Image(systemName: entry.focus.key?.symbol(filled: entry.focus.isCurrent) ?? "moon.stars")
            }
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
                Image(systemName: "moon.stars")
                    .font(WidgetType.icon(20))
                    .widgetAccentable()
            } else {
                Gauge(value: entry.intervalProgress) {
                    Text(entry.focus.key?.nameAr ?? "الصلاة")
                } currentValueLabel: {
                    Text(entry.focus.key?.nameAr ?? "الصلاة")
                        .font(WidgetType.primary(WidgetType.minSize))
                        .lineLimit(1)
                        .minimumScaleFactor(CGFloat(WidgetTextBudget.minScale))
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
                    Text("\(entry.stateTitle) \(entry.focus.key?.nameAr ?? "")")
                        .font(WidgetType.primary(14))
                        .lineLimit(1)
                        .minimumScaleFactor(CGFloat(WidgetTextBudget.minScale))
                }
                PrayerLiveClock(mode: entry.clockMode, now: entry.date, live: entry.allowsLiveCountdown)
                    .font(WidgetType.primary(26))
                    .lineLimit(1)
                    .minimumScaleFactor(CGFloat(WidgetTextBudget.minScale))
                if let t = entry.focusTimeText {
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
