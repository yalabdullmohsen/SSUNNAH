import SwiftUI

/// /feature-tour — إعادة عرض جولة المزايا (شرائح AppFeatureTour حرفيًا). الإغلاق يعود للخلف.
struct AccountFeatureTourScreen: View {
    @Environment(\.dismiss) private var dismiss
    @State private var index = 0

    private let slides = AccountTexts.tourSlides
    private static let icons = ["mushaf": "book", "prayer": "moon.stars", "adhkar": "heart.text.square",
                                "lessons": "graduationcap", "sections": "books.vertical", "search": "magnifyingglass"]

    private var isLast: Bool { index == slides.count - 1 }

    var body: some View {
        VStack(spacing: Sunnah.Spacing.s5) {
            TabView(selection: $index) {
                ForEach(Array(slides.enumerated()), id: \.element.id) { i, slide in
                    VStack(spacing: Sunnah.Spacing.s4) {
                        Image(systemName: Self.icons[slide.id] ?? "star")
                            .font(Sunnah.Typography.pageTitle).foregroundStyle(Sunnah.Colors.primary)
                            .frame(width: Sunnah.Spacing.touch * 2, height: Sunnah.Spacing.touch * 2)
                            .background(Sunnah.Colors.primarySoft, in: Circle())
                            .accessibilityHidden(true)
                        Text(slide.title).font(Sunnah.Typography.sectionTitle).foregroundStyle(Sunnah.Colors.textPrimary)
                            .accessibilityAddTraits(.isHeader)
                        Text(slide.body).font(Sunnah.Typography.body).foregroundStyle(Sunnah.Colors.textPrimary)
                            .multilineTextAlignment(.center)
                        Text(slide.hint).font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.textSecondary)
                    }
                    .padding(Sunnah.Spacing.s6)
                    .tag(i)
                }
            }
            #if os(iOS)
            .tabViewStyle(.page(indexDisplayMode: .never))
            #endif

            HStack(spacing: Sunnah.Spacing.s2) {
                ForEach(slides.indices, id: \.self) { i in
                    Button { sunnahAnimate { index = i } } label: {
                        Capsule().fill(i == index ? Sunnah.Colors.primary : Sunnah.Colors.surface2)
                            .frame(width: i == index ? Sunnah.Spacing.s5 : Sunnah.Spacing.s2, height: Sunnah.Spacing.s2)
                            .frame(minWidth: Sunnah.Spacing.s5, minHeight: Sunnah.Spacing.touch)
                    }
                    .buttonStyle(.plain)
                    .accessibilityLabel("الشريحة \(i + 1) من \(slides.count): \(slides[i].title)".arabicDigits)
                    .accessibilityAddTraits(i == index ? .isSelected : [])
                }
            }

            SunnahActionRow {
                SunnahButton(isLast ? "إغلاق" : "تخطّي", style: .secondary) { dismiss() }
                if index > 0 {
                    SunnahButton("السابق", style: .secondary) { sunnahAnimate { index -= 1 } }
                }
                SunnahButton(isLast ? "تم" : "التالي") {
                    if isLast { dismiss() } else { sunnahAnimate { index += 1 } }
                }
            }

            Text("\(index + 1) / \(slides.count)".arabicDigits).font(Sunnah.Typography.tag).foregroundStyle(Sunnah.Colors.textSecondary)
                .monospacedDigit().accessibilityHidden(true)
        }
        .padding(Sunnah.Spacing.pageX)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Sunnah.Colors.bg)
        .sunnahNavTitle("جولة المزايا")
    }
}
