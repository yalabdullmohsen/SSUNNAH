import SwiftUI

/// أقسام صفحة النبي: كل خيار يظهر فقط إن كان له محتوى موثّق، والفارغ يُخفى كليًّا.
enum ProphetSection: String, CaseIterable, Hashable {
    case story, verses, lineage, timePlace, miracles, lessons

    var title: String {
        switch self {
        case .story: return "القصة كاملة"
        case .verses: return "الآيات"
        case .lineage: return "النسب"
        case .timePlace: return "الزمان والمكان"
        case .miracles: return "المعجزات والآيات"
        case .lessons: return "الدروس والابتلاءات"
        }
    }
    /// عناوين `##` في البيانات المقابلة لكل خيار؛ القصة تجمع الدعوة والمواقف والمآل.
    var headings: [String] {
        switch self {
        case .story: return ["أصل الدعوة", "أبرز المواقف والابتلاءات", "مآل قومه والعبرة العامة", "دعوته", "سياق النبوة"]
        case .verses: return []
        case .lineage: return ["التعريف والنسب"]
        case .timePlace: return ["الزمان والمكان"]
        case .miracles: return ["المعجزات والآيات البينات"]
        case .lessons: return ["الدروس والعبر", "العبرة", "العبرة للمكلّف", "ما يُستفاد من ذكره"]
        }
    }
}

/// نبي واحد بعد تحليل النص: أقسامه الظاهرة فقط، وآياته بمراجعها، بلا عبارات منهجية داخلية.
struct ProphetStory: Identifiable, Hashable {
    struct Ayah: Hashable { let ref: String; let text: String }
    let id: String
    let name: String
    let sections: [ProphetSection: [String]]
    let ayat: [Ayah]
    let sources: [String]

    /// عناوين/عبارات داخلية لا تُعرض للمستخدم.
    static let hiddenHeadings: Set<String> = ["سياسة سُنّة في الإسرائيليات والتوسع", "خاتمة منهجية", "منهج العرض", "ضابط الإسرائيليات", "مكانته في الذكر"]
    static let internalPhrases = ["كما في العرض المعتمد", "ملاحظة منهجية", "منهج العرض", "يُقتصر", "لا تُخترع", "لم يحدّد القرآن", "يُكرّر هنا", "يُكرَّر هنا", "مقالة الأمة"]

    init?(_ k: SirahKnowledgeItem) {
        guard k.reviewStatus == "verified", !(k.sources ?? []).isEmpty else { return nil }
        var parsed: [String: [String]] = [:]
        var head: String?; var skip = false
        for raw in k.body.components(separatedBy: "\n") {
            let line = raw.trimmingCharacters(in: .whitespaces)
            if line.hasPrefix("### ") { skip = ProphetStory.internalPhrases.contains { line.contains($0) }; continue }
            if line.hasPrefix("## ") { head = String(line.dropFirst(3)); skip = false; continue }
            guard let h = head, !skip, !line.isEmpty, !ProphetStory.hiddenHeadings.contains(h),
                  !ProphetStory.internalPhrases.contains(where: { line.contains($0) }) else { continue }
            parsed[h, default: []].append(line)
        }
        var out: [ProphetSection: [String]] = [:]
        for s in ProphetSection.allCases {
            let paras = s.headings.flatMap { parsed[$0] ?? [] }
            if !paras.isEmpty { out[s] = paras }
        }
        let ayat = (k.evidences ?? []).compactMap { e -> Ayah? in
            guard let r = e.ref, SunnahAyahRange.parse(r) != nil, !e.text.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty else { return nil }
            return Ayah(ref: r, text: e.text)
        }
        if !ayat.isEmpty { out[.verses] = [] }
        guard !out.isEmpty else { return nil }
        id = k.id; name = k.title; sections = out; self.ayat = ayat
        sources = (k.sources ?? []).map { [$0.book, $0.locator].compactMap { $0 }.filter { !$0.isEmpty }.joined(separator: "، ") }
    }

    /// الترتيب الزمني من آدم إلى محمد ﷺ (المتعارف عليه عند أهل السير)؛ ن2 يراجعه، والمجهول يُلحق في الآخر.
    static let chronology = ["adam", "idris", "nuh", "hud", "salih", "ibrahim", "lut", "ismail", "is-haq", "yaqub", "yusuf", "ayyub", "dhul-kifl", "shuayb", "musa", "harun", "ilyas", "al-yasa", "dawud", "sulayman", "yunus", "zakariyya", "yahya", "isa", "muhammad"]
    static func chronological(_ rows: [ProphetStory]) -> [ProphetStory] {
        func rank(_ p: ProphetStory) -> Int { chronology.firstIndex(of: p.id.replacingOccurrences(of: "prophet-", with: "")) ?? chronology.count }
        return rows.sorted { rank($0) < rank($1) }
    }

    var visibleSections: [ProphetSection] { ProphetSection.allCases.filter { sections[$0] != nil } }
}

// MARK: الشبكة

struct ProphetsGridView: View {
    let prophets: [ProphetStory]
    @State private var query = ""
    @State private var debugOpen = false
    @Environment(\.horizontalSizeClass) private var hSize

