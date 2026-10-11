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
        catch { phase = .failed }
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
        registry.registerView(id: "fikr-waqia") { SirahSection.list(File.fikrWaqia, SirahAdapters.darsSections, base: "/fikr-waqia") }
        registry.registerView(id: "islamic-landmarks") { SirahSection.list(File.landmarks, SirahAdapters.landmarks, base: "/islamic-landmarks") }
        registry.registerView(id: "islamic-landmarks.map") {
            SirahLoadedView(source: File.landmarks, adapt: SirahAdapters.landmarks) { CardGridTemplate(items: $0, detailBase: "/islamic-landmarks") }
                .navigationTitle(SirahSection.title)
        }
        registry.registerView(id: "nations") { SirahSection.list(File.nations, SirahAdapters.nations, base: "/nations") }
        registry.registerView(id: "occasions") { SirahSection.list(File.occasions, SirahAdapters.occasions, base: "/occasions") }
        registry.registerView(id: "occasions-lessons") { SectionsListTemplate(links: SirahLinks.occasionsLessons).navigationTitle(SirahSection.title) }
        registry.registerView(id: "prophets") { SirahSection.list(File.prophets, SirahAdapters.prophets, base: "/prophets") }
        registry.registerView(id: "prophets.tree") { SirahSection.list(File.lineage, SirahAdapters.lineage, base: "/prophets/tree") }
        registry.registerView(id: "sahabah") { SirahSection.list(File.sahabah, SirahAdapters.sahabah, base: "/sahabah") }
        registry.registerView(id: "seerah") { SirahSection.list(File.seerah, SirahAdapters.seerah, base: "/seerah") }
        registry.registerView(id: "shamael") { SirahSection.list(File.shamail, SirahAdapters.shamail, base: "/shamael") }
        registry.registerView(id: "stories") { SirahSection.list(File.stories, SirahAdapters.stories, base: "/stories") }
        registry.registerView(id: "tarikh-islami") { SirahSection.list(File.history, SirahAdapters.history, base: "/tarikh-islami") }
        registry.registerView(id: "teachers") {
            SirahLoadedView(source: File.lessons, adapt: SirahAdapters.teachers) { SectionsListTemplate(links: $0) }
                .navigationTitle(SirahSection.title)
        }
    }

    /// مسارات :id للقسم. التفاصيل الطويلة (قصص، أنبياء، أبواب) بقالب المقال، والباقي بقالب التفاصيل.
    public static func resolve(path: String) -> AnyView? {
        let c = path.split(separator: "/").map(String.init)
        guard c.count == 2 else { return nil }
        let id = c[1].removingPercentEncoding ?? c[1]
        switch c[0] {
        case "fikr-waqia": return SirahSection.article(File.fikrWaqia, SirahAdapters.darsSections, id: id)
        case "islamic-landmarks": return SirahSection.detail(File.landmarks, SirahAdapters.landmarks, id: id)
        case "nations": return SirahSection.article(File.nations, SirahAdapters.nations, id: id)
        case "occasions": return SirahSection.detail(File.occasions, SirahAdapters.occasions, id: id)
        case "prophets": return id == "tree" ? nil : SirahSection.article(File.prophets, SirahAdapters.prophets, id: id)
        case "sahabah": return SirahSection.detail(File.sahabah, SirahAdapters.sahabah, id: id)
        case "seerah": return SirahSection.article(File.seerah, SirahAdapters.seerah, id: id)
        case "shamael": return SirahSection.article(File.shamail, SirahAdapters.shamail, id: id)
        case "stories": return SirahSection.article(File.stories, SirahAdapters.stories, id: id)
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
