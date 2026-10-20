import SwiftUI

/// تحميل ملف محزوم؛ غيابه أو فراغه = «قيد التوثيق».
struct QuranBundledLoader<T: Decodable & Sendable, V: View>: View {
    let name: String
    let isEmpty: (T) -> Bool
    @ViewBuilder let content: (T) -> V
    @Environment(\.contentLoader) private var loader
    @State private var phase: Phase = .loading

    private enum Phase { case loading, failed, unavailable, ready(T) }

    var body: some View {
        Group {
            switch phase {
            case .loading: LoadingStateView()
            case .failed: ErrorStateView { Task { await load() } }
            case .unavailable: EmptyStateView(title: QuranSection.pendingTitle)
            case .ready(let v): content(v)
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Sunnah.Colors.bg)
        .task(id: name) { await load() }
    }

    private func load() async {
        phase = .loading
        do {
            let v = try await loader.load(T.self, from: PublishedData.file(name))
            phase = isEmpty(v) ? .unavailable : .ready(v)
        } catch ContentError.missingBundledFile { phase = .unavailable }
        catch { phase = .failed }
    }
}

/// شاشة نصية بعنوان وفقرات ومصدر.
struct QuranDocView: View {
    let title: String
    var paragraphs: [String] = []
    var sections: [(title: String, lines: [String])] = []
    var sources: [String] = []
    /// معرّف المحتوى للإبلاغ عن خطأ (يُظهر الزر أسفل الصفحة)؛ nil لشاشات الأدوات.
    var reportID: String? = nil
    var reportSection = ""

    var body: some View {
        ScrollView {
            VStack(spacing: 0) {
            DetailHero(title: title)
            VStack(alignment: .leading, spacing: Sunnah.Spacing.s4) {
                if !paragraphs.isEmpty { SunnahSectionedMarkdown((paragraphs + (sources.isEmpty ? [] : ["المصدر: " + sources.joined(separator: "؛ ")])).joined(separator: "\n\n"), key: "doc-\(title)", style: .body) }
                ForEach(sections, id: \.title) { s in
                    Text(s.title).font(Sunnah.Typography.sectionTitle).foregroundStyle(Sunnah.Colors.textPrimary)
                    ForEach(s.lines, id: \.self) { Text($0).font(Sunnah.Typography.body).foregroundStyle(Sunnah.Colors.textPrimary) }
                }
                if !sources.isEmpty && paragraphs.isEmpty {
                    Text("المصدر").font(Sunnah.Typography.sectionTitle).foregroundStyle(Sunnah.Colors.textPrimary)
                    ForEach(sources, id: \.self) { Text($0).font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.textSecondary) }
                }
            }
            .padding(Sunnah.Spacing.s4).frame(maxWidth: .infinity, alignment: .leading)
            if let reportID { SunnahContentFooter(title: title, id: reportID, section: reportSection) }
            }
        }
        .background(Sunnah.Colors.bg)
        .environment(\.layoutDirection, .rightToLeft)
    }
}

struct TajweedListView: View {
    let file: TajweedFile
    var body: some View {
        qScroll {
            if let i = file.intro {
                SunnahGroupedCard([QItem(id: "intro")]) { _ in
                    SunnahNavigationLink { QuranDocView(title: i.title, paragraphs: i.paragraphs, sources: [i.source]) } label: { SunnahListRow(title: i.title, subtitle: nil) }
                }
            }
            SunnahGroupedCard(file.chapters) { c in
                SunnahNavigationLink { TajweedChapterView(chapter: c) } label: { SunnahListRow(title: c.title, subtitle: c.summary) }
            }
        }
    }
}

struct TajweedChapterView: View {
    let chapter: TajweedChapter
    var surahNames: [Int: String] = QuranSection.surahNames()
    var body: some View {
        let ex = chapter.examples.map { e -> String in
            let ref = PublishedAdapters.ayahText(surah: e.surah, ayah: e.ayah) { surahNames[$0] ?? "سورة \($0)" }.arabicDigits
            return [e.text, e.note, "(\(ref))"].compactMap { $0 }.joined(separator: " — ")
        }
        QuranDocView(title: chapter.title, paragraphs: [chapter.summary] + chapter.body,
                     sections: ex.isEmpty ? [] : [("أمثلة", ex)] + (chapter.quizHint.map { [("سؤال مراجعة", [$0])] } ?? []),
                     sources: [chapter.source])
    }
}

