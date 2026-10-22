// قسم «المظهر» (Section("المظهر") أدناه) هو المكان الموحَّد لكل خيارات المظهر:
// أيقونة التطبيق + السمة + خط التطبيق + حجم النص.
// أضيفوا أي خيار مظهر جديد داخله ولا تنشئوا قسمًا آخر.
import SwiftUI

struct SettingsView: View {
    @Environment(\.platform) private var platform
    @Environment(\.openRoute) private var openRoute
    @State private var email: String?

    private func link(_ title: String, _ icon: String, _ path: String, last: Bool = false, tone: SunnahIconTile.Tone = .mint) -> some View {
        Button { openRoute(path) } label: {
            SunnahSettingsRow(title, symbol: icon, tone: tone, isLast: last) { chevron }
        }
        .buttonStyle(.plain)
        .accessibilityIdentifier("settings.link\(path)")
    }

    private var chevron: some View {
        Image(systemName: "chevron.left").font(.system(size: 13, weight: .bold)).foregroundStyle(Sunnah.Colors.textSecondary)
    }

    var body: some View {
        ScrollViewReader { proxy in
        ScrollView {
            VStack(alignment: .leading, spacing: 18) {
                SunnahPageTitle("الإعدادات")
                SunnahSettingsGroup("الصلاة") {
                    link("إعدادات التنبيهات", "bell", "/notification-settings").id("prayer")
                    link("وضع المسجد", "building.columns", "/mosque-mode")
                    link("وضع السيارة", "car", "/car-mode", last: true)
                }
                SunnahSettingsGroup("المصحف") {
                    TextSizeOptionsView()
                }
                SunnahSettingsGroup("المظهر") {
                    SunnahNavigationLink { AppIconPickerView() } label: {
                        SunnahSettingsRow("أيقونة التطبيق", symbol: "app.badge") { chevron }
                    }
                    .buttonStyle(.plain).accessibilityIdentifier("settings.appIcon")
                    AppearanceOptionsView()
                }
                SunnahSettingsGroup("الحساب") {
                    if let email {
                        SunnahSettingsRow(email, symbol: "person.crop.circle")
                        Button { Task { await platform.authService.signOut(); self.email = nil } } label: {
                            SunnahSettingsRow("تسجيل الخروج", symbol: "rectangle.portrait.and.arrow.right", tone: .gold)
                        }.buttonStyle(.plain)
                    } else {
                        link("تسجيل الدخول", "person.crop.circle.badge.checkmark", "/login")
                    }
                    link("مساهماتي", "tray.full", "/my-submissions", last: true)
                }
                SunnahSettingsGroup("البيانات والودجت") {
                    link("مركز دون اتصال", "arrow.down.circle", "/offline").id("data")
                    link("مركز الودجت", "square.grid.2x2", "/widget-center", last: true)
                }
                SunnahSettingsGroup("الخصوصية") {
                    link("مركز الخصوصية", "hand.raised", "/privacy-center").id("privacy")
                    link("حذف الحساب", "trash", "/account-deletion", last: true, tone: .gold)
                }
                SunnahSettingsGroup("عن التطبيق") {
                    VStack(alignment: .leading, spacing: Sunnah.Spacing.s2) {
                        Label(SunnahDisclosure.title, systemImage: "info.circle").font(AppearancePrefs.ui(.extraBold, 14, .subheadline)).foregroundStyle(Sunnah.Colors.primary)
                        Text(SunnahDisclosure.short).font(AppearancePrefs.ui(.bold, 13, .footnote)).foregroundStyle(Sunnah.Colors.textSecondary)
                            .fixedSize(horizontal: false, vertical: true)
                    }
                    .frame(maxWidth: .infinity, alignment: .leading).padding(.vertical, 14)
                    .accessibilityElement(children: .combine).accessibilityIdentifier("detail.disclosure")
                    link("عن التطبيق", "info.circle", "/about").id("about")
                    link("المصادر والتراخيص", "doc.text", "/data-licenses")
                    link("سياسة الفتوى والمراجعة", "checkmark.shield", "/fatwa-policy")
                    link("جولة في التطبيق", "map", "/feature-tour")
                    link("تواصل معنا", "envelope", "/contact", last: true)
                }
            }
            .padding(.bottom, 96)
        }
        .background(Sunnah.Colors.bg)
        .sunnahRootChrome()
        .environment(\.layoutDirection, .rightToLeft)
        .sunnahReadableWidth()
        .onAppear { email = platform.authService.currentEmail }
        #if DEBUG
        .task {   // لقطات التدقيق فقط: تمرير إلى مجموعة
            if let id = ProcessInfo.processInfo.environment["SNAP_SCROLL"] {
                try? await Task.sleep(nanoseconds: 1_500_000_000)
                proxy.scrollTo(id, anchor: .top)
            }
        }
        #endif
        }
    }
}

