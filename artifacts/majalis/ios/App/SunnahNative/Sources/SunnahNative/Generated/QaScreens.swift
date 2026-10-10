// مُولَّد بـ scripts/generate-native-screens.mjs من ROUTE_TEMPLATE_MAP.json — لا تعدّل يدويًا.
import SwiftUI

struct QaScreen: ScreenTemplate {
    static let id = "qa"
    static let title = "الأسئلة والأجوبة"
    static let source = ContentSource.bundled(name: "qa")
    typealias Content = [ContentItem]
    let content: Content
    init(content: Content) { self.content = content }
    var body: some View { ListTemplate(items: content, detailBase: "/qa") }
}

/// قسم «الأسئلة والأجوبة». المسارات بلا معاملات تُسجَّل في TemplateRegistry (Route.native(id:))، وذات :id تُحلّ بـresolve.
public enum QaScreens {
    @MainActor public static func register(in registry: TemplateRegistry) {
        registry.register(QaScreen.self)
    }

    static func resolve(_ c: [String]) -> AnyView? {
        if c.count == 2, c[0] == "qa" { return AnyView(ItemHost(source: .bundled(name: "qa"), id: c[1]) { DetailTemplate(item: $0) }) }
        return nil
    }
}
