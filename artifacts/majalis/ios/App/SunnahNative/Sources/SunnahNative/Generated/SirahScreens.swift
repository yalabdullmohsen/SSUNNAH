// مُولَّد بـ scripts/generate-native-screens.mjs من ROUTE_TEMPLATE_MAP.json — لا تعدّل يدويًا.
import SwiftUI

struct SirahFikrWaqiaScreen: ScreenTemplate {
    static let id = "fikr-waqia"
    static let title = "السيرة والتاريخ والأعلام"
    static let source = ContentSource.bundled(name: "fikr-waqia")
    typealias Content = [ContentItem]
    let content: Content
    init(content: Content) { self.content = content }
    var body: some View { ListTemplate(items: content, detailBase: "/fikr-waqia") }
}

struct SirahIslamicLandmarksScreen: ScreenTemplate {
    static let id = "islamic-landmarks"
    static let title = "السيرة والتاريخ والأعلام"
    static let source = ContentSource.bundled(name: "islamic-landmarks")
    typealias Content = [ContentItem]
    let content: Content
    init(content: Content) { self.content = content }
    var body: some View { ListTemplate(items: content, detailBase: "/islamic-landmarks") }
}

struct SirahIslamicLandmarksMapScreen: ScreenTemplate {
    static let id = "islamic-landmarks.map"
    static let title = "السيرة والتاريخ والأعلام"
    static let source = ContentSource.bundled(name: "islamic-landmarks-map")
    typealias Content = [ContentItem]
    let content: Content
    init(content: Content) { self.content = content }
    var body: some View { CardGridTemplate(items: content, detailBase: "/islamic-landmarks/map") }
}

struct SirahNationsScreen: ScreenTemplate {
    static let id = "nations"
    static let title = "السيرة والتاريخ والأعلام"
    static let source = ContentSource.bundled(name: "nations")
    typealias Content = [ContentItem]
    let content: Content
    init(content: Content) { self.content = content }
    var body: some View { ListTemplate(items: content, detailBase: "/nations") }
}

struct SirahOccasionsScreen: ScreenTemplate {
    static let id = "occasions"
    static let title = "السيرة والتاريخ والأعلام"
    static let source = ContentSource.bundled(name: "occasions")
    typealias Content = [ContentItem]
    let content: Content
    init(content: Content) { self.content = content }
    var body: some View { ListTemplate(items: content, detailBase: "/occasions") }
}

struct SirahOccasionsLessonsScreen: ScreenTemplate {
    static let id = "occasions-lessons"
    static let title = "السيرة والتاريخ والأعلام"
    static let source = ContentSource.bundled(name: "occasions-lessons")
    typealias Content = [SectionLink]
    let content: Content
    init(content: Content) { self.content = content }
    var body: some View { SectionsListTemplate(links: content) }
}

struct SirahProphetsScreen: ScreenTemplate {
    static let id = "prophets"
    static let title = "السيرة والتاريخ والأعلام"
    static let source = ContentSource.bundled(name: "prophets")
    typealias Content = ContentItem
    let content: Content
    init(content: Content) { self.content = content }
    var body: some View { ArticleTemplate(item: content) }
}

struct SirahProphetsTreeScreen: ScreenTemplate {
    static let id = "prophets.tree"
    static let title = "السيرة والتاريخ والأعلام"
    static let source = ContentSource.bundled(name: "prophets-tree")
    typealias Content = [ContentItem]
    let content: Content
    init(content: Content) { self.content = content }
    var body: some View { ListTemplate(items: content, detailBase: "/prophets/tree") }
}

struct SirahSahabahScreen: ScreenTemplate {
    static let id = "sahabah"
    static let title = "السيرة والتاريخ والأعلام"
    static let source = ContentSource.bundled(name: "sahabah")
    typealias Content = [ContentItem]
    let content: Content
    init(content: Content) { self.content = content }
    var body: some View { ListTemplate(items: content, detailBase: "/sahabah") }
}

