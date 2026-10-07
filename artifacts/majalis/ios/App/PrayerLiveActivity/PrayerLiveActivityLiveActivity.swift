import ActivityKit
import WidgetKit
import SwiftUI

/// ألوان هوية سُنّة — Shared/SunnahBrandColors (لا ثيم Live Activity منفصل).
private typealias Brand = SunnahBrandColors

private func prayerSymbol(for key: String) -> String {
    switch key.lowercased() {
    case "fajr": return "moon.stars.fill"
    case "dhuhr": return "sun.max.fill"
    case "asr": return "sun.haze.fill"
    case "maghrib": return "sunset.fill"
    case "isha": return "moon.fill"
    default: return "building.columns.fill"
    }
}

private func symbolKey(attributes: PrayerActivityAttributes, state: PrayerActivityAttributes.ContentState) -> String {
    switch state.phase {
    case .completed:
        return state.nextPrayerKey ?? attributes.prayerKey
    case .appLaunch:
        return "launch"
    default:
        return attributes.prayerKey
    }
}

struct PrayerLiveActivityWidget: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: PrayerActivityAttributes.self) { context in
            LockScreenPrayerView(attributes: context.attributes, state: context.state)
                .activityBackgroundTint(Brand.emeraldDark)
                .activitySystemActionForegroundColor(.white)
                .widgetURL(SunnahPrayerDeepLink.prayerTimes)
        } dynamicIsland: { context in
            let state = context.state
            let attrs = context.attributes
            let key = symbolKey(attributes: attrs, state: state)

            return DynamicIsland {
                DynamicIslandExpandedRegion(.leading) {
                    Image(systemName: prayerSymbol(for: key))
                        .font(.title3)
                        .foregroundStyle(Brand.gold)
                        .accessibilityLabel(expandedA11yTitle(state: state))
                }
                DynamicIslandExpandedRegion(.trailing) {
                    trailingExpanded(state: state)
                }
                DynamicIslandExpandedRegion(.center) {
                    Text(centerTitle(state: state))
                        .font(.subheadline.bold())
                        .foregroundStyle(.white)
                        .lineLimit(1)
                        .minimumScaleFactor(0.8)
                }
                DynamicIslandExpandedRegion(.bottom) {
                    bottomExpanded(state: state)
                }
            } compactLeading: {
                Image(systemName: prayerSymbol(for: key))
                    .foregroundStyle(Brand.gold)
                    .accessibilityLabel(compactA11y(state: state))
            } compactTrailing: {
                compactTrailing(state: state)
            } minimal: {
                Image(systemName: prayerSymbol(for: key))
                    .foregroundStyle(Brand.gold)
                    .accessibilityLabel(compactA11y(state: state))
            }
            .widgetURL(SunnahPrayerDeepLink.prayerTimes)
            .keylineTint(Brand.emerald)
        }
    }

    @ViewBuilder
    private func trailingExpanded(state: PrayerActivityAttributes.ContentState) -> some View {
        switch state.phase {
        case .upcoming:
            Text(timerInterval: Date.now...state.prayerTime, countsDown: true)
                .font(.headline.monospacedDigit())
                .foregroundStyle(.white)
                .frame(maxWidth: 72)
                .accessibilityLabel("العد التنازلي للصلاة القادمة")
        case .active:
            // مضى على الأذان: عدّ تصاعدي من لحظة الأذان
            Text(state.prayerTime, style: .timer)
                .font(.headline.monospacedDigit())
                .foregroundStyle(Brand.gold)
                .frame(maxWidth: 72)
                .accessibilityLabel("مضى على أذان \(state.prayerName)")
        case .completed:
            if let end = state.nextPrayerTime, end > Date() {
                Text(timerInterval: Date.now...end, countsDown: true)
                    .font(.headline.monospacedDigit())
                    .foregroundStyle(.white)
                    .frame(maxWidth: 72)
                    .accessibilityLabel("العد التنازلي للصلاة التالية")
            } else {
                Text(state.statusLabel)
                    .font(.headline)
                    .foregroundStyle(.white)
            }
        case .appLaunch:
            Image(systemName: "arrow.up.forward.app")
                .foregroundStyle(Brand.gold)
                .accessibilityLabel("افتح مواقيت الصلاة")
        }
    }

    @ViewBuilder
    private func compactTrailing(state: PrayerActivityAttributes.ContentState) -> some View {
        switch state.phase {
        case .upcoming:
            Text(timerInterval: Date.now...state.prayerTime, countsDown: true)
                .font(.caption2.monospacedDigit())
                .foregroundStyle(.white)
                .frame(maxWidth: 44)
                .accessibilityLabel("العد التنازلي")
        case .active:
            Text(state.prayerTime, style: .timer)
                .font(.caption2.monospacedDigit())
                .foregroundStyle(Brand.gold)
                .frame(maxWidth: 44)
                .accessibilityLabel("مضى على أذان \(state.prayerName)")
        case .completed:
            if let end = state.nextPrayerTime, end > Date() {
                Text(timerInterval: Date.now...end, countsDown: true)
                    .font(.caption2.monospacedDigit())
                    .foregroundStyle(.white)
                    .frame(maxWidth: 44)
            } else {
                Text("✓")
                    .font(.caption2.bold())
                    .foregroundStyle(Brand.gold)
            }
        case .appLaunch:
            Text("افتح")
                .font(.caption2.bold())
                .foregroundStyle(Brand.gold)
                .accessibilityLabel("افتح مواقيت الصلاة")
        }
    }

    private func centerTitle(state: PrayerActivityAttributes.ContentState) -> String {
        switch state.phase {
        case .upcoming, .active:
            return state.prayerName
        case .completed:
            return state.nextPrayerName ?? state.prayerName
        case .appLaunch:
            return "سُنّة"
        }
    }

    @ViewBuilder
    private func bottomExpanded(state: PrayerActivityAttributes.ContentState) -> some View {
        HStack {
            Text(bottomCopy(state: state))
                .font(.caption)
                .foregroundStyle(.white.opacity(0.85))
                .lineLimit(2)
                .minimumScaleFactor(0.85)
            Spacer()
            if !state.locationLabel.isEmpty && state.phase != .appLaunch {
                Text(state.locationLabel)
                    .font(.caption2)
                    .foregroundStyle(.white.opacity(0.6))
                    .lineLimit(1)
            }
        }
        .environment(\.layoutDirection, .rightToLeft)
        .environment(\.locale, Locale(identifier: "ar"))
    }

    private func bottomCopy(state: PrayerActivityAttributes.ContentState) -> String {
        switch state.phase {
        case .upcoming:
            return "أذان \(state.prayerName) — \(state.prayerTime.formatted(date: .omitted, time: .shortened))"
        case .active:
            return "مضى على أذان \(state.prayerName)"
        case .completed:
            if let next = state.nextPrayerName {
                return "اكتملت \(state.prayerName) · التالية \(next)"
            }
            return "اكتملت صلاة \(state.prayerName)"
        case .appLaunch:
            return "افتح مواقيت الصلاة"
        }
    }

    private func expandedA11yTitle(state: PrayerActivityAttributes.ContentState) -> String {
        switch state.phase {
        case .upcoming: return "الصلاة القادمة \(state.prayerName)"
        case .active: return "مضى على أذان \(state.prayerName)"
        case .completed: return "الصلاة التالية \(state.nextPrayerName ?? "")"
        case .appLaunch: return "افتح مواقيت الصلاة"
        }
    }

    private func compactA11y(state: PrayerActivityAttributes.ContentState) -> String {
        expandedA11yTitle(state: state)
    }
}