    private var filtered: [(Int, ProphetStory)] {
        let q = query.trimmingCharacters(in: .whitespaces)
        return prophets.enumerated().filter { q.isEmpty || $0.element.name.contains(q) }.map { ($0.offset, $0.element) }
    }
    private var columns: [GridItem] {
        hSize == .regular ? [GridItem(.adaptive(minimum: 180), spacing: Sunnah.Spacing.s3)]
                          : Array(repeating: GridItem(.flexible(), spacing: Sunnah.Spacing.s3), count: 2)
    }

    var body: some View {
        ScrollView {
            HStack(spacing: Sunnah.Spacing.s2) {
                Image(systemName: "magnifyingglass").foregroundStyle(Sunnah.Colors.textSecondary).accessibilityHidden(true)
                TextField("ابحث باسم النبي", text: $query).font(Sunnah.Typography.body).accessibilityIdentifier("prophets.search")
            }
            .padding(.horizontal, Sunnah.Spacing.s4).frame(minHeight: 44)
            .background(RoundedRectangle(cornerRadius: 12).fill(Sunnah.Colors.textSecondary.opacity(0.1)))
            .padding(.horizontal, Sunnah.Spacing.pageX).padding(.top, Sunnah.Spacing.s2)
            LazyVGrid(columns: columns, spacing: Sunnah.Spacing.s3) {
                ForEach(filtered, id: \.1.id) { idx, p in
                    SunnahNavigationLink { ProphetPageView(prophets: prophets, start: idx) } label: {
                        SunnahCard {
                            VStack(spacing: Sunnah.Spacing.s2) {
                                Image(systemName: "book.pages").font(.title2).foregroundStyle(Sunnah.Colors.primary).accessibilityHidden(true)
                                Text(p.name).font(Sunnah.Typography.cardTitle).foregroundStyle(Sunnah.Colors.textPrimary)
                                    .multilineTextAlignment(.center).lineLimit(2).minimumScaleFactor(0.85)
                            }
                            .frame(maxWidth: .infinity, minHeight: 84)
                        }
                    }
                    .buttonStyle(.plain).accessibilityIdentifier("prophet.card.\(p.id)")
                }
            }
            .padding(Sunnah.Spacing.pageX)
            if filtered.isEmpty { EmptyStateView(title: "لا نتائج", symbol: "magnifyingglass", declaresEmpty: false) }
        }
        .background(Sunnah.Colors.bg)
        .bodyTitledNavigation()
        .accessibilityIdentifier("prophets.grid")
        #if DEBUG
        .navigationDestination(isPresented: $debugOpen) { ProphetPageView(prophets: prophets, start: UserDefaults.standard.integer(forKey: "snapshotProphet")) }
        .onAppear { if UserDefaults.standard.object(forKey: "snapshotProphet") != nil { debugOpen = true } }
        #endif
    }
}

// MARK: صفحة النبي

struct ProphetPageView: View {
    let prophets: [ProphetStory]
    @State private var index: Int
    @State private var selection: ProphetSection = .story
    init(prophets: [ProphetStory], start: Int) { self.prophets = prophets; _index = State(initialValue: start) }

    private var p: ProphetStory { prophets[index] }
    private var options: [SunnahChipBar<ProphetSection>.Option] { p.visibleSections.map { .init(id: $0, title: $0.title) } }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: Sunnah.Spacing.s4) {
                SunnahChipBar(options: options, selection: $selection)
                SunnahGeometricHeader(title: p.name)
                VStack(alignment: .leading, spacing: Sunnah.Spacing.s4) {
                    content
                    SunnahStepper(index: $index, count: prophets.count, previousTitle: "النبي السابق", nextTitle: "النبي التالي")
                }
                .padding(.horizontal, Sunnah.Spacing.pageX)
            }
        }
        .background(Sunnah.Colors.bg)
        .bodyTitledNavigation()
        .onChange(of: index) { _ in if !p.visibleSections.contains(selection) { selection = p.visibleSections.first ?? .story } }
        .onAppear { if !p.visibleSections.contains(selection) { selection = p.visibleSections.first ?? .story } }
        .accessibilityIdentifier("prophet.page")
    }

    @ViewBuilder private var content: some View {
        if selection == .verses {
            ForEach(p.ayat, id: \.self) { a in
                SunnahCard {
                    VStack(alignment: .leading, spacing: Sunnah.Spacing.s2) {
                        // مؤقت: SunnahArabicText(.quran) إلى أن تصل QuranAyahText من ن3.
                        SunnahArabicText(a.text, style: .quran).foregroundStyle(Sunnah.Colors.textPrimary)
                        if let path = SunnahAyahRange.mushafPath(a.ref) {
                            SunnahValueLink(value: Route.web(path: path)) {
                                Text(SunnahAyahRange.display(a.ref)).font(Sunnah.Typography.tag).foregroundStyle(Sunnah.Colors.primary).frame(minHeight: 44)
                            }.accessibilityIdentifier("prophet.ayah.\(a.ref)")
                        }
                    }
                }
            }
        } else {
            ForEach(Array((p.sections[selection] ?? []).enumerated()), id: \.offset) { _, para in
                SunnahArabicText(para, style: .reading).foregroundStyle(Sunnah.Colors.textPrimary)
            }
        }
    }
}
