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

private struct SunnahWidgetBackgroundCustom: ViewModifier {
    let colors: [Color]
    func body(content: Content) -> some View {
        let gradient = LinearGradient(
            colors: colors,
            startPoint: .topLeading,
            endPoint: .bottomTrailing
        )
        if #available(iOSApplicationExtension 17.0, *) {
            content.containerBackground(for: .widget) { gradient }
        } else {
            content.background(gradient)
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
        .environment(\.locale, Locale(identifier: "ar"))
        .widgetURL(prayerURL)
        .redacted(reason: entry.presentation == .placeholder ? .placeholder : [])
    }
}

enum PrayerWidgetCopy {
    static let noData = "افتح سُنّة لإكمال إعداد مواقيت الصلاة"
    static let stale = "حدّث المواقيت من سُنّة"
    static let malformed = "تعذّر قراءة المواقيت — افتح سُنّة"
    static let permission = "فعّل إذن الموقع من إعدادات الجهاز ثم افتح سُنّة"
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
        // Text(timerInterval:) يتمدد لكامل العرض افتراضيًا؛ نثبّته على عرض محتواه.
        .fixedSize(horizontal: true, vertical: false)
        // أرقام هندية موحّدة في النص الحي أيضًا.
        .environment(\.locale, Locale(identifier: "ar@numbers=arab"))
    }

    @ViewBuilder private var staticText: some View {
        if let t = LiveClock.staticText(mode, now: now) { Text(t) }
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

// MARK: - Small

struct SmallPrayerWidgetView: View {
    let entry: PrayerWidgetEntry

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            if entry.needsAppOpenAction {
                emptyLabel
            } else {
                Label {
                    Text(entry.currentNameAr.map { "الآن: \($0)" } ?? "قبل الفجر")
                        .font(.caption.bold())
                        .foregroundStyle(.white)
                        .minimumScaleFactor(0.8)
                        .lineLimit(1)
                } icon: {
                    Image(systemName: entry.currentKey?.symbolName ?? "moon.stars.fill")
                        .foregroundStyle(SunnahBrandColors.gold)
                        .widgetAccentable()
                        .accessibilityHidden(true)
                }
                .accessibilityLabel(Text(smallA11yLabel))

                Text(entry.nextLine("التالي:") ?? nextFallback)
                    .font(.subheadline.bold())
                    .foregroundStyle(.white)
                    .lineLimit(1)
                    .minimumScaleFactor(0.8)

                PrayerCountdownText(entry: entry)
                    .font(.title3.monospacedDigit().bold())
                    .foregroundStyle(SunnahBrandColors.gold)
                    .widgetAccentable()
                    .accessibilityLabel(Text(countdownA11y))

                if entry.isSampleData {
                    Text(PrayerWidgetCopy.sampleBadge)
                        .font(.caption2)
                        .foregroundStyle(.white.opacity(0.7))
                }
            }
            Spacer(minLength: 0)
        }
        .padding(12)
        .modifier(SunnahWidgetBackground())
    }

    private var emptyLabel: some View {
        Text(PrayerWidgetCopy.action(for: entry))
            .font(.caption.bold())
            .foregroundStyle(.white)
            .accessibilityLabel("لا توجد مواقيت جاهزة للويدجت. \(PrayerWidgetCopy.action(for: entry)).")
    }

    private var nextFallback: String {
        entry.dataState == .staleData ? PrayerWidgetCopy.stale : "التالي غير متاح"
    }

    private var smallA11yLabel: String {
        let cur = entry.currentNameAr ?? "غير محددة"
        let nxt = entry.nextNameAr ?? "غير محددة"
        return "الصلاة الحالية \(cur). الصلاة التالية \(nxt)."
    }

    private var countdownA11y: String {
        if let name = entry.elapsedNameAr, let start = entry.elapsedStart {
            return "مضى \(LiveClock.format(seconds: entry.date.timeIntervalSince(start))) على أذان \(name)"
        }
        if entry.nextHasStarted { return "حان وقت الصلاة" }
        if let end = entry.nextDate, end > entry.date {
            return "متبقي \(LiveClock.format(seconds: end.timeIntervalSince(entry.date))) للصلاة التالية"
        }
        return "العد التنازلي للصلاة التالية"
    }
}

// MARK: - Medium

