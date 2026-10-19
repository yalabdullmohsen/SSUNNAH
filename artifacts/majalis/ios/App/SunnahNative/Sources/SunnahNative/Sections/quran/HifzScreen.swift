import SwiftUI

extension HifzState {
    /// الأخضر محفوظ، الذهبي جزئي، الرمادي غير محفوظ، البرتقالي يحتاج مراجعة.
    var color: Color {
        switch self {
        case .memorized: return Sunnah.Colors.primary
        case .partial: return Sunnah.Colors.gold
        case .review: return Sunnah.Colors.hifzReview
        case .none: return Sunnah.Colors.switchOff
        }
    }
}

private extension Double {
    var pct: String { "\(HifzSummary.percent(self).arabicDigits)٪" }
}

/// شريط نسب مجزّأ (محفوظ/مراجعة/جزئي/متبقٍ) أفقيًا أو عموديًا.
private struct HifzSplit: View {
    let s: HifzSummary
    var vertical = false
    var body: some View {
        GeometryReader { g in
            let len = vertical ? g.size.height : g.size.width
            let parts: [(HifzState, Int)] = [(.memorized, s.memorized), (.review, s.review), (.partial, s.partial), (.none, s.none)]
            let layout = vertical ? AnyLayout(VStackLayout(spacing: 0)) : AnyLayout(HStackLayout(spacing: 0))
            layout {
                ForEach(parts.filter { $0.1 > 0 }, id: \.0) { st, n in
                    Rectangle().fill(st.color).frame(width: vertical ? nil : len * CGFloat(n) / CGFloat(max(1, s.total)),
                                                      height: vertical ? len * CGFloat(n) / CGFloat(max(1, s.total)) : nil)
                }
            }
        }
    }
}

/// هدف تغيير الحالة: نطاق صفحات بعنوان.
struct HifzTarget: Equatable { let title: String; let pages: ClosedRange<Int> }

struct HifzScreen: View {
    @StateObject private var store = HifzProgressStore()
    @State private var index: MushafIndex?
    @State private var tab = UserDefaults.standard.integer(forKey: "snapshotHifzTab")
    @State private var openJuz: Int? = { let j = UserDefaults.standard.integer(forKey: "snapshotHifzJuz"); return j > 0 ? j : nil }()
    @State private var chooser: HifzTarget?
    @State private var openPage: Int?
    @State private var showPage = false
    @State private var rangeFrom = 1
    @State private var rangeTo = 20
    @State private var rangeState: HifzState = .memorized

    var body: some View {
        ZStack(alignment: .bottom) {
            ScrollView {
                VStack(alignment: .leading, spacing: Sunnah.Spacing.s4) {
                    summaryCard
                    legend
                    SunnahSegmented([(id: 0, title: "الأجزاء"), (id: 1, title: "السور"), (id: 2, title: "إحصائيات")], selection: $tab)
                    switch tab {
                    case 1: surahsTab
                    case 2: statsTab
                    default: juzTab
                    }
                    rangeCard
                }
                .padding(.horizontal, Sunnah.Spacing.pageX).padding(.vertical, Sunnah.Spacing.s3)
            }
            .background(Sunnah.Colors.bg)
            if let c = chooser {
                Color.black.opacity(0.35).ignoresSafeArea().onTapGesture { chooser = nil }
                chooserCard(c).padding(.bottom, 96)
            }
        }
        .environment(\.layoutDirection, .rightToLeft)
        .navigationDestination(isPresented: $showPage) { MushafScreen(target: .page(openPage ?? 1)) }
        .task {
            let idx = await Task.detached { try? MushafRepository(bundle: .main)?.index() }.value
            index = idx
            store.migrateIfNeeded(marks: MushafStore().bookmarks, index: idx)
            if UserDefaults.standard.bool(forKey: "snapshotSeedHifz"), store.progress.entries.isEmpty { seed() }
            if UserDefaults.standard.bool(forKey: "snapshotHifzChooser"), let j = idx?.juzStart, !j.isEmpty {
                chooser = HifzTarget(title: "الجزء ٢", pages: HifzProgress.juzPages(2, juzStart: j))
            }
        }
        .quranTitle("حفظي")
    }

    private var p: HifzProgress { store.progress }
    private var juzStart: [Int] { index?.juzStart ?? [] }

