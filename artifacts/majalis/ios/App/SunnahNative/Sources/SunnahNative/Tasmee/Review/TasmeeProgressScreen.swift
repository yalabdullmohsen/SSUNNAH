import SwiftUI

/// متابعة التسميع: السلسلة، مراجعة الضعيف المستحقة، الأهداف، سجل الأخطاء، خريطة السور (قوية/تحتاج مراجعة).
public struct TasmeeProgressScreen: View {
    @ObservedObject var store: TasmeeHistoryStore
    let surahName: (Int) -> String
    let onReview: ([TasmeeReviewItem]) -> Void
    let now: Date

    public init(store: TasmeeHistoryStore, now: Date = Date(), surahName: @escaping (Int) -> String,
                onReview: @escaping ([TasmeeReviewItem]) -> Void) {
        self.store = store; self.now = now; self.surahName = surahName; self.onReview = onReview
    }

    public var body: some View {
        SunnahPage("متابعة التسميع") { content }
    }

    @ViewBuilder var content: some View {
        summaryCard
        reviewCard
        goalsCard
        errorLogCard
        mapCard
    }

    private func section<C: View>(_ title: String, @ViewBuilder _ content: () -> C) -> some View {
        SunnahCard {
            VStack(alignment: .leading, spacing: 12) {
                Text(title).font(AppearancePrefs.ui(.extraBold, 17, .headline)).foregroundStyle(Sunnah.Colors.textPrimary)
                    .accessibilityAddTraits(.isHeader)
                content()
            }
        }
        .padding(.horizontal, Sunnah.Spacing.pageX)
    }

    private var summaryCard: some View {
        let avg = store.sessions.isEmpty ? 0 : store.sessions.map(\.accuracy).reduce(0, +) / Double(store.sessions.count)
        return section("الإحصاءات") {
            HStack(alignment: .top) {
                SunnahStatCell(store.streak(now: now).arabicDigits, "أيام متتالية")
                SunnahStatCell(store.sessions.count.arabicDigits, "جلسات")
                SunnahStatCell("\(Int((avg * 100).rounded()).arabicDigits)٪", "متوسط الصحة")
            }
        }
    }

    private var reviewCard: some View {
        let due = store.dueReview(now: now)
        return section("مراجعة الضعيف") {
            if due.isEmpty {
                Text("لا آيات مستحقة للمراجعة الآن.").font(AppearancePrefs.ui(.regular, 15, .body)).foregroundStyle(Sunnah.Colors.textSecondary)
            } else {
                Text("\(TasmeeProgressFormat.ayahs(due.count)) مستحقة").font(AppearancePrefs.ui(.bold, 15, .body)).foregroundStyle(Sunnah.Colors.textPrimary) // digits-ok: ayahs() يحوّل العدد إلى أرقام عربية داخليًا
                ForEach(Array(due.prefix(5)), id: \.id) { i in
                    Text("\(surahName(i.surah)) · \(i.ayah.arabicDigits)").font(AppearancePrefs.ui(.regular, 15, .body))
                        .foregroundStyle(Sunnah.Colors.textSecondary)
                }
                SunnahButton("ابدأ المراجعة") { onReview(due) }
            }
        }
    }

    private var goalsCard: some View {
        section("الأهداف") {
            if store.goals.isEmpty {
                Text("لم تضف أهدافًا بعد، مثل «الكهف كل جمعة».").font(AppearancePrefs.ui(.regular, 15, .body)).foregroundStyle(Sunnah.Colors.textSecondary)
            }
            ForEach(store.goals) { g in
                let met = g.isMet(on: now, sessions: store.sessions)
                HStack {
                    Image(systemName: met ? "checkmark.circle.fill" : "circle").foregroundStyle(met ? Sunnah.Colors.primary : Sunnah.Colors.textSecondary)
                    Text(TasmeeProgressFormat.goalTitle(g, surahName: surahName)).font(AppearancePrefs.ui(.regular, 15, .body))
                        .foregroundStyle(Sunnah.Colors.textPrimary)
                    Spacer(minLength: 0)
                    if g.isDue(on: now) && !met { SunnahChip("اليوم", selected: true) }
                }
                .accessibilityElement(children: .combine)
                .accessibilityValue(met ? "منجز" : "غير منجز")
            }
        }
    }

