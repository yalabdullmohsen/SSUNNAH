// مُولَّد بـ scripts/generate-native-screens.mjs من ROUTE_TEMPLATE_MAP.json — لا تعدّل يدويًا.
import SwiftUI

struct StoriesScreen: ScreenTemplate {
    static let id = "stories"
    static let title = "القصص"
    static let source = ContentSource.bundled(name: "stories")
    typealias Content = [ContentItem]
    let content: Content
    init(content: Content) { self.content = content }
    var body: some View { CardGridTemplate(items: content, detailBase: "/stories") }
}

/// قسم «القصص». المسارات بلا معاملات تُسجَّل في TemplateRegistry (Route.native(id:))، وذات :id تُحلّ بـresolve.
public enum StoriesScreens {
    @MainActor public static func register(in registry: TemplateRegistry) {
        registry.register(StoriesScreen.self)
    }

    static func resolve(_ c: [String]) -> AnyView? {
        if c.count == 2, c[0] == "stories" { return AnyView(ItemHost(source: .bundled(name: "stories"), id: c[1]) { ArticleTemplate(item: $0) }) }
        return nil
    }
}
