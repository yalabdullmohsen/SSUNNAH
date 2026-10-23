import SwiftUI

/// الشريط السفلي: شريط نحيف ملتصق بأسفل الشاشة (ارتفاع 52)، خلفيته تمتد حتى الحافة السفلية فلا يظهر تحته أي محتوى، والتبويب النشط بخلفية أخضر فاتح.
/// قاعدة عامة لكل الشاشات: يُعرض عبر `safeAreaInset(edge: .bottom)` في RootTabView، والخلفية وحدها تتجاوز منطقة مؤشّر الرئيسية.
public struct SunnahTabBar: View {
    /// ارتفاع الشريط الذي يحجزه المحتوى القابل للتمرير (منطقة مؤشّر الرئيسية يحجزها النظام).
    public static let reservedHeight: CGFloat = 52

    let selected: AppTab
    let onSelect: (AppTab) -> Void
    public init(selected: AppTab, onSelect: @escaping (AppTab) -> Void) {
        self.selected = selected; self.onSelect = onSelect
    }
    public var body: some View {
        HStack(spacing: 2) {
            ForEach(AppTab.allCases) { tab in
                let on = tab == selected
                Button {
                    Sunnah.Haptics.select(); onSelect(tab)
                } label: {
                    VStack(spacing: 2) {
                        Image(systemName: tab.systemImage).font(.system(size: 17, weight: on ? .bold : .regular))
                        Text(tab.title).font(Sunnah.Typography.tag).lineLimit(1).minimumScaleFactor(0.75)   // XXXL على SE: التسميات المتجاورة كانت تتلامس
                    }
                    .frame(maxWidth: .infinity, minHeight: 44)   // مساحة لمس ≥44
                    .foregroundStyle(on ? Sunnah.Colors.primary : Sunnah.Colors.textSecondary)
                    .background(on ? Sunnah.Colors.primarySoft : .clear, in: RoundedRectangle(cornerRadius: 14, style: .continuous))
                    .contentShape(Rectangle())
                }
                .buttonStyle(.plain)
                .accessibilityAddTraits(on ? .isSelected : [])
            }
        }
        .padding(.horizontal, Sunnah.Spacing.s2)
        .padding(.vertical, 4)
        .frame(height: Self.reservedHeight)
        .dynamicTypeSize(...DynamicTypeSize.xxxLarge)   // الشريط بارتفاع ثابت: أحجام إمكانية الوصول كانت تقتطع التسميات
        .frame(maxWidth: .infinity)
        .background {
            // الخلفية تمتد حتى الحافة السفلية (تحت مؤشّر الرئيسية) فلا يظهر محتوى الصفحة تحت الشريط.
            ZStack {
                Sunnah.Colors.surface
                Rectangle().fill(.regularMaterial).opacity(0.35)
            }
            .ignoresSafeArea(edges: .bottom)
        }
        .overlay(alignment: .top) { Rectangle().fill(Sunnah.Colors.border).frame(height: 0.5) }
    }
}
