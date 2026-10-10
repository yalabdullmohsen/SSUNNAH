// مُولَّد بـ scripts/generate-native-screens.mjs من ROUTE_TEMPLATE_MAP.json — لا تعدّل يدويًا.
import SwiftUI

struct HadithScreen: ScreenTemplate {
    static let id = "hadith"
    static let title = "الحديث وعلومه"
    static let source = ContentSource.bundled(name: "hadith")
    typealias Content = [ContentItem]
    let content: Content
    init(content: Content) { self.content = content }
    var body: some View { ListTemplate(items: content, detailBase: "/hadith") }
}

/// قسم «الحديث وعلومه». المسارات بلا معاملات تُسجَّل في TemplateRegistry (Route.native(id:))، وذات :id تُحلّ بـresolve.
public enum HadithScreens {
    @MainActor public static func register(in registry: TemplateRegistry) {
        registry.register(HadithScreen.self)
    }

    static func resolve(_ c: [String]) -> AnyView? {
        if c.count == 2, c[0] == "hadith" { return AnyView(ItemHost(source: .bundled(name: "hadith"), id: c[1]) { ArticleTemplate(item: $0) }) }
        return nil
    }
}
