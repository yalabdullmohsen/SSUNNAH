import SwiftUI

/// حالة رسالة مشتركة (فارغ/خطأ/تحتاج اتصالًا): أيقونة + عنوان + نص اختياري + زر اختياري.
/// تتبع رموز التصميم فتتكيّف مع الداكن وDynamic Type، والزر بارتفاع لمس كافٍ.
public struct SunnahMessageState: View {
    let symbol: String; let title: String; let message: String?
    let actionTitle: String?; let action: (() -> Void)?
    public init(symbol: String, title: String, message: String? = nil, actionTitle: String? = nil, action: (() -> Void)? = nil) {
        self.symbol = symbol; self.title = title; self.message = message
        self.actionTitle = actionTitle; self.action = action
    }
    public var body: some View {
        VStack(spacing: Sunnah.Spacing.s3) {
            Image(systemName: symbol).font(Sunnah.Typography.sectionTitle)
                .foregroundStyle(Sunnah.Colors.textSecondary).accessibilityHidden(true)
            Text(title).font(Sunnah.Typography.cardTitle).foregroundStyle(Sunnah.Colors.textPrimary)
                .multilineTextAlignment(.center).accessibilityAddTraits(.isHeader)
            if let message {
                Text(message).font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.textSecondary)
                    .multilineTextAlignment(.center).fixedSize(horizontal: false, vertical: true)
            }
            if let actionTitle, let action { SunnahButton(actionTitle, style: .secondary, action: action) }
        }
        .frame(maxWidth: .infinity).padding(Sunnah.Spacing.s6)
        .accessibilityElement(children: actionTitle == nil ? .combine : .contain)
    }
}

public struct EmptyStateView: View {
    let title: String; let message: String?; let symbol: String
    /// false لحالة «انتظار إدخال» (بحث قبل الكتابة): دعوة للفعل لا غياب محتوى، فلا تُعلَن فارغة للتدقيق.
    let declaresEmpty: Bool
    public init(title: String = "المحتوى قيد التوثيق", message: String? = nil, symbol: String = "tray", declaresEmpty: Bool = true) { self.title = title; self.message = message; self.symbol = symbol; self.declaresEmpty = declaresEmpty }
    public var body: some View {
        if declaresEmpty { SunnahMessageState(symbol: symbol, title: title, message: message).screenState(.empty) }
        else { SunnahMessageState(symbol: symbol, title: title, message: message) }
    }
}

public struct LoadingStateView: View {
    public init() {}
    public var body: some View {
        ProgressView().tint(Sunnah.Colors.primary)
            .frame(maxWidth: .infinity).padding(Sunnah.Spacing.s6)
            .accessibilityLabel("جارٍ التحميل")
            .screenState(.loading)
    }
}

public struct ErrorStateView: View {
    public static let offlineMessage = "لا يوجد اتصال، حاول لاحقًا"
    let retry: (() -> Void)?
    public init(retry: (() -> Void)? = nil) { self.retry = retry }
    public var body: some View {
        SunnahMessageState(symbol: "wifi.slash", title: ErrorStateView.offlineMessage,
                           actionTitle: retry == nil ? nil : "إعادة المحاولة", action: retry)
            .screenState(.error)
    }
}

/// عنوان قسم داخل صفحة: عنوان + إجراء اختياري («عرض الكل»)، ويُعلن كرأس لقارئ الشاشة.
public struct SunnahSectionHeader: View {
    let title: String; let actionTitle: String?; let action: (() -> Void)?
    public init(_ title: String, actionTitle: String? = nil, action: (() -> Void)? = nil) {
        self.title = title; self.actionTitle = actionTitle; self.action = action
    }
    public var body: some View {
        HStack(alignment: .firstTextBaseline, spacing: Sunnah.Spacing.s3) {
            Text(title).font(Sunnah.Typography.sectionTitle).foregroundStyle(Sunnah.Colors.textPrimary)
                .accessibilityAddTraits(.isHeader)
            Spacer(minLength: Sunnah.Spacing.s2)
            if let actionTitle, let action {
                Button(action: action) {
                    Text(actionTitle).font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.primary)
                        .frame(minHeight: Sunnah.Spacing.touch)
                }.buttonStyle(.plain)
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }
}
