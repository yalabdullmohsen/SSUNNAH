import SwiftUI

public extension View {
    /// ورقة سفلية موحّدة للشاشات (بديل `.sheet` الخام الممنوع خارج Components): مقبض سحب ظاهر،
    /// والمحتوى يحدد ارتفاعه بـ`presentationDetents` كما يلزمه.
    func sunnahSheet<Sheet: View>(isPresented: Binding<Bool>, @ViewBuilder content: @escaping () -> Sheet) -> some View {
        sheet(isPresented: isPresented) {
            content().presentationDragIndicator(.visible)
        }
    }
}
