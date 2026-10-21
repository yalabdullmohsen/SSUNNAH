import SwiftUI

/// الذيل الموحّد لكل شاشة محتوى شرعي: أيقونتا «ⓘ» والإبلاغ «!» الصغيرتان (الرسالة الكاملة في Sheet بضغطة المستخدم فقط) + المصدر (إن وُجد في البيانات) وإلا رابط «مصادر التطبيق».
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

    /// بطاقة صغيرة واحدة أسفل الصفحة فقط (قرار المالك 2026-10-20 مساءً: لا إبلاغ أعلى الصفحة ولا في وسطها):
    /// «ⓘ» + جملة الإفصاح بخط صغير + «!» للإبلاغ، وتحتها المصدر بخط صغير — كلها داخل البطاقة نفسها.
    public var body: some View {
        VStack(alignment: .leading, spacing: Sunnah.Spacing.s1) {
            HStack(alignment: .center, spacing: Sunnah.Spacing.s1) {
                SunnahDisclosureInfoButton(title: title, id: id, section: section)
                Text(SunnahDisclosure.card).font(AppearancePrefs.ui(.regular, 11, .caption2)).foregroundStyle(Sunnah.Colors.textSecondary)
                    .fixedSize(horizontal: false, vertical: true).frame(maxWidth: .infinity, alignment: .leading)
                    .accessibilityIdentifier("detail.disclosureCard")
                if style == .full { SunnahReportIssueIcon(title: title, id: id, section: section) }
            }
            if sensitive {
                Text(SunnahDisclosure.fatwaHint).font(AppearancePrefs.ui(.regular, 11, .caption2)).foregroundStyle(Sunnah.Colors.textSecondary)
                    .padding(.horizontal, Sunnah.Spacing.s2)
                    .accessibilityIdentifier("detail.fatwaHint")
            }
            SunnahSourceLine(source: source, inset: false, compact: true)
        }
        .padding(.horizontal, Sunnah.Spacing.s2).padding(.vertical, Sunnah.Spacing.s1)
        .background(Sunnah.Colors.surface2.opacity(0.6), in: RoundedRectangle(cornerRadius: 14, style: .continuous))
        .padding(.horizontal, Sunnah.Spacing.pageX).padding(.top, Sunnah.Spacing.s5)
        .padding(.bottom, Sunnah.Spacing.s4)
        .accessibilityIdentifier("detail.footer")
    }
}

/// سطر المصدر: نص المصدر حين تحمله البيانات، وإلا رابط «مصادر التطبيق» إلى `/sources`.
struct SunnahSourceLine: View {
    var source: String?
    var inset = true
    /// داخل بطاقة الذيل الصغيرة: خط أصغر وبلا هامش علوي كبير.
    var compact = false
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
        .font(compact ? AppearancePrefs.ui(.regular, 12, .caption) : Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.textSecondary)
        .multilineTextAlignment(.leading)
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(.horizontal, inset ? Sunnah.Spacing.pageX : Sunnah.Spacing.s2).padding(.top, compact ? 0 : Sunnah.Spacing.s3)
        .padding(.bottom, compact ? Sunnah.Spacing.s1 : 0)
    }
}
