import SwiftUI

/// أقسام صفحة النبي: كل خيار يظهر فقط إن كان له محتوى موثّق، والفارغ يُخفى كليًّا.
enum ProphetSection: String, CaseIterable, Hashable {
    case story, identity, sunnah, saadi, verses, lineage, timePlace, miracles, lessons

    var title: String {
        switch self {
        case .story: return "القصة كاملة"
        case .identity: return "التعريف"
        case .saadi: return "من تفسير السعدي"
        case .sunnah: return "من السنة"
        case .verses: return "الآيات"
        case .lineage: return "النسب"
        case .timePlace: return "الزمان والمكان"
        case .miracles: return "المعجزات والآيات"
        case .lessons: return "الدروس والابتلاءات"
        }
    }
    var partKey: String? { self == .story ? "story" : self == .identity ? "identity" : self == .saadi ? "saadi" : self == .sunnah ? "sunnah" : nil }
    /// عناوين `##` في البيانات المقابلة لكل خيار؛ القصة تجمع الدعوة والمواقف والمآل.
    var headings: [String] {
        switch self {
        case .story: return ["أصل الدعوة", "أبرز المواقف والابتلاءات", "مآل قومه والعبرة العامة", "دعوته", "سياق النبوة"]
        case .identity, .saadi, .sunnah, .verses: return []
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
    let sectionSources: [ProphetSection: [String]]

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
        var secSrc: [ProphetSection: [String]] = [:]
        for s in ProphetSection.allCases {
            let paras = s.headings.flatMap { parsed[$0] ?? [] }
            if !paras.isEmpty { out[s] = paras }
        }
        for part in k.sections ?? [] {
            guard let sec = [ProphetSection.story, .identity, .saadi, .sunnah].first(where: { $0.partKey == part.key }), !(part.sources ?? []).isEmpty else { continue }
            let paras = part.body.components(separatedBy: "\n").map { $0.trimmingCharacters(in: .whitespaces) }.filter { !$0.isEmpty }
            if !paras.isEmpty {
                out[sec] = paras
                secSrc[sec] = (part.sources ?? []).map { [$0.book, $0.locator].compactMap { $0 }.filter { !$0.isEmpty }.joined(separator: "، ") }
            }
        }
        let ayat = (k.evidences ?? []).compactMap { e -> Ayah? in
            guard let r = e.ref, SunnahAyahRange.parse(r) != nil else { return nil }
            return Ayah(ref: r, text: e.text)
        }
        if !ayat.isEmpty { out[.verses] = [] }
        guard !out.isEmpty else { return nil }
        id = k.id; name = k.title; sections = out; self.ayat = ayat; sectionSources = secSrc
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


// MARK: الشبكة (النموذج ٢)

/// آخر نبي فتحه القارئ؛ يُكتب عند عرض صفحة النبي ويُقرأ في بطاقة «تابع القراءة».
enum ProphetsReadingProgress {
    static let key = "prophets.lastRead"
    static var lastID: String? { UserDefaults.standard.string(forKey: key) }
    static func save(_ id: String) { UserDefaults.standard.set(id, forKey: key) }
}

private func arabicNumber(_ n: Int) -> String {
    String(String(n).unicodeScalars.map { (0x30...0x39).contains($0.value) ? Character(Unicode.Scalar(0x0660 + $0.value - 0x30)!) : Character($0) })
}

struct ProphetsGridView: View {
    let prophets: [ProphetStory]
    @State private var query = ""
    @State private var debugOpen = false
    @State private var openIndex: Int?
    @State private var lastID = ProphetsReadingProgress.lastID
    @Environment(\.horizontalSizeClass) private var hSize

    private var filtered: [(Int, ProphetStory)] {
        let q = query.trimmingCharacters(in: .whitespaces)
        return prophets.enumerated().filter { q.isEmpty || $0.element.name.contains(q) }.map { ($0.offset, $0.element) }
    }
    private var columns: [GridItem] {
        hSize == .regular ? [GridItem(.adaptive(minimum: 170), spacing: 14)]
                          : Array(repeating: GridItem(.flexible(), spacing: 14), count: 2)
    }
    private var resume: (Int, ProphetStory)? {
        guard let lastID, let i = prophets.firstIndex(where: { $0.id == lastID }) else { return nil }
        return (i, prophets[i])
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 14) {
                SunnahPageTitle("قصص الأنبياء")
                searchField
                if query.isEmpty, let (i, p) = resume { resumeCard(i, p) }
                LazyVGrid(columns: columns, spacing: 14) {
                    ForEach(filtered, id: \.1.id) { idx, p in
                        SunnahNavigationLink { ProphetPageView(prophets: prophets, start: idx) } label: { tile(idx, p) }
                            .buttonStyle(.plain).sunnahPressable()
                            .accessibilityIdentifier("prophet.card.\(p.id)")
                    }
                }
                .padding(.horizontal, Sunnah.Spacing.pageX)
                if filtered.isEmpty { EmptyStateView(title: "لا نتائج", symbol: "magnifyingglass", declaresEmpty: false) }
                SunnahContentFooter(title: "قصص الأنبياء", id: "prophets", section: "قصص الأنبياء", inset: false)
            }
            .padding(.bottom, 96)
        }
        .background(Sunnah.Colors.bg)
        .sunnahSubChrome()
        .environment(\.layoutDirection, .rightToLeft)
        .sunnahReadableWidth()
        .onAppear { lastID = ProphetsReadingProgress.lastID }
        .navigationDestination(isPresented: Binding(get: { openIndex != nil }, set: { if !$0 { openIndex = nil } })) {
            ProphetPageView(prophets: prophets, start: openIndex ?? 0)
        }
        .accessibilityIdentifier("prophets.grid")
        #if DEBUG
        .navigationDestination(isPresented: $debugOpen) { ProphetPageView(prophets: prophets, start: UserDefaults.standard.integer(forKey: "snapshotProphet")) }
        .onAppear { if UserDefaults.standard.object(forKey: "snapshotProphet") != nil, !prophets.isEmpty { debugOpen = true } }
        #endif
    }

    private var searchField: some View {
        HStack(spacing: 10) {
            Image(systemName: "magnifyingglass").font(.system(size: 16, weight: .semibold)).foregroundStyle(Sunnah.Colors.textSecondary).accessibilityHidden(true)
            TextField("ابحث باسم النبي", text: $query)
                .font(AppearancePrefs.ui(.bold, 15, .body)).foregroundStyle(Sunnah.Colors.textPrimary)
                .accessibilityIdentifier("prophets.search")
            if !query.isEmpty {
                Button { query = "" } label: { Image(systemName: "xmark.circle.fill").foregroundStyle(Sunnah.Colors.textSecondary).frame(width: 44, height: 44) }
                    .accessibilityLabel("مسح البحث")
            }
        }
        .padding(.horizontal, 16).frame(minHeight: 50)
        .background(Sunnah.Colors.surface, in: Capsule())
        .overlay(Capsule().stroke(Sunnah.Colors.border, lineWidth: 1))
        .padding(.horizontal, Sunnah.Spacing.pageX)
    }

    private func resumeCard(_ i: Int, _ p: ProphetStory) -> some View {
        Button { openIndex = i } label: {
            SunnahHeroCard {
                HStack(spacing: 14) {
                    VStack(alignment: .leading, spacing: 4) {
                        Text("تابع القراءة").font(AppearancePrefs.ui(.bold, 12, .caption)).foregroundStyle(Sunnah.Colors.heroGold)
                        Text(p.name).font(AppearancePrefs.ui(.extraBold, 24, .title2)).foregroundStyle(.white)
                    }
                    Spacer(minLength: 8)
                    Text("أكمل").font(AppearancePrefs.ui(.extraBold, 14, .subheadline)).foregroundStyle(Sunnah.Colors.goldInk)
                        .padding(.horizontal, 18).frame(minHeight: 44)
                        .background(Sunnah.Colors.heroGold, in: Capsule())
                }
            }
        }
        .buttonStyle(.plain).sunnahPressable()
        .accessibilityLabel("تابع القراءة: \(p.name)")
        .accessibilityIdentifier("prophets.resume")
    }

    private func tile(_ idx: Int, _ p: ProphetStory) -> some View {
        let active = p.id == lastID
        return HStack(spacing: 12) {
            Text(arabicNumber(idx + 1)).font(AppearancePrefs.ui(.extraBold, 15, .subheadline))
                .foregroundStyle(active ? Color.white : Sunnah.Colors.primary)
                .frame(width: 40, height: 40)
                .background(active ? Sunnah.Colors.primary : Sunnah.Colors.primarySoft, in: RoundedRectangle(cornerRadius: 14, style: .continuous))
            Text(p.name).font(AppearancePrefs.ui(.extraBold, 16, .body)).foregroundStyle(Sunnah.Colors.textPrimary)
                .lineLimit(2).minimumScaleFactor(0.85)
            Spacer(minLength: 0)
        }
        .padding(12).frame(maxWidth: .infinity, minHeight: 64)
        .background(Sunnah.Colors.surface, in: RoundedRectangle(cornerRadius: 22, style: .continuous))
        .overlay(RoundedRectangle(cornerRadius: 22, style: .continuous).stroke(active ? Sunnah.Colors.primary : Sunnah.Colors.border, lineWidth: active ? 1.5 : 1))
    }
}

// MARK: صفحة النبي — صفحة واحدة كاملة

struct ProphetPageView: View {
    let prophets: [ProphetStory]
    @State private var index: Int
    /// مستودع المصحف الذي تقرأ منه `QuranAyahText`؛ نص الآية لا يُعرض إلا عبره.
    private let repo = MushafRepository(bundle: .main)
    init(prophets: [ProphetStory], start: Int) { self.prophets = prophets; _index = State(initialValue: start) }