struct MediumPrayerWidgetView: View {
    let entry: PrayerWidgetEntry

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            if entry.needsAppOpenAction {
                Text(PrayerWidgetCopy.noData)
                    .font(.subheadline.bold())
                    .foregroundStyle(.white)
                    .accessibilityLabel("لا توجد مواقيت محفوظة. افتح تطبيق سُنّة.")
            } else {
                HStack {
                    VStack(alignment: .leading, spacing: 2) {
                        Text(entry.currentNameAr.map { "الحالية: \($0)" } ?? "قبل الفجر")
                            .font(.caption.bold())
                            .foregroundStyle(.white.opacity(0.9))
                        Text(entry.nextLine("التالية:") ?? "حدّث المواقيت")
                            .font(.headline.bold())
                            .foregroundStyle(.white)
                            .lineLimit(1)
                    }
                    Spacer()
                    PrayerCountdownText(entry: entry)
                        .font(.title2.monospacedDigit().bold())
                        .foregroundStyle(SunnahBrandColors.gold)
                        .widgetAccentable()
                        .accessibilityLabel("العد التنازلي للصلاة التالية")
                }

                PrayerTimelineStrip(slots: entry.slots, currentKey: entry.currentKey, nextKey: entry.nextKey)
                    .accessibilityLabel("جدول صلوات اليوم")
            }
        }
        .padding(14)
        .modifier(SunnahWidgetBackgroundCustom(colors: [
            SunnahBrandColors.emeraldDeep, SunnahBrandColors.emeraldDark,
        ]))
        .accessibilityElement(children: .combine)
    }
}

// MARK: - Large

struct LargePrayerWidgetView: View {
    let entry: PrayerWidgetEntry

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            if entry.needsAppOpenAction {
                Text("افتح تطبيق سُنّة")
                    .font(.title3.bold())
                    .foregroundStyle(.white)
                Text("لإكمال إعداد مواقيت الصلاة وعرضها هنا")
                    .font(.subheadline)
                    .foregroundStyle(.white.opacity(0.85))
                Spacer(minLength: 0)
            } else {
                HStack(alignment: .firstTextBaseline) {
                    VStack(alignment: .leading, spacing: 2) {
                        Text(entry.gregorianDateText)
                            .font(.caption)
                            .foregroundStyle(.white.opacity(0.85))
                        if let hijri = entry.hijriDateText {
                            Text(hijri)
                                .font(.caption2)
                                .foregroundStyle(SunnahBrandColors.gold.opacity(0.95))
                                .accessibilityLabel("التاريخ الهجري \(hijri)")
                        }
                    }
                    Spacer()
                    if !entry.locationLabel.isEmpty {
                        Text(entry.locationLabel)
                            .font(.caption2)
                            .foregroundStyle(.white.opacity(0.7))
                            .lineLimit(1)
                    }
                }

                HStack {
                    Text(entry.nextLine("التالي:") ?? "مواقيت الصلاة")
                        .font(.title3.bold())
                        .foregroundStyle(.white)
                    Spacer()
                    PrayerCountdownText(entry: entry)
                        .font(.title.monospacedDigit().bold())
                        .foregroundStyle(SunnahBrandColors.gold)
                        .widgetAccentable()
                        .accessibilityLabel("الوقت المتبقي للصلاة التالية")
                }

                PrayerTimelineStrip(slots: entry.slots, currentKey: entry.currentKey, nextKey: entry.nextKey, showTimes: true)
                    .frame(maxHeight: .infinity)

                if entry.dataState == .staleData {
                    Text(PrayerWidgetCopy.stale)
                        .font(.caption2)
                        .foregroundStyle(SunnahBrandColors.gold)
                        .widgetAccentable()
                } else if let updated = entry.lastUpdated {
                    Text("آخر تحديث: \(updated, style: .time)")
                        .font(.caption2)
                        .foregroundStyle(.white.opacity(0.55))
                        .accessibilityLabel("آخر تحديث للمواقيت")
                }
            }
        }
        .padding(16)
        .modifier(SunnahWidgetBackgroundCustom(colors: [
            SunnahBrandColors.emerald, SunnahBrandColors.emeraldDeep, SunnahBrandColors.emeraldDark,
        ]))
    }
}

// MARK: - Lock Screen

struct InlinePrayerWidgetView: View {
    let entry: PrayerWidgetEntry

    var body: some View {
        if entry.needsAppOpenAction {
            Text("افتح سُنّة")
                .accessibilityLabel("افتح تطبيق سُنّة لتهيئة مواقيت الصلاة")
        } else if let name = entry.nextNameAr, !name.isEmpty {
            Text("صلاة \(name)")
                .accessibilityLabel("الصلاة التالية \(name)")
        } else {
            Text("مواقيت الصلاة")
                .accessibilityLabel("مواقيت الصلاة")
        }
    }
}

struct CircularPrayerWidgetView: View {
    let entry: PrayerWidgetEntry

