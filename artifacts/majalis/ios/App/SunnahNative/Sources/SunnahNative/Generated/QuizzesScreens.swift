// مُولَّد بـ scripts/generate-native-screens.mjs من ROUTE_TEMPLATE_MAP.json — لا تعدّل يدويًا.
import SwiftUI

struct QuizzesScreen: ScreenTemplate {
    static let id = "quizzes"
    static let title = "الاختبارات"
    static let source = ContentSource.bundled(name: "quizzes")
    typealias Content = [QuizQuestion]
    let content: Content
    init(content: Content) { self.content = content }
    var body: some View { QuizTemplate(questions: content) }
}

/// قسم «الاختبارات». المسارات بلا معاملات تُسجَّل في TemplateRegistry (Route.native(id:))، وذات :id تُحلّ بـresolve.
public enum QuizzesScreens {
    @MainActor public static func register(in registry: TemplateRegistry) {
        registry.register(QuizzesScreen.self)
    }

    static func resolve(_ c: [String]) -> AnyView? {
        return nil
    }
}