    private var errorLogCard: some View {
        let log = store.errorLog(limit: 8)
        return section("سجل الأخطاء") {
            if log.isEmpty {
                Text("لا أخطاء مسجّلة.").font(AppearancePrefs.ui(.regular, 15, .body)).foregroundStyle(Sunnah.Colors.textSecondary)
            }
            ForEach(Array(log.enumerated()), id: \.offset) { _, e in
                HStack {
                    Text("\(surahName(e.surah)) · \(e.ayah.arabicDigits)").font(AppearancePrefs.ui(.regular, 15, .body))
                        .foregroundStyle(Sunnah.Colors.textPrimary)
                    Spacer(minLength: 0)
                    Text(TasmeeProgressFormat.times(e.count)).font(AppearancePrefs.ui(.bold, 13, .caption)).foregroundStyle(Sunnah.Colors.danger)
                }
                .accessibilityElement(children: .combine)
            }
        }
    }

    private var mapCard: some View {
        section("خريطة السور") {
            let cols = [GridItem(.adaptive(minimum: 44), spacing: 8)]
            LazyVGrid(columns: cols, spacing: 8) {
                ForEach(1...114, id: \.self) { s in
                    let st = store.strength(ofSurah: s)
                    Text(s.arabicDigits).font(AppearancePrefs.ui(.bold, 13, .caption)).lineLimit(1).minimumScaleFactor(0.6)
                        .foregroundStyle(TasmeeProgressFormat.ink(st))
                        .frame(maxWidth: .infinity, minHeight: 36)
                        .background(Sunnah.Colors.surface2, in: RoundedRectangle(cornerRadius: 10, style: .continuous))
                        .overlay(RoundedRectangle(cornerRadius: 10, style: .continuous)
                            .stroke(TasmeeProgressFormat.fill(st), lineWidth: st == .untouched ? 0 : 2))
                        .accessibilityLabel("\(surahName(s)): \(TasmeeProgressFormat.label(st))")
                }
            }
            HStack(spacing: 12) {
                ForEach([SurahStrength.strong, .needsReview, .untouched], id: \.self) { st in
                    HStack(spacing: 4) {
                        RoundedRectangle(cornerRadius: 3).stroke(TasmeeProgressFormat.fill(st), lineWidth: st == .untouched ? 0 : 2)
                            .background(Sunnah.Colors.surface2, in: RoundedRectangle(cornerRadius: 3)).frame(width: 14, height: 14)
                        Text(TasmeeProgressFormat.label(st)).font(AppearancePrefs.ui(.regular, 13, .caption)).foregroundStyle(Sunnah.Colors.textSecondary)
                    }
                }
            }
        }
    }
}

public enum TasmeeProgressFormat {
    public static func label(_ s: SurahStrength) -> String {
        switch s { case .strong: return "قوية"; case .needsReview: return "تحتاج مراجعة"; case .untouched: return "لم تُسمَّع" }
    }
    static func fill(_ s: SurahStrength) -> Color {
        switch s { case .strong: return Sunnah.Colors.primary; case .needsReview: return Sunnah.Colors.hifzReview; case .untouched: return Sunnah.Colors.border }
    }
    static func ink(_ s: SurahStrength) -> Color {
        switch s { case .strong: return Sunnah.Colors.primary; case .needsReview: return Sunnah.Colors.hifzReview; case .untouched: return Sunnah.Colors.textSecondary }
    }
    public static func goalTitle(_ g: TasmeeGoal, surahName: (Int) -> String) -> String {
        switch g.kind {
        case .surahWeekly:
            let day = g.weekday.flatMap { (1...7).contains($0) ? weekdays[$0 - 1] : nil } ?? ""
            guard let sn = g.surah else { return "ورد أسبوعي" }
            return "\(surahName(sn)) كل يوم \(day)"
        case .juzReview: return g.juz.map { "مراجعة الجزء \($0.arabicDigits)" } ?? "مراجعة جزء"
        case .dailyAyahs: return "\(ayahs(g.dailyAyahs ?? 0)) يوميًا"
        }
    }
    static let weekdays = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"]

    /// عدّ بصيغة المفرد/المثنى/الجمع العربية عبر `ArabicCount` (يعتبر آخر رقمين: «١٠٣ آيات» لا «١٠٣ آية»).
    static func counted(_ n: Int, one: String, two: String, few: String, many: String) -> String {
        ArabicCount.label(n, one: one, two: two, few: few, many: many, genitive: many)
    }
    public static func ayahs(_ n: Int) -> String { counted(n, one: "آية واحدة", two: "آيتان", few: "آيات", many: "آية") }
    public static func times(_ n: Int) -> String { counted(n, one: "مرة واحدة", two: "مرتان", few: "مرات", many: "مرة") }
}