private struct LockScreenPrayerView: View {
    let attributes: PrayerActivityAttributes
    let state: PrayerActivityAttributes.ContentState

    var body: some View {
        HStack(spacing: 14) {
            ZStack {
                Circle()
                    .fill(Brand.emerald.opacity(0.35))
                    .frame(width: 44, height: 44)
                Image(systemName: prayerSymbol(for: symbolKey(attributes: attributes, state: state)))
                    .font(.title3)
                    .foregroundStyle(Brand.gold)
            }

            VStack(alignment: .leading, spacing: 3) {
                Text(lockTitle)
                    .font(.subheadline.bold())
                    .foregroundStyle(.white)
                    .lineLimit(2)
                    .minimumScaleFactor(0.85)
                    .accessibilityLabel(lockTitle)

                HStack(spacing: 6) {
                    Text(state.statusLabel)
                        .font(.caption.bold())
                        .foregroundStyle(Brand.gold)
                    if state.phase != .appLaunch {
                        Text(lockTimeText)
                            .font(.caption)
                            .foregroundStyle(.white.opacity(0.75))
                    }
                    if !state.locationLabel.isEmpty && state.phase != .appLaunch {
                        Text("•")
                            .foregroundStyle(.white.opacity(0.4))
                        Text(state.locationLabel)
                            .font(.caption)
                            .foregroundStyle(.white.opacity(0.75))
                            .lineLimit(1)
                    }
                }
            }

            Spacer(minLength: 8)

            lockTrailing
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 14)
        .environment(\.layoutDirection, .rightToLeft)
        .environment(\.locale, Locale(identifier: "ar"))
    }

    private var lockTitle: String {
        switch state.phase {
        case .upcoming:
            return "صلاة \(state.prayerName) القادمة"
        case .active:
            return "مضى على أذان \(state.prayerName)"
        case .completed:
            if let next = state.nextPrayerName {
                return "التالية: \(next)"
            }
            return "اكتملت صلاة \(state.prayerName)"
        case .appLaunch:
            return "افتح مواقيت الصلاة"
        }
    }

    private var lockTimeText: String {
        switch state.phase {
        case .completed:
            if let t = state.nextPrayerTime {
                return t.formatted(date: .omitted, time: .shortened)
            }
            return state.prayerTime.formatted(date: .omitted, time: .shortened)
        default:
            return state.prayerTime.formatted(date: .omitted, time: .shortened)
        }
    }

    @ViewBuilder
    private var lockTrailing: some View {
        switch state.phase {
        case .upcoming:
            Text(timerInterval: Date.now...state.prayerTime, countsDown: true)
                .font(.title3.monospacedDigit().bold())
                .foregroundStyle(.white)
                .frame(minWidth: 64, alignment: .trailing)
                .accessibilityLabel("العد التنازلي")
        case .active:
            Text(state.prayerTime, style: .timer)
                .font(.title3.monospacedDigit().bold())
                .foregroundStyle(Brand.gold)
                .frame(minWidth: 64, alignment: .trailing)
                .accessibilityLabel("مضى على أذان \(state.prayerName)")
        case .completed:
            if let end = state.nextPrayerTime, end > Date() {
                Text(timerInterval: Date.now...end, countsDown: true)
                    .font(.title3.monospacedDigit().bold())
                    .foregroundStyle(.white)
                    .frame(minWidth: 64, alignment: .trailing)
                    .accessibilityLabel("العد التنازلي للصلاة التالية")
            } else {
                Text(state.statusLabel)
                    .font(.subheadline.bold())
                    .foregroundStyle(Brand.gold)
            }
        case .appLaunch:
            Image(systemName: "arrow.up.forward.app.fill")
                .font(.title3)
                .foregroundStyle(Brand.gold)
                .accessibilityLabel("افتح مواقيت الصلاة")
        }
    }
}