struct UpdatePasswordView: View {
    @Environment(\.platform) private var platform
    @State private var password = ""
    @State private var message: String?
    @State private var busy = false
    var body: some View {
        VStack(spacing: Sunnah.Spacing.s4) {
            SecureField("كلمة المرور الجديدة (6 أحرف فأكثر)", text: $password).sunnahFieldChrome()
            if let message { Text(message).font(Sunnah.Typography.secondary) }
            Button(busy ? "جارٍ الحفظ…" : "حفظ") {
                Task {
                    busy = true; defer { busy = false }
                    do { try await platform.authService.updatePassword(password); message = "تم تحديث كلمة المرور." }
                    catch { message = error.localizedDescription }
                }
            }
            .buttonStyle(.borderedProminent).disabled(busy || password.count < 6)
        }
        .padding(Sunnah.Spacing.pageX)
        .frame(maxHeight: .infinity, alignment: .top)
        .background(Sunnah.Colors.bg)
        .sunnahNavTitle("تحديث كلمة المرور")
    }
}

/// الخزنة: ملاحظات محلية على الجهاز (UserDefaults). المزامنة السحابية تتطلب عقد خلفية غير موجود بعد.
struct VaultView: View {
    @AppStorage("sunnah.vault.notes") private var raw = "[]"
    @State private var draft = ""
    private var notes: [String] { (try? JSONDecoder().decode([String].self, from: Data(raw.utf8))) ?? [] }
    private func save(_ n: [String]) { raw = (try? String(data: JSONEncoder().encode(n), encoding: .utf8)) ?? "[]" }

    var body: some View {
        SunnahRowStack {
            SunnahRowGroupHeader("ملاحظة جديدة")
            VStack(spacing: Sunnah.Spacing.s3) {
                TextField("اكتب ملاحظتك", text: $draft, axis: .vertical)
                    .font(Sunnah.Typography.body).frame(minHeight: 44).accessibilityIdentifier("vault.draft")
                SunnahButton("حفظ") { save([draft] + notes); draft = "" }
                    .disabled(draft.trimmingCharacters(in: .whitespaces).isEmpty).accessibilityIdentifier("vault.save")
            }.sunnahStackRow()
            SunnahRowGroupHeader("ملاحظاتي (على هذا الجهاز)")
            if notes.isEmpty { Text("لا ملاحظات بعد").font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.textSecondary)
                .frame(maxWidth: .infinity, alignment: .leading).padding(.horizontal, Sunnah.Spacing.pageX) }
            ForEach(Array(notes.enumerated()), id: \.offset) { i, n in
                HStack(alignment: .top) {
                    Text(n).font(Sunnah.Typography.body).foregroundStyle(Sunnah.Colors.textPrimary)
                        .frame(maxWidth: .infinity, alignment: .leading)
                    Button { var all = notes; all.remove(at: i); save(all) } label: {
                        Image(systemName: "trash").foregroundStyle(Sunnah.Colors.textSecondary)
                            .frame(width: 44, height: 44).contentShape(Rectangle())
                    }.buttonStyle(.plain).accessibilityLabel("حذف الملاحظة")
                }.sunnahStackRow()
            }
        }
        .sunnahNavTitle("خزنتي")
    }
}

enum SettingsScreens {
    @MainActor
    static func register(in registry: TemplateRegistry) {
        registry.registerView(id: "settings") { SettingsView() }
        registry.registerView(id: "vault") { VaultView() }
        registry.registerView(id: "auth.update-password") { UpdatePasswordView() }
        registry.registerView(id: "auth.callback") { ContentPendingView(message: "تُعالَج روابط الدخول تلقائيًا عند فتحها من البريد").sunnahNavTitle("تأكيد الحساب") }
        registry.registerView(id: "upload") { ContentPendingView(message: "رفع الدروس يتطلب خدمة رفع وإشراف في الخادم؛ غير متاح في هذه النسخة").sunnahNavTitle("رفع درس") }
    }
}
