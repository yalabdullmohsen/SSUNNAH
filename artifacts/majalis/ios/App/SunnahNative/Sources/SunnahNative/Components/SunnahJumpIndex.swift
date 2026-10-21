import SwiftUI

/// فهرس قفز للقوائم الطويلة: شريط حروف رأسي على الحافة يقفز إلى أول صف بالحرف (نقرة أو سحب) مع لمس اهتزازي.
/// يُفعَّل تلقائيًا فقط حين يتجاوز العدد `threshold` (30)؛ وإلا يُرسم المحتوى كما هو.
/// الاستعمال: غلّف `SunnahRowStack` بـ`SunnahJumpIndex(keys:count:)` وضع `.sunnahJumpAnchor(key)` على أول صف لكل حرف.
struct SunnahJumpIndex<Content: View>: View {
    static var threshold: Int { 30 }
    let keys: [String]; let count: Int
    @ViewBuilder var content: () -> Content
    @State private var active: String?

    /// الحرف الفهرسي للعنوان: أول حرف عربي بعد التطبيع (تشكيل/همزات)؛ غيره «#».
    static func key(for title: String) -> String {
        let n = ArabicSearch.normalize(title.trimmingCharacters(in: .whitespacesAndNewlines))
        guard let c = n.first(where: { $0.isLetter }) else { return "#" }
        return String(c)
    }

    var body: some View {
        if count > Self.threshold && keys.count > 1 {
            ScrollViewReader { proxy in
                content()
                    .safeAreaInset(edge: .trailing, spacing: 0) { Color.clear.frame(width: 36) }
                    .overlay(alignment: .trailing) { rail(proxy) }
            }
        } else {
            content()
        }
    }

    private func rail(_ proxy: ScrollViewProxy) -> some View {
        GeometryReader { geo in
            let step = geo.size.height / CGFloat(keys.count)
            VStack(spacing: 0) {
                ForEach(keys, id: \.self) { k in
                    Text(k).font(Sunnah.Typography.tag)
                        .foregroundStyle(active == k ? Sunnah.Colors.textOnPrimary : Sunnah.Colors.primary)
                        .frame(width: 22, height: max(step, 1))
                        .background(active == k ? Sunnah.Colors.primary : Color.clear, in: Capsule())
                }
            }
            .frame(width: 26)
            .background(Sunnah.Colors.surface.opacity(0.85), in: Capsule())
            .overlay(Capsule().stroke(Sunnah.Colors.border, lineWidth: 1))
            .contentShape(Rectangle())
            .gesture(DragGesture(minimumDistance: 0).onChanged { v in
                let i = min(max(Int(v.location.y / max(step, 1)), 0), keys.count - 1)
                let k = keys[i]
                guard k != active else { return }
                active = k; Sunnah.Haptics.select()
                proxy.scrollTo("jump.\(k)", anchor: .top)
            }.onEnded { _ in active = nil })
            .frame(maxHeight: .infinity, alignment: .center)
        }
        .frame(width: 30)
        .padding(.vertical, Sunnah.Spacing.s4).padding(.trailing, 2)
        .environment(\.layoutDirection, .leftToRight)
        .accessibilityLabel("فهرس القفز")
    }
}

extension View {
    /// يعلّم الصف هدفًا لحرف في فهرس القفز.
    func sunnahJumpAnchor(_ key: String) -> some View { id("jump.\(key)") }
}
