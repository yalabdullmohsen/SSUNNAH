import SwiftUI

/// مصدر نص واحد لإفصاح الذكاء الاصطناعي: يُعرض عبر `SunnahContentFooter` أسفل كل شاشة محتوى شرعي (والمصحف ومواقيت الصلاة بالنمط الخفيف).
public enum SunnahDisclosure {
    public static let title = "تنبيه"

    /// الصيغة المختصرة (حرفيًا من المالك).
    public static let short = "أُعدّ محتوى هذا التطبيق بمساعدة الذكاء الاصطناعي اعتمادًا على مصادر مذكورة في كل صفحة، وقد يقع فيه خطأ. للفتوى والأحكام الشرعية ارجعوا إلى أهل العلم. إن وجدتم خطأً فاضغطوا «إبلاغ عن خطأ»."

    /// سطر بطاقة الذيل الموحّد (أقصر من `short`؛ الرسالة الكاملة في Sheet «!» بضغطة المستخدم).
    public static let card = "أُعدّ هذا المحتوى بمساعدة الذكاء الاصطناعي من مصادر مذكورة، وقد يقع فيه خطأ."

    /// سطر الصفحات الحساسة (أحكام/فتاوى/أحاديث) بجوار أيقونة «!».
    public static let fatwaHint = "للفتوى راجع أهل العلم"

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

/// أيقونة «!» الصغيرة في ذيل الصفحة: الرسالة الكاملة (نص ن5 الحرفي) تُعرض في Sheet **بضغطة المستخدم فقط**،
/// ولا تُفتح تلقائيًا عند دخول أي شاشة (الاستثناء الوحيد: افتتاحية أول تشغيل في IntroView).
struct SunnahDisclosureInfoButton: View {
    let title: String; let id: String; let section: String
    @State private var showing = false
    @Environment(\.openURL) private var openURL
    var body: some View {
        Button { Sunnah.Haptics.select(); showing = true } label: {
            Image(systemName: "info.circle").font(Sunnah.Typography.tag).foregroundStyle(Sunnah.Colors.textSecondary)
                .frame(minWidth: 44, minHeight: 44)
        }
        .buttonStyle(.plain)
        .accessibilityLabel(SunnahDisclosure.title).accessibilityHint("يعرض تنبيه الذكاء الاصطناعي")
        .accessibilityIdentifier("detail.disclosureInfo")
        #if DEBUG
        .onAppear { if UserDefaults.standard.bool(forKey: "snapshotDisclosure") { showing = true } }
        #endif
        .fullScreenCover(isPresented: $showing) {
            // صفحة كاملة بشريط رجوع بدل الورقة؛ الرسالة نفسها حرفيًا.
            VStack(alignment: .leading, spacing: Sunnah.Spacing.s4) {
                SunnahTopBar(onBack: { showing = false }) { EmptyView() }
                Label(SunnahDisclosure.title, systemImage: "info.circle").font(Sunnah.Typography.cardTitle)
                    .padding(.horizontal, Sunnah.Spacing.pageX)
                Text(SunnahDisclosure.short).font(Sunnah.Typography.body).fixedSize(horizontal: false, vertical: true)
                    .padding(.horizontal, Sunnah.Spacing.pageX)
                Spacer(minLength: 0)
                SunnahButton("إبلاغ عن خطأ", style: .primary) {
                    if let url = SunnahReportIssueButton.mailURL(title: title, id: id, section: section) { openURL(url) }
                }
                .accessibilityIdentifier("disclosure.report").padding(.horizontal, Sunnah.Spacing.pageX)
                SunnahButton("إغلاق", style: .outline) { showing = false }
                    .accessibilityIdentifier("disclosure.close").padding(.horizontal, Sunnah.Spacing.pageX).padding(.bottom, Sunnah.Spacing.s4)
            }
            .foregroundStyle(Sunnah.Colors.textPrimary)
            .background(Sunnah.Colors.bg.ignoresSafeArea())
            .environment(\.layoutDirection, .rightToLeft)
            .accessibilityIdentifier("disclosure.sheet")
        }
    }
}