struct SurahStoriesListView: View {
    let stories: [SurahStory]
    var body: some View {
        qScroll {
            SunnahNavTileGrid(stories, idPrefix: "surah-story", padded: false, tile: { s in
                SunnahTileItem(id: "\(s.number)", title: "\(s.number). \(s.name)", subtitle: s.revelationPlace, symbol: "book.closed")
            }) { SurahStoryView(story: $0) }
        }
    }
}

struct SurahStoryView: View {
    let story: SurahStory
    var body: some View {
        var secs: [(title: String, lines: [String])] = []
        if let n = story.namingReason { secs.append(("سبب التسمية", [n])) }
        if !story.mainThemes.isEmpty { secs.append(("المحاور", story.mainThemes)) }
        if !story.mainStories.isEmpty { secs.append(("القصص", story.mainStories)) }
        if !story.lessons.isEmpty { secs.append(("الدروس", story.lessons)) }
        if let v = story.virtues { secs.append(("الفضل", [v])) }
        return QuranDocView(title: "سورة \(story.name)", paragraphs: ["\(story.revelationPlace) — \(story.ayahCount) آية"], sections: secs, sources: [story.source])
    }
}

struct HifzPathsListView: View {
    let paths: [HifzPath]
    var body: some View {
        qScroll {
            ForEach(PublishedAdapters.hifzByCategory(paths), id: \.title) { g in
                SunnahSectionLabel(g.title)
                SunnahGroupedCard(g.paths) { p in
                    SunnahNavigationLink { HifzPathView(path: p) } label: { SunnahListRow(title: p.title, subtitle: p.shortDescription) }
                }
            }
        }
    }
}

struct HifzPathView: View {
    let path: HifzPath
    var surahNames: [Int: String] = QuranSection.surahNames()
    private func unitSubtitle(_ u: HifzUnit) -> String? {
        var parts: [String] = []
        if let r = u.ref { parts.append(PublishedAdapters.refText(r) { surahNames[$0] ?? "سورة \($0)" }.arabicDigits) }
        if let n = u.repetitionTarget { parts.append("التكرار المقترح: \(n)") }
        return parts.isEmpty ? nil : parts.joined(separator: " · ")
    }
    var body: some View {
        qScroll {
            SunnahCard {
                VStack(alignment: .leading, spacing: Sunnah.Spacing.s2) {
                    if let d = path.shortDescription { Text(d).font(Sunnah.Typography.body).foregroundStyle(Sunnah.Colors.textPrimary) }
                    Text("المستوى: \(PublishedAdapters.hifzLevels[path.level] ?? path.level) · \(path.units.count) وحدة".arabicDigits)
                        .font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.textSecondary)
                }.frame(maxWidth: .infinity, alignment: .leading)
            }
            if !path.learningObjectives.isEmpty {
                SunnahSectionLabel("أهداف التعلّم")
                SunnahCard {
                    VStack(alignment: .leading, spacing: Sunnah.Spacing.s2) {
                        ForEach(path.learningObjectives, id: \.self) { Text("• \($0)".arabicDigits).font(Sunnah.Typography.body).foregroundStyle(Sunnah.Colors.textPrimary) }
                    }.frame(maxWidth: .infinity, alignment: .leading)
                }
            }
            if let src = path.source {
                SunnahSectionLabel("المصدر")
                Text(src).font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.textSecondary).frame(maxWidth: .infinity, alignment: .leading)
            }
            SunnahSectionLabel("الوحدات")
            SunnahGroupedCard(path.units) { u in
                SunnahNavigationLink { HifzUnitView(unit: u, surahNames: surahNames, siblings: path.units) } label: { SunnahListRow(title: u.title, subtitle: unitSubtitle(u)) }
            }
        }
        .quranTitle(path.title)
    }
}

