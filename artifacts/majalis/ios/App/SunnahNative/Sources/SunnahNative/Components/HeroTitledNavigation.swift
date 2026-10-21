import SwiftUI

extension View {
    /// شاشة بترويسة DetailHero: العنوان يظهر في الترويسة وحدها (لا عنوان كبير ولا مضمّن مكرَّر في الشريط)،
    /// ويبقى `navigationTitle` لزر الرجوع في الشاشة التالية ولـVoiceOver.
    func heroTitledNavigation(_ title: String) -> some View {
        #if os(iOS)
        return navigationTitle(title).navigationBarTitleDisplayMode(.inline)
            .toolbar { ToolbarItem(placement: .principal) { Color.clear.frame(width: 1, height: 1).accessibilityHidden(true) } }
        #else
        return navigationTitle(title)
        #endif
    }
}
