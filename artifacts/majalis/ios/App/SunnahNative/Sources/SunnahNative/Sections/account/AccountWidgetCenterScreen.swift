import SwiftUI
import SunnahPrayer

/// آية اليوم كما في عقد البيانات (`Data/home/daily-ayah.json`) — مجموعة الموقع نفسها.
struct DailyAyahEntry: Decodable, Sendable, Equatable {
    let id: String
    let text: String
    let surah: String
    let ayahNumber: Int
    let reference: String
    let meaning: String

    /// نفس getDayIndex في الموقع: يوم Asia/Kuwait منذ epoch ثم % الطول.
    static func pick(from pool: [DailyAyahEntry], on date: Date) -> DailyAyahEntry? {
        guard !pool.isEmpty else { return nil }
        var cal = Calendar(identifier: .gregorian)
        cal.timeZone = TimeZone(identifier: "Asia/Kuwait") ?? .current
        let c = cal.dateComponents([.year, .month, .day], from: date)
        var utc = Calendar(identifier: .gregorian)
        utc.timeZone = TimeZone(identifier: "UTC") ?? .current
        guard let day = utc.date(from: DateComponents(year: c.year, month: c.month, day: c.day)) else { return nil }
        let index = Int(floor(day.timeIntervalSince1970 / 86_400))
        return pool[((index % pool.count) + pool.count) % pool.count]
    }
}

/// مركز الودجت: الصلاة القادمة وآية اليوم والوِرد داخل التطبيق بالبيانات الفعلية.
struct AccountWidgetCenterScreen: View {
    @StateObject private var store = PrayerPreferencesStore()
    @Environment(\.openRoute) private var openRoute
    @State private var phase: Phase = .loading

    private enum Phase { case loading, ready(DailyAyahEntry), unavailable }

    var body: some View {
        ScrollView {
            VStack(spacing: Sunnah.Spacing.s4) {
                TimelineView(.periodic(from: .now, by: 1)) { ctx in prayerCard(now: ctx.date) }
                ayahCard
                Button { openRoute("/daily-wird") } label: {
                    SunnahCard {
                        HStack {
                            Text("الوِرد اليومي").font(Sunnah.Typography.cardTitle).foregroundStyle(Sunnah.Colors.textPrimary)
                            Spacer()
                            Image(systemName: "chevron.forward").foregroundStyle(Sunnah.Colors.textSecondary)
                        }
                        .frame(minHeight: 44)
                    }
                }
                .buttonStyle(.plain)
            }
            .padding(Sunnah.Spacing.s4)
        }
        .background(Sunnah.Colors.bg)
        .environment(\.layoutDirection, .rightToLeft)
        .navigationTitle("مركز الودجت")
        .task { await load() }
    }

    @ViewBuilder
    private func prayerCard(now: Date) -> some View {
        let prefs = store.preferences
        SunnahCard {
            if let next = PrayerCalculator.next(after: now, location: prefs.location, settings: prefs.settings) {
                VStack(spacing: Sunnah.Spacing.s1) {
                    Text("الصلاة القادمة").font(Sunnah.Typography.tag).foregroundStyle(Sunnah.Colors.textSecondary)
                    Text(next.prayer.nameAr).font(Sunnah.Typography.pageTitle).foregroundStyle(Sunnah.Colors.textPrimary)
                    Text(PrayerTimeFormat.countdown(next.time.timeIntervalSince(now)))
                        .font(Sunnah.Typography.body).monospacedDigit().foregroundStyle(Sunnah.Colors.textPrimary)
                }
                .frame(maxWidth: .infinity)
            } else {
                Text("حدّد موقعك من مواقيت الصلاة لعرض الصلاة القادمة")
                    .font(Sunnah.Typography.body).foregroundStyle(Sunnah.Colors.textSecondary)
            }
        }
    }

    @ViewBuilder
    private var ayahCard: some View {
        switch phase {
        case .loading:
            SunnahCard { ProgressView().frame(maxWidth: .infinity) }
        case .unavailable:
            SunnahCard {
                Text("تعذّر تحميل آية اليوم").font(Sunnah.Typography.body).foregroundStyle(Sunnah.Colors.textSecondary)
            }
        case let .ready(entry):
            SunnahCard {
                VStack(alignment: .leading, spacing: Sunnah.Spacing.s2) {
                    Text("آية اليوم").font(Sunnah.Typography.tag).foregroundStyle(Sunnah.Colors.textSecondary)
                    Text(entry.text).font(Sunnah.Typography.body).foregroundStyle(Sunnah.Colors.textPrimary)
                    Text(entry.reference).font(Sunnah.Typography.tag).foregroundStyle(Sunnah.Colors.textSecondary)
                    Text(entry.meaning).font(Sunnah.Typography.body).foregroundStyle(Sunnah.Colors.textPrimary)
                }
            }
        }
    }

    private func load() async {
        let source = ContentSource.bundled(name: "daily-ayah", subdirectory: "Data/home")
        do {
            let pool: [DailyAyahEntry] = try await ContentLoader().load(from: source)
            if let entry = DailyAyahEntry.pick(from: pool, on: Date()) { phase = .ready(entry) } else { phase = .unavailable }
        } catch { phase = .unavailable }
    }
}
