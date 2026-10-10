// مُولَّد بـ scripts/generate-native-screens.mjs من ROUTE_TEMPLATE_MAP.json — لا تعدّل يدويًا.
import SwiftUI

/// قسم «الدروس».
public enum LessonsScreens {
    public static let title = "الدروس"
    public static func resolve(_ c: [String], open: @escaping (String) -> Void) -> AnyView? {
        if c.count == 1, c[0] == "lessons" { return AnyView(ListTemplate(section: "lessons", title: "الدروس", open: { open($0.route ?? "/lessons" + "/" + $0.id) })) }
        if c.count == 3, c[0] == "lessons", c[2] == "audio" { return AnyView(AudioPlayerTemplate(section: "lessons", id: c[1])) }
        if c.count == 2, c[0] == "lessons" { return AnyView(DetailTemplate(section: "lessons", id: c[1])) }
        return nil
    }
}
