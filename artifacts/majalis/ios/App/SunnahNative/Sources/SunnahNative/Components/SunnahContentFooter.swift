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

    /// يستهلك `SourceRef` الموحّد مباشرة: المصادر المفهومة فقط تُعرض مفصولة بـ«؛»، وبلا مصادر يعود رابط «مصادر التطبيق».
    public init(title: String, id: String, section: String, sources: [SourceRef], style: Style = .full, inset: Bool = true, sensitive: Bool = false) {
        let joined = sources.map(\.display).filter { !$0.isEmpty }.joined(separator: "؛ ")
        self.init(title: title, id: id, section: section, source: joined.isEmpty ? nil : joined, style: style, inset: inset, sensitive: sensitive)
    }

    public var body: some View {
        VStack(spacing: Sunnah.Spacing.s3) {
            VStack(alignment: .leading, spacing: Sunnah.Spacing.s2) {
                HStack(alignment: .center, spacing: Sunnah.Spacing.s2) {
                    SunnahDisclosureInfoButton(title: title, id: id, section: section)
                    Text(SunnahDisclosure.card).font(AppearancePrefs.ui(.bold, 13, .footnote)).foregroundStyle(Sunnah.Colors.textSecondary)
                        .fixedSize(horizontal: false, vertical: true).frame(maxWidth: .infinity, alignment: .leading)
                        .accessibilityIdentifier("detail.disclosureCard")
                }
                if sensitive {
                    Text(SunnahDisclosure.fatwaHint).font(AppearancePrefs.ui(.bold, 13, .footnote)).foregroundStyle(Sunnah.Colors.textSecondary)
                        .accessibilityIdentifier("detail.fatwaHint")
                }
                if style == .full { SunnahReportIssueButton(title: title, id: id, section: section, inset: false) }
                SunnahSourceLine(source: source, inset: false)
            }
            .padding(Sunnah.Spacing.s4)
            .background(Sunnah.Colors.surface, in: RoundedRectangle(cornerRadius: 26, style: .continuous))
            .overlay(RoundedRectangle(cornerRadius: 26, style: .continuous).stroke(Sunnah.Colors.border, lineWidth: 1))
        }
        .padding(.horizontal, Sunnah.Spacing.pageX).padding(.top, Sunnah.Spacing.s4)
        .padding(.bottom, Sunnah.Spacing.s4)
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
        .padding(.horizontal, inset ? Sunnah.Spacing.pageX : Sunnah.Spacing.s2).padding(.top, Sunnah.Spacing.s3)
    }
}
