import SwiftUI
import SunnahPrayer

/// الرئيسية: الصلاة القادمة (من محرك المواقيت) + الورد اليومي + آخر قراءة + شبكة أقسام التطبيق.
/// لا نص شرعي هنا: عناوين تنقّل فقط، والأرقام من حالة الجهاز المحلية.
public struct HomeScreen: View {
    @StateObject private var store = PrayerPreferencesStore()
    @AppStorage("sunnah.wird.state.v1") private var wirdRaw = ""
    @AppStorage("mushaf.lastPage") private var lastPage = 0
    @Environment(\.openRoute) private var openRoute
    @Environment(\.dynamicTypeSize) private var typeSize
    @State private var daily: HomeDailyContent?

    struct Shortcut: Identifiable { let title: String; let symbol: String; let route: String; var id: String { route } }

    static let shortcuts: [Shortcut] = [
        .init(title: "القرآن", symbol: "book.closed", route: "/quran-hub"),
        .init(title: "الحديث", symbol: "text.book.closed", route: "/hadith"),
        .init(title: "الدروس", symbol: "graduationcap", route: "/lessons"),
        .init(title: "الفقه", symbol: "scalemass", route: "/fiqh"),
        .init(title: "العقيدة", symbol: "sparkles", route: "/tawhid"),
        .init(title: "السيرة", symbol: "moon.stars", route: "/seerah"),
        .init(title: "الأذكار", symbol: "hands.sparkles", route: "/native/adhkar"),
        .init(title: "القبلة", symbol: "location.north.line", route: "/qibla"),
        .init(title: "التقويم", symbol: "calendar", route: "/calendar"),
        .init(title: "الصلاة", symbol: "clock", route: "/prayer-times"),
        .init(title: "الإحصاءات", symbol: "chart.bar", route: "/stats"),
        .init(title: "كل الأقسام", symbol: "square.grid.2x2", route: "/sections")
    ]

    public init() {}

    public var body: some View {
        ScrollView {
            VStack(spacing: Sunnah.Spacing.s5) {
                header
                TimelineView(.periodic(from: .now, by: 1)) { ctx in
                    nextPrayerCard(now: ctx.date)
                }
                wirdCard
                if let daily {
                    ayahCard(daily)
                    hadithCard(daily.hadith)
                }
                if lastPage > 0 { lastReadCard }
                VStack(spacing: Sunnah.Spacing.s3) {
                    SunnahSectionHeader("أقسام التطبيق")
                    LazyVGrid(columns: columns, spacing: Sunnah.Spacing.s3) {
                        ForEach(Self.shortcuts) { item in tile(item) }
                    }
                }
            }
            .padding(Sunnah.Spacing.pageX)
        }
        .background(Sunnah.Colors.bg)
        .environment(\.layoutDirection, .rightToLeft)
        .onAppear { daily = HomeDailyContent.load(on: Date()) }
    }

    private var header: some View {
        VStack(alignment: .leading, spacing: Sunnah.Spacing.s1) {
            Text(Self.greeting(Date())).font(Sunnah.Typography.pageTitle).foregroundStyle(.white)
            Text(Self.hijriDate(Date())).font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.goldSoft)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(Sunnah.Spacing.s5)
        .sunnahMotifCorner(size: 170, alignment: .topLeading, tint: .white, opacity: 0.14).clipped()
        .sunnahPatternedBackground(radius: Sunnah.Radius.hero)
        .accessibilityElement(children: .combine)
        .accessibilityIdentifier("home.header")
    }

    static func greeting(_ d: Date) -> String {
        Calendar.current.component(.hour, from: d) < 12 ? "صباح الخير" : "مساء الخير"
    }

    /// التاريخ الهجري (أم القرى) بأرقام لاتينية.
    static func hijriDate(_ d: Date) -> String {
        let f = DateFormatter()
        f.calendar = Calendar(identifier: .islamicUmmAlQura)
        f.locale = Locale(identifier: "ar-u-nu-latn")
        f.dateFormat = "d MMMM y"
        return f.string(from: d)
    }

