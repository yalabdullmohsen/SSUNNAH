import SwiftUI

/// سور المصحف (اسم/عدد آيات) لاختيار المقطع؛ فارغة حين لا تتوفر بيانات المصحف (تُستعمل خانات رقمية).
@MainActor func quranSurahList() -> [MushafSurah] {
    (try? MushafRepository(bundle: .main)?.index().surahs) ?? []
}

private struct RangePicker: View {
    let surahs: [MushafSurah]
    @Binding var surah: Int
    @Binding var from: Int
    @Binding var to: Int

    private var maxAyah: Int { surahs.first { $0.id == surah }?.ayahs ?? 286 }

    var body: some View {
        VStack(alignment: .leading, spacing: Sunnah.Spacing.s2) {
            SunnahSectionLabel("المقطع")
            SunnahCard {
                VStack(spacing: Sunnah.Spacing.s3) {
                    if surahs.isEmpty {
                        Stepper("السورة: \(surah)", value: $surah, in: 1...114)
                    } else {
                        SurahChoiceRow(items: surahs.map { SurahChoice(id: $0.id, name: $0.name) }, selection: $surah)
                    }
                    Stepper("من الآية: \(from)", value: $from, in: 1...maxAyah)
                    Stepper("إلى الآية: \(to)", value: $to, in: from...max(from, maxAyah))
                }
            }
        }
        .onChange(of: surah) { _ in from = 1; to = min(to, maxAyah) }
        .onChange(of: from) { v in if to < v { to = v } }
    }
}

private func rangeLabel(_ surahs: [MushafSurah], _ surah: Int, _ a: Int, _ b: Int) -> String {
    let name = surahs.first { $0.id == surah }?.name ?? "سورة \(surah)"
    return a == b ? "\(name) · آية \(a)" : "\(name) · الآيات \(a)–\(b)"
}

// MARK: - /quran/memorization-plans

struct MemorizationPlansScreen: View {
    var store = QuranLocalStore()
    @State private var plans: [MemorizationPlan] = []
    @State private var creating = false
    @State private var surahs: [MushafSurah] = []

    var body: some View {
        Group {
            if plans.isEmpty {
                SunnahInviteState(symbol: "checklist", title: "لا خطط حفظ بعد", message: "اختر سورة ووتيرة المراجعة ونرتّب لك الورد.",
                                  actionTitle: "ابدأ خطة حفظ") { creating = true }
                    .frame(maxHeight: .infinity, alignment: .top)
            } else {
                lScroll {
                    SunnahButton("خطة جديدة") { creating = true }
                    ForEach($plans) { $plan in
                        SunnahCard {
                            MemorizationPlanCard(plan: $plan, title: rangeLabel(surahs, plan.surah, plan.ayahFrom, plan.ayahTo)) { save() }
                        }
                    }
                }
            }
        }
        .background(Sunnah.Colors.bg)
        .navigationDestination(isPresented: $creating) {
            NewMemorizationPlanForm(surahs: surahs) { plan in plans.insert(plan, at: 0); save(); creating = false }
        }
        .onAppear { surahs = quranSurahList(); plans = store.load([MemorizationPlan].self, .plans) ?? [] }
        .quranTitle("خطط الحفظ")
    }

    private func save() { store.save(plans, .plans) }
}

private struct MemorizationPlanCard: View {
    @Binding var plan: MemorizationPlan
    let title: String
    let onChange: () -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: Sunnah.Spacing.s2) {
            HStack {
                Text(title).font(Sunnah.Typography.cardTitle).foregroundStyle(Sunnah.Colors.textPrimary)
                Spacer()
                SunnahChip(plan.statusLabel)
            }
            ProgressView(value: plan.progress).tint(Sunnah.Colors.primary)
            Text("حُفظ \(plan.done) من \(plan.total) آية · \(Int(plan.progress * 100))٪")
                .font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.textSecondary)
            if plan.status == .active {
                Stepper("حفظتُ حتى الآية: \(max(plan.memorizedUpTo, plan.ayahFrom - 1))",
                        value: Binding(get: { max(plan.memorizedUpTo, plan.ayahFrom - 1) },
                                       set: { plan.memorize(upTo: $0); onChange() }),
                        in: (plan.ayahFrom - 1)...plan.ayahTo)
                    .font(Sunnah.Typography.secondary)
            }
            HStack(spacing: Sunnah.Spacing.s4) {
                if plan.status == .active { Button("إيقاف مؤقت") { plan.status = .paused; onChange() } }
                if plan.status == .paused { Button("استئناف") { plan.status = .active; onChange() } }
                if plan.status == .active || plan.status == .paused {
                    Button("إلغاء الخطة", role: .destructive) { plan.status = .cancelled; onChange() }
                }
            }
            .font(Sunnah.Typography.secondary).buttonStyle(.borderless)
        }
        .padding(.vertical, Sunnah.Spacing.s2)
    }
}

