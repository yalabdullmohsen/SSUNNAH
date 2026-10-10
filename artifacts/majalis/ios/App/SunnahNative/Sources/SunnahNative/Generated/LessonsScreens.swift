// مُولَّد بـ scripts/generate-native-screens.mjs من ROUTE_TEMPLATE_MAP.json — لا تعدّل يدويًا.
import SwiftUI

struct LessonsScreen: ScreenTemplate {
    static let id = "lessons"
    static let title = "الدروس"
    static let source = ContentSource.bundled(name: "lessons")
    typealias Content = [ContentItem]
    let content: Content
    init(content: Content) { self.content = content }
    var body: some View { ListTemplate(items: content, detailBase: "/lessons") }
}

/// قسم «الدروس». المسارات بلا معاملات تُسجَّل في TemplateRegistry (Route.native(id:))، وذات :id تُحلّ بـresolve.
public enum LessonsScreens {
    @MainActor public static func register(in registry: TemplateRegistry) {
        registry.register(LessonsScreen.self)
    }

    static func resolve(_ c: [String]) -> AnyView? {
        if c.count == 3, c[0] == "lessons", c[2] == "audio" { return AnyView(ItemHost(source: .bundled(name: "lessons"), id: c[1]) { AudioPlayerTemplate(item: $0) }) }
        if c.count == 2, c[0] == "lessons" { return AnyView(ItemHost(source: .bundled(name: "lessons"), id: c[1]) { DetailTemplate(item: $0) }) }
        return nil
    }
}
