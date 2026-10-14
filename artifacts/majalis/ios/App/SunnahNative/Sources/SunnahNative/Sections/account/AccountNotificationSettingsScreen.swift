import SwiftUI
import SunnahPrayer
#if canImport(UserNotifications)
import UserNotifications
#endif
#if canImport(UIKit)
import UIKit
#endif

/// إعدادات الإشعارات الأصلية: تحرّر موافقة المستخدم وخيارات المجموعات في App Group ثم تعيد الجدولة
/// عبر النظام الواحد في SunnahPrayer (NativeNotifications.rescheduleAll) — لا مجدول ثانٍ هنا.
@MainActor
final class AccountNotificationSettingsModel: ObservableObject {
    enum Permission: Equatable { case unknown, notDetermined, denied, granted, unsupported }

    @Published var optIn: NativeNotificationsOptIn
    @Published var prayer: PrayerNotificationOptions
    @Published var general: GeneralNotificationOptions
    @Published private(set) var permission: Permission = .unknown
    @Published private(set) var requesting = false
    @Published var saved = false

    private let defaults: UserDefaults

    init(defaults: UserDefaults? = nil) {
        let defaults = defaults ?? UserDefaults(suiteName: PrayerPreferencesStore.appGroup) ?? .standard
        self.defaults = defaults
        optIn = NativeNotificationsOptIn.read(from: defaults)
        prayer = PrayerNotificationOptions.read(from: defaults)
        general = GeneralNotificationOptions.read(from: defaults)
    }

    func refreshPermission() async {
        #if canImport(UserNotifications)
        let settings = await UNUserNotificationCenter.current().notificationSettings()
        switch settings.authorizationStatus {
        case .authorized, .provisional: permission = .granted
        case .denied: permission = .denied
        case .notDetermined: permission = .notDetermined
        #if os(iOS)
        case .ephemeral: permission = .granted
        #endif
        @unknown default: permission = .unknown
        }
        #else
        permission = .unsupported
        #endif
    }

    /// يطلب الإذن مرة (بعد شرح السبب في الواجهة) ويعيد هل مُنح.
    func requestPermission() async -> Bool {
        #if canImport(UserNotifications)
        requesting = true
        defer { requesting = false }
        let granted = (try? await UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .sound, .badge])) ?? false
        await refreshPermission()
        return granted
        #else
        return false
        #endif
    }

    /// يحفظ ويعيد جدولة كل الإشعارات؛ إطفاء الكل يزيل ما جدولناه فقط.
    func apply() async {
        optIn.write(to: defaults)
        prayer.save(to: defaults)
        general.save(to: defaults)
        #if canImport(UserNotifications)
        if optIn.isAnyEnabled {
            await NativeNotifications.rescheduleAll(defaults: defaults)
        } else {
            await NativeNotifications.removeAll()
        }
        #endif
        saved = true
    }
}

/// /notification-settings — الإشعارات: تنبيهات الصلاة، وتذكيرات الأذكار، وساعات الهدوء.
struct AccountNotificationSettingsScreen: View {
    @StateObject private var model = AccountNotificationSettingsModel()
    @Environment(\.openRoute) private var openRoute
    @State private var explainFor: ((Bool) -> Void)?