    // MARK: ملخص
    private var summaryCard: some View {
        let o = p.overall
        let juzDone = (1...max(1, juzStart.count)).filter { !juzStart.isEmpty && p.juzSummary($0, juzStart: juzStart).derived == .memorized }.count
        return VStack(alignment: .leading, spacing: Sunnah.Spacing.s3) {
            Text("حفظي من المصحف").font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.onHero.opacity(0.85))
            Text("\(o.memorizedFraction.pct) محفوظ").font(Sunnah.Typography.pageTitle).foregroundStyle(Sunnah.Colors.onHero)
                .accessibilityIdentifier("hifz.overall")
            HStack(spacing: Sunnah.Spacing.s3) {
                stat("محفوظ", o.memorizedFraction.pct, .memorized)
                stat("جزئي", o.partialFraction.pct, .partial)
                stat("متبقٍ", o.remainingFraction.pct, .none)
            }
            Text("\(o.memorizedTotal.arabicDigits) من ٦٠٤ صفحة · \(juzDone.arabicDigits) من ٣٠ جزءًا مكتملًا")
                .font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.onHero.opacity(0.9))
        }
        .frame(maxWidth: .infinity, alignment: .leading).padding(Sunnah.Spacing.s5)
        .background(RoundedRectangle(cornerRadius: Sunnah.Radius.hero, style: .continuous).fill(Sunnah.Colors.hero))
        .accessibilityElement(children: .combine)
    }
    private func stat(_ title: String, _ value: String, _ st: HifzState) -> some View {
        VStack(alignment: .leading, spacing: 2) {
            HStack(spacing: 4) { Circle().fill(st == .none ? Sunnah.Colors.onHero.opacity(0.45) : (st == .memorized ? Sunnah.Colors.onHero : Sunnah.Colors.heroGold)).frame(width: 8, height: 8)
                Text(title).font(Sunnah.Typography.tag).foregroundStyle(Sunnah.Colors.onHero.opacity(0.85)) }
            Text(value).font(Sunnah.Typography.cardTitle).foregroundStyle(Sunnah.Colors.onHero)
        }.frame(maxWidth: .infinity, alignment: .leading)
    }

    private var legend: some View {
        HStack(spacing: Sunnah.Spacing.s3) {
            ForEach([HifzState.memorized, .partial, .none, .review]) { st in
                HStack(spacing: 4) {
                    RoundedRectangle(cornerRadius: 3, style: .continuous).fill(st.color).frame(width: 12, height: 12)
                    Text(st.name).font(Sunnah.Typography.tag).foregroundStyle(Sunnah.Colors.textSecondary).lineLimit(1).minimumScaleFactor(0.8)
                }
            }
        }.accessibilityElement(children: .combine).accessibilityIdentifier("hifz.legend")
    }

    // MARK: الأجزاء
    private var juzTab: some View {
        VStack(alignment: .leading, spacing: Sunnah.Spacing.s3) {
            if let j = openJuz, !juzStart.isEmpty { juzDetail(j) }
            else {
                Text("المس جزءًا لعرض صفحاته، واضغط مطوّلًا لتغيير حالته").font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.textSecondary)
                LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: Sunnah.Spacing.s2), count: 5), spacing: Sunnah.Spacing.s2) {
                    ForEach(1...30, id: \.self) { j in juzCell(j) }
                }
            }
        }
    }
    private func juzCell(_ j: Int) -> some View {
        let s = juzStart.isEmpty ? HifzSummary(total: 1, memorized: 0, partial: 0, review: 0) : p.juzSummary(j, juzStart: juzStart)
        return ZStack {
            HifzSplit(s: s, vertical: true)
            Text(j.arabicDigits).font(Sunnah.Typography.cardTitle).foregroundStyle(Sunnah.Colors.textPrimary)
                .padding(.horizontal, 6).padding(.vertical, 2).background(Capsule().fill(Sunnah.Colors.surface.opacity(0.85)))
        }
        .frame(height: 64).clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
        .contentShape(Rectangle())
        .onTapGesture { openJuz = j }
        .onLongPressGesture(minimumDuration: 0.4) { if !juzStart.isEmpty { Sunnah.Haptics.select(); chooser = HifzTarget(title: "الجزء \(j.arabicDigits)", pages: HifzProgress.juzPages(j, juzStart: juzStart)) } }
        .accessibilityElement(children: .ignore)
        .accessibilityLabel("الجزء \(j.arabicDigits)، \(s.memorizedFraction.pct) محفوظ")
        .accessibilityAddTraits(.isButton).accessibilityIdentifier("hifz.juz.\(j)")
    }
    private func juzDetail(_ j: Int) -> some View {
        let r = HifzProgress.juzPages(j, juzStart: juzStart), s = p.juzSummary(j, juzStart: juzStart)
        return VStack(alignment: .leading, spacing: Sunnah.Spacing.s3) {
            HStack {
                Text("الجزء \(j.arabicDigits) · \(s.memorizedFraction.pct) محفوظ").font(Sunnah.Typography.sectionTitle).foregroundStyle(Sunnah.Colors.textPrimary)
                Spacer()
                Button { openJuz = nil } label: { Text("كل الأجزاء").font(Sunnah.Typography.tag).foregroundStyle(Sunnah.Colors.primary).frame(minHeight: Sunnah.Spacing.touch) }
                    .accessibilityIdentifier("hifz.juz.back")
            }
            Text("المس صفحة لفتحها في المصحف، واضغط مطوّلًا لتغيير حالتها").font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.textSecondary)
            LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: Sunnah.Spacing.s2), count: 5), spacing: Sunnah.Spacing.s2) {
                ForEach(Array(r), id: \.self) { n in pageCell(n) }
            }
        }
    }
    private func pageCell(_ n: Int) -> some View {
        let st = p.state(n)
        return Text(n.arabicDigits).font(Sunnah.Typography.cardTitle).foregroundStyle(st == .none ? Sunnah.Colors.textPrimary : Sunnah.Colors.textOnPrimary)
            .frame(maxWidth: .infinity, minHeight: Sunnah.Spacing.touch + 8)
            .background(RoundedRectangle(cornerRadius: 12, style: .continuous).fill(st.color))
            .contentShape(Rectangle())
            .onTapGesture { openPage = n; showPage = true }
            .onLongPressGesture(minimumDuration: 0.4) { Sunnah.Haptics.select(); chooser = HifzTarget(title: "صفحة \(n.arabicDigits)", pages: n...n) }
            .accessibilityElement(children: .ignore).accessibilityLabel("صفحة \(n.arabicDigits)، \(st.name)")
            .accessibilityAddTraits(.isButton).accessibilityIdentifier("hifz.page.\(n)")
    }

    // MARK: السور
    private var surahsTab: some View {
        LazyVStack(spacing: Sunnah.Spacing.s2) {
            ForEach(index?.surahs ?? []) { sr in
                let s = p.surahSummary(sr)
                HStack(spacing: Sunnah.Spacing.s3) {
                    Text(sr.id.arabicDigits).font(Sunnah.Typography.tag).foregroundStyle(Sunnah.Colors.textSecondary).frame(width: 30)
                    VStack(alignment: .leading, spacing: 6) {
                        HStack { Text(sr.name).font(Sunnah.Typography.cardTitle).foregroundStyle(Sunnah.Colors.textPrimary); Spacer()
                            Text(s.memorizedFraction.pct).font(Sunnah.Typography.tag).foregroundStyle(Sunnah.Colors.textSecondary) }
                        HifzSplit(s: s).frame(height: Sunnah.Spacing.progress).clipShape(Capsule())
                    }
                }
                .padding(Sunnah.Spacing.s3).frame(minHeight: Sunnah.Spacing.touch)
                .background(RoundedRectangle(cornerRadius: Sunnah.Radius.small, style: .continuous).fill(Sunnah.Colors.surface))
                .contentShape(Rectangle())
                .onTapGesture { openPage = sr.firstPage; showPage = true }
                .onLongPressGesture(minimumDuration: 0.4) { Sunnah.Haptics.select(); chooser = HifzTarget(title: "سورة \(sr.name)", pages: sr.firstPage...max(sr.firstPage, sr.lastPage)) }
                .accessibilityElement(children: .ignore)
                .accessibilityLabel("سورة \(sr.name)، \(s.memorizedFraction.pct) محفوظ")
                .accessibilityAddTraits(.isButton).accessibilityIdentifier("hifz.surah.\(sr.id)")
            }
        }
    }

    // MARK: الإحصائيات
    private var statsTab: some View {
        let streak = p.streak()
        return VStack(alignment: .leading, spacing: Sunnah.Spacing.s4) {
            SunnahCard {
                HStack {
                    VStack(alignment: .leading, spacing: 4) {
                        Text("التتابع اليومي").font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.textSecondary)
                        Text(streak == 0 ? "ابدأ اليوم" : "\(streak.arabicDigits) \(streak == 1 ? "يوم" : "أيام") متتالية")
                            .font(Sunnah.Typography.sectionTitle).foregroundStyle(Sunnah.Colors.textPrimary)
                    }
                    Spacer()
                    Image(systemName: "flame.fill").font(.system(size: 28)).foregroundStyle(streak == 0 ? Sunnah.Colors.switchOff : Sunnah.Colors.hifzReview)
                }
            }.accessibilityIdentifier("hifz.streak")
            Text("تقدّم كل جزء").font(Sunnah.Typography.sectionTitle).foregroundStyle(Sunnah.Colors.textPrimary)
            LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: Sunnah.Spacing.s3), count: 5), spacing: Sunnah.Spacing.s3) {
                ForEach(1...30, id: \.self) { j in ring(j) }
            }
            Text("أكثر السور حفظًا").font(Sunnah.Typography.sectionTitle).foregroundStyle(Sunnah.Colors.textPrimary)
            let top = p.topSurahs(index?.surahs ?? [])
            if top.isEmpty {
                Text("لم تحدّد سورًا محفوظة بعد").font(Sunnah.Typography.body).foregroundStyle(Sunnah.Colors.textSecondary)
            } else {
                ForEach(top, id: \.surah.id) { t in
                    SunnahCard {
                        VStack(alignment: .leading, spacing: 6) {
                            HStack { Text(t.surah.name).font(Sunnah.Typography.cardTitle).foregroundStyle(Sunnah.Colors.textPrimary); Spacer()
                                Text(t.summary.memorizedFraction.pct).font(Sunnah.Typography.cardTitle).foregroundStyle(Sunnah.Colors.primary) }
                            HifzSplit(s: t.summary).frame(height: Sunnah.Spacing.progress).clipShape(Capsule())
                        }
                    }
                }
            }
        }
    }
    private func ring(_ j: Int) -> some View {
        let f = juzStart.isEmpty ? 0 : p.juzSummary(j, juzStart: juzStart).memorizedFraction
        return ZStack {
            Circle().stroke(Sunnah.Colors.switchOff, lineWidth: 5)
            Circle().trim(from: 0, to: f).stroke(Sunnah.Colors.primary, style: StrokeStyle(lineWidth: 5, lineCap: .round)).rotationEffect(.degrees(90)).scaleEffect(x: -1)
            Text(j.arabicDigits).font(Sunnah.Typography.tag).foregroundStyle(Sunnah.Colors.textPrimary)
        }.aspectRatio(1, contentMode: .fit)
            .accessibilityElement(children: .ignore).accessibilityLabel("الجزء \(j.arabicDigits)، \(f.pct) محفوظ")
    }

    // MARK: تعيين نطاق
    private var rangeCard: some View {
        SunnahCard {
            VStack(alignment: .leading, spacing: Sunnah.Spacing.s3) {
                Text("تعيين حالة لنطاق صفحات").font(Sunnah.Typography.cardTitle).foregroundStyle(Sunnah.Colors.textPrimary)
                stepperRow("من صفحة", $rangeFrom, id: "from")
                stepperRow("إلى صفحة", $rangeTo, id: "to")
                SunnahSegmented(HifzState.allCases.map { (id: $0, title: $0 == .none ? "إزالة" : ($0 == .partial ? "جزئي" : ($0 == .review ? "مراجعة" : "محفوظ"))) }, selection: $rangeState)
                SunnahButton("تطبيق على \((abs(rangeTo - rangeFrom) + 1).arabicDigits) صفحة") {
                    store.set(rangeState, pages: min(rangeFrom, rangeTo)...max(rangeFrom, rangeTo))
                }.accessibilityIdentifier("hifz.range.apply")
            }
        }
    }
    private func stepperRow(_ title: String, _ v: Binding<Int>, id: String) -> some View {
        HStack {
            Text(title).font(Sunnah.Typography.body).foregroundStyle(Sunnah.Colors.textPrimary)
            Spacer()
            roundButton("minus", "إنقاص", id: "hifz.range.\(id).minus") { v.wrappedValue = max(1, v.wrappedValue - 1) }
            Text(v.wrappedValue.arabicDigits).font(Sunnah.Typography.cardTitle).foregroundStyle(Sunnah.Colors.textPrimary).frame(minWidth: 48)
            roundButton("plus", "زيادة", id: "hifz.range.\(id).plus") { v.wrappedValue = min(Mushaf.pageCount, v.wrappedValue + 1) }
        }
    }
    private func roundButton(_ icon: String, _ label: String, id: String, _ action: @escaping () -> Void) -> some View {
        Button { Sunnah.Haptics.select(); action() } label: {
            Image(systemName: icon).font(.system(size: 16, weight: .bold)).foregroundStyle(Sunnah.Colors.primary)
                .frame(width: Sunnah.Spacing.touch, height: Sunnah.Spacing.touch).background(Circle().fill(Sunnah.Colors.primarySoft))
        }.accessibilityLabel(label).accessibilityIdentifier(id)
    }

    // MARK: مُنتقي الحالة (بطاقة مخصّصة بلا مكوّنات نظام)
    private func chooserCard(_ c: HifzTarget) -> some View {
        VStack(spacing: Sunnah.Spacing.s1) {
            Text("حالة الحفظ: \(c.title)").font(Sunnah.Typography.cardTitle).foregroundStyle(Sunnah.Colors.textPrimary)
            ForEach(HifzState.allCases) { st in
                Button {
                    store.set(st, pages: c.pages); chooser = nil
                } label: {
                    HStack(spacing: Sunnah.Spacing.s3) {
                        RoundedRectangle(cornerRadius: 4, style: .continuous).fill(st.color).frame(width: 16, height: 16)
                        Text(st == .none ? "إزالة الحالة" : st.name).font(Sunnah.Typography.body).foregroundStyle(Sunnah.Colors.textPrimary)
                        Spacer()
                    }.frame(minHeight: 44).contentShape(Rectangle())
                }.accessibilityIdentifier("hifz.choose.\(st.rawValue)")
            }
            SunnahButton("إلغاء", style: .outline) { chooser = nil }
        }
        .padding(Sunnah.Spacing.s5)
        .background(RoundedRectangle(cornerRadius: Sunnah.Radius.card, style: .continuous).fill(Sunnah.Colors.surface)
            .shadow(color: .black.opacity(0.18), radius: 16, y: -2))
        .padding(Sunnah.Spacing.pageX)
        .accessibilityElement(children: .contain)
    }

    private func seed() {
        guard !juzStart.isEmpty else { return }
        store.set(.memorized, pages: 1...60)
        store.set(.review, pages: 61...72)
        store.set(.partial, pages: 73...90)
        store.set(.memorized, pages: 582...604)
        store.set(.partial, pages: 300...312)
    }
}

