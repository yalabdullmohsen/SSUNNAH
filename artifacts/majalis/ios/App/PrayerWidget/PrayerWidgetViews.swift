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
    @Environment(\.widgetFamily) private var family
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
        // Text(timerInterval:) يتمدد لكامل العرض افتراضيًا؛ نثبّته على عرض محتواه.
        .fixedSize(horizontal: true, vertical: false)
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
                    SunnahCounterFace(entry: entry, size: 26)
                        .foregroundStyle(SunnahBrandColors.gold)
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
                    SunnahCounterFace(entry: entry, size: 34)
                        .foregroundStyle(SunnahBrandColors.gold)
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
                        .foregroundStyle(SunnahBrandColors.gold)
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

// MARK: - Lock Screen

struct InlinePrayerWidgetView: View {
    let entry: PrayerWidgetEntry

    var body: some View {
        if entry.needsAppOpenAction {
            Text("افتح سُنّة")
        } else {
            Label {
                PrayerLiveClock(mode: entry.clockMode, now: entry.date, live: entry.allowsLiveCountdown)
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
                VStack(spacing: 2) {
                    Image(systemName: entry.focus.key?.symbol(filled: entry.focus.isCurrent) ?? "moon.stars")
                        .font(WidgetType.icon(WidgetType.minSize))
                        .widgetAccentable()
                    PrayerLiveClock(mode: entry.clockMode, now: entry.date, live: entry.allowsLiveCountdown)
                        .font(WidgetType.primary(WidgetType.minSize))
                }
                .padding(.horizontal, 2)
            }
        }
        .accessibilityLabel(Text(PrayerCounterA11y.label(entry)))
    }
}

struct RectangularPrayerWidgetView: View {
    let entry: PrayerWidgetEntry

    var body: some View {
        if entry.needsAppOpenAction {
            SunnahCalmCard(compact: true)
        } else {
            SunnahTwoZone {
                SunnahCounterFace(entry: entry, size: 24, showsIcon: false)
                    .widgetAccentable()
            } secondary: {
                Image(systemName: entry.focus.key?.symbol(filled: entry.focus.isCurrent) ?? "moon.stars")
                    .font(WidgetType.icon(20))
                    .widgetAccentable()
                    .accessibilityHidden(true)
            }
            .accessibilityElement(children: .ignore)
            .accessibilityLabel(Text(PrayerCounterA11y.label(entry)))
        }
    }
}
