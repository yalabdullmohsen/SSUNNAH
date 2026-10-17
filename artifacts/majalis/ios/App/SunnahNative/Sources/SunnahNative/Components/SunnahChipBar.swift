import SwiftUI

/// شريط خيارات أفقي ثابت (Chips) يبدّل الأقسام؛ يُمرَّر له الخيارات غير الفارغة فقط.
public struct SunnahChipBar<ID: Hashable>: View {
    public struct Option: Identifiable { public let id: ID; public let title: String
        public init(id: ID, title: String) { self.id = id; self.title = title } }
    let options: [Option]; @Binding var selection: ID
    @State private var barHeight: CGFloat = 52   // ScrollView الأفقي يتمدّد رأسيًا في VStack؛ نقيس ارتفاع المحتوى ونثبّته.
    public init(options: [Option], selection: Binding<ID>) { self.options = options; _selection = selection }
    public var body: some View {
        ScrollViewReader { proxy in
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: Sunnah.Spacing.s2) {
                    ForEach(options) { o in
                        Button { Sunnah.Haptics.select(); selection = o.id } label: { SunnahChip(o.title, selected: o.id == selection) }
                            .buttonStyle(.plain).id(o.id)
                            .accessibilityAddTraits(o.id == selection ? .isSelected : [])
                    }
                }
                .padding(.horizontal, Sunnah.Spacing.pageX).padding(.vertical, Sunnah.Spacing.s2)
                .background(GeometryReader { g in Color.clear.onAppear { barHeight = g.size.height }.onChange(of: g.size.height) { barHeight = $0 } })
            }
            .frame(height: barHeight)
            .onChange(of: selection) { id in withAnimation(.easeOut(duration: 0.2)) { proxy.scrollTo(id, anchor: .center) } }
        }
        .accessibilityIdentifier("chipBar")
    }
}
