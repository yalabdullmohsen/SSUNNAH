import SwiftUI

struct SettingsView: View {
    @Environment(\.platform) private var platform
    @State private var email: String?
    @State private var laState = ""

    var body: some View {
        List {
            Section("الحساب") {
                if let email {
                    Text(email)
                    Button("تسجيل الخروج", role: .destructive) {
                        Task { await platform.authService.signOut(); self.email = nil }
                    }
                } else {
                    Text("لم تسجّل الدخول").foregroundStyle(Sunnah.Colors.textSecondary)
                }
            }
            if platform.liveActivity.isSupported {
                Section("النشاط الحي للصلاة") {
                    Button("تحديث النشاط الحي الآن") {
                        Task { laState = await platform.liveActivity.sync() ? "تم التحديث" : "غير مفعّل أو لا يوجد موعد" }
                    }
                    Button("إيقاف النشاط الحي") {
                        Task { laState = await platform.liveActivity.end() ? "تم الإيقاف" : "لا نشاط جارٍ" }
                    }
                    if !laState.isEmpty { Text(laState).font(Sunnah.Typography.secondary) }
                }
            }
            Section("الخصوصية") {
                Text("تُعالج التلاوة في التسميع على جهازك فقط. لحذف حسابك وبياناتك افتح «حذف الحساب» من القائمة.")
                    .font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.textSecondary)
            }
        }
        .scrollContentBackground(.hidden)
        .background(Sunnah.Colors.bg)
        .navigationTitle("الإعدادات")
        .onAppear { email = platform.authService.currentEmail }
    }
}

struct WidgetCenterView: View {
    @Environment(\.platform) private var platform
    var body: some View {
        List {
            Section("الويدجت") {
                Text("أضف ويدجت سُنّة من الشاشة الرئيسية: اضغط مطولًا على الشاشة ثم «+» ثم ابحث عن «سُنّة».")
                Text("تتحدّث الويدجت من بيانات التطبيق المشتركة تلقائيًا.").font(Sunnah.Typography.secondary)
                    .foregroundStyle(Sunnah.Colors.textSecondary)
            }
            Section("النشاط الحي") {
                Text(platform.liveActivity.isSupported ? "مدعوم على هذا الجهاز؛ يظهر موعد الصلاة القادمة على شاشة القفل." : "غير مدعوم على هذا الجهاز.")
            }
        }
        .scrollContentBackground(.hidden)
        .background(Sunnah.Colors.bg)
        .navigationTitle("مركز الويدجت")
    }
}

struct UpdatePasswordView: View {
    @Environment(\.platform) private var platform
    @State private var password = ""
    @State private var message: String?
    @State private var busy = false
    var body: some View {
        VStack(spacing: Sunnah.Spacing.s4) {
            SecureField("كلمة المرور الجديدة (6 أحرف فأكثر)", text: $password).textFieldStyle(.roundedBorder)
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
        registry.registerView(id: "widget-center") { WidgetCenterView() }
        registry.registerView(id: "vault") { VaultView() }
        registry.registerView(id: "auth.update-password") { UpdatePasswordView() }
        registry.registerView(id: "auth.callback") { ContentPendingView(message: "تُعالَج روابط الدخول تلقائيًا عند فتحها من البريد").navigationTitle("تأكيد الحساب") }
        registry.registerView(id: "upload") { ContentPendingView(message: "رفع الدروس يتطلب خدمة رفع وإشراف في الخادم؛ غير متاح في هذه النسخة").navigationTitle("رفع درس") }
    }
}