struct SirahSeerahScreen: ScreenTemplate {
    static let id = "seerah"
    static let title = "السيرة والتاريخ والأعلام"
    static let source = ContentSource.bundled(name: "seerah")
    typealias Content = [ContentItem]
    let content: Content
    init(content: Content) { self.content = content }
    var body: some View { ListTemplate(items: content, detailBase: "/seerah") }
}

struct SirahShamaelScreen: ScreenTemplate {
    static let id = "shamael"
    static let title = "السيرة والتاريخ والأعلام"
    static let source = ContentSource.bundled(name: "shamael")
    typealias Content = [ContentItem]
    let content: Content
    init(content: Content) { self.content = content }
    var body: some View { ListTemplate(items: content, detailBase: "/shamael") }
}

struct SirahStoriesScreen: ScreenTemplate {
    static let id = "stories"
    static let title = "السيرة والتاريخ والأعلام"
    static let source = ContentSource.bundled(name: "stories")
    typealias Content = ContentItem
    let content: Content
    init(content: Content) { self.content = content }
    var body: some View { ArticleTemplate(item: content) }
}

struct SirahTarikhIslamiScreen: ScreenTemplate {
    static let id = "tarikh-islami"
    static let title = "السيرة والتاريخ والأعلام"
    static let source = ContentSource.bundled(name: "tarikh-islami")
    typealias Content = [ContentItem]
    let content: Content
    init(content: Content) { self.content = content }
    var body: some View { ListTemplate(items: content, detailBase: "/tarikh-islami") }
}

struct SirahTeachersScreen: ScreenTemplate {
    static let id = "teachers"
    static let title = "السيرة والتاريخ والأعلام"
    static let source = ContentSource.bundled(name: "teachers")
    typealias Content = [SectionLink]
    let content: Content
    init(content: Content) { self.content = content }
    var body: some View { SectionsListTemplate(links: content) }
}

/// قسم «السيرة والتاريخ والأعلام». المسارات بلا معاملات تُسجَّل في TemplateRegistry (Route.native(id:))، وذات :id تُحلّ بـresolve.
public enum SirahScreens {
    @MainActor public static func register(in registry: TemplateRegistry) {
        registry.register(SirahFikrWaqiaScreen.self)
        registry.register(SirahIslamicLandmarksScreen.self)
        registry.register(SirahIslamicLandmarksMapScreen.self)
        registry.register(SirahNationsScreen.self)
        registry.register(SirahOccasionsScreen.self)
        registry.register(SirahOccasionsLessonsScreen.self)
        registry.register(SirahProphetsScreen.self)
        registry.register(SirahProphetsTreeScreen.self)
        registry.register(SirahSahabahScreen.self)
        registry.register(SirahSeerahScreen.self)
        registry.register(SirahShamaelScreen.self)
        registry.register(SirahStoriesScreen.self)
        registry.register(SirahTarikhIslamiScreen.self)
        registry.register(SirahTeachersScreen.self)
    }

    static func resolve(_ c: [String]) -> AnyView? {
        if c.count == 2, c[0] == "islamic-landmarks" { return AnyView(ItemHost(source: .bundled(name: "islamic-landmarks"), id: c[1]) { DetailTemplate(item: $0) }) }
        if c.count == 2, c[0] == "nations" { return AnyView(ItemHost(source: .bundled(name: "nations"), id: c[1]) { DetailTemplate(item: $0) }) }
        if c.count == 2, c[0] == "tarikh-islami" { return AnyView(ItemHost(source: .bundled(name: "tarikh-islami"), id: c[1]) { DetailTemplate(item: $0) }) }
        if c.count == 2, c[0] == "teachers" { return AnyView(ItemHost(source: .bundled(name: "teachers"), id: c[1]) { DetailTemplate(item: $0) }) }
        return nil
    }
}
