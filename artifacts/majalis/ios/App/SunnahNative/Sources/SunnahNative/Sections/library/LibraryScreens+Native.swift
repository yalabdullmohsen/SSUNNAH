import SwiftUI

/// يحمّل ملف القسم بشكله المُصدَّر ثم يحوّله ويعرضه.
/// غياب الملف من الحزمة يعني أن المحتوى لم يُصدَّق بعد: حال فراغ لا خطأ.
struct LibraryLoadedView<Raw: Decodable & Sendable, Output, V: View>: View {
    @Environment(\.contentLoader) private var loader
    @State private var phase: Phase = .loading
    let source: ContentSource
    let adapt: (Raw) -> Output
    @ViewBuilder let content: (Output) -> V

    private enum Phase { case loading, failed, unavailable, ready(Output) }

    var body: some View {
        Group {
            switch phase {
            case .loading: LoadingStateView()
            case .failed: ErrorStateView { Task { await load() } }
            case .unavailable: EmptyStateView(title: LibrarySection.pendingTitle)
            case .ready(let output): content(output)
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Sunnah.Colors.bg)
        .task(id: String(describing: source)) { await load() }
    }

    private func load() async {
        phase = .loading
        do { phase = .ready(adapt(try await loader.load(Raw.self, from: source))) }
        catch ContentError.missingBundledFile { phase = .unavailable }
        catch { phase = .failed }
    }
}

/// عناصر بلا مسار تفاصيل مبقى (ROUTE_TEMPLATE_MAP): تُقرأ في الشاشة نفسها كما في الويب، بورقة لا بمسار جديد.
struct LibraryInlineItemsView: View {
    enum Layout { case list, grid }
    enum Reader { case article, detail }
    let items: [ContentItem]
    var layout: Layout = .list
    var reader: Reader = .article
    @State private var open: ContentItem?

    var body: some View {
        Group {
            if items.isEmpty { EmptyStateView() } else {
                switch layout {
                case .list:
                    SunnahCardStack {
                        ForEach(Array(items.enumerated()), id: \.element.id) { i, item in
                            Button { Sunnah.Haptics.select(); open = item } label: { SunnahItemCard(title: item.title, subtitle: item.subtitle, gold: i % 3 == 1) }
                                .buttonStyle(.plain).sunnahPressable()
                        }
                    }
                case .grid:
                    ScrollView {
                        LazyVGrid(columns: [GridItem(.adaptive(minimum: Sunnah.Spacing.cardMinWidth), spacing: Sunnah.Spacing.s3)], spacing: Sunnah.Spacing.s3) {
                            ForEach(items) { item in
                                Button { open = item } label: { ContentCard(item) }.buttonStyle(.plain)
                            }
                        }
                        .padding(Sunnah.Spacing.pageX)
                    }
                }
            }
        }
        .background(Sunnah.Colors.bg)
        .fullScreenCover(item: $open) { item in
            VStack(spacing: 0) {
                HStack {
                    Button { open = nil } label: {
                        Text("إغلاق").font(Sunnah.Typography.cardTitle).foregroundStyle(Sunnah.Colors.primary)
                            .frame(minWidth: 64, minHeight: 44).contentShape(Rectangle())
                    }
                    .buttonStyle(.plain).accessibilityIdentifier("library.reader.close")
                    Spacer()
                }
                .padding(.horizontal, Sunnah.Spacing.pageX)
                Group {
                    switch reader {
                    case .article: ArticleTemplate(item: item)
                    case .detail: DetailTemplate(item: item)
                    }
                }
            }
            .background(Sunnah.Colors.bg)
        }
    }
}

/// قائمة روابط مجمّعة بعناوين (المزيد، خريطة الموقع).
struct LibraryGroupedLinksView: View {
    @Environment(\.openRoute) private var openRoute
    let groups: [LibraryAdapters.NavGroup]

