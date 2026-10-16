// قسم «المظهر» (Section("المظهر") أدناه) هو المكان الموحَّد لكل خيارات المظهر:
// أيقونة التطبيق + السمة + خط التطبيق + حجم النص.
// أضيفوا أي خيار مظهر جديد داخله ولا تنشئوا قسمًا آخر.
import SwiftUI

struct SettingsView: View {
    @Environment(\.platform) private var platform
    @Environment(\.openRoute) private var openRoute
    @State private var email: String?

    private func link(_ title: String, _ icon: String, _ path: String) -> some View {
        Button { openRoute(path) } label: { SunnahListRow(title: title, icon: icon) }
            .accessibilityIdentifier("settings.link\(path)")
    }

    var body: some View {
        ScrollViewReader { proxy in
        List {
            Section("الحساب") {
                if let email {
                    SunnahListRow(title: email, showsChevron: false, icon: "person.crop.circle")
                    Button("تسجيل الخروج", role: .destructive) {
                        Task { await platform.authService.signOut(); self.email = nil }
                    }
                } else {
                    link("تسجيل الدخول", "person.crop.circle.badge.plus", "/login")
                }
                link("مساهماتي", "tray.full", "/my-submissions")
            }
            Section("المظهر") {
                SunnahNavigationLink { AppIconPickerView() } label: { SunnahListRow(title: "أيقونة التطبيق", icon: "app.badge") }
                    .accessibilityIdentifier("settings.appIcon")
                AppearanceOptionsView()
            }
            Section("الصلاة والتنبيهات") {
                link("إعدادات التنبيهات", "bell", "/notification-settings").id("prayer")
                link("وضع المسجد", "building.columns", "/mosque-mode")
                link("وضع السيارة", "car", "/car-mode")
            }
            Section("البيانات والودجت") {
                link("مركز دون اتصال", "arrow.down.circle", "/offline").id("data")
                link("مركز الودجت", "square.grid.2x2", "/widget-center")
            }
            Section("الخصوصية") {
                link("مركز الخصوصية", "hand.raised", "/privacy-center").id("privacy")
                link("حذف الحساب", "trash", "/account-deletion")
            }
            Section("عن التطبيق") {
                link("عن التطبيق", "info.circle", "/about").id("about")
                link("المصادر والتراخيص", "doc.text", "/data-licenses")
                link("سياسة الفتوى والمراجعة", "checkmark.shield", "/fatwa-policy")
                link("جولة في التطبيق", "map", "/feature-tour")
                link("تواصل معنا", "envelope", "/contact")
            }
            Section { SunnahDisclosureNotice(inset: false).padding(.top, 0) }
                .listRowBackground(Color.clear)
        }
        .scrollContentBackground(.hidden)
        .background(Sunnah.Colors.bg)
        .navigationTitle("الإعدادات")
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
        .navigationTitle("تحديث كلمة المرور")
    }
}

/// الخزنة: ملاحظات محلية على الجهاز (UserDefaults). المزامنة السحابية تتطلب عقد خلفية غير موجود بعد.
struct VaultView: View {
    @AppStorage("sunnah.vault.notes") private var raw = "[]"
    @State private var draft = ""
    private var notes: [String] { (try? JSONDecoder().decode([String].self, from: Data(raw.utf8))) ?? [] }
    private func save(_ n: [String]) { raw = (try? String(data: JSONEncoder().encode(n), encoding: .utf8)) ?? "[]" }

    var body: some View {
        List {
            Section("ملاحظة جديدة") {
                TextField("اكتب ملاحظتك", text: $draft, axis: .vertical)
                Button("حفظ") { save([draft] + notes); draft = "" }.disabled(draft.trimmingCharacters(in: .whitespaces).isEmpty)
            }
            Section("ملاحظاتي (على هذا الجهاز)") {
                if notes.isEmpty { Text("لا ملاحظات بعد").foregroundStyle(Sunnah.Colors.textSecondary) }
                ForEach(Array(notes.enumerated()), id: \.offset) { _, n in Text(n) }
                    .onDelete { idx in var n = notes; n.remove(atOffsets: idx); save(n) }
            }
        }
        .scrollContentBackground(.hidden)
        .background(Sunnah.Colors.bg)
        .navigationTitle("خزنتي")
    }
}

enum SettingsScreens {
    @MainActor
    static func register(in registry: TemplateRegistry) {
        registry.registerView(id: "settings") { SettingsView() }
        registry.registerView(id: "vault") { VaultView() }
        registry.registerView(id: "auth.update-password") { UpdatePasswordView() }
        registry.registerView(id: "auth.callback") { ContentPendingView(message: "تُعالَج روابط الدخول تلقائيًا عند فتحها من البريد").navigationTitle("تأكيد الحساب") }
        registry.registerView(id: "upload") { ContentPendingView(message: "رفع الدروس يتطلب خدمة رفع وإشراف في الخادم؛ غير متاح في هذه النسخة").navigationTitle("رفع درس") }
    }
}
