import SwiftUI
#if canImport(UIKit)
import UIKit
#endif

/// /contact — البريد الرسمي، موضوعات الرسائل، والأسئلة الشائعة (نصوص ContactPage حرفيًا).
struct AccountContactScreen: View {
    /// موضوع مقترح من رابط ?topic= (يمرّره الموجّه حين يدعم الاستعلام).
    var topicParam: String = ""
    @State private var copied = false
    @State private var expandedFAQ: String? = AccountTexts.contactFAQ.first?.id

    private var activeTopic: AccountContactTopic? {
        AccountContact.resolveTopicId(topicParam).flatMap { id in AccountTexts.contactTopics.first { $0.id == id } }
    }

    var body: some View {
        ScrollView {
            LazyVStack(alignment: .leading, spacing: Sunnah.Spacing.s4) {
                AccountHeader(eyebrow: "الدعم", title: "تواصل معنا")

                AccountSectionCard(title: "قنوات التواصل") {
                    HStack(spacing: Sunnah.Spacing.s3) {
                        Image(systemName: "envelope").font(Sunnah.Typography.sectionTitle).foregroundStyle(Sunnah.Colors.primary)
                            .accessibilityHidden(true)
                        VStack(alignment: .leading, spacing: Sunnah.Spacing.s1) {
                            Text("البريد الرسمي").font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.textSecondary)
                            Text(AccountTexts.contactEmail).font(Sunnah.Typography.cardTitle).foregroundStyle(Sunnah.Colors.textPrimary)
                                .environment(\.layoutDirection, .leftToRight).textSelection(.enabled)
                        }
                    }
                    HStack(spacing: Sunnah.Spacing.s3) {
                        mailButton("إرسال بريد", subject: AccountContact.subject(for: activeTopic, topicParam: topicParam))
                        SunnahButton(copied ? "تم النسخ" : "نسخ", style: .secondary) { copyEmail() }
                    }
                }

                Text("يسعدنا استقبال ملاحظاتك واقتراحاتك وتصحيحاتك.")
                    .font(Sunnah.Typography.body).foregroundStyle(Sunnah.Colors.textSecondary)

                if let activeTopic {
                    SunnahCard {
                        AccountRichText("موضوع مقترَح من الرابط: **\(activeTopic.label)**"
                                        + (topicParam.isEmpty || topicParam == activeTopic.id ? "" : " — السياق: \(topicParam)"))
                    }
                }

                AccountSectionCard(title: "كيف نساعدك؟") {
                    ForEach(AccountTexts.contactTopics) { topic in
                        let selected = topic.id == activeTopic?.id
                        let subject = selected && !topicParam.isEmpty && topicParam != topic.id ? "\(topic.subject) — \(topicParam)" : topic.subject
                        if let url = AccountContact.mailto(subject: subject) {
                            Link(destination: url) {
                                SunnahListRow(title: topic.label, subtitle: topic.note)
                            }
                            .buttonStyle(.plain)
                            .accessibilityAddTraits(selected ? .isSelected : [])
                        }
                    }
                }

                AccountSectionCard(title: "للإعلان والشراكات") {
                    Text("للاقتراحات أو الإعلان أو الشراكات، راسلنا عبر البريد الرسمي فقط.")
                        .font(Sunnah.Typography.body).foregroundStyle(Sunnah.Colors.textPrimary)
                    Text(AccountTexts.contactEmail).font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.textSecondary)
                        .environment(\.layoutDirection, .leftToRight)
                    mailButton("إرسال بريد", subject: "للإعلان والشراكات")
                }

                AccountSectionCard(title: "الأسئلة الشائعة") {
                    ForEach(AccountTexts.contactFAQ) { item in
                        DisclosureGroup(isExpanded: Binding(
                            get: { expandedFAQ == item.id },
                            set: { expandedFAQ = $0 ? item.id : nil }
                        )) {
                            Text(item.answer).font(Sunnah.Typography.body).foregroundStyle(Sunnah.Colors.textSecondary)
                                .fixedSize(horizontal: false, vertical: true)
                                .frame(maxWidth: .infinity, alignment: .leading)
                                .padding(.top, Sunnah.Spacing.s2)
                        } label: {
                            Text(item.question).font(Sunnah.Typography.cardTitle).foregroundStyle(Sunnah.Colors.textPrimary)
                                .frame(maxWidth: .infinity, minHeight: Sunnah.Spacing.touch, alignment: .leading)
                        }
                        .tint(Sunnah.Colors.primary)
                    }
                }
            }
            .padding(Sunnah.Spacing.pageX)
        }
        .background(Sunnah.Colors.bg)
        .navigationTitle("تواصل معنا")
    }

    @ViewBuilder
    private func mailButton(_ title: String, subject: String) -> some View {
        if let url = AccountContact.mailto(subject: subject) {
            Link(destination: url) {
                Text(title).font(Sunnah.Typography.cardTitle)
                    .frame(maxWidth: .infinity, minHeight: Sunnah.Spacing.buttonHeight)
                    .foregroundStyle(Sunnah.Colors.textOnPrimary)
                    .background(Sunnah.Colors.primary, in: RoundedRectangle(cornerRadius: Sunnah.Radius.small))
            }
            .buttonStyle(.plain)
        }
    }

    private func copyEmail() {
        #if canImport(UIKit)
        UIPasteboard.general.string = AccountTexts.contactEmail
        #elseif canImport(AppKit)
        NSPasteboard.general.clearContents()
        NSPasteboard.general.setString(AccountTexts.contactEmail, forType: .string)
        #endif
        copied = true
        Task { @MainActor in
            try? await Task.sleep(nanoseconds: 2_000_000_000)
            copied = false
        }
    }
}

/// منطق التواصل النقي (مطابق لـ ContactPage).
enum AccountContact {
    static func mailto(subject: String) -> URL? {
        var c = URLComponents()
        c.scheme = "mailto"
        c.path = AccountTexts.contactEmail
        c.queryItems = [URLQueryItem(name: "subject", value: subject)]
        return c.url
    }

    static func subject(for topic: AccountContactTopic?, topicParam: String) -> String {
        guard let topic else { return "استفسار عام" }
        return !topicParam.isEmpty && topicParam != topic.id ? "\(topic.subject) — \(topicParam)" : topic.subject
    }

    static func resolveTopicId(_ raw: String) -> String? {
        let t = (raw.removingPercentEncoding ?? raw).trimmingCharacters(in: .whitespacesAndNewlines).lowercased()
        if t.isEmpty { return nil }
        if t == "rate" || t.contains("تقييم") || t.contains("rate") { return "suggest" }
        if t.contains("خطأ") || t.contains("تصحيح") || t.contains("report") || t.contains("content") { return "report" }
        if t.contains("اقتراح") || t.contains("suggest") || t.contains("ملاحظة") { return "suggest" }
        if t.contains("تقنية") || t.contains("tech") { return "tech" }
        if t.contains("حذف") || t.contains("خصوصية") || t.contains("privacy") { return "privacy" }
        if t.contains("شراكة") || t.contains("partner") || t.contains("إعلان") || t.contains("اعلان") { return "partner" }
        return "suggest"
    }
}
