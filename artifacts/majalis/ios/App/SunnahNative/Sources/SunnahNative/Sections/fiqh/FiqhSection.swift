import SwiftUI

/// مواضع ملفات القسم داخل الحزمة (بنية `ios-native/Data/` من سكربت التصدير). الأسماء مقترحة في docs/native/requests/fiqh.md.
enum FiqhSources {
    static let dir = "Data/fiqh"
    static let books = ContentSource.bundled(name: "books", subdirectory: dir)
    static let aliases = ContentSource.bundled(name: "book-aliases", subdirectory: dir)
    static let madhahib = ContentSource.bundled(name: "madhahib", subdirectory: dir)
    static let maqasid = ContentSource.bundled(name: "maqasid-sharia", subdirectory: dir)
    static let prayerRanks = ContentSource.bundled(name: "prayer-ranks", subdirectory: dir)
    static let usul = ContentSource.bundled(name: "usul-topics", subdirectory: dir)
    static let sins = ContentSource.bundled(name: "sins-and-rights", subdirectory: dir)
    static let medicine = ContentSource.bundled(name: "prophetic-medicine", subdirectory: dir)
    static let amr = ContentSource.bundled(name: "amr-bil-maruf", subdirectory: dir)
    static func guide(_ slug: String) -> ContentSource { .bundled(name: slug, subdirectory: dir + "/guides") }
}

/// كتالوج الكتب مع الأسماء البديلة؛ الأسماء البديلة اختيارية (غيابها لا يمنع العرض).
struct FiqhLibrary: Sendable {
    let catalog: FiqhCatalog
    let aliases: [FiqhBookAlias]

    static func load(_ loader: ContentLoader) async throws -> FiqhLibrary {
        let catalog = try await loader.load(FiqhCatalog.self, from: FiqhSources.books)
        let aliases = (try? await loader.load(FiqhAliasList.self, from: FiqhSources.aliases))?.aliases ?? []
        return FiqhLibrary(catalog: catalog, aliases: aliases)
    }
}

/// الكتالوج ~5 MB: يُفكّ مرة ويُعاد استعماله بين شاشات الكتاب والباب والمسألة.
actor FiqhLibraryCache {
    static let shared = FiqhLibraryCache()
    private var value: FiqhLibrary?

    func library(using loader: ContentLoader) async throws -> FiqhLibrary {
        if let value { return value }
        let loaded = try await FiqhLibrary.load(loader)
        value = loaded
        return loaded
    }
}

/// قسم «الفقه والعبادات» — الشاشات التي لا يناسبها قالب ContentItem المسطّح.
/// `register` يستبدل شاشات المولّد بالمعرّفات نفسها، و`resolve` يُستشار قبل GeneratedScreens.resolve.
public enum FiqhSection {
    static let guideSlugs = ["jumuah", "nikah", "riba", "ruqya", "sadaqa", "talaq", "udhiya", "waqf"]

    /// المسارات بلا معاملات التي يتولاها القسم (معرّف السجل = المقاطع مفصولة بنقطة، كما في المولّد).
    static let staticPaths = ["/fiqh", "/fiqh/usul", "/madhahib", "/maqasid-sharia", "/prayer-ranks",
                              "/sins-and-rights", "/prophetic-medicine", "/amr-bil-maruf", "/mawarith/calculator"] + guideSlugs.map { "/" + $0 }

    static func registryId(_ path: String) -> String {
        path.split(separator: "/").joined(separator: ".")
    }

    @MainActor public static func register(in registry: TemplateRegistry) {
        for path in staticPaths {
            registry.registerView(id: registryId(path)) { resolve(path: path) ?? AnyView(EmptyStateView()) }
        }
    }

