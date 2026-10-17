import SwiftUI

/// الذيل الموحّد لكل شاشة محتوى شرعي: أيقونتا «!» والإبلاغ الصغيرتان (الرسالة الكاملة في Sheet بضغطة المستخدم فقط) + المصدر (إن وُجد في البيانات) وإلا رابط «مصادر التطبيق» + زر الإبلاغ.
/// `.light` للمصحف ومواقيت الصلاة: سطر الإفصاح ورابط المصادر فقط (لا إبلاغ عن محتوى مفرد).
/// `scripts/native-content-footer-guard.sh` يفشل عند شاشة شرعية لا تستعمله.
public struct SunnahContentFooter: View {
    public enum Style { case full, light }
    let title: String; let id: String; let section: String
    var source: String?
    var style: Style
    var inset: Bool
    /// أحكام/فتاوى/أحاديث: يُضاف سطر «للفتوى راجع أهل العلم» بخط صغير بجانب الأيقونتين.
    var sensitive: Bool

    public init(title: String, id: String, section: String, source: String? = nil, style: Style = .full, inset: Bool = true, sensitive: Bool = false) {
        self.title = title; self.id = id; self.section = section; self.source = source; self.style = style; self.inset = inset; self.sensitive = sensitive
    }

    public var body: some View {
        VStack(spacing: 0) {
            HStack(spacing: Sunnah.Spacing.s3) {
                SunnahDisclosureInfoButton(title: title, id: id, section: section)
                if style == .full { SunnahReportIssueIcon(title: title, id: id, section: section) }
                if sensitive {
                    Text(SunnahDisclosure.fatwaHint).font(Sunnah.Typography.tag).foregroundStyle(Sunnah.Colors.textSecondary)
                        .accessibilityIdentifier("detail.fatwaHint")
                }
                Spacer(minLength: 0)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(.horizontal, inset ? Sunnah.Spacing.pageX : 0).padding(.top, Sunnah.Spacing.s4)
            SunnahSourceLine(source: source, inset: inset)
        }
        .accessibilityIdentifier("detail.footer")
    }
}

/// سطر المصدر: نص المصدر حين تحمله البيانات، وإلا رابط «مصادر التطبيق» إلى `/sources`.
struct SunnahSourceLine: View {
    var source: String?
    var inset = true
    var body: some View {
        Group {
            if let source, !source.isEmpty {
                Label(source, systemImage: "text.book.closed")
                    .accessibilityIdentifier("detail.source")
            } else {
                SunnahValueLink(value: Route.web(path: "/sources")) {
                    Label("مصادر التطبيق", systemImage: "text.book.closed")
                        .foregroundStyle(Sunnah.Colors.primary)
                }
                .accessibilityIdentifier("detail.sourcesLink")
            }
        }
        .font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.textSecondary)
        .multilineTextAlignment(.leading)
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(.horizontal, inset ? Sunnah.Spacing.pageX : 0).padding(.top, Sunnah.Spacing.s3)
    }
}
