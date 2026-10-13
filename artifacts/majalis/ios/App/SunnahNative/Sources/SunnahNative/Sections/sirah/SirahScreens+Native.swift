import SwiftUI

/// يحمّل ملف القسم بشكله المُصدَّر ثم يحوّله ويعرضه بقالب موجود.
/// غياب الملف من الحزمة يعني أن المحتوى لم يُصدَّق بعد: يُعرض حال فراغ لا خطأ.
struct SirahLoadedView<Raw: Decodable & Sendable, Output, V: View>: View {
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
            case .unavailable: EmptyStateView(title: SirahSection.pendingTitle)
            case .ready(let output): content(output)
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Sunnah.Colors.bg)
        .task { await load() }
    }

    private func load() async {
        phase = .loading
        do { phase = .ready(adapt(try await loader.load(Raw.self, from: source))) }
        catch ContentError.missingBundledFile { phase = .unavailable }
        catch is CancellationError { return }  // إلغاء .task عند إعادة بناء الواجهة ليس فشلًا
        catch let e as URLError where e.code == .cancelled { return }
        catch { phase = .failed }
    }
}

/// عناصر بلا مسار تفاصيل مبقى (ROUTE_TEMPLATE_MAP): تُقرأ في الشاشة نفسها بورقة، لا بمسار جديد.
struct SirahInlineItemsView: View {
    enum Reader { case article, detail }
    let items: [ContentItem]
    var reader: Reader = .article
    @State private var open: ContentItem?

    var body: some View {
        Group {
            if items.isEmpty { EmptyStateView() } else {
                List(items) { item in
                    Button { open = item } label: { SunnahListRow(title: item.title, subtitle: item.subtitle) }
                        .buttonStyle(.plain).listRowBackground(Sunnah.Colors.surface)
                }
                .listStyle(.plain).scrollContentBackground(.hidden)
            }
        }
        .background(Sunnah.Colors.bg)
        .sheet(item: $open) { item in
            NavigationStack {
                Group {
                    switch reader {
                    case .article: ArticleTemplate(item: item)
                    case .detail: DetailTemplate(item: item)
                    }
                }
                .toolbar {
                    ToolbarItem(placement: .cancellationAction) { Button("إغلاق") { open = nil } }
                }
            }
        }
    }
}

/// شاشات قسم «السيرة والتاريخ والأعلام» الأصلية: تحلّ محل المولَّدة بالمعرّفات نفسها
/// لأن المولَّدة تفكّ `[ContentItem]` مباشرة وبيانات القسم لا تطابق ذلك الشكل.
/// الربط: `SirahSection.register(in:)` بعد `GeneratedScreens.registerAll`، و`SirahSection.resolve(path:)` قبل `GeneratedScreens.resolve` (انظر docs/native/requests/sirah.md).
public enum SirahSection {
    static let title = "السيرة والتاريخ والأعلام"
    static let pendingTitle = "المحتوى قيد التوثيق"

    enum File {
        static let fikrWaqia = SirahData.file("fikr-waqia")
        static let landmarks = SirahData.file("islamic-landmarks")
        static let nations = SirahData.file("nations")
        static let occasions = SirahData.file("occasions-verified")
        static let prophets = SirahData.file("prophets-knowledge")
        static let lineage = SirahData.file("prophets-lineage")
        static let sahabah = SirahData.file("sahabah")
        static let seerah = SirahData.file("seerah-phases")
        static let shamail = SirahData.file("shamail")
        static let stories = SirahData.file("stories")
        static let history = SirahData.file("islamic-history")
        /// صفوف الدروس من الشبكة (DATA_CONTRACT §2): قسم الدروس يملك المصدر، وهنا قراءة فقط.
        static let lessons = ContentSource.remote(path: "/data/lessons/chunk-000.json", maxAge: 3600)
    }