    private var p: ProphetStory { prophets[index] }

    var body: some View {
        ScrollViewReader { proxy in
            ScrollView {
                VStack(alignment: .leading, spacing: 14) {
                    SunnahPageTitle(p.name)
                    jumpBar(proxy)
                    ForEach(p.visibleSections, id: \.self) { sec in
                        sectionCard(sec).id(sec)
                    }
                    SunnahStepper(index: $index, count: prophets.count, previousTitle: "النبي السابق", nextTitle: "النبي التالي")
                        .padding(.horizontal, Sunnah.Spacing.pageX)
                    SunnahContentFooter(title: p.name, id: p.id, section: "قصص الأنبياء", inset: false)
                }
                .padding(.bottom, 96)
            }
            .id(p.id)
            .onAppear {
                ProphetsReadingProgress.save(p.id)
                #if DEBUG
                if let s = UserDefaults.standard.string(forKey: "snapshotProphetSection"), let sec = ProphetSection(rawValue: s) {
                    DispatchQueue.main.asyncAfter(deadline: .now() + 0.6) { proxy.scrollTo(sec, anchor: .top) }
                }
                #endif
            }
            .onChange(of: index) { _ in ProphetsReadingProgress.save(p.id); proxy.scrollTo(p.visibleSections.first, anchor: .top) }
        }
        .background(Sunnah.Colors.bg)
        .sunnahSubChrome()
        .environment(\.layoutDirection, .rightToLeft)
        .sunnahReadableWidth()
        .accessibilityIdentifier("prophet.page")
    }

