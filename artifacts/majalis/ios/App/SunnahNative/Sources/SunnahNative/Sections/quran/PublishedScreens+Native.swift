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

    var body: some View {
        ScrollView {
            VStack(spacing: 0) {
            DetailHero(title: title)
            VStack(alignment: .leading, spacing: Sunnah.Spacing.s4) {
                ForEach(paragraphs, id: \.self) { Text($0).font(Sunnah.Typography.body).foregroundStyle(Sunnah.Colors.textPrimary) }
                ForEach(sections, id: \.title) { s in
                    Text(s.title).font(Sunnah.Typography.sectionTitle).foregroundStyle(Sunnah.Colors.textPrimary)
                    ForEach(s.lines, id: \.self) { Text($0).font(Sunnah.Typography.body).foregroundStyle(Sunnah.Colors.textPrimary) }
                }
                if !sources.isEmpty {
                    Text("المصدر").font(Sunnah.Typography.sectionTitle).foregroundStyle(Sunnah.Colors.textPrimary)
                    ForEach(sources, id: \.self) { Text($0).font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.textSecondary) }
                }
            }
            .padding(Sunnah.Spacing.s4).frame(maxWidth: .infinity, alignment: .leading)
            }
        }
        .background(Sunnah.Colors.bg)
        .environment(\.layoutDirection, .rightToLeft)
    }
}

struct TajweedListView: View {
    let file: TajweedFile
    var body: some View {
        List {
            if let i = file.intro {
                SunnahNavigationLink { QuranDocView(title: i.title, paragraphs: i.paragraphs, sources: [i.source]) } label: { SunnahListRow(title: i.title, subtitle: nil) }
                    .sunnahRowChrome()
            }
            ForEach(file.chapters) { c in
                SunnahNavigationLink { TajweedChapterView(chapter: c) } label: { SunnahListRow(title: c.title, subtitle: c.summary) }
                    .sunnahRowChrome()
            }
        }
        .listStyle(.plain).scrollContentBackground(.hidden).background(Sunnah.Colors.bg)
    }
}

