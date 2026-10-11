// مُولَّد بـ scripts/generate-native-screens.mjs من ROUTE_TEMPLATE_MAP.json — لا تعدّل يدويًا.
import SwiftUI

struct LibraryAcademicResearchScreen: ScreenTemplate {
    static let id = "academic-research"
    static let title = "اللغة والمكتبة والبحث"
    static let source = ContentSource.bundled(name: "academic-research")
    typealias Content = [ContentItem]
    let content: Content
    init(content: Content) { self.content = content }
    var body: some View { SearchTemplate(items: content, detailBase: "/academic-research") }
}

struct LibraryAcademicResearchAssistantScreen: ScreenTemplate {
    static let id = "academic-research.assistant"
    static let title = "اللغة والمكتبة والبحث"
    static let source = ContentSource.bundled(name: "academic-research-assistant")
    typealias Content = [ContentItem]
    let content: Content
    init(content: Content) { self.content = content }
    var body: some View { SearchTemplate(items: content, detailBase: "/academic-research/assistant") }
}

struct LibraryAcademicResearchSubmitScreen: ScreenTemplate {
    static let id = "academic-research.submit"
    static let title = "اللغة والمكتبة والبحث"
    static let source = ContentSource.bundled(name: "academic-research-submit")
    typealias Content = [ContentItem]
    let content: Content
    init(content: Content) { self.content = content }
    var body: some View { SearchTemplate(items: content, detailBase: "/academic-research/submit") }
}

struct LibraryArabicLanguageScreen: ScreenTemplate {
    static let id = "arabic-language"
    static let title = "اللغة والمكتبة والبحث"
    static let source = ContentSource.bundled(name: "arabic-language")
    typealias Content = [ContentItem]
    let content: Content
    init(content: Content) { self.content = content }
    var body: some View { ListTemplate(items: content, detailBase: "/arabic-language") }
}

struct LibraryCardsScreen: ScreenTemplate {
    static let id = "cards"
    static let title = "اللغة والمكتبة والبحث"
    static let source = ContentSource.bundled(name: "cards")
    typealias Content = [ContentItem]
    let content: Content
    init(content: Content) { self.content = content }
    var body: some View { ListTemplate(items: content, detailBase: "/cards") }
}

struct LibraryIslamicDirectoryScreen: ScreenTemplate {
    static let id = "islamic-directory"
    static let title = "اللغة والمكتبة والبحث"
    static let source = ContentSource.bundled(name: "islamic-directory")
    typealias Content = [SectionLink]
    let content: Content
    init(content: Content) { self.content = content }
    var body: some View { SectionsListTemplate(links: content) }
}

struct LibraryIslamicGlossaryScreen: ScreenTemplate {
    static let id = "islamic-glossary"
    static let title = "اللغة والمكتبة والبحث"
    static let source = ContentSource.bundled(name: "islamic-glossary")
    typealias Content = [ContentItem]
    let content: Content
    init(content: Content) { self.content = content }
    var body: some View { ListTemplate(items: content, detailBase: "/islamic-glossary") }
}

struct LibraryMawsuaatScreen: ScreenTemplate {
    static let id = "mawsuaat"
    static let title = "اللغة والمكتبة والبحث"
    static let source = ContentSource.bundled(name: "mawsuaat")
    typealias Content = [ContentItem]
    let content: Content
    init(content: Content) { self.content = content }
    var body: some View { ListTemplate(items: content, detailBase: "/mawsuaat") }
}

struct LibraryMethodologyScreen: ScreenTemplate {
    static let id = "methodology"
    static let title = "اللغة والمكتبة والبحث"
    static let source = ContentSource.bundled(name: "methodology")
    typealias Content = [ContentItem]
    let content: Content
    init(content: Content) { self.content = content }
    var body: some View { ListTemplate(items: content, detailBase: "/methodology") }
}

struct LibraryMindMapScreen: ScreenTemplate {
    static let id = "mind-map"
    static let title = "اللغة والمكتبة والبحث"
    static let source = ContentSource.bundled(name: "mind-map")
    typealias Content = [ContentItem]
    let content: Content
    init(content: Content) { self.content = content }
    var body: some View { CardGridTemplate(items: content, detailBase: "/mind-map") }
}