    var body: some View {
        if groups.isEmpty { EmptyStateView() } else {
            SunnahRowStack {
                ForEach(groups, id: \.title) { group in
                    SunnahRowGroupHeader(group.title)
                    ForEach(group.links) { link in
                        Button { openRoute(link.route) } label: { SunnahListRow(title: link.title, subtitle: link.subtitle) }
                            .buttonStyle(.plain).sunnahStackRow()
                            .accessibilityIdentifier("sections.item.\(link.route)")
                    }
                }
            }
        }
    }
}

/// مساعد الباحث: فجوات التصنيفات وأكثر الكلمات المفتاحية في المنشور (محلي، بلا شبكة).
struct LibraryResearchAssistantView: View {
    let insights: LibraryAdapters.ResearchInsights

    var body: some View {
        SunnahRowStack {
            SunnahRowGroupHeader("تغطية التصنيفات (الأقل أولًا)")
            ForEach(insights.coverage, id: \.label) { row in
                SunnahListRow(title: row.label, subtitle: row.count == 0 ? "لا أبحاث منشورة بعد" : "\(row.count) بحثًا منشورًا")
                    .sunnahStackRow()
            }
            if !insights.topKeywords.isEmpty {
                SunnahRowGroupHeader("الموضوعات الأكثر بحثًا")
                ForEach(insights.topKeywords, id: \.label) { row in
                    SunnahListRow(title: row.label, subtitle: "\(row.count) بحثًا").sunnahStackRow()
                }
            }
        }
    }
}

/// البحث الموحّد: تطبيع عربي على فهرس محزوم، والنتيجة تفتح مسارها في التطبيق.
struct LibrarySearchView: View {
    @Environment(\.openRoute) private var openRoute
    let index: LibrarySearchIndex
    @State private var query = ""

    var body: some View {
        let results = LibraryAdapters.search(index, query: query)
        let groups = Dictionary(grouping: results, by: { $0.subtitle ?? "أخرى" })
        let order = results.reduce(into: [String]()) { if !$0.contains($1.subtitle ?? "أخرى") { $0.append($1.subtitle ?? "أخرى") } }
        Group {
            if results.isEmpty {
                if query.trimmingCharacters(in: .whitespacesAndNewlines).count < 2 {
                    VStack(spacing: Sunnah.Spacing.s3) {
                        SunnahMessageState(symbol: "magnifyingglass", title: "ابحث في المكتبة", message: "اكتب كلمة أو عبارة لتظهر النتائج مصنّفة حسب القسم.").screenState(.empty)
                        HStack(spacing: Sunnah.Spacing.s2) {
                            ForEach(["الصلاة", "البقرة", "الصيام"], id: \.self) { w in
                                Button { Sunnah.Haptics.select(); query = w } label: { SunnahChip(w) }.buttonStyle(.plain).sunnahPressable()
                            }
                        }
                        Spacer(minLength: 0)
                    }
                } else {
                    EmptyStateView(title: "لا نتائج", message: "جرّب كلمة أخرى أو تحقّق من الإملاء.", symbol: "magnifyingglass")
                }
            } else {
                SunnahCardStack {
                    ForEach(order, id: \.self) { kind in
                        SunnahCardGroupHeader(title: kind, count: groups[kind]?.count)
                        ForEach(groups[kind] ?? []) { item in
                            Button { Sunnah.Haptics.select(); openRoute(item.route ?? "/") } label: { SunnahItemCard(title: item.title, symbol: Self.symbol(kind)) }
                                .buttonStyle(.plain).sunnahPressable()
                        }
                    }
                }
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Sunnah.Colors.bg)
        .sunnahSearchable(text: $query)
    }
}

extension LibrarySearchView {
    static func symbol(_ kind: String) -> String {
        switch kind {
        case "تفسير", "سورة": return "book"
        case "حديث": return "text.quote"
        case "ذكر": return "heart.text.square"
        case "سؤال وجواب": return "questionmark.bubble"
        case "نبي", "أمة", "تاريخ": return "clock.arrow.circlepath"
        case "درس": return "graduationcap"
        case "علَم": return "person"
        default: return "doc.text"
        }
    }
}

/// بطاقات للمشاركة: يكتب المستخدم النص ومصدره، وتُصدَّر صورة. لا نص افتراضي (لا محتوى شرعي من الكود).
struct LibraryCardsView: View {
    @Environment(\.layoutDirection) private var direction
    @State private var text = ""
    @State private var source = ""

