import SwiftUI
import WidgetKit

private let prayerURL = PrayerWidgetDeepLink.prayerTimes

private struct SunnahWidgetBackground: ViewModifier {
    func body(content: Content) -> some View {
        let gradient = LinearGradient(
            colors: [SunnahBrandColors.emerald, SunnahBrandColors.emeraldDark],
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
    }
}

// MARK: - Small

struct SmallPrayerWidgetView: View {
    let entry: PrayerWidgetEntry

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            if entry.snapshot == nil {
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
                }
                .accessibilityLabel(Text(smallA11yLabel))

                Text(entry.nextNameAr.map { "التالي: \($0)" } ?? "—")
                    .font(.subheadline.bold())
                    .foregroundStyle(.white)
                    .lineLimit(1)
                    .minimumScaleFactor(0.8)

                countdownView
                    .font(.title3.monospacedDigit().bold())
                    .foregroundStyle(SunnahBrandColors.gold)
                    .accessibilityLabel(Text(countdownA11y))
            }
            Spacer(minLength: 0)
        }
        .padding(12)
        .modifier(SunnahWidgetBackground())
    }

    private var emptyLabel: some View {
        Text("افتح مواقيت الصلاة")
            .font(.caption.bold())
            .foregroundStyle(.white)
            .accessibilityLabel("لا توجد مواقيت محفوظة. افتح مواقيت الصلاة.")
    }

    @ViewBuilder
    private var countdownView: some View {
        if entry.nextHasStarted {
            Text("الآن")
        } else if let end = entry.nextDate, end > entry.date {
            Text(timerInterval: entry.date...end, countsDown: true)
        } else {
            Text("—")
        }
    }

    private var smallA11yLabel: String {
        let cur = entry.currentNameAr ?? "غير محددة"
        let nxt = entry.nextNameAr ?? "غير محددة"
        return "الصلاة الحالية \(cur). الصلاة التالية \(nxt)."
    }

    private var countdownA11y: String {
        if entry.nextHasStarted { return "حان وقت الصلاة" }
        return "العد التنازلي للصلاة التالية"
    }
}

// MARK: - Medium

struct MediumPrayerWidgetView: View {
    let entry: PrayerWidgetEntry

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                VStack(alignment: .leading, spacing: 2) {
                    Text(entry.currentNameAr.map { "الحالية: \($0)" } ?? "قبل الفجر")
                        .font(.caption.bold())
                        .foregroundStyle(.white.opacity(0.9))
                    Text(entry.nextNameAr.map { "التالية: \($0)" } ?? "—")
                        .font(.headline.bold())
                        .foregroundStyle(.white)
                        .lineLimit(1)
                }
                Spacer()
                Group {
                    if entry.nextHasStarted {
                        Text("الآن")
                    } else if let end = entry.nextDate, end > entry.date {
                        Text(timerInterval: entry.date...end, countsDown: true)
                    } else {
                        Text("—")
                    }
                }
                .font(.title2.monospacedDigit().bold())
                .foregroundStyle(SunnahBrandColors.gold)
                .accessibilityLabel("العد التنازلي")
            }

            PrayerTimelineStrip(slots: entry.slots, currentKey: entry.currentKey, nextKey: entry.nextKey)
                .accessibilityLabel("جدول صلوات اليوم")
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
                Text(entry.nextNameAr.map { "التالي: \($0)" } ?? "مواقيت الصلاة")
                    .font(.title3.bold())
                    .foregroundStyle(.white)
                Spacer()
                Group {
                    if entry.nextHasStarted {
                        Text("الآن")
                    } else if let end = entry.nextDate, end > entry.date {
                        Text(timerInterval: entry.date...end, countsDown: true)
                    } else {
                        Text("—")
                    }
                }
                .font(.title.monospacedDigit().bold())
                .foregroundStyle(SunnahBrandColors.gold)
                .accessibilityLabel("الوقت المتبقي")
            }

            PrayerTimelineStrip(slots: entry.slots, currentKey: entry.currentKey, nextKey: entry.nextKey, showTimes: true)
                .frame(maxHeight: .infinity)

            if let updated = entry.lastUpdated {
                Text("آخر تحديث: \(updated, style: .time)")
                    .font(.caption2)
                    .foregroundStyle(.white.opacity(0.55))
                    .accessibilityLabel("آخر تحديث للمواقيت")
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
        if let name = entry.nextNameAr {
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
                if entry.nextHasStarted {
                    Text("الآن")
                        .font(.caption2.bold())
                } else if let end = entry.nextDate, end > entry.date {
                    Text(timerInterval: entry.date...end, countsDown: true)
                        .font(.caption2.monospacedDigit())
                        .minimumScaleFactor(0.5)
                        .lineLimit(1)
                } else {
                    Text("—")
                        .font(.caption2)
                }
            }
        }
        .accessibilityLabel(circularA11y)
    }

    private var circularA11y: String {
        let name = entry.nextNameAr ?? "الصلاة"
        if entry.nextHasStarted { return "حان وقت \(name)" }
        return "العد التنازلي لصلاة \(name)"
    }
}

struct RectangularPrayerWidgetView: View {
    let entry: PrayerWidgetEntry

    var body: some View {
        HStack {
            VStack(alignment: .leading, spacing: 2) {
                Text(entry.nextNameAr ?? "الصلاة")
                    .font(.headline)
                    .lineLimit(1)
                if let end = entry.nextDate {
                    Text(end, style: .time)
                        .font(.caption.monospacedDigit())
                        .foregroundStyle(.secondary)
                }
            }
            Spacer(minLength: 4)
            if entry.nextHasStarted {
                Text("الآن")
                    .font(.caption.bold())
            } else if let end = entry.nextDate, end > entry.date {
                Text(timerInterval: entry.date...end, countsDown: true)
                    .font(.caption.monospacedDigit())
                    .frame(maxWidth: 52)
            }
        }
        .accessibilityElement(children: .combine)
        .accessibilityLabel(rectA11y)
    }

    private var rectA11y: String {
        let name = entry.nextNameAr ?? "الصلاة"
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
                        Text(slot.key.nameAr)
                            .font(.system(.caption2, design: .rounded).weight(slot.key == nextKey ? .bold : .regular))
                            .foregroundStyle(.white)
                            .lineLimit(1)
                            .minimumScaleFactor(0.7)
                        if showTimes {
                            Text(slot.date, style: .time)
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
                    .accessibilityLabel("\(slot.key.nameAr) \(slot.date.formatted(date: .omitted, time: .shortened))")
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
