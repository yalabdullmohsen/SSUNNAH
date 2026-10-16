import SwiftUI

/// صف أزرار: متجاورة بعروض متساوية حين يتسع العرض لأطول عنوان، وإلا تلتف عموديًا بعرض كامل (الخط الكبير/الشاشة الضيقة).
/// القاعدة الوحيدة لكل شاشة متعددة الأزرار؛ لا `VStack` أزرار متتالية خارجه (يفرضه `ActionRowGuardTests`).
public struct SunnahActionRow<Content: View>: View {
    let content: Content
    public init(@ViewBuilder _ content: () -> Content) { self.content = content() }
    public var body: some View { SunnahActionRowLayout(spacing: Sunnah.Spacing.s3) { content } }
}

struct SunnahActionRowLayout: Layout {
    var spacing: CGFloat
    /// هامش أفقي داخل كل زر يُضاف لأطول عرض مثالي قبل الحكم بالتجاور.
    private let slack: CGFloat = Sunnah.Spacing.s4 * 2

    private func visible(_ subviews: Subviews) -> [LayoutSubview] {
        subviews.filter { $0.sizeThatFits(.unspecified).width > 0 || $0.sizeThatFits(.unspecified).height > 0 }
    }

    /// متجاورة؟ عدد الأزرار ≥ 2 وكل زر يتسع لعرضه المثالي في حصته المتساوية.
    func sideBySide(_ views: [LayoutSubview], width: CGFloat) -> Bool {
        guard views.count > 1, width.isFinite else { return false }
        let share = (width - spacing * CGFloat(views.count - 1)) / CGFloat(views.count)
        let widest = views.map { $0.sizeThatFits(.unspecified).width }.max() ?? 0
        return widest + slack <= share
    }

    func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
        let views = visible(subviews)
        guard !views.isEmpty else { return .zero }
        let width = proposal.width ?? views.map { $0.sizeThatFits(.unspecified).width }.max() ?? 0
        if sideBySide(views, width: width) {
            let share = (width - spacing * CGFloat(views.count - 1)) / CGFloat(views.count)
            let h = views.map { $0.sizeThatFits(ProposedViewSize(width: share, height: nil)).height }.max() ?? 0
            return CGSize(width: width, height: h)
        }
        let heights = views.map { $0.sizeThatFits(ProposedViewSize(width: width, height: nil)).height }
        return CGSize(width: width, height: heights.reduce(0, +) + spacing * CGFloat(views.count - 1))
    }

    func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
        let views = visible(subviews)
        guard !views.isEmpty else { return }
        if sideBySide(views, width: bounds.width) {
            let share = (bounds.width - spacing * CGFloat(views.count - 1)) / CGFloat(views.count)
            let h = views.map { $0.sizeThatFits(ProposedViewSize(width: share, height: nil)).height }.max() ?? 0
            for (i, v) in views.enumerated() {
                v.place(at: CGPoint(x: bounds.minX + CGFloat(i) * (share + spacing), y: bounds.minY), anchor: .topLeading,
                        proposal: ProposedViewSize(width: share, height: h))
            }
        } else {
            var y = bounds.minY
            for v in views {
                let h = v.sizeThatFits(ProposedViewSize(width: bounds.width, height: nil)).height
                v.place(at: CGPoint(x: bounds.minX, y: y), anchor: .topLeading, proposal: ProposedViewSize(width: bounds.width, height: h))
                y += h + spacing
            }
        }
    }
}
