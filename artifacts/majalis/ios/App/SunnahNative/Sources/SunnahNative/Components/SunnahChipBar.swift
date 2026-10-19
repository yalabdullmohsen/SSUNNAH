import SwiftUI

/// شريط خيارات أفقي ثابت (Chips) يبدّل الأقسام؛ يُمرَّر له الخيارات غير الفارغة فقط.
public struct SunnahChipBar<ID: Hashable>: View {
    public struct Option: Identifiable { public let id: ID; public let title: String
        public init(id: ID, title: String) { self.id = id; self.title = title } }
    let options: [Option]; @Binding var selection: ID
    @State private var barHeight: CGFloat = 52   // ScrollView الأفقي يتمدّد رأسيًا في VStack؛ نقيس ارتفاع المحتوى ونثبّته.
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
    private var variant: Int { Int(UserDefaults.standard.string(forKey: "chipVariant") ?? "") ?? 0 }
    public var body: some View {
        ScrollViewReader { proxy in
            Group {
                switch variant {
                case 3: chips().frame(maxWidth: .infinity, alignment: .trailing)
                case 2:
                    Color.clear.frame(height: 56).overlay(alignment: .top) { ScrollView(.horizontal, showsIndicators: false) { chips() } }
                case 1:
                    ScrollView(.horizontal, showsIndicators: false) { chips().background(GeometryReader { g in Color.clear.onAppear { barHeight = g.size.height }.onChange(of: g.size.height) { barHeight = $0 } }) }.frame(height: barHeight)
                case 4:
                    ScrollView(.horizontal, showsIndicators: false) { chips() }.frame(height: 56).clipped().padding(.top, 0.5)
                default:
                    ScrollView(.horizontal, showsIndicators: false) { chips().background(GeometryReader { g in Color.clear.onAppear { barHeight = g.size.height }.onChange(of: g.size.height) { barHeight = $0 } }) }
                        .frame(height: barHeight).ignoresSafeArea(.all, edges: .top)
                }
            }
            .onChange(of: selection) { id in withAnimation(.easeOut(duration: 0.2)) { proxy.scrollTo(id, anchor: .center) } }
        }
        .accessibilityIdentifier("chipBar")
    }
}
