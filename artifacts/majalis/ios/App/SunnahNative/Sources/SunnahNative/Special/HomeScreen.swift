import SwiftUI
import SunnahPrayer

/// الرئيسية (النموذج ٢): بطاقة خضراء موحّدة (التحية + التاريخ الهجري + المدينة + الصلاة القادمة + الخط الزمني) ← الورد وأذكار الوقت ← آية اليوم ← حديث اليوم.
/// لا نص شرعي هنا: عناوين تنقّل فقط، والأرقام من حالة الجهاز المحلية.
public struct HomeScreen: View {
    @StateObject private var store = PrayerPreferencesStore()
    @AppStorage("sunnah.wird.state.v1") private var wirdRaw = ""
    @AppStorage("mushaf.lastPage") private var lastPage = 0
    @Environment(\.openRoute) private var openRoute
    @State private var daily: HomeDailyContent?

    struct Shortcut: Identifiable { let title: String; let symbol: String; let route: String; var id: String { route } }

    static let shortcuts: [Shortcut] = [
        .init(title: "القرآن", symbol: "book.closed", route: "/quran-hub"),
        .init(title: "الحديث", symbol: "text.book.closed", route: "/hadith"),
        .init(title: "الأذكار", symbol: "heart.text.square", route: "/native/adhkar"),
        .init(title: "الفقه", symbol: "building.columns", route: "/fiqh"),
        .init(title: "الدروس", symbol: "graduationcap", route: "/lessons"),
        .init(title: "القبلة", symbol: "location.north.line", route: "/qibla"),
        .init(title: "التقويم", symbol: "calendar", route: "/calendar"),
        .init(title: "كل الأقسام", symbol: "square.grid.2x2", route: "/sections")
    ]

    public init() {}

    public var body: some View {
        ScrollView {
            VStack(spacing: Sunnah.Spacing.s4) {
                TimelineView(.periodic(from: .now, by: 1)) { ctx in heroCard(now: ctx.date) }
                shortcutGrid
                HStack(alignment: .top, spacing: Sunnah.Spacing.s3) {
                    wirdCard
                    adhkarCard
                }
                .padding(.horizontal, Sunnah.Spacing.pageX)
                if let daily {
                    ayahCard(daily)
                    hadithCard(daily.hadith)
                }
                if lastPage > 0 { lastReadCard }
                hifzCard
                SunnahContentFooter(title: "الرئيسية", id: "home", section: "الرئيسية", inset: false)
                    .padding(.horizontal, Sunnah.Spacing.pageX)
            }
            .padding(.top, Sunnah.Spacing.s2)
        }
        .background(Sunnah.Colors.bg)
        .sunnahRootChrome()
        .environment(\.layoutDirection, .rightToLeft)
        .task {
            // فك JSON (آية/حديث اليوم + سورة) خارج الخيط الرئيسي كي لا يؤخّر أول إطار
            let date = Date()
            daily = await Task.detached(priority: .userInitiated) { HomeDailyContent.load(on: date) }.value
        }
    }

    static func greeting(_ d: Date) -> String {
        Calendar.current.component(.hour, from: d) < 12 ? "صباح الخير" : "مساء الخير"
    }

    /// «الأحد ٧ جمادى الأولى ١٤٤٨ هـ» (أم القرى، أرقام عربية-هندية).
    static func hijriDate(_ d: Date) -> String {
        let f = DateFormatter()
        f.calendar = Calendar(identifier: .islamicUmmAlQura)
        f.locale = Sunnah.locale
        f.dateFormat = "EEEE d MMMM y"
        return f.string(from: d) + " هـ"
    }

    private func heroCard(now: Date) -> some View {
        let prefs = store.preferences
        let day = PrayerCalculator.times(for: prefs.location, on: now, settings: prefs.settings)
        let next = PrayerCalculator.next(after: now, location: prefs.location, settings: prefs.settings)
        let zone = TimeZone(identifier: prefs.location.timeZoneIdentifier) ?? .current
        let five: [Prayer] = [.fajr, .dhuhr, .asr, .maghrib, .isha]
        return Button { openRoute("/native/prayer") } label: {
            SunnahHeroCard {
                VStack(alignment: .leading, spacing: Sunnah.Spacing.s4) {
                    HStack(alignment: .top) {
                        VStack(alignment: .leading, spacing: 4) {
                            Text(Self.greeting(now)).font(AppearancePrefs.ui(.extraBold, 28, .title)).foregroundStyle(.white)
                            Text(Self.hijriDate(now)).font(AppearancePrefs.ui(.bold, 13, .footnote)).foregroundStyle(Sunnah.Colors.heroGold)
                        }
                        Spacer(minLength: 8)
                        Text(prefs.location.label).font(AppearancePrefs.ui(.bold, 12, .caption)).foregroundStyle(.white)
                            .padding(.horizontal, 12).padding(.vertical, 6)
                            .background(Color.white.opacity(0.18), in: Capsule())
                    }
                    Divider().overlay(Color.white.opacity(0.2))
                    if let next {
                        HStack(alignment: .bottom) {
                            VStack(alignment: .leading, spacing: 2) {
                                Text("الصلاة القادمة").font(AppearancePrefs.ui(.bold, 12, .caption)).foregroundStyle(Sunnah.Colors.heroGold)
                                Text(next.prayer.nameAr).font(AppearancePrefs.ui(.extraBold, 40, .largeTitle)).foregroundStyle(.white)
                            }
                            Spacer(minLength: 8)
                            VStack(alignment: .trailing, spacing: 6) {
                                Text(PrayerTimeFormat.clock(next.time, in: zone)).font(AppearancePrefs.ui(.extraBold, 28, .title)).foregroundStyle(.white)
                                SunnahHeroCapsule(Self.remaining(next.time.timeIntervalSince(now)))
                            }
                        }
                        if let day {
                            SunnahPrayerTimeline(five.map { p in
                                SunnahTimelineItem(id: p.rawValue, name: p.nameAr, time: PrayerTimeFormat.clock(day.time(p), in: zone), active: p == next.prayer)
                            })
                        }
                    } else {
                        Text("افتح المواقيت لتحديد موقعك وعرض الصلاة القادمة").font(AppearancePrefs.ui(.bold, 15, .body)).foregroundStyle(.white)
                    }
                }
            }
        }
        .buttonStyle(.plain).sunnahPressable()
        .accessibilityElement(children: .combine)
        .accessibilityIdentifier("home.card.prayer")
    }

