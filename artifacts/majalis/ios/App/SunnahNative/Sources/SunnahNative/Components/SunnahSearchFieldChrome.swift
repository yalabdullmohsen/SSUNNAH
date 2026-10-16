import SwiftUI

extension View {
    /// إطار حقول البحث الموحّد: حدّ أدنى للمس، وتباعد رأسي يمنع التصاق النص بالحافة حين يلتفّ على أسطر في أحجام Dynamic Type الكبيرة، وارتفاع ينمو مع النص.
    func sunnahSearchFieldChrome<S: ShapeStyle>(fill: S, radius: CGFloat = Sunnah.Radius.small, stroke: Color? = nil) -> some View {
        self
            .fixedSize(horizontal: false, vertical: true)
            .multilineTextAlignment(.leading)
            .padding(.horizontal, Sunnah.Spacing.s3).padding(.vertical, Sunnah.Spacing.s3)
            .frame(maxWidth: .infinity, minHeight: Sunnah.Spacing.touch, alignment: .leading)
            .background(fill, in: RoundedRectangle(cornerRadius: radius, style: .continuous))
            .overlay { if let stroke { RoundedRectangle(cornerRadius: radius, style: .continuous).stroke(stroke, lineWidth: Sunnah.Spacing.hairline) } }
    }
}