    private func jumpBar(_ proxy: ScrollViewProxy) -> some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 8) {
                ForEach(p.visibleSections, id: \.self) { sec in
                    Button { withAnimation(.easeInOut(duration: 0.25)) { proxy.scrollTo(sec, anchor: .top) } } label: {
                        Text(sec.title).font(AppearancePrefs.ui(.bold, 13, .footnote)).foregroundStyle(Sunnah.Colors.primary)
                            .padding(.horizontal, 16).frame(minHeight: 44)
                            .background(Sunnah.Colors.primarySoft, in: Capsule())
                    }
                    .buttonStyle(.plain).accessibilityIdentifier("prophet.jump.\(sec.rawValue)")
                }
            }
            .padding(.horizontal, Sunnah.Spacing.pageX)
        }
    }

    private func sourceLine(_ sec: ProphetSection) -> String {
        (p.sectionSources[sec] ?? p.sources).joined(separator: " · ")
    }

    @ViewBuilder private func sectionCard(_ sec: ProphetSection) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            Text(sec.title).font(AppearancePrefs.ui(.extraBold, 18, .headline)).foregroundStyle(Sunnah.Colors.primary)
            if sec == .verses {
                ForEach(p.ayat.filter { repo != nil && QuranAyahRange.parse($0.ref) != nil }, id: \.self) { a in
                    VStack(alignment: .leading, spacing: Sunnah.Spacing.s2) {
                        if let repo, let r = QuranAyahRange.parse(a.ref) {
                            QuranAyahText(range: r, repo: repo, paper: false)
                        }
                        if let path = SunnahAyahRange.mushafPath(a.ref) {
                            SunnahValueLink(value: Route.web(path: path)) {
                                Text(SunnahAyahRange.display(a.ref)).font(Sunnah.Typography.tag).foregroundStyle(Sunnah.Colors.primary).frame(minHeight: 44)
                            }.accessibilityIdentifier("prophet.ayah.\(a.ref)")
                        }
                    }
                }
            } else {
                ForEach(Array((p.sections[sec] ?? []).enumerated()), id: \.offset) { _, para in
                    if let head = Self.stageHeading(para) {
                        Text(head).font(AppearancePrefs.ui(.extraBold, 16, .subheadline)).foregroundStyle(Sunnah.Colors.textPrimary).padding(.top, 4)
                    } else {
                        SunnahArabicText(para, style: .reading).foregroundStyle(Sunnah.Colors.textPrimary)
                    }
                }
            }
            if !sourceLine(sec).isEmpty {
                Text("المصدر: \(sourceLine(sec))").font(AppearancePrefs.ui(.bold, 12, .caption)).foregroundStyle(Sunnah.Colors.textSecondary)
            }
        }
        .padding(18).frame(maxWidth: .infinity, alignment: .leading)
        .background(Sunnah.Colors.surface, in: RoundedRectangle(cornerRadius: 26, style: .continuous))
        .overlay(RoundedRectangle(cornerRadius: 26, style: .continuous).stroke(Sunnah.Colors.border, lineWidth: 1))
        .padding(.horizontal, Sunnah.Spacing.pageX)
    }

    /// فقرة قصيرة تبدأ بترقيم المراحل («١. …» أو «1. …») تُعرض عنوانًا فرعيًا.
    private static func stageHeading(_ para: String) -> String? {
        guard para.count <= 60, let f = para.first, f.isNumber || ("٠"..."٩").contains(String(f)) else { return nil }
        let rest = para.drop { $0.isNumber }
        return rest.hasPrefix(".") || rest.hasPrefix("٫") || rest.hasPrefix("-") ? para : nil
    }
}
