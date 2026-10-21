import SwiftUI
#if canImport(UIKit)
import UIKit
#endif

/// أيقونات التطبيق الثلاث. `alternateName == nil` تعني الأيقونة الأساسية (AppIcon).
public enum AppIconChoice: String, CaseIterable, Identifiable, Sendable {
    case primary, starDish, zellijDark
    public var id: String { rawValue }

    public var alternateName: String? {
        switch self {
        case .primary: nil
        case .starDish: "AppIcon-StarDish"
        case .zellijDark: "AppIcon-ZellijDark"
        }
    }
    public var title: String {
        switch self {
        case .primary: "الزليج — عاجي (الأساسي)"
        case .starDish: "الطبق النجمي — أخضر"
        case .zellijDark: "الزليج — داكن"
        }
    }
    /// اسم صورة المعاينة في Assets (الأيقونات البديلة لا تُقرأ بالاسم من الكتالوج).
    public var previewAsset: String {
        switch self {
        case .primary: "IconPreview-Primary"
        case .starDish: "IconPreview-StarDish"
        case .zellijDark: "IconPreview-ZellijDark"
        }
    }
    public init(alternateName: String?) {
        self = Self.allCases.first { $0.alternateName == alternateName } ?? .primary
    }
}

/// واجهة النظام لتبديل الأيقونة، قابلة للاستبدال في الاختبار.
@MainActor public protocol AppIconSwitching {
    var currentAlternateName: String? { get }
    var supportsAlternateIcons: Bool { get }
    func setAlternateIconName(_ name: String?) async throws
}

#if canImport(UIKit) && !os(watchOS)
@MainActor public struct SystemAppIconSwitcher: AppIconSwitching {
    public init() {}
    public var currentAlternateName: String? { UIApplication.shared.alternateIconName }
    public var supportsAlternateIcons: Bool { UIApplication.shared.supportsAlternateIcons }
    public func setAlternateIconName(_ name: String?) async throws {
        try await UIApplication.shared.setAlternateIconName(name)
    }
}
#endif

@MainActor struct UnsupportedAppIconSwitcher: AppIconSwitching {
    var currentAlternateName: String? { nil }
    var supportsAlternateIcons: Bool { false }
    func setAlternateIconName(_ name: String?) async throws {}
}

/// منطق الاختيار والحفظ: النظام هو المصدر الصادق عند الفتح، والقيمة المحفوظة احتياط.
@MainActor public final class AppIconModel: ObservableObject {
    public static let storageKey = "sunnah.appIcon.choice"
    @Published public private(set) var selected: AppIconChoice
    @Published public private(set) var errorMessage: String?
    private let switcher: AppIconSwitching
    private let defaults: UserDefaults

    public init(switcher: AppIconSwitching, defaults: UserDefaults = .standard) {
        self.switcher = switcher; self.defaults = defaults
        if let name = switcher.currentAlternateName { selected = AppIconChoice(alternateName: name) }
        else if let raw = defaults.string(forKey: Self.storageKey), let saved = AppIconChoice(rawValue: raw),
                !switcher.supportsAlternateIcons { selected = saved }
        else { selected = .primary }
    }

    public var isSupported: Bool { switcher.supportsAlternateIcons }

    public func choose(_ choice: AppIconChoice) async {
        guard choice != selected else { return }
        guard switcher.supportsAlternateIcons else { errorMessage = "تغيير الأيقونة غير مدعوم على هذا الجهاز."; return }
        do {
            try await switcher.setAlternateIconName(choice.alternateName)
            selected = choice; errorMessage = nil
            defaults.set(choice.rawValue, forKey: Self.storageKey)
        } catch {
            errorMessage = "تعذّر تغيير الأيقونة. حاول مرة أخرى."
        }
    }
}

/// «أيقونة التطبيق»: ثلاث بطاقات بمعاينة، والمختارة عليها علامة ✓ خضراء.
public struct AppIconPickerView: View {
    @StateObject private var model: AppIconModel
    public init(model: @autoclosure @escaping () -> AppIconModel) { _model = StateObject(wrappedValue: model()) }

    #if canImport(UIKit) && !os(watchOS)
    public init() { self.init(model: AppIconModel(switcher: SystemAppIconSwitcher())) }
    #else
    public init() { self.init(model: AppIconModel(switcher: UnsupportedAppIconSwitcher())) }
    #endif

    public var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: Sunnah.Spacing.s3) {
                SunnahSettingsGroup("اختر الأيقونة") {
                    ForEach(Array(AppIconChoice.allCases.enumerated()), id: \.element) { index, choice in
                        Button { Task { await model.choose(choice) } } label: {
                            row(choice, isLast: index == AppIconChoice.allCases.count - 1)
                        }
                        .buttonStyle(.plain)
                        .accessibilityIdentifier("appicon.\(choice.rawValue)")
                        .accessibilityLabel(choice.title)
                        .accessibilityValue(model.selected == choice ? "محدَّدة" : "")
                        .accessibilityAddTraits(model.selected == choice ? [.isButton, .isSelected] : .isButton)
                    }
                }
                if let message = model.errorMessage {
                    Text(message).font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.danger)
                        .padding(.horizontal, Sunnah.Spacing.pageX + 4)
                }
            }
            .padding(.top, Sunnah.Spacing.s3)
        }
        .background(Sunnah.Colors.bg)
        .sunnahNavTitle("أيقونة التطبيق")
    }

    private func row(_ choice: AppIconChoice, isLast: Bool) -> some View {
        VStack(spacing: 0) {
            HStack(spacing: Sunnah.Spacing.s3) {
                Image(choice.previewAsset)
                    .resizable().scaledToFit().frame(width: 52, height: 52)
                    .clipShape(RoundedRectangle(cornerRadius: 52 * 0.2237, style: .continuous))
                    .overlay(RoundedRectangle(cornerRadius: 52 * 0.2237, style: .continuous).stroke(Sunnah.Colors.border, lineWidth: Sunnah.Spacing.hairline))
                    .accessibilityHidden(true)
                Text(choice.title).font(AppearancePrefs.ui(.bold, 15, .body)).foregroundStyle(Sunnah.Colors.textPrimary)
                Spacer(minLength: Sunnah.Spacing.s2)
                if model.selected == choice {
                    Image(systemName: "checkmark.circle.fill").font(.title3).foregroundStyle(Sunnah.Colors.primary).accessibilityHidden(true)
                }
            }
            .frame(minHeight: 72)
            .contentShape(Rectangle())
            if !isLast { Divider().overlay(Sunnah.Colors.border) }
        }
    }
}
