import SwiftUI

/// ارتفاع البطاقة السفلية كما يقيسه المكوّن، يُبلَّغ للمضيف عبر PreferenceKey.
public struct SunnahBottomCardHeightKey: PreferenceKey {
    public static let defaultValue: CGFloat = 0
    public static func reduce(value: inout CGFloat, nextValue: () -> CGFloat) { value = max(value, nextValue()) }
}

extension View {
    /// المضيف: يستقبل ارتفاع أي `SunnahBottomCard` ظاهرة ويحجز هامشًا سفليًا بالقدر نفسه،
    /// فلا يُغطّى العنصر المحدّد. يُستعمل مرة واحدة على الحاوية (ScrollView/List) التي تعلوها البطاقة.
    public func sunnahAvoidsBottomCard() -> some View { modifier(SunnahBottomCardAvoidance()) }
}

private struct SunnahBottomCardAvoidance: ViewModifier {
    @State private var cardHeight: CGFloat = 0
    func body(content: Content) -> some View {
        Group {
            if #available(iOS 17.0, macOS 14.0, *) { content.contentMargins(.bottom, cardHeight, for: .scrollContent) }
            else { content.padding(.bottom, cardHeight) }
        }
        .onPreferenceChange(SunnahBottomCardHeightKey.self) { cardHeight = $0 }
    }
}

/// بطاقة سفلية فوق المحتوى (تفاصيل عنصر محدّد). تقيس ارتفاعها وتبلّغ المضيف؛
/// على المضيف أن يستدعي `sunnahAvoidsBottomCard()` — القاعدة في docs/native/UI_RULES.md وحارسها native-bottom-card-guard.sh.
public struct SunnahBottomCard<Content: View>: View {
    let content: Content
    public init(@ViewBuilder content: () -> Content) { self.content = content() }
    public var body: some View {
        SunnahCard { content }
            .padding(.horizontal, Sunnah.Spacing.pageX).padding(.bottom, Sunnah.Spacing.s2)
            .background(GeometryReader { Color.clear.preference(key: SunnahBottomCardHeightKey.self, value: $0.size.height) })
            .accessibilityIdentifier("bottomCard")
    }
}
