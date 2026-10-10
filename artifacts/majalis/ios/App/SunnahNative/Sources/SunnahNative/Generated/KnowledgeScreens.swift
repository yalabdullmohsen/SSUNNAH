// مُولَّد بـ scripts/generate-native-screens.mjs من ROUTE_TEMPLATE_MAP.json — لا تعدّل يدويًا.
import SwiftUI

struct KnowledgeScreen: ScreenTemplate {
    static let id = "knowledge"
    static let title = "المعرفة"
    static let source = ContentSource.bundled(name: "knowledge")
    typealias Content = [SectionLink]
    let content: Content
    init(content: Content) { self.content = content }
    var body: some View { SectionsListTemplate(links: content) }
}

struct KnowledgeTopicsScreen: ScreenTemplate {
    static let id = "knowledge.topics"
    static let title = "المعرفة"
    static let source = ContentSource.bundled(name: "knowledge-topics")
    typealias Content = [ContentItem]
    let content: Content
    init(content: Content) { self.content = content }
    var body: some View { CardGridTemplate(items: content, detailBase: "/knowledge/topics") }
}

/// قسم «المعرفة». المسارات بلا معاملات تُسجَّل في TemplateRegistry (Route.native(id:))، وذات :id تُحلّ بـresolve.
public enum KnowledgeScreens {
    @MainActor public static func register(in registry: TemplateRegistry) {
        registry.register(KnowledgeScreen.self)
        registry.register(KnowledgeTopicsScreen.self)
    }

    static func resolve(_ c: [String]) -> AnyView? {
        if c.count == 3, c[0] == "knowledge", c[1] == "topics" { return AnyView(ItemHost(source: .bundled(name: "knowledge-topics"), id: c[2]) { ArticleTemplate(item: $0) }) }
        return nil
    }
}
