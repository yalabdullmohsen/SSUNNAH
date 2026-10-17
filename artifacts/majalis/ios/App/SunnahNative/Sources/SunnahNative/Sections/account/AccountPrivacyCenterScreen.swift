import SwiftUI

/// /privacy-center — الحقوق، تصدير بيانات الحساب، وروابط الحذف والسياسات (نصوص PrivacyCenterPage).
struct AccountPrivacyCenterScreen: View {
    static let staticPages: [(title: String, url: String)] = [
        ("سياسة الخصوصية على الإنترنت", "https://yalabdullmohsen.github.io/SSUNNAH/privacy.html"),
        ("الدعم والتواصل", "https://yalabdullmohsen.github.io/SSUNNAH/support.html"),
    ]

    @Environment(\.platform) private var platform
    @State private var exporting = false
    @State private var exportMessage = ""
    @State private var exportFile: URL?

    private static let rights = [
        "الاطلاع على سياسة الخصوصية واتفاقية Apple القياسية للاستخدام.",
        "تصدير بيانات حسابك (قابلية النقل).",
        "طلب حذف الحساب نهائيًا (حق النسيان)."
    ]

    var body: some View {
        ScrollView {
            LazyVStack(alignment: .leading, spacing: Sunnah.Spacing.s4) {
                AccountHeader(eyebrow: "الخصوصية", title: "مركز الخصوصية", subtitle: "آخر تحديث: 2026-08-07")

                AccountSectionCard(title: "حقوقك باختصار") {
                    AccountListBlock(items: Self.rights, numbered: false)
                }

                AccountSectionCard(title: "الموافقة والتخزين") {
                    AccountRichText("التخزين الضروري مطلوب لتشغيل الجلسة والتفضيلات. لا يُرسل التطبيق أي بيانات تحليلات.")
                }

                AccountSectionCard(title: "تصدير البيانات") {
                    AccountRichText("احصل على ملف JSON يتضمن بيانات حسابك المرتبطة في المنصة (أفضل جهد للجداول المتاحة).")
                    SunnahButton(exporting ? "يُصدَّر…" : "تصدير بيانات الحساب", style: .secondary) {
                        Task { await export() }
                    }
                    .disabled(exporting)
                    if !exportMessage.isEmpty {
                        Text(exportMessage).font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.textSecondary)
                    }
                    if let exportFile {
                        ShareLink(item: exportFile) {
                            Label("حفظ الملف أو مشاركته", systemImage: "square.and.arrow.down")
                                .font(Sunnah.Typography.cardTitle).foregroundStyle(Sunnah.Colors.primary)
                                .frame(minHeight: Sunnah.Spacing.touch)
                        }
                    }
                    AccountRichText("لتصدير تفضيلات الجهاز فقط استخدم زر التنزيل في [الإعدادات](majlisilm://settings).",
                                    font: Sunnah.Typography.secondary, color: Sunnah.Colors.textSecondary)
                }

                AccountSectionCard(title: "حذف الحساب") {
                    AccountLinkRow(title: "حذف الحساب نهائيًا", path: "/account-deletion")
                }

                AccountSectionCard(title: "سياسات ومستندات") {
                    AccountLinkRow(title: "سياسة الخصوصية", path: "/privacy")
                    // قرار المالك: اتفاقية Apple القياسية (EULA) بدل صفحة شروط مخصصة.
                    if let eula = URL(string: "https://www.apple.com/legal/internet-services/itunes/dev/stdeula/") {
                        Link(destination: eula) { SunnahListRow(title: "شروط الاستخدام (اتفاقية Apple القياسية)", subtitle: nil) }
                            .buttonStyle(.plain)
                    }
                    // روابط ثابتة على GitHub Pages (يتحقق حارس الروابط من 200)؛ لا نطاق موقع في التطبيق.
                    ForEach(Self.staticPages, id: \.title) { page in
                        if let url = URL(string: page.url) {
                            Link(destination: url) { SunnahListRow(title: page.title, subtitle: nil) }.buttonStyle(.plain)
                        }
                    }
                    AccountLinkRow(title: "إعدادات الكثافة وتوفير البيانات", path: "/settings")
                }
            }
            .padding(Sunnah.Spacing.pageX)
        }
        .background(Sunnah.Colors.bg)
        .navigationTitle("مركز الخصوصية")
    }

    @MainActor private func export() async {
        guard let session = AccountSession.read(from: platform.auth) else {
            exportMessage = "سجّل الدخول لتصدير بيانات الحساب من الخادم."
            return
        }
        exporting = true
        exportMessage = ""
        exportFile = nil
        defer { exporting = false }
        do {
            let data = try await AccountAPI().exportAccount(token: session.accessToken)
            let url = FileManager.default.temporaryDirectory.appendingPathComponent("ssunnah-data-export.json")
            try data.write(to: url, options: .atomic)
            exportFile = url
            exportMessage = "تم تنزيل نسخة بياناتك."
        } catch AccountAPIError.server(let message) {
            exportMessage = message
        } catch {
            exportMessage = "تعذّر تحميل المحتوى. أعد المحاولة."
        }
    }
}
