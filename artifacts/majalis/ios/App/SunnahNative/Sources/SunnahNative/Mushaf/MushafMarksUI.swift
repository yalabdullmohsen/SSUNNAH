import SwiftUI
#if canImport(UIKit)
import UIKit
#endif

extension MushafMarkColor {
    /// اللون الدلالي: يتبدّل بين الفاتح والداكن تلقائيًا.
    public var color: Color {
        let (l, d) = hex
        #if canImport(UIKit)
        return Color(UIColor { $0.userInterfaceStyle == .dark ? UIColor(rgb: d) : UIColor(rgb: l) })
        #else
        return Color(red: Double((l >> 16) & 0xFF) / 255, green: Double((l >> 8) & 0xFF) / 255, blue: Double(l & 0xFF) / 255)
        #endif
    }
}

#if canImport(UIKit)
private extension UIColor {
    convenience init(rgb: UInt32) {
        self.init(red: CGFloat((rgb >> 16) & 0xFF) / 255, green: CGFloat((rgb >> 8) & 0xFF) / 255, blue: CGFloat(rgb & 0xFF) / 255, alpha: 1)
    }
}
#endif

/// اختيار لون العلامة: خمس دوائر بالاسم؛ المفعّل بعلامة صح، ويجوز تفعيل أكثر من لون.
struct MushafMarkPicker: View {
    let active: [MushafMarkColor]
    let toggle: (MushafMarkColor) -> Void

    var body: some View {
        HStack(spacing: Sunnah.Spacing.s2) {
            ForEach(MushafMarkColor.allCases) { c in
                let on = active.contains(c)
                Button { toggle(c) } label: {
                    VStack(spacing: 4) {
                        ZStack {
                            Circle().fill(c.color).frame(width: 28, height: 28)
                            if on { Image(systemName: "checkmark").font(.system(size: 13, weight: .bold)).foregroundStyle(.white) }
                        }
                        .overlay(Circle().stroke(Sunnah.Colors.textPrimary.opacity(on ? 0.55 : 0), lineWidth: 2).frame(width: 34, height: 34))
                        Text(c.name).font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.textPrimary).lineLimit(1).minimumScaleFactor(0.8)
                    }
                    .frame(maxWidth: .infinity, minHeight: 44)
                }
                .buttonStyle(.plain)
                .accessibilityLabel("علامة \(c.name)")
                .accessibilityValue(on ? "مفعّلة" : "غير مفعّلة")
                .accessibilityIdentifier("mushaf.mark.\(c.rawValue)")
            }
        }
    }
}

/// أثر بصري خفيف بجانب رقم الآية: نقاط صغيرة بألوان علاماتها.
struct MushafMarkDots: View {
    let colors: [MushafMarkColor]
    var body: some View {
        HStack(spacing: 2) { ForEach(colors) { Circle().fill($0.color).frame(width: 5, height: 5) } }
            .accessibilityHidden(true)
    }
}

/// حافة الصفحة: شريط رفيع بألوان علامات الصفحة.
struct MushafPageEdge: View {
    let colors: [MushafMarkColor]
    var body: some View {
        VStack(spacing: 0) { ForEach(colors) { Rectangle().fill($0.color) } }
            .frame(width: 4)
            .clipShape(Capsule())
            .accessibilityHidden(true)
    }
}

/// شاشة «علاماتي»: شرائح تصفية (الكل + الألوان)، الانتقال بالضغط، والحذف بالسحب.
struct MushafMarksScreen: View {
    @ObservedObject var store: MushafStore
    let open: (Int) -> Void
    @State private var filter: MushafMarkColor?

    var body: some View {
        let marks = store.marks(filter: filter)
        VStack(spacing: Sunnah.Spacing.s2) {
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: Sunnah.Spacing.s2) {
                    chip("الكل", color: nil)
                    ForEach(MushafMarkColor.allCases) { chip($0.name, color: $0) }
                }
                .padding(.horizontal, Sunnah.Spacing.s4)
            }
            .accessibilityIdentifier("mushaf.marks.filters")
            if marks.isEmpty { StateMessage(text: "لا علامات بعد") }
            else {
                List {
                    ForEach(marks) { b in
                        Button { open(b.page) } label: {
                            HStack(spacing: Sunnah.Spacing.s3) {
                                Circle().fill(b.color.color).frame(width: 12, height: 12)
                                VStack(alignment: .leading, spacing: 2) {
                                    Text(b.ayah.map { "آية \($0)" } ?? "الصفحة كاملة").foregroundStyle(Sunnah.Colors.textPrimary)
                                    Text(b.color.name).font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.textSecondary)
                                }
                                Spacer()
                                Text("صفحة \(b.page)").foregroundStyle(Sunnah.Colors.textSecondary)
                            }
                        }
                        .sunnahRowChrome()
                        .swipeActions(edge: .trailing, allowsFullSwipe: true) {
                            Button(role: .destructive) { store.remove(b) } label: { Label("حذف", systemImage: "trash") }
                        }
                    }
                }
                .listStyle(.plain).scrollContentBackground(.hidden)
            }
        }
        .padding(.top, Sunnah.Spacing.s2)
    }

    private func chip(_ title: String, color: MushafMarkColor?) -> some View {
        let on = filter == color
        return Button { filter = color } label: {
            HStack(spacing: 6) {
                if let color { Circle().fill(color.color).frame(width: 10, height: 10) }
                Text(title).font(Sunnah.Typography.secondary)
            }
            .padding(.horizontal, Sunnah.Spacing.s3).frame(minHeight: 36)
            .foregroundStyle(on ? Sunnah.Colors.textOnPrimary : Sunnah.Colors.textPrimary)
            .background(on ? Sunnah.Colors.primary : Sunnah.Colors.surface, in: Capsule())
            .overlay(Capsule().stroke(Sunnah.Colors.surface2, lineWidth: 1))
        }
        .buttonStyle(.plain)
        .accessibilityAddTraits(on ? .isSelected : [])
        .accessibilityIdentifier("mushaf.marks.chip.\(color?.rawValue ?? "all")")
    }
}
