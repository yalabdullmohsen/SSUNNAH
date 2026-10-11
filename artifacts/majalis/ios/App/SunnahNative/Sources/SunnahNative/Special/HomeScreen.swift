import SwiftUI
import SunnahPrayer

/// الرئيسية: بطاقة الصلاة القادمة (من محرك المواقيت) + اختصارات.
public struct HomeScreen: View {
    @StateObject private var store = PrayerPreferencesStore()
    @Environment(\.openRoute) private var openRoute

    private static let shortcuts: [(title: String, route: String)] = [
        ("مواقيت الصلاة", "/native/prayer"),
        ("الأذكار", "/native/adhkar")
    ]

    public init() {}

    public var body: some View {
        ScrollView {
            VStack(spacing: Sunnah.Spacing.s4) {
                TimelineView(.periodic(from: .now, by: 1)) { ctx in
                    nextPrayerCard(now: ctx.date)
                }
                ForEach(Self.shortcuts, id: \.route) { item in
                    Button { openRoute(item.route) } label: {
                        SunnahCard { Text(item.title).font(Sunnah.Typography.body).frame(maxWidth: .infinity, alignment: .leading) }
                    }
                    .buttonStyle(.plain)
                }
            }
            .padding(Sunnah.Spacing.s4)
        }
        .environment(\.layoutDirection, .rightToLeft)
    }

    @ViewBuilder
    private func nextPrayerCard(now: Date) -> some View {
        let prefs = store.preferences
        if let next = PrayerCalculator.next(after: now, location: prefs.location, settings: prefs.settings) {
            SunnahCard {
                VStack(spacing: Sunnah.Spacing.s1) {
                    Text("الصلاة القادمة").font(Sunnah.Typography.tag)
                    Text(next.prayer.nameAr).font(Sunnah.Typography.pageTitle)
                    Text(PrayerTimeFormat.countdown(next.time.timeIntervalSince(now)))
                        .font(Sunnah.Typography.body).monospacedDigit()
                }
                .frame(maxWidth: .infinity)
            }
        }
    }
}
