import SwiftUI

extension View {
    /// iPad: عرض قراءة أقصى (~700pt) متمركز عند `horizontalSizeClass == .regular` فقط؛ لا أثر على الهاتف.
    /// يُطبَّق قبل `.background` كي تبقى الخلفية بكامل العرض.
    func sunnahReadableWidth(_ maxWidth: CGFloat = 700) -> some View {
        modifier(SunnahReadableWidth(maxWidth: maxWidth))
    }
}

private struct SunnahReadableWidth: ViewModifier {
    let maxWidth: CGFloat
    @Environment(\.horizontalSizeClass) private var sizeClass
    func body(content: Content) -> some View {
        if sizeClass == .regular {
            content.frame(maxWidth: maxWidth).frame(maxWidth: .infinity)
        } else {
            content
        }
    }
}
