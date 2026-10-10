// مُولَّد بـ scripts/generate-native-screens.mjs من ROUTE_TEMPLATE_MAP.json — لا تعدّل يدويًا.
import SwiftUI

/// قسم «الأسئلة والأجوبة».
public enum QaScreens {
    public static let title = "الأسئلة والأجوبة"
    public static func resolve(_ c: [String], open: @escaping (String) -> Void) -> AnyView? {
        if c.count == 1, c[0] == "qa" { return AnyView(ListTemplate(section: "qa", title: "الأسئلة والأجوبة", open: { open($0.route ?? "/qa" + "/" + $0.id) })) }
        if c.count == 2, c[0] == "qa" { return AnyView(DetailTemplate(section: "qa", id: c[1])) }
        return nil
    }
}