struct LibraryMoreScreen: ScreenTemplate {
    static let id = "more"
    static let title = "اللغة والمكتبة والبحث"
    static let source = ContentSource.bundled(name: "more")
    typealias Content = [ContentItem]
    let content: Content
    init(content: Content) { self.content = content }
    var body: some View { ListTemplate(items: content, detailBase: "/more") }
}

struct LibrarySearchScreen: ScreenTemplate {
    static let id = "search"
    static let title = "اللغة والمكتبة والبحث"
    static let source = ContentSource.bundled(name: "search")
    typealias Content = [ContentItem]
    let content: Content
    init(content: Content) { self.content = content }
    var body: some View { SearchTemplate(items: content, detailBase: "/search") }
}

struct LibrarySectionsScreen: ScreenTemplate {
    static let id = "sections"
    static let title = "اللغة والمكتبة والبحث"
    static let source = ContentSource.bundled(name: "sections")
    typealias Content = [SectionLink]
    let content: Content
    init(content: Content) { self.content = content }
    var body: some View { SectionsListTemplate(links: content) }
}

struct LibrarySitemapScreen: ScreenTemplate {
    static let id = "sitemap"
    static let title = "اللغة والمكتبة والبحث"
    static let source = ContentSource.bundled(name: "sitemap")
    typealias Content = [ContentItem]
    let content: Content
    init(content: Content) { self.content = content }
    var body: some View { CardGridTemplate(items: content, detailBase: "/sitemap") }
}

struct LibrarySourcesScreen: ScreenTemplate {
    static let id = "sources"
    static let title = "اللغة والمكتبة والبحث"
    static let source = ContentSource.bundled(name: "sources")
    typealias Content = [ContentItem]
    let content: Content
    init(content: Content) { self.content = content }
    var body: some View { ListTemplate(items: content, detailBase: "/sources") }
}

struct LibraryTermsScreen: ScreenTemplate {
    static let id = "terms"
    static let title = "اللغة والمكتبة والبحث"
    static let source = ContentSource.bundled(name: "terms")
    typealias Content = [ContentItem]
    let content: Content
    init(content: Content) { self.content = content }
    var body: some View { ListTemplate(items: content, detailBase: "/terms") }
}

/// قسم «اللغة والمكتبة والبحث». المسارات بلا معاملات تُسجَّل في TemplateRegistry (Route.native(id:))، وذات :id تُحلّ بـresolve.
public enum LibraryScreens {
    @MainActor public static func register(in registry: TemplateRegistry) {
        registry.register(LibraryAcademicResearchScreen.self)
        registry.register(LibraryAcademicResearchAssistantScreen.self)
        registry.register(LibraryAcademicResearchSubmitScreen.self)
        registry.register(LibraryArabicLanguageScreen.self)
        registry.register(LibraryCardsScreen.self)
        registry.register(LibraryIslamicDirectoryScreen.self)
        registry.register(LibraryIslamicGlossaryScreen.self)
        registry.register(LibraryMawsuaatScreen.self)
        registry.register(LibraryMethodologyScreen.self)
        registry.register(LibraryMindMapScreen.self)
        registry.register(LibraryMoreScreen.self)
        registry.register(LibrarySearchScreen.self)
        registry.register(LibrarySectionsScreen.self)
        registry.register(LibrarySitemapScreen.self)
        registry.register(LibrarySourcesScreen.self)
        registry.register(LibraryTermsScreen.self)
    }

    static func resolve(_ c: [String]) -> AnyView? {
        if c.count == 2, c[0] == "academic-research" { return AnyView(CollectionHost(source: .bundled(name: "academic-research")) { SearchTemplate(items: $0, detailBase: "/academic-research") }) }
        if c.count == 2, c[0] == "scientific-announcements" { return AnyView(ItemHost(source: .bundled(name: "scientific-announcements"), id: c[1]) { DetailTemplate(item: $0) }) }
        if c.count == 2, c[0] == "sources" { return AnyView(ItemHost(source: .bundled(name: "sources"), id: c[1]) { DetailTemplate(item: $0) }) }
        return nil
    }
}
