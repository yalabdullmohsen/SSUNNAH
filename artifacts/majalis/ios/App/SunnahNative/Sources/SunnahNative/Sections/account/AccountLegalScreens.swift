import SwiftUI

/// /about — حول التطبيق. النص حرفي من AboutPage، ورقم الإصدار من الحزمة.
struct AccountAboutScreen: View {
    var body: some View {
        AccountLegalDocumentView(AccountTexts.about, sharePath: "/about") {
            SunnahDisclosureNotice(inset: false)   // مصدر النص الواحد (يتبع الصيغة المختصرة)
        }
    }
}

/// /privacy — سياسة الخصوصية حرفيًا.
struct AccountPrivacyScreen: View {
    var body: some View { AccountLegalDocumentView(AccountTexts.privacy, sharePath: "/privacy") }
}

/// /fatwa-policy — سياسة الفتوى والمراجعة حرفيًا (قالب «مقال» بأقسامه).
struct AccountFatwaPolicyScreen: View {
    var body: some View { AccountLegalDocumentView(AccountTexts.fatwaPolicy, sharePath: "/fatwa-policy") }
}

/// /data-licenses — المصادر والتراخيص من data/content-sources.ts حرفيًا.
struct AccountDataLicensesScreen: View {
    var body: some View {
        ScrollView {
            LazyVStack(alignment: .leading, spacing: Sunnah.Spacing.s4) {
                AccountHeader(eyebrow: "الشفافية", title: "المصادر والتراخيص", subtitle: "آخر تحديث: 2026-10-09")

                AccountSectionCard(title: "الحقوق") {
                    AccountRichText("**" + AccountTexts.rightsHeadline + "**")
                    AccountRichText(AccountTexts.rightsSentence)
                    AccountRichText("لا نعيد استضافة الدروس والمنشورات الخارجية؛ تُعرض كمعلومة وجدول ورابط للمصدر. [منهجية التوثيق](majlisilm://methodology) · [دليل الجهات](majlisilm://sources) · الجرد الكامل للمكتبات والأصول في docs/LICENSES.md")
                }

                ForEach(AccountTexts.sourceTypes) { type in
                    AccountSectionCard(title: type.label) {
                        ForEach(type.entries) { AccountSourceEntryView(entry: $0) }
                    }
                }

                AccountSectionCard(title: "مصادر لم يُحسم ترخيصها") {
                    AccountRichText("لا ندّعي لها ترخيصًا مفتوحًا. تُراجَع مع المالك قبل أي اعتماد، وما لم يثبت إذنه يبقى معروضًا بالإسناد فقط أو يُسحب.")
                    AccountListBlock(items: AccountTexts.unknownLicenseSources.map { "**\($0.entry.name)** (\($0.typeLabel))" }, numbered: false)
                }

                AccountSectionCard(title: "الإبلاغ") {
                    AccountRichText("بلاغات الحقوق أو خطأ في النسبة عبر [تواصل معنا](majlisilm://contact) — أولوية قصوى.")
                }
                AccountShareRow(title: "المصادر والتراخيص — سُنّة", path: "/data-licenses")
            }
            .padding(Sunnah.Spacing.pageX)
        }
        .background(Sunnah.Colors.bg)
        .sunnahNavTitle("المصادر والتراخيص")
    }
}

struct AccountSourceEntryView: View {
    let entry: AccountSourceEntry

    var body: some View {
        VStack(alignment: .leading, spacing: Sunnah.Spacing.s2) {
            HStack(alignment: .firstTextBaseline, spacing: Sunnah.Spacing.s2) {
                Text(entry.name).font(Sunnah.Typography.cardTitle).foregroundStyle(Sunnah.Colors.textPrimary)
                    .fixedSize(horizontal: false, vertical: true)
                Spacer(minLength: Sunnah.Spacing.s2)
                SunnahChip(AccountTexts.sourceStatusLabel[entry.status] ?? entry.status, selected: entry.status == "open")
            }
            labeled("ما أخذناه:", entry.took)
            labeled("الترخيص:", entry.license)
            if let link = entry.url, let url = URL(string: link) {
                Link(link, destination: url).font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.primary)
                    .environment(\.layoutDirection, .leftToRight)
            }
        }
        .padding(.vertical, Sunnah.Spacing.s2)
        .accessibilityElement(children: .combine)
    }

    private func labeled(_ key: String, _ value: String) -> some View {
        (Text(key + " ").foregroundColor(Sunnah.Colors.textSecondary) + Text(value).foregroundColor(Sunnah.Colors.textPrimary))
            .font(Sunnah.Typography.secondary)
            .fixedSize(horizontal: false, vertical: true)
    }
}
