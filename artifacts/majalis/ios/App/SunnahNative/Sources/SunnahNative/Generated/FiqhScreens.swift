// مُولَّد بـ scripts/generate-native-screens.mjs من ROUTE_TEMPLATE_MAP.json — لا تعدّل يدويًا.
import SwiftUI

struct FiqhScreen: ScreenTemplate {
    static let id = "fiqh"
    static let title = "الفقه"
    static let source = ContentSource.bundled(name: "fiqh")
    typealias Content = [SectionLink]
    let content: Content
    init(content: Content) { self.content = content }
    var body: some View { SectionsListTemplate(links: content) }
}

struct FiqhTopicsScreen: ScreenTemplate {
    static let id = "fiqh.topics"
    static let title = "الفقه"
    static let source = ContentSource.bundled(name: "fiqh-topics")
    typealias Content = [ContentItem]
    let content: Content
    init(content: Content) { self.content = content }
    var body: some View { ListTemplate(items: content, detailBase: "/fiqh/topics") }
}

/// قسم «الفقه». المسارات بلا معاملات تُسجَّل في TemplateRegistry (Route.native(id:))، وذات :id تُحلّ بـresolve.
public enum FiqhScreens {
    @MainActor public static func register(in registry: TemplateRegistry) {
        registry.register(FiqhScreen.self)
        registry.register(FiqhTopicsScreen.self)
    }

    static func resolve(_ c: [String]) -> AnyView? {
        if c.count == 3, c[0] == "fiqh", c[1] == "topics" { return AnyView(ItemHost(source: .bundled(name: "fiqh-topics"), id: c[2]) { ArticleTemplate(item: $0) }) }
        return nil
    }
}
