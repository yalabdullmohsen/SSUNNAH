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

struct SirahNationsScreen: ScreenTemplate {
    static let id = "nations"
    static let title = "السيرة والتاريخ والأعلام"
    static let source = ContentSource.bundled(name: "nations")
    typealias Content = [ContentItem]
    let content: Content
    init(content: Content) { self.content = content }
    var body: some View { ListTemplate(items: content, detailBase: "/nations") }
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

struct SirahStoriesScreen: ScreenTemplate {
    static let id = "stories"
    static let title = "السيرة والتاريخ والأعلام"
    static let source = ContentSource.bundled(name: "stories")
    typealias Content = ContentItem
    let content: Content
    init(content: Content) { self.content = content }
    var body: some View { ArticleTemplate(item: content) }
}

/// قسم «السيرة والتاريخ والأعلام». المسارات بلا معاملات تُسجَّل في TemplateRegistry (Route.native(id:))، وذات :id تُحلّ بـresolve.
public enum SirahScreens {
    @MainActor public static func register(in registry: TemplateRegistry) {
        registry.register(SirahFikrWaqiaScreen.self)
        registry.register(SirahIslamicLandmarksScreen.self)
        registry.register(SirahNationsScreen.self)
        registry.register(SirahSahabahScreen.self)
        registry.register(SirahStoriesScreen.self)
    }

    static func resolve(_ c: [String]) -> AnyView? {
        if c.count == 2, c[0] == "islamic-landmarks" { return AnyView(ItemHost(source: .bundled(name: "islamic-landmarks"), id: c[1]) { DetailTemplate(item: $0) }) }
        if c.count == 2, c[0] == "nations" { return AnyView(ItemHost(source: .bundled(name: "nations"), id: c[1]) { DetailTemplate(item: $0) }) }
        if c.count == 2, c[0] == "tarikh-islami" { return AnyView(ItemHost(source: .bundled(name: "tarikh-islami"), id: c[1]) { DetailTemplate(item: $0) }) }
        if c.count == 2, c[0] == "teachers" { return AnyView(ItemHost(source: .bundled(name: "teachers"), id: c[1]) { DetailTemplate(item: $0) }) }
        return nil
    }
}