struct HifzUnitView: View {
    let unit: HifzUnit
    var surahNames: [Int: String] = [:]
    /// وحدات المسار نفسه بترتيبها؛ تُستعمل للتنقّل (السابقة/التالية) وموضع الوحدة.
    var siblings: [HifzUnit] = []
    @Environment(\.openRoute) private var openRoute
    private func name(_ n: Int) -> String { surahNames[n] ?? "سورة \(n)" }
    private var index: Int? { siblings.firstIndex(where: { $0.id == unit.id }) }
    var body: some View {
        ScrollView {
            VStack(spacing: 0) {
                DetailHero(title: unit.title, subtitle: index.map { "الوحدة \($0 + 1) من \(siblings.count)" })
                VStack(alignment: .leading, spacing: Sunnah.Spacing.s4) {
                    SunnahCard {
                        VStack(alignment: .leading, spacing: Sunnah.Spacing.s3) {
                            if let r = unit.ref { row("الموضع", PublishedAdapters.refText(r, surahName: name)) }
                            if let n = unit.repetitionTarget { row("التكرار المقترح", "\(n) مرة") }
                            if let c = unit.completionCriteria { row("معيار الإتمام", c) }
                        }
                    }
                    if let r = unit.ref {
                        SunnahButton("افتح الآية الأولى في المصحف") { openRoute("/mushaf/ayah/\(r.surah):\(r.ayahFrom)") }
                    }
                    if let i = index {
                        VStack(spacing: 0) {
                            if i + 1 < siblings.count {
                                let n = siblings[i + 1]
                                SunnahNavigationLink { HifzUnitView(unit: n, surahNames: surahNames, siblings: siblings) } label: { SunnahListRow(title: n.title, subtitle: "الوحدة التالية") }
                            }
                            if i > 0 {
                                let n = siblings[i - 1]
                                SunnahNavigationLink { HifzUnitView(unit: n, surahNames: surahNames, siblings: siblings) } label: { SunnahListRow(title: n.title, subtitle: "الوحدة السابقة") }
                            }
                        }
                    }
                }
                .padding(Sunnah.Spacing.s4).frame(maxWidth: .infinity, alignment: .leading)
            }
        }
        .background(Sunnah.Colors.bg)
        .environment(\.layoutDirection, .rightToLeft)
    }
    private func row(_ k: String, _ v: String) -> some View {
        VStack(alignment: .leading, spacing: 2) {
            Text(k).font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.textSecondary)
            Text(v).font(Sunnah.Typography.body).foregroundStyle(Sunnah.Colors.textPrimary)
        }
    }
}

/// «معلومات عن القرآن» في صفحة واحدة: شريط مجموعات + شبكة بطاقات حقائق (القيمة كبيرة والعنوان تحتها)؛ اللمس يفتح التفصيل بمصدره.
struct QuranStatsView: View {
    let stats: [QuranStat]
    @State private var group = ""
    private var groups: [(title: String, stats: [QuranStat])] { PublishedAdapters.statsByGroup(stats) }
    private var current: [QuranStat] { groups.first { $0.title == group }?.stats ?? groups.first?.stats ?? [] }
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 14) {
                SunnahChipBar(options: groups.map { .init(id: $0.title, title: $0.title) }, selection: Binding(get: { group.isEmpty ? (groups.first?.title ?? "") : group }, set: { group = $0 }))
                LazyVGrid(columns: [GridItem(.flexible(), spacing: 14), GridItem(.flexible(), spacing: 14)], spacing: 14) {
                    ForEach(current) { s in
                        SunnahNavigationLink { QuranStatView(stat: s) } label: { factCard(s) }
                            .buttonStyle(.plain).sunnahPressable()
                            .accessibilityElement(children: .combine)
                            .accessibilityIdentifier("quran.fact.\(s.id)")
                    }
                }
                .padding(.horizontal, Sunnah.Spacing.pageX)
            }
            .padding(.bottom, 96)
        }
        .background(Sunnah.Colors.bg)
        .environment(\.layoutDirection, .rightToLeft)
    }
    private func factCard(_ s: QuranStat) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(Sunnah.digits(s.value)).font(AppearancePrefs.ui(.extraBold, 30, .title)).foregroundStyle(Sunnah.Colors.primary)
                .minimumScaleFactor(0.6).lineLimit(1)
            Text(s.label).font(AppearancePrefs.ui(.bold, 14, .subheadline)).foregroundStyle(Sunnah.Colors.textPrimary)
                .multilineTextAlignment(.leading).lineLimit(3)
            Spacer(minLength: 0)
            if let k = PublishedAdapters.statKinds[s.kind], s.kind != "agreed" {
                Text(k).font(AppearancePrefs.ui(.bold, 11, .caption2)).foregroundStyle(Sunnah.Colors.primary)
                    .padding(.horizontal, 10).padding(.vertical, 3).background(Sunnah.Colors.primarySoft, in: Capsule())
            }
        }
        .padding(16).frame(maxWidth: .infinity, minHeight: 132, alignment: .topLeading)
        .background(Sunnah.Colors.surface, in: RoundedRectangle(cornerRadius: 26, style: .continuous))
        .overlay(RoundedRectangle(cornerRadius: 26, style: .continuous).stroke(Sunnah.Colors.border, lineWidth: 1))
    }
}