    private func ayahCard(_ d: HomeDailyContent) -> some View {
        Button { openRoute("/mushaf") } label: {
            SunnahCard {
                VStack(alignment: .leading, spacing: Sunnah.Spacing.s2) {
                    Label("آية اليوم", systemImage: "book.closed").font(Sunnah.Typography.cardTitle)
                        .foregroundStyle(Sunnah.Colors.textPrimary)
                    Text(d.ayahText).font(Sunnah.Typography.body).foregroundStyle(Sunnah.Colors.textPrimary)
                        .frame(maxWidth: .infinity, alignment: .leading)
                    Text(PrayerTimeFormat.arabicDigits(d.ayah.reference)).font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.textSecondary)
                }
            }
        }
        .buttonStyle(.plain)
        .accessibilityElement(children: .combine)
        .accessibilityIdentifier("home.card.ayah")
    }

    private func hadithCard(_ h: HomeDailyHadith) -> some View {
        Button { openRoute("/hadith") } label: {
            SunnahCard {
                VStack(alignment: .leading, spacing: Sunnah.Spacing.s2) {
                    Label("حديث اليوم", systemImage: "text.book.closed").font(Sunnah.Typography.cardTitle)
                        .foregroundStyle(Sunnah.Colors.textPrimary)
                    Text(h.text).font(Sunnah.Typography.body).foregroundStyle(Sunnah.Colors.textPrimary)
                        .frame(maxWidth: .infinity, alignment: .leading)
                    Text(PrayerTimeFormat.arabicDigits([h.narrator, h.source, h.number].compactMap { $0 }.joined(separator: " — ")))
                        .font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.textSecondary)
                }
            }
        }
        .buttonStyle(.plain)
        .accessibilityElement(children: .combine)
        .accessibilityIdentifier("home.card.hadith")
    }

    private var columns: [GridItem] {
        let n = typeSize.isAccessibilitySize ? 1 : (typeSize >= .xxLarge ? 2 : 3)
        return Array(repeating: GridItem(.flexible(), spacing: Sunnah.Spacing.s3), count: n)
    }

    private func tile(_ item: Shortcut) -> some View {
        Button { openRoute(item.route) } label: {
            VStack(spacing: Sunnah.Spacing.s2) {
                Image(systemName: item.symbol).font(Sunnah.Typography.sectionTitle)
                    .foregroundStyle(Sunnah.Colors.primary).accessibilityHidden(true)
                Text(item.title).font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.textPrimary)
                    .multilineTextAlignment(.center)
            }
            .frame(maxWidth: .infinity, minHeight: 84)
            .padding(Sunnah.Spacing.s3)
            .background(Sunnah.Colors.surface, in: RoundedRectangle(cornerRadius: Sunnah.Radius.card))
            .overlay(RoundedRectangle(cornerRadius: Sunnah.Radius.card).stroke(Sunnah.Colors.surface2, lineWidth: Sunnah.Spacing.hairline))
        }
        .buttonStyle(.plain)
        .accessibilityElement(children: .combine)
        .accessibilityIdentifier("home.tile.\(item.route)")
    }

    @ViewBuilder
    private func nextPrayerCard(now: Date) -> some View {
        let prefs = store.preferences
        if let next = PrayerCalculator.next(after: now, location: prefs.location, settings: prefs.settings) {
            Button { openRoute("/native/prayer") } label: {
                SunnahCard {
                    VStack(spacing: Sunnah.Spacing.s1) {
                        Text("الصلاة القادمة").font(Sunnah.Typography.tag).foregroundStyle(Sunnah.Colors.textSecondary)
                        Text(next.prayer.nameAr).font(Sunnah.Typography.pageTitle).foregroundStyle(Sunnah.Colors.textPrimary)
                        Text(PrayerTimeFormat.countdown(next.time.timeIntervalSince(now)))
                            .font(Sunnah.Typography.body).foregroundStyle(Sunnah.Colors.primary).monospacedDigit()
                    }
                    .frame(maxWidth: .infinity)
                }
            }
            .buttonStyle(.plain)
            .accessibilityElement(children: .combine)
            .accessibilityIdentifier("home.card.prayer")
        } else {
            Button { openRoute("/native/prayer") } label: {
                SunnahCard {
                    SunnahMessageState(symbol: "clock", title: "مواقيت الصلاة",
                                       message: "افتح المواقيت لتحديد موقعك وعرض الصلاة القادمة")
                }
            }
            .buttonStyle(.plain)
            .accessibilityIdentifier("home.card.prayer")
        }
    }

    private var wird: WirdState {
        wirdRaw.data(using: .utf8).flatMap { try? JSONDecoder().decode(WirdState.self, from: $0) } ?? WirdState()
    }

    private var wirdCard: some View {
        let w = wird
        let c = Calendar(identifier: .gregorian).dateComponents([.year, .month, .day], from: Date())
        let today = String(format: "%04d-%02d-%02d", c.year ?? 0, c.month ?? 0, c.day ?? 0)
        let done = w.todayCount(today), goal = max(w.pagesPerDay, 1)
        return Button { openRoute("/native/daily-wird") } label: {
            SunnahCard {
                VStack(alignment: .leading, spacing: Sunnah.Spacing.s2) {
                    HStack {
                        Label("الورد اليومي", systemImage: "book").font(Sunnah.Typography.cardTitle)
                            .foregroundStyle(Sunnah.Colors.textPrimary)
                        Spacer(minLength: Sunnah.Spacing.s2)
                        if w.streak > 0 {
                            Label(ar(w.streak), systemImage: "flame").font(Sunnah.Typography.secondary)
                                .foregroundStyle(Sunnah.Colors.textSecondary)
                        }
                    }
                    ProgressView(value: min(Double(done) / Double(goal), 1)).tint(Sunnah.Colors.primary)
                    Text(done >= goal ? "أكملت وردك لهذا اليوم" : "\(ar(done)) من \(ar(goal)) صفحة")
                        .font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.textSecondary)
                }
            }
        }
        .buttonStyle(.plain)
        .accessibilityElement(children: .combine)
        .accessibilityIdentifier("home.card.wird")
    }

    private var lastReadCard: some View {
        Button { openRoute("/mushaf") } label: {
            SunnahCard {
                HStack(spacing: Sunnah.Spacing.s3) {
                    Image(systemName: "bookmark").font(Sunnah.Typography.sectionTitle)
                        .foregroundStyle(Sunnah.Colors.primary).accessibilityHidden(true)
                    VStack(alignment: .leading, spacing: Sunnah.Spacing.s1) {
                        Text("متابعة القراءة").font(Sunnah.Typography.cardTitle).foregroundStyle(Sunnah.Colors.textPrimary)
                        Text("آخر صفحة: \(ar(lastPage))").font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.textSecondary)
                    }
                    Spacer(minLength: 0)
                }
            }
        }
        .buttonStyle(.plain)
        .accessibilityElement(children: .combine)
        .accessibilityIdentifier("home.card.continue")
    }

    private func ar(_ n: Int) -> String { PrayerTimeFormat.arabicDigits(String(n)) }
}