    /// يحوّل مسار القسم إلى شاشته، أو nil لما ليس له (فيكمل المضيف إلى المولَّد/الويب).
    public static func resolve(path: String) -> AnyView? {
        let base = String(path.prefix { $0 != "?" && $0 != "#" })
        let c = base.split(separator: "/").map(String.init)
        guard let head = c.first else { return nil }

        switch (head, c.count) {
        case ("fiqh", 1):
            return library { FiqhAdapters.hub($0.catalog) }
        case ("fiqh", 2) where c[1] == "usul":
            return reading(FiqhSources.usul) { (t: [UsulTopic]) in FiqhAdapters.usul(t) }
        case ("fiqh", 3) where c[1] == "books":
            return library { lib in lib.catalog.visibleBook(c[2], aliases: lib.aliases).map(FiqhAdapters.book) }
        case ("fiqh", 3) where c[1] == "topics":
            let target = FiqhRoutes.topicRedirect(c[2])
            return target == base ? nil : resolve(path: target)
        case ("fiqh", 5) where c[1] == "books" && c[3] == "chapters":
            return library { lib in
                lib.catalog.visibleChapter(book: c[2], chapter: c[4], aliases: lib.aliases).map { FiqhAdapters.chapter($0.0, $0.1) }
            }
        case ("fiqh", 5) where c[1] == "books" && c[3] == "lessons":
            return library { lib in
                lib.catalog.visibleLesson(book: c[2], lesson: c[4], aliases: lib.aliases).map { FiqhAdapters.lesson($0.0, $0.1, $0.2) }
            }
        case ("madhahib", 1):
            return reading(FiqhSources.madhahib) { (m: [Madhhab]) in FiqhAdapters.madhahib(m) }
        case ("madhahib", 2):
            return reading(FiqhSources.madhahib) { (m: [Madhhab]) in m.first { $0.id == c[1] }.map(FiqhAdapters.madhhab) }
        case ("maqasid-sharia", 1):
            return reading(FiqhSources.maqasid) { (s: [DarsSection]) in FiqhAdapters.dars(title: "مقاصد الشريعة الإسلامية", s) }
        case ("prayer-ranks", 1):
            return reading(FiqhSources.prayerRanks) { (r: [PrayerRank]) in FiqhAdapters.prayerRanks(r) }
        case ("sins-and-rights", 1):
            return reading(FiqhSources.sins) { (b: SinsAndRightsBundle) in FiqhAdapters.sinsList(b) }
        case ("sins-and-rights", 2):
            return reading(FiqhSources.sins) { (b: SinsAndRightsBundle) in
                let reviewed = FiqhAdapters.reviewedSins(b)
                guard let topic = reviewed.first(where: { $0.slug == c[1] }) else { return nil }
                let related = (topic.relatedSlugs ?? []).compactMap { slug in reviewed.first { $0.slug == slug } }
                return FiqhAdapters.sin(topic, related: related)
            }
        case ("mawarith", 2) where c[1] == "calculator":
            return AnyView(MawarithCalculatorScreen())
        case ("prophetic-medicine", 1):
            return reading(FiqhSources.medicine) { (i: [PropheticMedicineItem]) in FiqhAdapters.propheticMedicine(i) }
        case ("amr-bil-maruf", 1):
            return reading(FiqhSources.amr) { (b: AmrBilMarufBundle) in FiqhAdapters.amrBilMaruf(b) }
        case (let slug, 1) where guideSlugs.contains(slug):
            return reading(FiqhSources.guide(slug)) { (g: FiqhGuide) in FiqhAdapters.guide(g) }
        default:
            return nil
        }
    }

    private static func reading<D: Decodable & Sendable>(_ source: ContentSource, _ adapt: @escaping (D) -> FiqhReading?) -> AnyView {
        AnyView(FiqhLoadHost(load: { try await $0.load(D.self, from: source) }) { FiqhReadingView(reading: adapt($0)) })
    }

    private static func library(_ adapt: @escaping (FiqhLibrary) -> FiqhReading?) -> AnyView {
        AnyView(FiqhLoadHost(load: { try await FiqhLibraryCache.shared.library(using: $0) }) { FiqhReadingView(reading: adapt($0)) })
    }
}