private struct NewMemorizationPlanForm: View {
    let surahs: [MushafSurah]
    let onCreate: (MemorizationPlan) -> Void
    @State private var surah = 1
    @State private var from = 1
    @State private var to = 7

    var body: some View {
        lScroll {
            RangePicker(surahs: surahs, surah: $surah, from: $from, to: $to)
            SunnahButton("إنشاء الخطة") { onCreate(MemorizationPlan(surah: surah, ayahFrom: from, ayahTo: to, startDate: Date())) }
        }
        .background(Sunnah.Colors.bg)
        .quranTitle("خطة جديدة")
    }
}

// MARK: - /quran/hifz-loop

struct HifzLoopScreen: View {
    var store = QuranLocalStore()
    @State private var loop = HifzLoop()
    @State private var surahs: [MushafSurah] = []

    var body: some View {
        lScroll {
            RangePicker(surahs: surahs, surah: $loop.surah, from: $loop.ayahFrom, to: $loop.ayahTo)
            SunnahSectionLabel("التكرار")
            SunnahCard {
                VStack(alignment: .leading, spacing: Sunnah.Spacing.s3) {
                    Stepper("الهدف: \(loop.target) مرة", value: $loop.target, in: 1...200, step: 5)
                    ProgressView(value: loop.progress).tint(Sunnah.Colors.primary)
                    Text("\(loop.count) من \(loop.target)".arabicDigits).font(Sunnah.Typography.cardTitle).foregroundStyle(Sunnah.Colors.textPrimary)
                    if loop.reachedTarget {
                        Text("بلغتَ هدف التكرار").font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.primary)
                    }
                    SunnahButton("تمّت مرة") { loop.tick() }
                    Button("تصفير العدّاد", role: .destructive) { loop.reset() }.disabled(loop.count == 0)
                }
            }
            Text(rangeLabel(surahs, loop.surah, loop.ayahFrom, loop.ayahTo)).font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.textSecondary)
        }
        .background(Sunnah.Colors.bg)
        .onAppear { surahs = quranSurahList(); loop = store.load(HifzLoop.self, .loop) ?? HifzLoop() }
        .onChange(of: loop) { store.save($0, .loop) }
        .quranTitle("تكرار الحفظ")
    }
}

// MARK: - /hifz-path/my

struct MyHifzPathsView: View {
    let paths: [HifzPath]
    var store = QuranLocalStore()
    @State private var progress = HifzPathProgress()

    var body: some View {
        lScroll {
            ForEach(paths) { path in
                SunnahSectionLabel("\(path.title): \(progress.doneCount(path: path.id, validUnits: Set(path.units.map(\.id)))) من \(path.units.count)".arabicDigits)
                ForEach(path.units.sorted { $0.sequence < $1.sequence }) { unit in
                  SunnahCard {
                    Button { progress.toggle(path: path.id, unit: unit.id); store.save(progress, .pathUnits) } label: {
                        HStack {
                            Image(systemName: progress.isDone(path: path.id, unit: unit.id) ? "checkmark.circle.fill" : "circle")
                                .foregroundStyle(Sunnah.Colors.primary)
                            Text(unit.title).font(Sunnah.Typography.body).foregroundStyle(Sunnah.Colors.textPrimary)
                            Spacer()
                        }
                    }
                    .buttonStyle(.plain)
                  }
                }
            }
        }
        .background(Sunnah.Colors.bg)
        .onAppear { progress = store.load(HifzPathProgress.self, .pathUnits) ?? HifzPathProgress() }
    }
}

// MARK: - /memorization

struct MemorizationHubView: View {
    var store = QuranLocalStore()
    @State private var plans: [MemorizationPlan] = []

    var body: some View {
        VStack(spacing: 0) {
            let active = plans.filter { $0.status == .active }
            Text(active.isEmpty ? "لا خطط حفظ جارية" : "خطط الحفظ الجارية: \(active.count)".arabicDigits)
                .font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.textSecondary)
                .frame(maxWidth: .infinity, alignment: .leading).padding(Sunnah.Spacing.pageX)
            SectionsListTemplate(links: QuranLinks.memorization)
        }
        .background(Sunnah.Colors.bg)
        .onAppear { plans = store.load([MemorizationPlan].self, .plans) ?? [] }
    }
}

// MARK: - /mushaf/bookmarks

/// علامات المصحف المحفوظة محليًا؛ الضغط يفتح المصحف على صفحة العلامة (لا تغيير في النص أو الصفحات).
struct MushafBookmarksScreen: View {
    @StateObject private var store = MushafStore()
    @Environment(\.openRoute) private var openRoute

    var body: some View {
        Group {
            if store.bookmarks.isEmpty {
                SunnahInviteState(symbol: "bookmark", title: "لا علامات بعد", message: "ضع علامة على أي صفحة لتعود إليها بسرعة.",
                                  actionTitle: "أضف علامة من المصحف") { openRoute("/mushaf") }
                    .frame(maxHeight: .infinity, alignment: .top)
            } else {
                lScroll {
                    SunnahNavTileGrid(store.bookmarks, idPrefix: "bookmark", padded: false, tile: { b in
                        SunnahTileItem(id: "\(b.id)", title: "آية \(b.ayah)", subtitle: "صفحة \(b.page)", symbol: "bookmark.fill")
                    }) { b in
                        MushafScreen().onAppear { store.visit(page: b.page) }
                    }
                }
            }
        }
        .background(Sunnah.Colors.bg)
        .quranTitle("علامات المصحف")
    }
}

