import SwiftUI

/// حالة «تحتاج اتصالًا/حسابًا»: الشاشة تظهر ولا تُخفى (docs/native/requests/n2-from-n1-empty-states.md).
/// لا محتوى ثابت لها (نموذج تواصل، مساعد بحث، إرسال بحث)؛ الزر يفتح النموذج الحي.
public struct ConnectionRequiredView: View {
    public let title: String
    public let message: String
    public let actionTitle: String
    public let action: () -> Void

    public init(title: String, message: String, actionTitle: String, action: @escaping () -> Void) {
        self.title = title
        self.message = message
        self.actionTitle = actionTitle
        self.action = action
    }

    public var body: some View {
        SunnahMessageState(symbol: "wifi", title: title, message: message, actionTitle: actionTitle, action: action)
            .frame(maxHeight: .infinity)
            .background(Sunnah.Colors.bg)
            .environment(\.layoutDirection, .rightToLeft)
    }
}