struct QuranStatView: View {
    let stat: QuranStat
    var body: some View {
        var secs: [(title: String, lines: [String])] = []
        if let m = stat.method { secs.append(("المنهج", [m])) }
        if let d = stat.detail { secs.append(("تفصيل", [d])) }
        if !stat.variants.isEmpty { secs.append(("أقوال أخرى", stat.variants.map { "\($0.value) — \($0.attribution) (\($0.source))" })) }
        let src = "\(stat.source.book) — \(stat.source.author) — \(stat.source.ref)"
        return QuranDocView(title: stat.label,
                            paragraphs: ["\(stat.value) · \(PublishedAdapters.statKinds[stat.kind] ?? stat.kind)"] + (stat.note.map { [$0] } ?? []),
                            sections: secs, sources: [src])
    }
}

struct QiraatView: View {
    let file: QiraatFile
    var surahNames: [Int: String] = QuranSection.surahNames()
    var body: some View {
        qScroll {
            SunnahGroupedCard(file.sections) { s in
                SunnahNavigationLink { QuranDocView(title: s.title, paragraphs: s.body, sources: [s.source]) } label: { SunnahListRow(title: s.title, subtitle: nil) }
            }
            SunnahSectionLabel("القراء العشرة")
            SunnahGroupedCard(file.ashara) { q in
                SunnahNavigationLink {
                    QuranDocView(title: q.name, paragraphs: [q.nisba + (q.deathYearHijri.map { " — ت \($0)هـ" } ?? ""), q.bio],
                                 sections: [("الراويان", q.rawis)], sources: [q.source])
                } label: { SunnahListRow(title: q.name, subtitle: q.rawis.joined(separator: "، ")) }
            }
            if !file.diffs.isEmpty {
                SunnahSectionLabel("أمثلة الخلاف")
                SunnahGroupedCard(file.diffs) { d in
                    SunnahNavigationLink {
                        QuranDocView(title: PublishedAdapters.diffKinds[d.kind] ?? d.kind,
                                     paragraphs: [d.description, PublishedAdapters.ayahText(surah: d.surah, ayah: d.ayah) { surahNames[$0] ?? "سورة \($0)" }.arabicDigits], sources: [d.source])
                    } label: { SunnahListRow(title: d.description, subtitle: nil) }
                }
            }
        }
    }
}

/// إشارات كونية للتأمل: المحرَّر وله مصدر علمي فقط (المُصدِّر يحجب needs_review). النص كما نُشر.
struct MiraclesListView: View {
    let items: [MiracleItem]
    var body: some View {
        qScroll {
            SunnahGroupedCard(items) { m in
                SunnahNavigationLink {
                    QuranDocView(title: m.title, paragraphs: m.body.components(separatedBy: "\n\n").filter { !$0.isEmpty }, sources: [m.scholarlySource])
                } label: { SunnahListRow(title: m.title, subtitle: "\(m.category) · \(m.reference)") }
            }
        }
    }
}

struct AhrufListView: View {
    let sections: [AhrufSection]
    var body: some View {
        qScroll {
            SunnahGroupedCard(sections) { s in
                SunnahNavigationLink { QuranDocView(title: s.title, paragraphs: s.body, sources: s.sources) } label: { SunnahListRow(title: s.title, subtitle: nil) }
            }
        }
    }
}

private struct QItem: Identifiable { let id: String }

/// حاوية تمرير موحّدة لقوائم المربعات: هامش 16 وخلفية النظام.
private func qScroll<C: View>(@ViewBuilder _ content: () -> C) -> some View {
    ScrollView { LazyVStack(spacing: 0) { content() }.padding(.horizontal, Sunnah.Spacing.s4) }
        .background(Sunnah.Colors.bg)
}
