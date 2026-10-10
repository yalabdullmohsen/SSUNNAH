// مُولَّد بـ scripts/generate-native-screens.mjs من ROUTE_TEMPLATE_MAP.json — لا تعدّل يدويًا.
import SwiftUI

struct SearchScreen: ScreenTemplate {
    static let id = "search"
    static let title = "البحث"
    static let source = ContentSource.bundled(name: "search")
    typealias Content = [ContentItem]
    let content: Content
    init(content: Content) { self.content = content }
    var body: some View { SearchTemplate(items: content, detailBase: "/search") }
}

/// قسم «البحث». المسارات بلا معاملات تُسجَّل في TemplateRegistry (Route.native(id:))، وذات :id تُحلّ بـresolve.
public enum SearchScreens {
    @MainActor public static func register(in registry: TemplateRegistry) {
        registry.register(SearchScreen.self)
    }

    static func resolve(_ c: [String]) -> AnyView? {
        return nil
    }
}
