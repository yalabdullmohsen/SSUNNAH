import SwiftUI

private struct AuthForm<Extra: View>: View {
    let title: String
    let action: String
    let showsPassword: Bool
    let run: (String, String) async throws -> String?
    @ViewBuilder let extra: () -> Extra
    @State private var email = ""
    @State private var password = ""
    @State private var busy = false
    @State private var message: String?
    @State private var failed = false

    var body: some View {
        ScrollView {
            VStack(spacing: Sunnah.Spacing.s4) {
                TextField("البريد الإلكتروني", text: $email)
                    .autocorrectionDisabled()
                    #if os(iOS)
                    .textContentType(.emailAddress).keyboardType(.emailAddress).textInputAutocapitalization(.never)
                    #endif
                    .sunnahFieldChrome()
                if showsPassword {
                    SecureField("كلمة المرور", text: $password).sunnahFieldChrome()
                }
                if let message {
                    Text(message).font(Sunnah.Typography.secondary)
                        .foregroundStyle(failed ? Color.red : Sunnah.Colors.primary)
                        .frame(maxWidth: .infinity, alignment: .leading)
                }
                Button {
                    Task {
                        busy = true; defer { busy = false }
                        do { message = try await run(email.trimmingCharacters(in: .whitespaces), password); failed = false }
                        catch { message = error.localizedDescription; failed = true }
                    }
                } label: {
                    Text(busy ? "جارٍ التنفيذ…" : action).frame(maxWidth: .infinity)
                }
                .buttonStyle(.borderedProminent)
                .disabled(busy || email.isEmpty || (showsPassword && password.count < 6))
                extra()
            }
            .padding(Sunnah.Spacing.pageX)
        }
        .background(Sunnah.Colors.bg)
        .navigationTitle(title)
    }
}

struct LoginView: View {
    @Environment(\.platform) private var platform
    @State private var signedIn = false
    var body: some View {
        if signedIn {
            Text("تم تسجيل الدخول").navigationTitle("تسجيل الدخول")
        } else {
            AuthForm(title: "تسجيل الدخول", action: "دخول", showsPassword: true, run: { e, p in
                try await platform.authService.signIn(email: e, password: p)
                signedIn = true
                return "تم تسجيل الدخول"
            }) {
                Text("ليس لديك حساب؟ أنشئ حسابًا من القائمة.").font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.textSecondary)
            }
        }
    }
}

struct RegisterView: View {
    @Environment(\.platform) private var platform
    var body: some View {
        AuthForm(title: "إنشاء حساب", action: "إنشاء الحساب", showsPassword: true, run: { e, p in
            try await platform.authService.signUp(email: e, password: p)
                ? "أرسلنا رابط التأكيد إلى بريدك؛ افتحه ثم سجّل الدخول."
                : "تم إنشاء الحساب وتسجيل الدخول."
        }) { EmptyView() }
    }
}

struct AccountDeletionView: View {
    @Environment(\.platform) private var platform
    @State private var confirm = ""
    @State private var busy = false
    @State private var done = false
    @State private var error: String?
    private let phrase = "حذف"

    var body: some View {
        VStack(spacing: Sunnah.Spacing.s4) {
            if done {
                Text("تم حذف حسابك وجميع بياناتك نهائيًا.").font(Sunnah.Typography.pageTitle)
            } else {
                Text("حذف الحساب نهائي ولا يمكن التراجع عنه. اكتب «\(phrase)» للتأكيد.")
                    .font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.textSecondary)
                TextField(phrase, text: $confirm).sunnahFieldChrome()
                if let error { Text(error).foregroundStyle(Color.red).font(Sunnah.Typography.secondary) }
                Button(busy ? "جارٍ الحذف…" : "حذف حسابي نهائيًا", role: .destructive) {
                    Task {
                        busy = true; error = nil; defer { busy = false }
                        do {
                            try await platform.authService.deleteAccount()
                            await platform.authService.signOut()
                            await LocalDataEraser.eraseAll()
                            done = true
                        } catch { self.error = error.localizedDescription }
                    }
                }
                .buttonStyle(.borderedProminent).tint(.red)
                .disabled(busy || confirm != phrase)
            }
        }
        .padding(Sunnah.Spacing.pageX)
        .frame(maxHeight: .infinity, alignment: .top)
        .background(Sunnah.Colors.bg)
        .navigationTitle("حذف الحساب")
    }
}

enum AccountScreens {
    @MainActor
    static func register(in registry: TemplateRegistry) {
        registry.registerView(id: "login") { LoginView() }
        registry.registerView(id: "register") { RegisterView() }
        registry.registerView(id: "account-deletion") { AccountDeletionView() }
    }
}
