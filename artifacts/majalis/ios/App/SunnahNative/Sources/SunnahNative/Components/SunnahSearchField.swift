import SwiftUI

/// حقل بحث كبير 52pt ظاهر دائمًا أعلى المحتوى (بديل `.searchable`)، مع اقتراحات اختيارية تظهر تحته ما دام الحقل فارغًا.
public struct SunnahSearchField: View {
    @Binding var text: String
    let prompt: String; let suggestions: [String]; let idPrefix: String
    public init(text: Binding<String>, prompt: String = "ابحث", suggestions: [String] = [], idPrefix: String = "sunnah.search") {
        _text = text; self.prompt = prompt; self.suggestions = suggestions; self.idPrefix = idPrefix
    }
    public var body: some View {
        VStack(alignment: .leading, spacing: Sunnah.Spacing.s2) {
            HStack(spacing: 10) {
                Image(systemName: "magnifyingglass").font(.system(size: 17, weight: .semibold)).foregroundStyle(Sunnah.Colors.textSecondary).accessibilityHidden(true)
                TextField(prompt, text: $text)
                    .font(AppearancePrefs.ui(.bold, 16, .body)).foregroundStyle(Sunnah.Colors.textPrimary)
                    .submitLabel(.search).accessibilityIdentifier(idPrefix)
                if !text.isEmpty {
                    Button { text = "" } label: { Image(systemName: "xmark.circle.fill").foregroundStyle(Sunnah.Colors.textSecondary).frame(width: 44, height: 44) }
                        .accessibilityLabel("مسح البحث")
                }
            }
            .padding(.horizontal, 18).frame(minHeight: 52)
            .background(Sunnah.Colors.surface, in: Capsule())
            .overlay(Capsule().stroke(Sunnah.Colors.border, lineWidth: 1))
            .padding(.horizontal, Sunnah.Spacing.pageX)
            if text.isEmpty && !suggestions.isEmpty {
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: Sunnah.Spacing.s2) {
                        ForEach(suggestions, id: \.self) { s in
                            Button { Sunnah.Haptics.select(); text = s } label: { SunnahChip(s.arabicDigits, selected: false) }
                                .buttonStyle(.plain).accessibilityIdentifier("\(idPrefix).suggestion.\(s)")
                        }
                    }
                    .padding(.horizontal, Sunnah.Spacing.pageX)
                }
            }
        }
    }
}
