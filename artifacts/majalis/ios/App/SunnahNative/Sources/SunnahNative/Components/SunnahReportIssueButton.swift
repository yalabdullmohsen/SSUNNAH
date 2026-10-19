import SwiftUI

/// «إبلاغ عن خطأ» أسفل صفحة المحتوى (وعدت به صفحة منهجية المراجعة): يفتح البريد بعنوان المحتوى ومعرّفه وقسمه،
/// وإن لم يتوفر تطبيق بريد ينسخ نص البلاغ إلى الحافظة فيلصقه المستخدم حيث شاء.
public struct SunnahReportIssueButton: View {
    let title: String; let id: String; let section: String
    /// false حين تضع الشاشة هامشها الأفقي بنفسها.
    var inset = true
    @Environment(\.openURL) private var openURL
    @State private var copied = false

    public init(title: String, id: String, section: String, inset: Bool = true) { self.title = title; self.id = id; self.section = section; self.inset = inset }

    static func report(title: String, id: String, section: String) -> String {
        "المحتوى: \(title)\nالمعرّف: \(id)\nالقسم: \(section)\n\nوصف الخطأ (وإن أمكن المصدر الصحيح):\n"
    }

    static func mailURL(title: String, id: String, section: String) -> URL? {
        var c = URLComponents()
        c.scheme = "mailto"; c.path = AccountTexts.contactEmail
        c.queryItems = [URLQueryItem(name: "subject", value: "الإبلاغ عن خطأ — \(title)"),
                        URLQueryItem(name: "body", value: report(title: title, id: id, section: section))]
        return c.url
    }

    public var body: some View { reportButton }

    private var reportButton: some View {
        Button {
            Sunnah.Haptics.select()
            guard let url = Self.mailURL(title: title, id: id, section: section) else { return }
            openURL(url) { accepted in if !accepted { copy() } }
        } label: {
            Label(copied ? "نُسخ نص البلاغ — الصقه في بريدك إلى \(AccountTexts.contactEmail)" : "إبلاغ عن خطأ في هذا المحتوى", systemImage: copied ? "checkmark.circle" : "exclamationmark.bubble")
                .font(AppearancePrefs.ui(.extraBold, 14, .subheadline)).foregroundStyle(Sunnah.Colors.goldInk)
                .multilineTextAlignment(.center)
                .frame(maxWidth: .infinity, minHeight: max(Sunnah.Spacing.buttonHeight, 48))
                .background(Sunnah.Colors.heroGold.opacity(0.22), in: Capsule())
                .overlay(Capsule().stroke(Sunnah.Colors.heroGold, lineWidth: 1))
        }
        .buttonStyle(.plain).sunnahPressable()
        .padding(.horizontal, inset ? Sunnah.Spacing.pageX : 0)
        .accessibilityIdentifier("detail.reportIssue")
    }

    private func copy() {
        let text = Self.report(title: title, id: id, section: section)
        #if canImport(UIKit)
        UIPasteboard.general.string = text
        #elseif canImport(AppKit)
        NSPasteboard.general.clearContents(); NSPasteboard.general.setString(text, forType: .string)
        #endif
        copied = true
    }
}

/// أيقونة «إبلاغ عن خطأ» الصغيرة في الذيل الموحّد (بجانب «!»)؛ تفتح البريد وإلا تنسخ نص البلاغ.
struct SunnahReportIssueIcon: View {
    let title: String; let id: String; let section: String
    @Environment(\.openURL) private var openURL
    var body: some View {
        Button {
            Sunnah.Haptics.select()
            guard let url = SunnahReportIssueButton.mailURL(title: title, id: id, section: section) else { return }
            openURL(url) { accepted in
                if !accepted {
                    let text = SunnahReportIssueButton.report(title: title, id: id, section: section)
                    #if canImport(UIKit)
                    UIPasteboard.general.string = text
                    #elseif canImport(AppKit)
                    NSPasteboard.general.clearContents(); NSPasteboard.general.setString(text, forType: .string)
                    #endif
                }
            }
        } label: {
            Image(systemName: "exclamationmark.bubble").font(Sunnah.Typography.tag).foregroundStyle(Sunnah.Colors.textSecondary)
                .frame(minWidth: 44, minHeight: 44)
        }
        .buttonStyle(.plain)
        .accessibilityLabel("إبلاغ عن خطأ في هذا المحتوى")
        .accessibilityIdentifier("detail.reportIssue")
    }
}

extension ContentItem {
    /// القسم المعروض في البلاغ: أول وسم وإلا مسار العنصر.
    var reportSection: String { tags.first ?? route ?? "—" }
}

private struct SunnahReportIssueToolbar: ViewModifier {
    let title: String; let id: String; let section: String
    @Environment(\.openURL) private var openURL
    func body(content: Content) -> some View {
        content.toolbar {
            ToolbarItem(placement: .primaryAction) {
                Button {
                    Sunnah.Haptics.select()
                    guard let url = SunnahReportIssueButton.mailURL(title: title, id: id, section: section) else { return }
                    openURL(url) { accepted in
                        if !accepted {
                            #if canImport(UIKit)
                            UIPasteboard.general.string = SunnahReportIssueButton.report(title: title, id: id, section: section)
                            #endif
                        }
                    }
                } label: { Image(systemName: "exclamationmark.bubble") }
                    .accessibilityLabel("إبلاغ عن خطأ")
                    .accessibilityIdentifier("detail.reportIssue.toolbar")
            }
        }
    }
}

public extension View {
    /// زر «إبلاغ عن خطأ» في شريط التنقل المشترك لشاشات المحتوى (يكمّل الزر أسفل الصفحة ولا يغني عن الإفصاح).
    func sunnahReportIssueToolbar(title: String, id: String, section: String) -> some View {
        modifier(SunnahReportIssueToolbar(title: title, id: id, section: section))
    }
}
