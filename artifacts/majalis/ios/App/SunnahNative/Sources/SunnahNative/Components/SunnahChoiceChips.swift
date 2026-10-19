import SwiftUI

/// شرائح اختيار تلتف على أسطر (بديل `Picker` بقائمة طويلة): اختيار واحد.
public struct SunnahChoiceChips<ID: Hashable>: View {
    public struct Option: Identifiable { public let id: ID; public let title: String
        public init(id: ID, title: String) { self.id = id; self.title = title } }
    let options: [Option]; @Binding var selection: ID
    public init(options: [Option], selection: Binding<ID>) { self.options = options; _selection = selection }
    public var body: some View {
        LazyVGrid(columns: [GridItem(.adaptive(minimum: 96), spacing: Sunnah.Spacing.s2, alignment: .leading)], alignment: .leading, spacing: Sunnah.Spacing.s2) {
            ForEach(options) { o in
                Button { Sunnah.Haptics.select(); selection = o.id } label: { SunnahChip(o.title.arabicDigits, selected: o.id == selection) }
                    .buttonStyle(.plain).accessibilityAddTraits(o.id == selection ? .isSelected : [])
            }
        }
        .padding(.horizontal, Sunnah.Spacing.pageX)
    }
}