    private var masterOn: Bool { model.optIn.adhkar && model.permission == .granted }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: Sunnah.Spacing.s4) {
                AccountHeader(eyebrow: "الإعدادات", title: "الإشعارات",
                              subtitle: "مكان واحد لكل التذكيرات: الصلاة والقرآن والأذكار وطلب العلم والمناسبات.")
                permissionBanner
                if explainFor != nil { explainCard }

                AccountSectionCard(title: "الصلاة") {
                    Toggle(isOn: Binding(get: { model.optIn.prayer && model.permission == .granted },
                                         set: { on in withPermission(on) { model.optIn.prayer = $0 } })) {
                        rowLabel("تنبيهات الصلاة", "تنبيه صوتي قصير قبل الوقت وعند دخوله، بمواقيت موقعك")
                    }
                    .tint(Sunnah.Colors.primary)
                    if model.optIn.prayer {
                        prayerOptions
                    }
                }

                SunnahCard {
                    Toggle(isOn: Binding(get: { masterOn }, set: { on in withPermission(on) { model.optIn.adhkar = $0 } })) {
                        rowLabel("تذكيرات المحتوى", contentStatus)
                    }
                    .tint(Sunnah.Colors.primary)
                    .disabled(model.permission == .unsupported)
                }

                AccountSectionCard(title: "فئات التذكير") {
                    Toggle(isOn: Binding(get: { masterOn && model.general.adhkarEnabled },
                                         set: { model.general.adhkarEnabled = $0; save() })) {
                        rowLabel("الأذكار", "الصباح بعد الفجر والمساء بعد العصر، والنوم والاستيقاظ وبعد الصلاة والصلاة على النبي ﷺ والاستغفار")
                    }
                    .tint(Sunnah.Colors.primary)
                    .disabled(!masterOn)
                    if masterOn && model.general.adhkarEnabled {
                        minutesStepper("أذكار الصباح بعد الفجر", value: $model.general.morningAfterFajrMinutes)
                        minutesStepper("أذكار المساء بعد العصر", value: $model.general.eveningAfterAsrMinutes)
                        quietHours
                    }
                }

                if model.saved {
                    Text("تم حفظ الإعدادات").font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.primary)
                }
            }
            .padding(Sunnah.Spacing.pageX)
        }
        .background(Sunnah.Colors.bg)
        .navigationTitle("الإشعارات")
        .task { await model.refreshPermission() }
    }

    // MARK: الأجزاء

    @ViewBuilder
    private var permissionBanner: some View {
        switch model.permission {
        case .unsupported:
            banner("هذا الجهاز لا يدعم الإشعارات المحلية.", action: nil)
        case .denied:
            banner("الإشعارات محجوبة من إعدادات النظام: الإعدادات ← سُنّة ← الإشعارات.", action: ("فتح إعدادات النظام", openSystemSettings))
        case .notDetermined:
            banner("لم يُمنح إذن الإشعارات بعد — لن يصلك أي تذكير قبل السماح.",
                   action: (model.requesting ? "…" : "السماح بالإشعارات", { explainFor = { if $0 { Task { _ = await model.requestPermission() } } } }))
        case .granted, .unknown:
            EmptyView()
        }
    }

    private var explainCard: some View {
        SunnahCard {
            VStack(alignment: .leading, spacing: Sunnah.Spacing.s3) {
                Text("نرسل التذكيرات التي تختارها فقط وفي أوقاتها، ويمكنك إيقافها في أي وقت. سيطلب النظام إذنك الآن.")
                    .font(Sunnah.Typography.body).foregroundStyle(Sunnah.Colors.textPrimary)
                HStack(spacing: Sunnah.Spacing.s3) {
                    SunnahButton("متابعة") { let f = explainFor; explainFor = nil; f?(true) }
                    SunnahButton("ليس الآن", style: .secondary) { let f = explainFor; explainFor = nil; f?(false) }
                }
            }
        }
        .accessibilityLabel("لماذا نطلب الإذن")
    }

    private var prayerOptions: some View {
        VStack(alignment: .leading, spacing: Sunnah.Spacing.s2) {
            ForEach(Prayer.allCases.filter(\.isObligatory), id: \.self) { p in
                Toggle(isOn: Binding(get: { model.prayer.enabledPrayers.contains(p) },
                                     set: { on in
                                         if on { model.prayer.enabledPrayers.insert(p) } else { model.prayer.enabledPrayers.remove(p) }
                                         save()
                                     })) {
                    Text(p.nameAr).font(Sunnah.Typography.body).foregroundStyle(Sunnah.Colors.textPrimary)
                }
                .tint(Sunnah.Colors.primary)
            }
            minutesStepper("تنبيه قبل الدخول", value: $model.prayer.minutesBefore, range: 0...60, step: 5)
        }
    }

    private var quietHours: some View {
        VStack(alignment: .leading, spacing: Sunnah.Spacing.s2) {
            Text("ساعات الهدوء").font(Sunnah.Typography.cardTitle).foregroundStyle(Sunnah.Colors.textPrimary)
            DatePicker("من", selection: minuteBinding(\.quietStartMinute), displayedComponents: .hourAndMinute)
            DatePicker("إلى", selection: minuteBinding(\.quietEndMinute), displayedComponents: .hourAndMinute)
        }
        .font(Sunnah.Typography.body)
        .tint(Sunnah.Colors.primary)
    }

    private func minutesStepper(_ title: String, value: Binding<Int>, range: ClosedRange<Int> = 0...180, step: Int = 5) -> some View {
        Stepper(value: Binding(get: { value.wrappedValue }, set: { value.wrappedValue = $0; save() }), in: range, step: step) {
            VStack(alignment: .leading, spacing: Sunnah.Spacing.s1) {
                Text(title).font(Sunnah.Typography.body).foregroundStyle(Sunnah.Colors.textPrimary)
                Text(value.wrappedValue == 0 ? "عند الوقت" : "\(value.wrappedValue) دقيقة")
                    .font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.textSecondary)
            }
        }
        .frame(minHeight: Sunnah.Spacing.touch)
    }

    private func minuteBinding(_ key: WritableKeyPath<GeneralNotificationOptions, Int>) -> Binding<Date> {
        Binding(
            get: { Calendar.current.date(bySettingHour: model.general[keyPath: key] / 60, minute: model.general[keyPath: key] % 60, second: 0, of: Date()) ?? Date() },
            set: { date in
                let c = Calendar.current.dateComponents([.hour, .minute], from: date)
                model.general[keyPath: key] = (c.hour ?? 0) * 60 + (c.minute ?? 0)
                save()
            })
    }

    private func rowLabel(_ title: String, _ subtitle: String) -> some View {
        VStack(alignment: .leading, spacing: Sunnah.Spacing.s1) {
            Text(title).font(Sunnah.Typography.cardTitle).foregroundStyle(Sunnah.Colors.textPrimary)
            Text(subtitle).font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.textSecondary)
                .fixedSize(horizontal: false, vertical: true)
        }
    }

    private var contentStatus: String {
        switch model.permission {
        case .unsupported: return "غير مدعوم على هذا الجهاز"
        case .denied: return "محجوبة من إعدادات النظام"
        default: return masterOn ? "مفعّلة — اختر الفئات أدناه" : "متوقفة — لا يصلك أي تذكير محتوى"
        }
    }

    private func banner(_ text: String, action: (String, () -> Void)?) -> some View {
        SunnahCard {
            VStack(alignment: .leading, spacing: Sunnah.Spacing.s3) {
                Text(text).font(Sunnah.Typography.body).foregroundStyle(Sunnah.Colors.textPrimary)
                if let action { SunnahButton(action.0, style: .secondary, action: action.1) }
            }
        }
    }

    // MARK: الأفعال

    /// التفعيل يمر بشرح الإذن ثم طلبه إن لم يُمنح؛ الإطفاء فوري.
    private func withPermission(_ on: Bool, apply: @escaping (Bool) -> Void) {
        guard on, model.permission != .granted else { apply(on); save(); return }
        if model.permission == .denied { openSystemSettings(); return }
        explainFor = { proceed in
            guard proceed else { return }
            Task {
                if await model.requestPermission() { apply(true); save() }
            }
        }
    }

    private func save() {
        model.saved = false
        Task { await model.apply() }
    }

    private func openSystemSettings() {
        #if canImport(UIKit)
        if let url = URL(string: UIApplication.openSettingsURLString) { UIApplication.shared.open(url) }
        #endif
    }
}
