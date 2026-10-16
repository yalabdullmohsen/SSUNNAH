import SwiftUI
import SunnahWidgetKit

/// الرئيسية: الصلاة التالية بعدّاد حيّ بالحالات الثلاث، التاريخ الهجري، قائمة مواقيت اليوم.
struct PrayerHomeView: View {
    @EnvironmentObject private var store: WatchStore

    var body: some View {
        if let p = store.payload {
            TimelineView(.explicit(PrayerHomeView.entries(p))) { ctx in
                content(p, now: ctx.date)
            }
        } else {
            WatchEmptyState()
        }
    }

    /// نقاط إعادة الرسم: الآن + كل حدّ حالة (أذان وأذان+النافذة)، فيبدّل `Text(timerInterval:)` نفسه بلا إعادة رسم كل ثانية.
    static func entries(_ p: WatchPayload) -> [Date] {
        let now = Date()
        return [now] + PrayerPhase.boundaries(after: now, adhans: p.adhans, window: p.window).prefix(12)
    }

    @ViewBuilder
    private func content(_ p: WatchPayload, now: Date) -> some View {
        let phase = p.phase(at: now)
        ScrollView {
            VStack(spacing: 8) {
                if let h = p.hijriDisplay {
                    Text(h).font(.caption2).foregroundStyle(WatchTheme.gold)
                }
                header(p, phase: phase, now: now)
                VStack(spacing: 0) {
                    ForEach(p.today(now: now).filter(\.isFard)) { pr in
                        row(pr, current: isCurrent(pr, phase: phase), p: p)
                    }
                }
                .background(WatchTheme.raised, in: RoundedRectangle(cornerRadius: 12, style: .continuous))
            }
            .padding(.horizontal, 4)
        }
    }

    private func isCurrent(_ pr: WatchPayload.Prayer, phase: PrayerPhase) -> Bool {
        switch phase {
        case .before(let n): return pr.date == n
        case .inWindow(let a, _, _): return pr.date == a
        case .afterWindow(_, let n): return pr.date == n
        case .none: return false
        }
    }

    @ViewBuilder
    private func header(_ p: WatchPayload, phase: PrayerPhase, now: Date) -> some View {
        switch phase {
        case .before(let next):
            counter(label: "بقي على \(p.prayer(at: next)?.nameAr ?? "")", range: now...next, up: false, urgent: next.timeIntervalSince(now) <= 600)
        case .inWindow(let adhan, let until, _):
            VStack(spacing: 2) {
                Text("حان وقت \(p.prayer(at: adhan)?.nameAr ?? "")").font(.headline).foregroundStyle(WatchTheme.textPrimary)
                counterText("مضى", range: adhan...until, up: true)
            }
        case .afterWindow(let since, let next):
            if let next {
                VStack(spacing: 2) {
                    counter(label: "بقي على \(p.prayer(at: next)?.nameAr ?? "")", range: now...next, up: false, urgent: next.timeIntervalSince(now) <= 600)
                    Text("مضى على \(p.prayer(at: since)?.nameAr ?? "")").font(.caption2).foregroundStyle(WatchTheme.textSecondary)
                }
            } else { WatchEmptyState() }
        case .none:
            WatchEmptyState()
        }
    }

    private func counter(label: String, range: ClosedRange<Date>, up: Bool, urgent: Bool) -> some View {
        VStack(spacing: 0) {
            Text(label).font(.footnote).foregroundStyle(WatchTheme.textSecondary)
            Text(timerInterval: range, countsDown: !up)
                .font(.system(.title2, design: .rounded).monospacedDigit().bold())
                .foregroundStyle(urgent ? WatchTheme.alert : WatchTheme.textPrimary)
                .minimumScaleFactor(0.7)
        }
    }

    private func counterText(_ label: String, range: ClosedRange<Date>, up: Bool) -> some View {
        HStack(spacing: 4) {
            Text(label).font(.footnote).foregroundStyle(WatchTheme.textSecondary)
            Text(timerInterval: range, countsDown: !up)
                .font(.system(.title3, design: .rounded).monospacedDigit().bold())
                .foregroundStyle(WatchTheme.gold)
        }
    }

    private func row(_ pr: WatchPayload.Prayer, current: Bool, p: WatchPayload) -> some View {
        HStack {
            Text(pr.nameAr).font(.footnote.weight(current ? .bold : .regular))
            Spacer()
            Text(pr.date, format: .dateTime.hour().minute().locale(Locale(identifier: "en_US_POSIX")).timeZone(p.timeZone))
                .font(.footnote.monospacedDigit())
        }
        .foregroundStyle(current ? WatchTheme.gold : WatchTheme.textPrimary)
        .padding(.horizontal, 10).padding(.vertical, 6)
        .background(current ? WatchTheme.gold.opacity(0.18) : .clear)
        .accessibilityElement(children: .combine)
    }
}

private extension Date.FormatStyle {
    func timeZone(_ tz: TimeZone) -> Date.FormatStyle { var s = self; s.timeZone = tz; return s }
}
