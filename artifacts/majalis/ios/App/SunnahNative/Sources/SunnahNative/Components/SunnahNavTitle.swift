import SwiftUI

/// عنوان الشاشة: عنوان النظام الكبير يُقطع بـ«…» في سطر واحد عند الأحجام الكبيرة والعناوين الطويلة؛
/// هنا يلتفّ العنوان إلى سطرين كحد أقصى مع تصغير أدنى 0.7 (يبقى `navigationTitle` لزر الرجوع وVoiceOver).
/// تضعه كل ترويسة/عنوان معروض في المتن (DetailHero، SunnahPageTitle): يُخفي عنوان الشريط كي لا يتكرر.
struct BodyTitleShownKey: PreferenceKey {
    static let defaultValue = false
    static func reduce(value: inout Bool, nextValue: () -> Bool) { value = value || nextValue() }
}

struct SunnahNavTitleModifier: ViewModifier {
    let title: String
    @Environment(\.dynamicTypeSize) private var size
    @State private var bodyTitled = false
    /// عناوين أطول من هذا (حرفًا) أو أحجام ≥ xLarge تنتقل إلى العنوان المضمّن الملتفّ.
    static let maxLargeTitleChars = 22
    private var wraps: Bool { !bodyTitled && (size >= .xLarge || title.count > Self.maxLargeTitleChars) }

    func body(content: Content) -> some View {
        #if os(iOS)
        content
            .onPreferenceChange(BodyTitleShownKey.self) { bodyTitled = $0 }
            .navigationTitle(bodyTitled ? "" : title)
            .navigationBarTitleDisplayMode(bodyTitled || wraps ? .inline : .large)
            .toolbar {
                if wraps {
                    ToolbarItem(placement: .principal) {
                        Text(title)
                            .font(Sunnah.Typography.cardTitle)
                            .lineLimit(2).minimumScaleFactor(0.7)
                            .multilineTextAlignment(.center)
                            .dynamicTypeSize(...DynamicTypeSize.xLarge)   // شريط بارتفاع ثابت: سطران بالحجم الأقصى يتّسعان
                            .accessibilityAddTraits(.isHeader)
                    }
                }
            }
        #else
        content.navigationTitle(title)
        #endif
    }
}

public extension View {
    /// بديل `navigationTitle` المعمَّم: يلتفّ العنوان الطويل/الكبير بدل القطع بـ«…».
    func sunnahNavTitle(_ title: String) -> some View { modifier(SunnahNavTitleModifier(title: title)) }
}