// MARK: - /quran-memorization

/// اختبارات الحفظ: أنواع الاختبار الاثنا عشر كما في الموقع (نصوص `quran-memorization.ts` حرفيًا) واختيار السورة.
struct QuranMemorizationView: View {
    static let types: [(id: String, label: String, desc: String)] = [
        ("complete-ayah", "أكمل الآية", "أكمل النص الناقص من الآية الكريمة"),
        ("which-surah", "حدّد السورة", "حدّد اسم السورة التي تنتمي إليها هذه الآية"),
        ("next-ayah", "الآية التالية", "ما الآية التي تلي هذه الآية مباشرةً؟"),
        ("prev-ayah", "الآية السابقة", "ما الآية التي تسبق هذه الآية مباشرةً؟"),
        ("fill-blank", "أكمل الفراغ", "أكمل الكلمة المحذوفة من الآية الكريمة"),
        ("ayah-number", "رقم الآية", "ما رقم هذه الآية في سورتها؟"),
        ("surah-type", "مكية أم مدنية؟", "هل هذه السورة مكية أم مدنية؟"),
        ("juz-number", "رقم الجزء", "في أي جزء من أجزاء القرآن تقع هذه الآية؟"),
        ("multiple-choice", "اختيار من متعدد", "اختر تكملة الآية الصحيحة من بين الخيارات"),
        ("surah-count", "عدد آيات السورة", "كم عدد آيات هذه السورة الكريمة؟"),
        ("order-ayahs", "ترتيب الآيات", "رتّب هذه الآيات حسب ورودها في القرآن الكريم"),
        ("first-word", "أول كلمة في الآية", "ما أول كلمة في هذه الآية الكريمة؟"),
    ]
    @State private var selected = "complete-ayah"
    @State private var surah = 1
    private let names = QuranSection.surahNames()

    var body: some View {
        lScroll {
            Text("12 نوعًا من اختبارات الحفظ مع نظام المراجعة المتباعدة")
                .font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.textSecondary)
                .frame(maxWidth: .infinity, alignment: .leading)
            SunnahSectionLabel("اختر نوع الاختبار")
            ForEach(Self.types.enumerated().map { LType(index: $0.offset, t: $0.element) }) { x in
                SunnahCard {
                    Button { selected = x.t.id } label: {
                        HStack {
                            SunnahListRow(title: x.t.label, subtitle: "نوع \(x.index + 1) — \(x.t.desc)")
                            if selected == x.t.id { Image(systemName: "checkmark").foregroundStyle(Sunnah.Colors.primary) }
                        }
                    }
                    .buttonStyle(.plain)
                }
            }
            SunnahSectionLabel("اختر السورة")
            SunnahCard {
                SurahChoiceRow(items: names.keys.sorted().map { SurahChoice(id: $0, name: "\($0). \(names[$0] ?? "")") }, selection: $surah)
            }
        }
        .background(Sunnah.Colors.bg)
    }
}

private struct LType: Identifiable {
    let index: Int; let t: (id: String, label: String, desc: String)
    var id: String { t.id }
}

private struct SurahChoice: Identifiable { let id: Int; let name: String }

private func lScroll<C: View>(@ViewBuilder _ content: () -> C) -> some View {
    ScrollView { LazyVStack(alignment: .leading, spacing: Sunnah.Spacing.s4) { content() }.padding(.horizontal, Sunnah.Spacing.s4) }
        .background(Sunnah.Colors.bg)
}

/// اختيار السورة بصفحة كاملة (بدل Picker/قائمة منسدلة النظام).
private struct SurahChoiceRow: View {
    let items: [SurahChoice]
    @Binding var selection: Int
    var body: some View {
        SunnahNavigationLink { SurahChoicePage(items: items, selection: $selection) } label: {
            SunnahListRow(title: "السورة", subtitle: items.first { $0.id == selection }?.name)
        }
    }
}

private struct SurahChoicePage: View {
    let items: [SurahChoice]
    @Binding var selection: Int
    @Environment(\.dismiss) private var dismiss
    var body: some View {
        lScroll {
            ForEach(items) { it in
                SunnahCard {
                    Button { selection = it.id; dismiss() } label: {
                        HStack {
                            Text(it.name).font(Sunnah.Typography.body).foregroundStyle(Sunnah.Colors.textPrimary)
                            Spacer()
                            if selection == it.id { Image(systemName: "checkmark").foregroundStyle(Sunnah.Colors.primary) }
                        }
                    }
                    .buttonStyle(.plain)
                }
            }
        }
        .quranTitle("اختر السورة")
    }
}