    private var card: some View {
        SunnahCard {
            VStack(alignment: .leading, spacing: Sunnah.Spacing.s3) {
                Text(text.isEmpty ? "اكتب النص هنا" : text).font(Sunnah.Typography.sectionTitle)
                    .foregroundStyle(text.isEmpty ? Sunnah.Colors.textSecondary : Sunnah.Colors.textPrimary)
                if !source.isEmpty { Text(source).font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.primary) }
            }
            .padding(Sunnah.Spacing.s4)
        }
    }

    @MainActor private var rendered: Image? {
        let renderer = ImageRenderer(content: card.frame(width: Sunnah.Spacing.cardMinWidth * 2).padding(Sunnah.Spacing.s4).background(Sunnah.Colors.bg).environment(\.layoutDirection, direction))
        renderer.scale = 3
        return renderer.cgImage.map { Image(decorative: $0, scale: 3) }
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: Sunnah.Spacing.s4) {
                card
                TextField("النص", text: $text, axis: .vertical).font(Sunnah.Typography.body).foregroundStyle(Sunnah.Colors.textPrimary)
                    .padding(Sunnah.Spacing.s3).frame(minHeight: 44)
                    .background(Sunnah.Colors.surface2, in: RoundedRectangle(cornerRadius: Sunnah.Radius.small))
                TextField("المصدر (مثل: رواه البخاري)", text: $source).font(Sunnah.Typography.body).foregroundStyle(Sunnah.Colors.textPrimary)
                    .padding(Sunnah.Spacing.s3).frame(minHeight: 44)
                    .background(Sunnah.Colors.surface2, in: RoundedRectangle(cornerRadius: Sunnah.Radius.small))
                if !text.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty, let image = rendered {
                    ShareLink(item: image, preview: SharePreview(text, image: image)) {
                        Text("مشاركة البطاقة").font(Sunnah.Typography.cardTitle)
                            .frame(maxWidth: .infinity, minHeight: Sunnah.Spacing.buttonHeight)
                            .foregroundStyle(Sunnah.Colors.textOnPrimary)
                            .background(Sunnah.Colors.primary, in: RoundedRectangle(cornerRadius: Sunnah.Radius.small))
                    }
                }
            }
            .padding(Sunnah.Spacing.pageX)
        }
        .background(Sunnah.Colors.bg)
    }
}

/// شاشات قسم «اللغة والمكتبة والبحث» الأصلية: تحلّ محل المولَّدة بالمعرّفات نفسها.
/// الربط: `LibrarySection.register(in:)` بعد `GeneratedScreens.registerAll`، و`LibrarySection.resolve(path:)` قبل `GeneratedScreens.resolve` (docs/native/requests/library.md).
public enum LibrarySection {
    static let title = "اللغة والمكتبة والبحث"
    static let pendingTitle = "المحتوى قيد التوثيق"

    enum File {
        static let research = LibraryData.file("academic-research")
        static let arabic = LibraryData.file("arabic-language")
        static let mawsuaat = LibraryData.file("mawsuaat")
        static let glossary = LibraryData.file("islamic-glossary")
        static let mindMaps = LibraryData.file("mind-maps")
        static let announcements = LibraryData.file("scientific-announcements")
        static let navigation = LibraryData.file("navigation")
        static let searchIndex = LibraryData.file("search-index")
        static let terms = LibraryData.file("terms")
        static let methodology = LibraryData.file("methodology")
        /// تشغيلي ويتغيّر (DATA_CONTRACT §2): من الشبكة.
        static let accounts = ContentSource.remote(path: "/data/sources/accounts.json", maxAge: 86_400)
        static let feed = ContentSource.remote(path: "/data/lessons/feed.json", maxAge: 3600)
    }