/// اختيار حالة حفظ الصفحة من المصحف (تُعاد الضغطة على الحالة الحالية فتُزيلها).
struct HifzStatePicker: View {
    @ObservedObject var store: HifzProgressStore
    let page: Int
    var body: some View {
        let cur = store.progress.state(page)
        VStack(alignment: .leading, spacing: Sunnah.Spacing.s2) {
            Text("حالة الحفظ لهذه الصفحة").font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.textSecondary)
            HStack(spacing: Sunnah.Spacing.s2) {
                ForEach([HifzState.memorized, .partial, .review]) { st in
                    Button { Sunnah.Haptics.select(); store.set(cur == st ? .none : st, pages: page...page) } label: {
                        HStack(spacing: 4) {
                            Circle().fill(st.color).frame(width: 10, height: 10)
                            Text(st == .partial ? "جزئي" : (st == .review ? "مراجعة" : "محفوظ")).font(Sunnah.Typography.tag)
                                .foregroundStyle(cur == st ? Sunnah.Colors.textOnPrimary : Sunnah.Colors.textPrimary).lineLimit(1).minimumScaleFactor(0.8)
                        }
                        .frame(maxWidth: .infinity, minHeight: Sunnah.Spacing.touch)
                        .background(Capsule().fill(cur == st ? st.color : Sunnah.Colors.primarySoft))
                    }
                    .accessibilityLabel(st.name).accessibilityAddTraits(cur == st ? .isSelected : [])
                    .accessibilityIdentifier("mushaf.hifz.\(st.rawValue)")
                }
            }
        }
    }
}