    /// معرّف الشاشة ← (مصدر، بناء). المعرّفات مطابقة لـGenerated/SirahScreens.swift.
    @MainActor public static func register(in registry: TemplateRegistry) {
        registry.registerView(id: "fikr-waqia") { SirahSection.inline(File.fikrWaqia, { (f: SirahDarsFile) in SirahAdapters.darsSections(f.sections) }) }
        registry.registerView(id: "islamic-landmarks") { SirahSection.list(File.landmarks, SirahAdapters.landmarks, base: "/islamic-landmarks") }
        registry.registerView(id: "islamic-landmarks.map") {
            SirahLoadedView(source: File.landmarks, adapt: SirahAdapters.landmarks) { CardGridTemplate(items: $0, detailBase: "/islamic-landmarks") }
                .navigationTitle(SirahSection.title)
        }
        registry.registerView(id: "nations") { SirahSection.list(File.nations, SirahAdapters.nations, base: "/nations") }
        registry.registerView(id: "occasions") { SirahSection.inline(File.occasions, SirahAdapters.occasions, reader: .detail) }
        registry.registerView(id: "occasions-lessons") { SectionsListTemplate(links: SirahLinks.occasionsLessons).navigationTitle(SirahSection.title) }
        registry.registerView(id: "prophets") { SirahSection.fullArticle(File.prophets, SirahAdapters.prophets, id: "prophets", title: "قصص الأنبياء") }
        registry.registerView(id: "prophets.tree") { SirahSection.inline(File.lineage, SirahAdapters.lineage, reader: .detail) }
        registry.registerView(id: "sahabah") { SirahSection.inline(File.sahabah, SirahAdapters.sahabah, reader: .detail) }
        registry.registerView(id: "seerah") { SirahSection.inline(File.seerah, SirahAdapters.seerah) }
        registry.registerView(id: "shamael") {
            SirahLoadedView(source: File.shamail, adapt: { (tabs: [ShamailTab]) in tabs }) { ShamailView(tabs: $0) }
                .navigationTitle(SirahSection.title)
        }
        registry.registerView(id: "stories") { SirahSection.fullArticle(File.stories, SirahAdapters.stories, id: "stories", title: "القصص الإسلامية") }
        registry.registerView(id: "tarikh-islami") { SirahSection.list(File.history, SirahAdapters.history, base: "/tarikh-islami") }
        registry.registerView(id: "teachers") {
            SirahLoadedView(source: File.lessons, adapt: SirahAdapters.teachers) { SectionsListTemplate(links: $0) }
                .navigationTitle(SirahSection.title)
        }
    }

    /// مسارات :id المبقاة فقط في ROUTE_TEMPLATE_MAP (المعالم، الأمم، التاريخ، المشايخ)؛ غيرها لا يُبنى.
    @MainActor public static func resolve(path: String) -> AnyView? {
        let c = path.split(separator: "/").map(String.init)
        guard c.count == 2 else { return nil }
        let id = c[1].removingPercentEncoding ?? c[1]
        switch c[0] {
        case "islamic-landmarks":
            if id == "map" { return TemplateRegistry.shared.view(for: "islamic-landmarks.map") }  // شاشة الخريطة مسجّلة بمعرّفها لا كتفصيل؛ بدونها يلتقطها المولَّد كتفصيل id=map
            return SirahSection.detail(File.landmarks, SirahAdapters.landmarks, id: id)
        case "nations": return SirahSection.article(File.nations, SirahAdapters.nations, id: id)
        case "tarikh-islami": return SirahSection.article(File.history, SirahAdapters.history, id: id)
        case "teachers":
            return AnyView(SirahLoadedView(source: File.lessons, adapt: { SirahAdapters.teacher(slug: c[1], rows: $0) }) { item in
                if let item { DetailTemplate(item: item) } else { EmptyStateView() }
            })
        default: return nil
        }
    }

    // MARK: بُناة

    private static func list<Raw: Decodable & Sendable>(_ source: ContentSource, _ adapt: @escaping (Raw) -> [ContentItem], base: String) -> some View {
        SirahLoadedView(source: source, adapt: adapt) { ListTemplate(items: $0, detailBase: base) }
            .navigationTitle(SirahSection.title)
    }

    private static func inline<Raw: Decodable & Sendable>(_ source: ContentSource, _ adapt: @escaping (Raw) -> [ContentItem],
                                                          reader: SirahInlineItemsView.Reader = .article) -> some View {
        SirahLoadedView(source: source, adapt: adapt) { SirahInlineItemsView(items: $0, reader: reader) }
            .navigationTitle(SirahSection.title)
    }

    /// قالب «مقال» لصفحة كاملة: كل العناصر المصدَّقة في مقال واحد.
    private static func fullArticle<Raw: Decodable & Sendable>(_ source: ContentSource, _ adapt: @escaping (Raw) -> [ContentItem], id: String, title: String) -> some View {
        SirahLoadedView(source: source, adapt: { SirahAdapters.article(adapt($0), id: id, title: title) }) { item in
            if let item { ArticleTemplate(item: item) } else { EmptyStateView() }
        }
    }

    private static func pick<Raw>(_ adapt: @escaping (Raw) -> [ContentItem], _ id: String) -> (Raw) -> ContentItem? {
        { raw in adapt(raw).first { $0.id == id } }
    }

    private static func detail<Raw: Decodable & Sendable>(_ source: ContentSource, _ adapt: @escaping (Raw) -> [ContentItem], id: String) -> AnyView {
        AnyView(SirahLoadedView(source: source, adapt: pick(adapt, id)) { item in
            if let item { DetailTemplate(item: item) } else { EmptyStateView() }
        })
    }

    private static func article<Raw: Decodable & Sendable>(_ source: ContentSource, _ adapt: @escaping (Raw) -> [ContentItem], id: String) -> AnyView {
        AnyView(SirahLoadedView(source: source, adapt: pick(adapt, id)) { item in
            if let item { ArticleTemplate(item: item) } else { EmptyStateView() }
        })
    }
}
