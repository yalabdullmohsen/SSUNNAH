import SwiftUI

/// مصدر نص واحد لإفصاح الذكاء الاصطناعي: يُعرض أسفل كل صفحة تفاصيل وفي «عن التطبيق» والإعدادات والترحيب.
public enum SunnahDisclosure {
    public static let title = "تنبيه"

    /// الصيغة المختصرة (حرفيًا من المالك).
    public static let short = "أُعدّ محتوى هذا التطبيق بمساعدة الذكاء الاصطناعي اعتمادًا على مصادر مذكورة في كل صفحة، وقد يقع فيه خطأ. للفتوى والأحكام الشرعية ارجعوا إلى أهل العلم. إن وجدتم خطأً فاضغطوا «إبلاغ عن خطأ»."

    /// الصيغة الموسّعة: المعنى نفسه مع بيان الوسم ودرجة التوثيق.
    public static let long = "أُعدّ محتوى هذا التطبيق بمساعدة الذكاء الاصطناعي اعتمادًا على مصادر مذكورة في كل صفحة، وقد يقع فيه خطأ. للفتوى والأحكام الشرعية ارجعوا إلى أهل العلم. المحتوى التحريري موسوم «من إعداد سُنّة»، ودرجة التوثيق تتفاوت بحسب الوسم الظاهر في كل صفحة. إن وجدتم خطأً فاضغطوا «إبلاغ عن خطأ» أسفل الصفحة."
}

/// سطر الإفصاح الثابت أسفل صفحات التفاصيل (قبل زر «إبلاغ عن خطأ»)؛ يظهر في كل أنواعها عبر `SunnahReportIssueButton`.
struct SunnahDisclosureNotice: View {
    var inset = true
    var body: some View {
        VStack(alignment: .leading, spacing: Sunnah.Spacing.s2) {
            Label(SunnahDisclosure.title, systemImage: "info.circle")
                .font(Sunnah.Typography.tag).foregroundStyle(Sunnah.Colors.textSecondary)
            Text(SunnahDisclosure.short)
                .font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.textSecondary)
                .fixedSize(horizontal: false, vertical: true)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(.horizontal, inset ? Sunnah.Spacing.pageX : 0).padding(.top, Sunnah.Spacing.s4)
        .accessibilityElement(children: .combine)
        .accessibilityIdentifier("detail.disclosure")
    }
}