    @MainActor public static func register(in registry: TemplateRegistry) {
        registry.registerView(id: "academic-research") {
            LibrarySection.titled(LibraryLoadedView(source: File.research, adapt: { LibraryAdapters.research($0) }) { LibraryHubScreen(items: $0) })
        }
        registry.registerView(id: "academic-research.assistant") {
            LibrarySection.titled(LibraryLoadedView(source: File.research, adapt: { LibraryAdapters.insights($0) }) { LibraryResearchAssistantView(insights: $0) })
        }
        registry.registerView(id: "academic-research.submit") {
            LibrarySection.titled(EmptyStateView(title: "استقبال الأبحاث غير متاح في التطبيق بعد"))
        }
        registry.registerView(id: "arabic-language") { LibrarySection.inline(File.arabic, LibraryAdapters.darsSections) }
        registry.registerView(id: "cards") { LibrarySection.titled(LibraryCardsView()) }
        registry.registerView(id: "islamic-directory") { LibrarySection.titled(SectionsListTemplate(links: LibraryLinks.directory)) }
        registry.registerView(id: "islamic-glossary") {
            LibrarySection.inline(File.glossary, LibraryAdapters.glossary, reader: .detail)
        }
        registry.registerView(id: "mawsuaat") { LibrarySection.inline(File.mawsuaat, LibraryAdapters.darsSections) }
        registry.registerView(id: "methodology") {
            LibraryLoadedView(source: File.methodology, adapt: { LibraryAdapters.document($0, id: "methodology") }) { ArticleTemplate(item: $0) }
        }
        registry.registerView(id: "mind-map") {
            LibrarySection.inline(File.mindMaps, LibraryAdapters.mindMaps, layout: .grid, reader: .detail)
        }
        registry.registerView(id: "more") {
            LibrarySection.titled(LibraryLoadedView(source: File.navigation, adapt: { LibraryAdapters.more($0) }) { LibraryGroupedLinksView(groups: $0) })
        }
        registry.registerView(id: "search") {
            LibrarySection.titled(LibraryLoadedView(source: File.searchIndex, adapt: { $0 as LibrarySearchIndex }) { LibrarySearchView(index: $0) })
        }
        registry.registerView(id: "sections") {
            // «كل الأقسام» لا تربط بنفسها (النقر كان لا يفعل شيئًا)
            LibraryLoadedView(source: File.navigation, adapt: { nav in
                LibraryAdapters.sectionsPage(nav)
            }) { SunnahSectionsHub(groups: $0) }
        }
        registry.registerView(id: "sitemap") {
            LibrarySection.titled(LibraryLoadedView(source: File.navigation, adapt: { LibraryAdapters.sitemap($0) }) { LibraryGroupedLinksView(groups: $0) })
        }
        registry.registerView(id: "sources") {
            LibrarySection.titled(LibraryLoadedView(source: File.accounts, adapt: LibraryAdapters.sources) { ListTemplate(items: $0, detailBase: "/sources") })
        }
        registry.registerView(id: "terms") {
            LibraryLoadedView(source: File.terms, adapt: { LibraryAdapters.document($0, id: "terms") }) { ArticleTemplate(item: $0) }
        }
    }

    /// مسارات :id المبقاة للقسم فقط (academic-research، scientific-announcements، sources)؛ غيرها لا يُبنى.
    public static func resolve(path: String) -> AnyView? {
        let c = path.split(separator: "/").map(String.init)
        guard c.count == 2 else { return nil }
        let id = c[1].removingPercentEncoding ?? c[1]
        switch c[0] {
        case "academic-research":
            // يلتقطها المسار العام ذو المقطعين في Generated فيفك ملفًا بشكل خاطئ؛ نعيد العرض المسجَّل صراحةً.
            if id == "assistant" {
                return AnyView(LibrarySection.titled(LibraryLoadedView(source: File.research, adapt: { LibraryAdapters.insights($0) }) { LibraryResearchAssistantView(insights: $0) }))
            }
            if id == "submit" { return AnyView(LibrarySection.titled(EmptyStateView(title: "استقبال الأبحاث غير متاح في التطبيق بعد"))) }
            return AnyView(LibraryLoadedView(source: File.research, adapt: { LibraryAdapters.research($0, id: id) }) { item in
                if let item { DetailTemplate(item: item) } else { EmptyStateView() }
            })
        case "scientific-announcements": return LibrarySection.detail(File.announcements, LibraryAdapters.announcements, id: id)
        case "sources":
            return AnyView(LibrarySourceDetailView(id: id))
        default: return nil
        }
    }

