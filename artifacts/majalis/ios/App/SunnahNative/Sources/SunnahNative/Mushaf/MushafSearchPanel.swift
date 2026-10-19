import SwiftUI

/// زر أداة في شريط المصحف: هدف لمس 44×44 على الأقل، ولمسه يعيد عدّ إخفاء الشريط.
struct MushafToolButton: View {
    let symbol: String, label: String, id: String
    var action: () -> Void
    var body: some View {
        Button(action: action) {
            Image(systemName: symbol).font(.system(size: 18, weight: .semibold))
                .frame(width: Sunnah.Spacing.touch, height: Sunnah.Spacing.touch)
                .contentShape(Rectangle())
        }
        .buttonStyle(.plain)
        .foregroundStyle(Sunnah.Colors.mushafInk)
        .accessibilityLabel(label).accessibilityIdentifier(id)
    }
}

/// حقل البحث الكبير في شريط المصحف: بعرض الشريط، ارتفاع 46، خط الجسم؛ النقر يمدّد البحث إلى لوحة النتائج فوق الصفحة.
struct MushafSearchField: View {
    @Binding var query: String
    var focused: FocusState<Bool>.Binding
    var onSubmit: () -> Void
    var body: some View {
        HStack(spacing: Sunnah.Spacing.s2) {
            Image(systemName: "magnifyingglass").foregroundStyle(Sunnah.Colors.mushafAccent)
            TextField("ابحث في القرآن", text: $query)
                .focused(focused)
                .font(Sunnah.Typography.body)
                .foregroundStyle(Sunnah.Colors.mushafInk)
                .submitLabel(.search)
                .autocorrectionDisabled()
                .onSubmit(onSubmit)
                .frame(maxWidth: .infinity, minHeight: 46)
                .contentShape(Rectangle())
                .accessibilityIdentifier("mushaf.search.field")
            if !query.isEmpty {
                Button { query = "" } label: {
                    Image(systemName: "xmark.circle.fill").foregroundStyle(Sunnah.Colors.mushafAccent)
                        .frame(width: Sunnah.Spacing.touch, height: Sunnah.Spacing.touch).contentShape(Rectangle())
                }
                .buttonStyle(.plain).accessibilityLabel("مسح البحث").accessibilityIdentifier("mushaf.search.clear")
            }
        }
        .padding(.leading, Sunnah.Spacing.s3).padding(.trailing, query.isEmpty ? Sunnah.Spacing.s3 : 0)
        .frame(height: 46)
        .background(Sunnah.Colors.mushafIvory, in: RoundedRectangle(cornerRadius: Sunnah.Radius.card, style: .continuous))
        .overlay(RoundedRectangle(cornerRadius: Sunnah.Radius.card, style: .continuous).stroke(Sunnah.Colors.mushafGoldBrown.opacity(0.6), lineWidth: 1))
    }
}

/// لوحة النتائج فوق الصفحة: قفزة مباشرة (إن وُجدت) ثم أعلى 8 نتائج فورًا، و«المزيد» لباقيها.
struct MushafSearchPanel: View {
    static let firstCount = 8
    let index: MushafIndex
    let repo: MushafRepository
    let query: String
    let hits: [MushafSearchHit]
    let jump: MushafJump?
    let maxHeight: CGFloat
    @Binding var expanded: Bool
    var pick: (MushafSearchHit) -> Void
    var go: (MushafJump) -> Void

    private func reference(_ h: MushafSearchHit) -> String {
        let parts = h.ayah.split(separator: ":")
        let name = Int(parts.first ?? "").flatMap { id in index.surahs.first { $0.id == id }?.name } ?? ""
        return "\(name) · آية \(String(parts.last ?? "").arabicDigits) · صفحة \(h.page.arabicDigits)"
    }

    var body: some View {
        ScrollView {
            LazyVStack(spacing: 0) {
                if let jump {
                    Button { go(jump) } label: {
                        HStack(spacing: Sunnah.Spacing.s2) {
                            Image(systemName: "arrow.uturn.backward.circle")
                            Text("اذهب إلى \(jump.title.arabicDigits)").font(Sunnah.Typography.cardTitle)
                            Spacer(minLength: 0)
                            Text("صفحة \(jump.page.arabicDigits)").font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.textSecondary)
                        }
                        .foregroundStyle(Sunnah.Colors.mushafInk)
                        .padding(.horizontal, Sunnah.Spacing.s4).frame(minHeight: Sunnah.Spacing.touch + 4).contentShape(Rectangle())
                    }
                    .buttonStyle(.plain).accessibilityIdentifier("mushaf.search.jump")
                    Divider()
                }
                if query.trimmingCharacters(in: .whitespaces).count < 2 && jump == nil {
                    note("اكتب كلمة من الآية، أو «٢:٢٥٥»، أو «البقرة ٢٥٥»")
                } else if hits.isEmpty && jump == nil {
                    note("لا نتائج لـ«\(query)»")
                }
                ForEach(expanded ? hits : Array(hits.prefix(Self.firstCount))) { h in
                    Button { pick(h) } label: {
                        VStack(alignment: .leading, spacing: Sunnah.Spacing.s1) {
                            Text(reference(h)).font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.mushafAccent)
                            MushafAyahText(ayah: h.ayah, repo: repo, size: 19, collapseAbove: 14, paper: false, plainText: h.text).allowsHitTesting(false)
                        }
                        .padding(.horizontal, Sunnah.Spacing.s4).padding(.vertical, Sunnah.Spacing.s3)
                        .frame(maxWidth: .infinity, minHeight: Sunnah.Spacing.touch, alignment: .leading).contentShape(Rectangle())
                    }
                    .buttonStyle(.plain).accessibilityIdentifier("mushaf.search.result")
                    Divider()
                }
                if !expanded, hits.count > Self.firstCount {
                    Button { expanded = true } label: {
                        Text("المزيد (\((hits.count - Self.firstCount).arabicDigits))").font(Sunnah.Typography.cardTitle)
                            .foregroundStyle(Sunnah.Colors.mushafAccent)
                            .frame(maxWidth: .infinity, minHeight: Sunnah.Spacing.touch + 4).contentShape(Rectangle())
                    }
                    .buttonStyle(.plain).accessibilityIdentifier("mushaf.search.more")
                }
            }
        }
        .scrollDismissesKeyboard(.interactively)
        .frame(maxHeight: maxHeight)
        .fixedSize(horizontal: false, vertical: true)
        .background(Sunnah.Colors.surface, in: RoundedRectangle(cornerRadius: Sunnah.Radius.hero, style: .continuous))
        .overlay(RoundedRectangle(cornerRadius: Sunnah.Radius.hero, style: .continuous).stroke(Sunnah.Colors.goldDeco.opacity(0.6), lineWidth: 1))
        .clipShape(RoundedRectangle(cornerRadius: Sunnah.Radius.hero, style: .continuous))
        .shadow(color: .black.opacity(0.14), radius: 16, y: 6)
        .environment(\.layoutDirection, .rightToLeft)
        .accessibilityIdentifier("mushaf.search.panel")
    }

    private func note(_ text: String) -> some View {
        Text(text).font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.textSecondary)
            .frame(maxWidth: .infinity, minHeight: Sunnah.Spacing.touch * 1.5).padding(.horizontal, Sunnah.Spacing.s4)
    }
}