    /// شبكة بلاط الأقسام الأكثر استعمالًا (٤ أعمدة، زاوية ناعمة، ضغط بصري).
    private var shortcutGrid: some View {
        LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: Sunnah.Spacing.s3), count: 4), spacing: Sunnah.Spacing.s3) {
            ForEach(Self.shortcuts) { s in
                Button { openRoute(s.route) } label: {
                    VStack(spacing: 8) {
                        SunnahIconTile(s.symbol, size: 44)
                        Text(s.title).font(AppearancePrefs.ui(.bold, 12, .caption)).foregroundStyle(Sunnah.Colors.textPrimary)
                            .lineLimit(1).minimumScaleFactor(0.8)
                    }
                    .padding(.vertical, 12)
                    .frame(maxWidth: .infinity)
                    .background(Sunnah.Colors.surface, in: RoundedRectangle(cornerRadius: Sunnah.Radius.card, style: .continuous))
                    .overlay(RoundedRectangle(cornerRadius: Sunnah.Radius.card, style: .continuous).stroke(Sunnah.Colors.border, lineWidth: 1))
                }
                .buttonStyle(.plain).sunnahPressable()
                .accessibilityIdentifier("home.shortcut.\(s.id)")
            }
        }
        .padding(.horizontal, Sunnah.Spacing.pageX)
    }

    /// «بعد ٦ س ١٤ د».
    static func remaining(_ interval: TimeInterval) -> String {
        let total = max(0, Int(interval.rounded(.down)))
        let h = total / 3600, m = total % 3600 / 60
        return Sunnah.digits(h > 0 ? "بعد \(h) س \(m) د" : "بعد \(m) د")
    }

    private func ayahCard(_ d: HomeDailyContent) -> some View {
        SunnahHeaderCard(title: "آية اليوم", symbol: "book.closed") {
            Button { openRoute("/mushaf") } label: {
                VStack(alignment: .leading, spacing: Sunnah.Spacing.s3) {
                    SunnahArabicText(d.ayahText, style: .quran).foregroundStyle(Sunnah.Colors.textPrimary)
                    Text(PrayerTimeFormat.arabicDigits(d.ayah.reference)).font(AppearancePrefs.ui(.bold, 12, .caption)).foregroundStyle(Sunnah.Colors.textSecondary)
                }
            }
            .buttonStyle(.plain)
        }
        .accessibilityIdentifier("home.card.ayah")
    }

    private func hadithCard(_ h: HomeDailyHadith) -> some View {
        SunnahHeaderCard(title: "حديث اليوم", symbol: "text.book.closed") {
            Button { openRoute("/hadith") } label: {
                VStack(alignment: .leading, spacing: Sunnah.Spacing.s3) {
                    SunnahArabicText(h.text, style: .amiri).foregroundStyle(Sunnah.Colors.textPrimary)
                    Text(PrayerTimeFormat.arabicDigits([h.narrator, h.source, h.number].compactMap { $0 }.joined(separator: " — ")))
                        .font(AppearancePrefs.ui(.bold, 12, .caption)).foregroundStyle(Sunnah.Colors.textSecondary)
                }
            }
            .buttonStyle(.plain)
        }
        .accessibilityIdentifier("home.card.hadith")
    }

    private var wird: WirdState {
        wirdRaw.data(using: .utf8).flatMap { try? JSONDecoder().decode(WirdState.self, from: $0) } ?? WirdState()
    }

    private func smallCard(title: String, symbol: String, tone: SunnahIconTile.Tone, trailing: String, progress: Double, footer: String, route: String, id: String) -> some View {
        Button { openRoute(route) } label: {
            VStack(alignment: .leading, spacing: Sunnah.Spacing.s3) {
                HStack {
                    SunnahIconTile(symbol, tone: tone, size: 38)
                    Spacer(minLength: 4)
                    Text(trailing).font(AppearancePrefs.ui(.bold, 12, .caption)).foregroundStyle(Sunnah.Colors.textSecondary)
                }
                Text(title).font(AppearancePrefs.ui(.extraBold, 16, .headline)).foregroundStyle(Sunnah.Colors.textPrimary).lineLimit(1).minimumScaleFactor(0.8)
                Capsule().fill(Sunnah.Colors.primarySoft).frame(height: 6)
                    .overlay(alignment: .leading) { GeometryReader { g in Capsule().fill(Sunnah.Colors.primary).frame(width: g.size.width * min(max(progress, 0), 1)) } }
                Text(footer).font(AppearancePrefs.ui(.bold, 12, .caption)).foregroundStyle(Sunnah.Colors.textSecondary)
            }
            .padding(16)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(Sunnah.Colors.surface, in: RoundedRectangle(cornerRadius: Sunnah.Radius.card, style: .continuous))
            .overlay(RoundedRectangle(cornerRadius: Sunnah.Radius.card, style: .continuous).stroke(Sunnah.Colors.border, lineWidth: 1))
        }
        .buttonStyle(.plain).sunnahPressable()
        .accessibilityElement(children: .combine)
        .accessibilityIdentifier(id)
    }

    private var wirdCard: some View {
        let w = wird
        let c = Calendar(identifier: .gregorian).dateComponents([.year, .month, .day], from: Date())
        let today = String(format: "%04d-%02d-%02d", c.year ?? 0, c.month ?? 0, c.day ?? 0)
        let done = w.todayCount(today), goal = max(w.pagesPerDay, 1)
        return smallCard(title: "الورد اليومي", symbol: "book", tone: .mint, trailing: Sunnah.digits("\(done) / \(goal)"),
                         progress: Double(done) / Double(goal),
                         footer: done >= goal ? "أكملت وردك اليوم" : Sunnah.digits("\(goal - done) صفحات متبقية"),
                         route: "/native/daily-wird", id: "home.card.wird")
    }

    private var adhkarCard: some View {
        let morning = Calendar.current.component(.hour, from: Date()) < 12
        return smallCard(title: morning ? "أذكار الصباح" : "أذكار المساء", symbol: morning ? "sun.max" : "moon", tone: .gold,
                         trailing: morning ? "الصباح" : "المساء", progress: 0, footer: "ابدأ ذكرك",
                         route: "/native/adhkar", id: "home.card.adhkar")
    }

    private var lastReadCard: some View {
        Button { openRoute("/mushaf") } label: {
            HStack(spacing: Sunnah.Spacing.s3) {
                SunnahIconTile("bookmark", size: 40)
                VStack(alignment: .leading, spacing: 2) {
                    Text("متابعة القراءة").font(AppearancePrefs.ui(.extraBold, 16, .headline)).foregroundStyle(Sunnah.Colors.textPrimary)
                    Text("آخر صفحة: \(Sunnah.digits(lastPage))").font(AppearancePrefs.ui(.bold, 12, .caption)).foregroundStyle(Sunnah.Colors.textSecondary)
                }
                Spacer(minLength: 0)
            }
            .padding(16)
            .background(Sunnah.Colors.surface, in: RoundedRectangle(cornerRadius: Sunnah.Radius.card, style: .continuous))
            .overlay(RoundedRectangle(cornerRadius: Sunnah.Radius.card, style: .continuous).stroke(Sunnah.Colors.border, lineWidth: 1))
            .padding(.horizontal, Sunnah.Spacing.pageX)
        }
        .buttonStyle(.plain).sunnahPressable()
        .accessibilityElement(children: .combine)
        .accessibilityIdentifier("home.card.continue")
    }

    private var hifzCard: some View {
        Button { openRoute("/quran/my-hifz") } label: {
            HStack(spacing: Sunnah.Spacing.s3) {
                SunnahIconTile("checkmark.seal", size: 40)
                VStack(alignment: .leading, spacing: 2) {
                    Text("حفظي").font(AppearancePrefs.ui(.extraBold, 16, .headline)).foregroundStyle(Sunnah.Colors.textPrimary)
                    Text("خريطة المصحف وإحصائيات الحفظ").font(AppearancePrefs.ui(.bold, 12, .caption)).foregroundStyle(Sunnah.Colors.textSecondary)
                }
                Spacer(minLength: 0)
            }
            .padding(16)
            .background(Sunnah.Colors.surface, in: RoundedRectangle(cornerRadius: Sunnah.Radius.card, style: .continuous))
            .overlay(RoundedRectangle(cornerRadius: Sunnah.Radius.card, style: .continuous).stroke(Sunnah.Colors.border, lineWidth: 1))
            .padding(.horizontal, Sunnah.Spacing.pageX)
        }
        .buttonStyle(.plain).sunnahPressable()
        .accessibilityElement(children: .combine)
        .accessibilityIdentifier("home.card.hifz")
    }
}