    // MARK: بُناة

    static func titled<V: View>(_ view: V) -> some View { view.frame(maxWidth: .infinity, maxHeight: .infinity).background(Sunnah.Colors.bg).registryTitle(LibrarySection.title) }

    private static func inline<Raw: Decodable & Sendable>(_ source: ContentSource, _ adapt: @escaping (Raw) -> [ContentItem],
                                                          layout: LibraryInlineItemsView.Layout = .list,
                                                          reader: LibraryInlineItemsView.Reader = .article) -> some View {
        titled(LibraryLoadedView(source: source, adapt: adapt) { LibraryInlineItemsView(items: $0, layout: layout, reader: reader) })
    }

    private static func pick<Raw>(_ adapt: @escaping (Raw) -> [ContentItem], _ id: String) -> (Raw) -> ContentItem? {
        { raw in adapt(raw).first { $0.id == id } }
    }

    private static func detail<Raw: Decodable & Sendable>(_ source: ContentSource, _ adapt: @escaping (Raw) -> [ContentItem], id: String) -> AnyView {
        AnyView(LibraryLoadedView(source: source, adapt: pick(adapt, id)) { item in
            if let item { DetailTemplate(item: item) } else { EmptyStateView() }
        })
    }
}

/// تفاصيل مصدر: الحساب من accounts.json، وآخر ما نُشر منه من feed.json إن توفّر.
struct LibrarySourceDetailView: View {
    @Environment(\.contentLoader) private var loader
    @State private var phase: Phase = .loading
    let id: String

    private enum Phase { case loading, failed, missing, ready(ContentItem) }

    var body: some View {
        Group {
            switch phase {
            case .loading: LoadingStateView()
            case .failed: ErrorStateView { Task { await load() } }
            case .missing: EmptyStateView()
            case .ready(let item): DetailTemplate(item: item)
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Sunnah.Colors.bg)
        .task(id: id) { await load() }
    }

    private func load() async {
        phase = .loading
        do {
            let accounts = try await loader.load(LibrarySourceAccountsFile.self, from: LibrarySection.File.accounts)
            let feed = try? await loader.load(LibraryFeedFile.self, from: LibrarySection.File.feed)
            if let item = LibraryAdapters.source(id: id, accounts: accounts, feed: feed) { phase = .ready(item) } else { phase = .missing }
        } catch { phase = .failed }
    }
}


/// صفحة «اللغة والمكتبة والبحث»: محور ببطاقات الوجهات وعدد عناصرها، والبحث في الأبحاث ثانويًا فوقه.
struct LibraryHubScreen: View {
    @Environment(\.contentLoader) private var loader
    let items: [ContentItem]
    @State private var counts: [String: Int] = [:]

    var body: some View {
        SearchTemplate(items: items, detailBase: "/academic-research", hub: LibraryLinks.hub, hubCounts: counts)
            .task {
                var c: [String: Int] = [:]
                if let d = try? await loader.load([LibraryDarsSection].self, from: LibrarySection.File.arabic) { c["/arabic-language"] = LibraryAdapters.darsSections(d).count }
                if let d = try? await loader.load([LibraryDarsSection].self, from: LibrarySection.File.mawsuaat) { c["/mawsuaat"] = LibraryAdapters.darsSections(d).count }
                if let g = try? await loader.load([LibraryGlossaryTerm].self, from: LibrarySection.File.glossary) { c["/islamic-glossary"] = LibraryAdapters.glossary(g).count }
                c["/islamic-directory"] = LibraryLinks.directory.count
                counts = c
            }
    }
}
