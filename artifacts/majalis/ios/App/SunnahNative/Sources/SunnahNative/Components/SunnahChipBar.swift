import SwiftUI

/// شريط خيارات أفقي ثابت (Chips) يبدّل الأقسام؛ يُمرَّر له الخيارات غير الفارغة فقط.
public struct SunnahChipBar<ID: Hashable>: View {
    public struct Option: Identifiable { public let id: ID; public let title: String
        public init(id: ID, title: String) { self.id = id; self.title = title } }
    let options: [Option]; @Binding var selection: ID
    public init(options: [Option], selection: Binding<ID>) { self.options = options; _selection = selection }
    private func chips() -> some View {
        HStack(spacing: Sunnah.Spacing.s2) {
            ForEach(options) { o in
                Button { Sunnah.Haptics.select(); selection = o.id } label: { SunnahChip(o.title, selected: o.id == selection) }
                    .buttonStyle(.plain).id(o.id)
                    .accessibilityAddTraits(o.id == selection ? .isSelected : [])
            }
        }
        .padding(.horizontal, Sunnah.Spacing.pageX).padding(.vertical, Sunnah.Spacing.s2)
    }
    /// ScrollView الأفقي يُزاح محتواه بمقدار المنطقة الآمنة العليا حين يقع داخل `safeAreaInset` (فتتراكب الشرائح على أزرار الشريط العلوي)،
    /// فيُحجز له إطار ثابت ويوضع فوقه كـoverlay فيبقى المحتوى في موضعه.
    public var body: some View {
        ScrollViewReader { proxy in
            Color.clear.frame(height: Self.barHeight)
                .overlay(alignment: .top) { ScrollView(.horizontal, showsIndicators: false) { chips() } }
                .onChange(of: selection) { id in withAnimation(.easeOut(duration: 0.2)) { proxy.scrollTo(id, anchor: .center) } }
        }
        .accessibilityIdentifier("chipBar")
    }
    private static var barHeight: CGFloat { 56 }
}
