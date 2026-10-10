// مُولَّد بـ scripts/generate-native-screens.mjs من ROUTE_TEMPLATE_MAP.json — لا تعدّل يدويًا.
import SwiftUI

/// قسم «الاختبارات».
public enum QuizzesScreens {
    public static let title = "الاختبارات"
    public static func resolve(_ c: [String], open: @escaping (String) -> Void) -> AnyView? {
        if c.count == 1, c[0] == "quizzes" { return AnyView(QuizTemplate(section: "quizzes", title: "الاختبارات")) }
        return nil
    }
}