    var body: some View {
        ZStack {
            AccessoryWidgetBackground()
            VStack(spacing: 2) {
                Image(systemName: entry.nextKey?.symbolName ?? "building.columns.fill")
                    .font(.caption)
                    .accessibilityHidden(true)
                if entry.needsAppOpenAction {
                    Text("سُنّة")
                        .font(.caption2.bold())
                } else if entry.clockMode != .none {
                    PrayerLiveClock(mode: entry.clockMode, now: entry.date, live: entry.allowsLiveCountdown)
                        .font(.caption2.bold())
                } else {
                    Text("حدّث")
                        .font(.caption2)
                }
            }
        }
        .accessibilityLabel(circularA11y)
    }

    private var circularA11y: String {
        if entry.needsAppOpenAction {
            return "افتح تطبيق سُنّة لتهيئة مواقيت الصلاة"
        }
        if let elapsed = entry.elapsedNameAr { return "مضى على أذان \(elapsed)" }
        let name = entry.nextNameAr ?? "الصلاة التالية"
        if entry.nextHasStarted { return "حان وقت \(name)" }
        return "العد التنازلي لصلاة \(name)"
    }
}

struct RectangularPrayerWidgetView: View {
    let entry: PrayerWidgetEntry

    var body: some View {
        if entry.needsAppOpenAction {
            VStack(alignment: .leading, spacing: 2) {
                Text("مواقيت الصلاة")
                    .font(.headline)
                    .lineLimit(1)
                Text("افتح سُنّة")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
            .accessibilityLabel("لا توجد مواقيت. افتح تطبيق سُنّة لتهيئة المواقيت.")
        } else {
            HStack {
                VStack(alignment: .leading, spacing: 2) {
                    Text(entry.nextDisplayName ?? "الصلاة التالية")
                        .font(.headline)
                        .lineLimit(1)
                    if let end = entry.nextDate {
                        Text(SunnahWidgetTimeFormatting.clock(end))
                            .font(.caption.monospacedDigit())
                            .foregroundStyle(.secondary)
                    }
                }
                Spacer(minLength: 4)
                PrayerCountdownText(entry: entry)
                    .font(.caption.monospacedDigit())
                    .frame(maxWidth: 64)
            }
            .accessibilityElement(children: .combine)
            .accessibilityLabel(rectA11y)
        }
    }

    private var rectA11y: String {
        if let elapsed = entry.elapsedNameAr { return "مضى على أذان \(elapsed)" }
        let name = entry.nextNameAr ?? "الصلاة التالية"
        if let end = entry.nextDate {
            return "الصلاة التالية \(name) الساعة \(SunnahWidgetTimeFormatting.clock(end))"
        }
        return "الصلاة التالية \(name)"
    }
}

// MARK: - Timeline strip

struct PrayerTimelineStrip: View {
    let slots: [PrayerTimelineSlot]
    let currentKey: PrayerSlotKey?
    let nextKey: PrayerSlotKey?
    var showTimes: Bool = false

    var body: some View {
        if slots.isEmpty {
            Text("لا جدول محفوظ بعد")
                .font(.caption2)
                .foregroundStyle(.white.opacity(0.7))
        } else {
            HStack(spacing: 4) {
                ForEach(slots, id: \.key) { slot in
                    VStack(spacing: 3) {
                        Image(systemName: slot.key.symbolName)
                            .font(.caption2)
                            .foregroundStyle(accent(for: slot.key))
                            .accessibilityHidden(true)
                        Text(slot.key.nameAr)
                            .font(.system(.caption2, design: .rounded).weight(slot.key == nextKey ? .bold : .regular))
                            .foregroundStyle(.white)
                            .lineLimit(1)
                            .minimumScaleFactor(0.7)
                        if showTimes {
                            Text(SunnahWidgetTimeFormatting.clock(slot.date))
                                .font(.system(.caption2, design: .monospaced))
                                .foregroundStyle(.white.opacity(0.75))
                        }
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 4)
                    .background(
                        RoundedRectangle(cornerRadius: 8)
                            .fill(slot.key == nextKey
                                  ? SunnahBrandColors.emerald.opacity(0.45)
                                  : Color.white.opacity(slot.key == currentKey ? 0.12 : 0.04))
                    )
                    .accessibilityLabel("\(slot.key.nameAr) \(SunnahWidgetTimeFormatting.clock(slot.date))\(slot.key == nextKey ? "، الصلاة التالية" : "")")
                }
            }
        }
    }

    private func accent(for key: PrayerSlotKey) -> Color {
        if key == nextKey { return SunnahBrandColors.gold }
        if key == currentKey { return .white }
        return .white.opacity(0.55)
    }
}
