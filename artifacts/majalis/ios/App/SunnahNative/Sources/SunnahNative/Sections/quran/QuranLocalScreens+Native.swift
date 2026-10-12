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
        Section("المقطع") {
            if surahs.isEmpty {
                Stepper("السورة: \(surah)", value: $surah, in: 1...114)
            } else {
                Picker("السورة", selection: $surah) { ForEach(surahs) { Text($0.name).tag($0.id) } }
            }
            Stepper("من الآية: \(from)", value: $from, in: 1...maxAyah)
            Stepper("إلى الآية: \(to)", value: $to, in: from...max(from, maxAyah))
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
                VStack(spacing: Sunnah.Spacing.s4) {
                    EmptyStateView(title: "لا خطط حفظ بعد")
                    SunnahButton("خطة جديدة") { creating = true }.padding(.horizontal, Sunnah.Spacing.pageX)
                }
                .frame(maxHeight: .infinity, alignment: .top)
            } else {
                List {
                    ForEach($plans) { $plan in
                        MemorizationPlanCard(plan: $plan, title: rangeLabel(surahs, plan.surah, plan.ayahFrom, plan.ayahTo)) { save() }
                            .listRowBackground(Sunnah.Colors.surface)
                    }
                }
                .listStyle(.plain).scrollContentBackground(.hidden)
            }
        }
        .background(Sunnah.Colors.bg)
        .toolbar { ToolbarItem(placement: .primaryAction) { Button("خطة جديدة") { creating = true } } }
        .sheet(isPresented: $creating) {
            NavigationStack {
                NewMemorizationPlanForm(surahs: surahs) { plan in plans.insert(plan, at: 0); save(); creating = false }
                    .toolbar { ToolbarItem(placement: .cancellationAction) { Button("إلغاء") { creating = false } } }
            }
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
        Form {
            RangePicker(surahs: surahs, surah: $surah, from: $from, to: $to)
            Section {
                Button("إنشاء الخطة") { onCreate(MemorizationPlan(surah: surah, ayahFrom: from, ayahTo: to, startDate: Date())) }
            }
        }
        .quranTitle("خطة جديدة")
    }
}

// MARK: - /quran/hifz-loop

struct HifzLoopScreen: View {
    var store = QuranLocalStore()
    @State private var loop = HifzLoop()
    @State private var surahs: [MushafSurah] = []

    var body: some View {
        Form {
            RangePicker(surahs: surahs, surah: $loop.surah, from: $loop.ayahFrom, to: $loop.ayahTo)
            Section("التكرار") {
                Stepper("الهدف: \(loop.target) مرة", value: $loop.target, in: 1...200, step: 5)
                ProgressView(value: loop.progress).tint(Sunnah.Colors.primary)
                Text("\(loop.count) من \(loop.target)").font(Sunnah.Typography.cardTitle).foregroundStyle(Sunnah.Colors.textPrimary)
                if loop.reachedTarget {
                    Text("بلغتَ هدف التكرار").font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.primary)
                }
                SunnahButton("تمّت مرة") { loop.tick() }
                Button("تصفير العدّاد", role: .destructive) { loop.reset() }.disabled(loop.count == 0)
            }
            Section {
                Text(rangeLabel(surahs, loop.surah, loop.ayahFrom, loop.ayahTo)).font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.textSecondary)
            }
        }
        .scrollContentBackground(.hidden).background(Sunnah.Colors.bg)
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
        List {
            ForEach(paths) { path in
                Section {
                    ForEach(path.units.sorted { $0.sequence < $1.sequence }) { unit in
                        Button { progress.toggle(path: path.id, unit: unit.id); store.save(progress, .pathUnits) } label: {
                            HStack {
                                Image(systemName: progress.isDone(path: path.id, unit: unit.id) ? "checkmark.circle.fill" : "circle")
                                    .foregroundStyle(Sunnah.Colors.primary)
                                Text(unit.title).font(Sunnah.Typography.body).foregroundStyle(Sunnah.Colors.textPrimary)
                            }
                        }
                        .listRowBackground(Sunnah.Colors.surface)
                    }
                } header: {
                    Text("\(path.title) · \(progress.doneCount(path: path.id, validUnits: Set(path.units.map(\.id)))) من \(path.units.count)")
                }
            }
        }
        .scrollContentBackground(.hidden).background(Sunnah.Colors.bg)
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
            Text(active.isEmpty ? "لا خطط حفظ جارية" : "خطط الحفظ الجارية: \(active.count)")
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

    var body: some View {
        Group {
            if store.bookmarks.isEmpty {
                EmptyStateView(title: "لا علامات بعد").frame(maxHeight: .infinity, alignment: .top)
            } else {
                List(store.bookmarks) { b in
                    SunnahNavigationLink {
                        MushafScreen().onAppear { store.visit(page: b.page) }
                    } label: {
                        SunnahListRow(title: "آية \(b.ayah)", subtitle: "صفحة \(b.page)")
                    }
                    .listRowBackground(Sunnah.Colors.surface)
                }
                .listStyle(.plain).scrollContentBackground(.hidden)
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
        List {
            Section {
                Text("12 نوعًا من اختبارات الحفظ مع نظام المراجعة المتباعدة")
                    .font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.textSecondary)
                    .listRowBackground(Sunnah.Colors.bg)
            }
            Section("اختر نوع الاختبار") {
                ForEach(Array(Self.types.enumerated()), id: \.element.id) { i, t in
                    Button { selected = t.id } label: {
                        HStack {
                            SunnahListRow(title: t.label, subtitle: "نوع \(i + 1) — \(t.desc)")
                            if selected == t.id { Image(systemName: "checkmark").foregroundStyle(Sunnah.Colors.primary) }
                        }
                    }
                    .buttonStyle(.plain)
                    .listRowBackground(Sunnah.Colors.surface)
                }
            }
            Section("اختر السورة") {
                Picker("السورة", selection: $surah) {
                    ForEach(names.keys.sorted(), id: \.self) { n in Text("\(n). \(names[n] ?? "")").tag(n) }
                }
                .listRowBackground(Sunnah.Colors.surface)
            }
        }
        .listStyle(.plain).scrollContentBackground(.hidden)
        .background(Sunnah.Colors.bg)
    }
}