struct TajweedChapterView: View {
    let chapter: TajweedChapter
    var surahNames: [Int: String] = QuranSection.surahNames()
    var body: some View {
        let ex = chapter.examples.map { e -> String in
            let ref = PublishedAdapters.ayahText(surah: e.surah, ayah: e.ayah) { surahNames[$0] ?? "سورة \($0)" }
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
        List(stories) { s in
            SunnahNavigationLink { SurahStoryView(story: s) } label: { SunnahListRow(title: "\(s.number). \(s.name)", subtitle: s.revelationPlace) }
                .sunnahRowChrome()
        }
        .listStyle(.plain).scrollContentBackground(.hidden).background(Sunnah.Colors.bg)
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
        List {
            ForEach(PublishedAdapters.hifzByCategory(paths), id: \.title) { g in
                Section(g.title) {
                    ForEach(g.paths) { p in
                        SunnahNavigationLink { HifzPathView(path: p) } label: { SunnahListRow(title: p.title, subtitle: p.shortDescription) }
                    }
                }.sunnahRowChrome()
            }
        }
        .listStyle(.plain).scrollContentBackground(.hidden).background(Sunnah.Colors.bg)
    }
}

struct HifzPathView: View {
    let path: HifzPath
    var surahNames: [Int: String] = QuranSection.surahNames()
    private func unitSubtitle(_ u: HifzUnit) -> String? {
        var parts: [String] = []
        if let r = u.ref { parts.append(PublishedAdapters.refText(r) { surahNames[$0] ?? "سورة \($0)" }) }
        if let n = u.repetitionTarget { parts.append("التكرار المقترح: \(n)") }
        return parts.isEmpty ? nil : parts.joined(separator: " · ")
    }
    var body: some View {
        List {
            Section {
                VStack(alignment: .leading, spacing: Sunnah.Spacing.s2) {
                    if let d = path.shortDescription { Text(d).font(Sunnah.Typography.body).foregroundStyle(Sunnah.Colors.textPrimary) }
                    Text("المستوى: \(PublishedAdapters.hifzLevels[path.level] ?? path.level) · \(path.units.count) وحدة")
                        .font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.textSecondary)
                }
            }.sunnahRowChrome()
            if !path.learningObjectives.isEmpty {
                Section("أهداف التعلّم") {
                    ForEach(path.learningObjectives, id: \.self) { Text("• \($0)").font(Sunnah.Typography.body).foregroundStyle(Sunnah.Colors.textPrimary) }
                }.sunnahRowChrome()
            }
            if let src = path.source {
                Section("المصدر") { Text(src).font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.textSecondary) }.sunnahRowChrome()
            }
            Section("الوحدات") {
                ForEach(path.units) { u in
                    SunnahNavigationLink { HifzUnitView(unit: u, surahNames: surahNames, siblings: path.units) } label: { SunnahListRow(title: u.title, subtitle: unitSubtitle(u)) }
                }
            }.sunnahRowChrome()
        }
        .listStyle(.plain).scrollContentBackground(.hidden).background(Sunnah.Colors.bg)
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

struct QuranStatsView: View {
    let stats: [QuranStat]
    var body: some View {
        List {
            ForEach(PublishedAdapters.statsByGroup(stats), id: \.title) { g in
                Section(g.title) {
                    ForEach(g.stats) { s in
                        SunnahNavigationLink { QuranStatView(stat: s) } label: { SunnahListRow(title: s.label, subtitle: s.value) }
                    }
                }.sunnahRowChrome()
            }
        }
        .listStyle(.plain).scrollContentBackground(.hidden).background(Sunnah.Colors.bg)
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
        List {
            ForEach(file.sections) { s in
                SunnahNavigationLink { QuranDocView(title: s.title, paragraphs: s.body, sources: [s.source]) } label: { SunnahListRow(title: s.title, subtitle: nil) }
            }.sunnahRowChrome()
            Section("القراء العشرة") {
                ForEach(file.ashara) { q in
                    SunnahNavigationLink {
                        QuranDocView(title: q.name, paragraphs: [q.nisba + (q.deathYearHijri.map { " — ت \($0)هـ" } ?? ""), q.bio],
                                     sections: [("الراويان", q.rawis)], sources: [q.source])
                    } label: { SunnahListRow(title: q.name, subtitle: q.rawis.joined(separator: "، ")) }
                }
            }.sunnahRowChrome()
            if !file.diffs.isEmpty {
                Section("أمثلة الخلاف") {
                    ForEach(file.diffs) { d in
                        SunnahNavigationLink {
                            QuranDocView(title: PublishedAdapters.diffKinds[d.kind] ?? d.kind,
                                         paragraphs: [d.description, PublishedAdapters.ayahText(surah: d.surah, ayah: d.ayah) { surahNames[$0] ?? "سورة \($0)" }], sources: [d.source])
                        } label: { SunnahListRow(title: d.description, subtitle: nil) }
                    }
                }.sunnahRowChrome()
            }
        }
        .listStyle(.plain).scrollContentBackground(.hidden).background(Sunnah.Colors.bg)
    }
}

/// إشارات كونية للتأمل: المحرَّر وله مصدر علمي فقط (المُصدِّر يحجب needs_review). النص كما نُشر.
struct MiraclesListView: View {
    let items: [MiracleItem]
    var body: some View {
        List(items) { m in
            SunnahNavigationLink {
                QuranDocView(title: m.title, paragraphs: m.body.components(separatedBy: "\n\n").filter { !$0.isEmpty }, sources: [m.scholarlySource])
            } label: { SunnahListRow(title: m.title, subtitle: "\(m.category) · \(m.reference)") }
                .sunnahRowChrome()
        }
        .listStyle(.plain).scrollContentBackground(.hidden).background(Sunnah.Colors.bg)
    }
}

struct AhrufListView: View {
    let sections: [AhrufSection]
    var body: some View {
        List(sections) { s in
            SunnahNavigationLink { QuranDocView(title: s.title, paragraphs: s.body, sources: s.sources) } label: { SunnahListRow(title: s.title, subtitle: nil) }
                .sunnahRowChrome()
        }
        .listStyle(.plain).scrollContentBackground(.hidden).background(Sunnah.Colors.bg)
    }
}
