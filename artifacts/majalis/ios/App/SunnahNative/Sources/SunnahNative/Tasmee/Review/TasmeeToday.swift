import SwiftUI
import UserNotifications

/// «تسميع اليوم»: يجمع ما حان موعده من مراجعة التسميع المتباعدة (`TasmeeHistoryStore`) ومراجعة وِرد الحفظ (`HifzPlanState`) دون منطق موازٍ.
public struct TasmeeTodaySummary: Equatable, Sendable {
    public var dueAyahs: Int
    public var wirdPages: Int
    /// مسار فتح المصحف على أول عنصر (آية مستحقة أولًا، وإلا أول صفحة مراجعة من الوِرد).
    public var firstRoute: String?
    public var total: Int { dueAyahs + wirdPages }

    public static func make(due: [TasmeeReviewItem], wirdReviewPages: [Int]) -> TasmeeTodaySummary {
        let route: String? = due.first.map { "/mushaf/ayah/\($0.surah):\($0.ayah)" }
            ?? wirdReviewPages.first.map { "/mushaf/page/\($0)" }
        return TasmeeTodaySummary(dueAyahs: due.count, wirdPages: wirdReviewPages.count, firstRoute: route)
    }
}

/// علم لمرة واحدة: المصحف يفتح ورقة أوضاع التسميع فور جاهزية النص بعد الضغط من بطاقة «تسميع اليوم».
@MainActor public enum TasmeeAutoStart {
    public static var pending = false
    public static func consume() -> Bool { defer { pending = false }; return pending }
}

/// تذكير محلي يومي اختياري: مغلق افتراضيًا، ولا يُطلب الإذن إلا عند تفعيل المستخدم صراحةً.
public enum TasmeeDailyReminder {
    static let id = "sunnah.tasmee.today.daily"
    public static let enabledKey = "sunnah.tasmee.reminder.enabled"
    public static let minutesKey = "sunnah.tasmee.reminder.minutes"   // دقائق من منتصف الليل
    public static let defaultMinutes = 20 * 60

    /// يطلب الإذن ثم يجدول؛ يعيد false إن رُفض الإذن.
    public static func enable(minutes: Int) async -> Bool {
        let ok = (try? await UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .sound])) ?? false
        if ok { schedule(minutes: minutes) }
        return ok
    }

    public static func schedule(minutes: Int) {
        let c = UNUserNotificationCenter.current()
        c.removePendingNotificationRequests(withIdentifiers: [id])
        let content = UNMutableNotificationContent()
        content.title = "تسميع اليوم"
        content.body = "حان وقت مراجعة ما حفظتَه."
        var d = DateComponents(); d.hour = (minutes / 60) % 24; d.minute = minutes % 60
        c.add(UNNotificationRequest(identifier: id, content: content, trigger: UNCalendarNotificationTrigger(dateMatching: d, repeats: true)))
    }

    public static func disable() { UNUserNotificationCenter.current().removePendingNotificationRequests(withIdentifiers: [id]) }
}

/// بطاقة الرئيسية. تضغطها فتفتح التسميع على أول عنصر؛ زر الجرس يفتح إعداد التذكير.
struct TasmeeTodayCard: View {
    @ObservedObject private var history = TasmeeHistoryStore.shared
    @AppStorage(TasmeeDailyReminder.enabledKey) private var reminderOn = false
    @AppStorage(TasmeeDailyReminder.minutesKey) private var minutes = TasmeeDailyReminder.defaultMinutes
    @Environment(\.openRoute) private var openRoute
    @State private var showSettings = false
    @State private var summary = TasmeeTodaySummary(dueAyahs: 0, wirdPages: 0, firstRoute: nil)

    private func refresh() {
        let wird = QuranLocalStore().loadHifzPlan().wird(today: Date(), calendar: .current)
        summary = .make(due: history.dueReview(now: Date()), wirdReviewPages: (wird?.nearPages ?? []) + (wird?.farPages ?? []))
    }

    var body: some View {
        Group {
            if summary.total > 0 || reminderOn || !history.sessions.isEmpty { card }
        }
        .task { refresh() }
        .onChange(of: history.review) { _ in refresh() }
    }

    private var subtitle: String {
        if summary.total == 0 { return "لا مراجعة مستحقة الآن" }
        var p: [String] = []
        if summary.dueAyahs > 0 { p.append("\(TasmeeProgressFormat.ayahs(summary.dueAyahs))") }
        if summary.wirdPages > 0 { p.append("\(summary.wirdPages.arabicDigits) من صفحات الوِرد") }
        return p.joined(separator: " · ")
    }

    private var card: some View {
        HStack(spacing: Sunnah.Spacing.s3) {
            Button {
                if let r = summary.firstRoute { TasmeeAutoStart.pending = true; openRoute(r) } else { showSettings = true }
            } label: {
                HStack(spacing: Sunnah.Spacing.s3) {
                    SunnahIconTile("mic", size: 40)
                    VStack(alignment: .leading, spacing: 2) {
                        Text("تسميع اليوم").font(AppearancePrefs.ui(.extraBold, 16, .headline)).foregroundStyle(Sunnah.Colors.textPrimary)
                        Text(subtitle).font(AppearancePrefs.ui(.bold, 12, .caption)).foregroundStyle(Sunnah.Colors.textSecondary)
                    }
                    Spacer(minLength: 0)
                }
            }
            .buttonStyle(.plain).sunnahPressable()
            .accessibilityIdentifier("home.card.tasmee-today")
            Button { showSettings = true } label: {
                Image(systemName: reminderOn ? "bell.fill" : "bell").font(.system(size: 18, weight: .semibold))
                    .foregroundStyle(reminderOn ? Sunnah.Colors.primary : Sunnah.Colors.textSecondary)
                    .frame(width: 44, height: 44)
            }
            .buttonStyle(.plain)
            .accessibilityLabel("تذكير التسميع")
            .accessibilityIdentifier("home.card.tasmee-today.reminder")
        }
        .padding(16)
        .background(Sunnah.Colors.surface, in: RoundedRectangle(cornerRadius: Sunnah.Radius.card, style: .continuous))
        .overlay(RoundedRectangle(cornerRadius: Sunnah.Radius.card, style: .continuous).stroke(Sunnah.Colors.border, lineWidth: 1))
        .padding(.horizontal, Sunnah.Spacing.pageX)
        .sunnahSheet(isPresented: $showSettings) { TasmeeReminderSheet(on: $reminderOn, minutes: $minutes).presentationDetents([.medium]) }
    }
}

struct TasmeeReminderSheet: View {
    @Binding var on: Bool
    @Binding var minutes: Int
    @State private var denied = false

    private var time: Binding<Date> {
        Binding(get: { Calendar.current.date(bySettingHour: minutes / 60, minute: minutes % 60, second: 0, of: Date()) ?? Date() },
                set: { let c = Calendar.current.dateComponents([.hour, .minute], from: $0)
                    minutes = (c.hour ?? 20) * 60 + (c.minute ?? 0)
                    if on { TasmeeDailyReminder.schedule(minutes: minutes) } })
    }

    var body: some View {
        VStack(alignment: .leading, spacing: Sunnah.Spacing.s4) {
            Text("تذكير تسميع اليوم").font(AppearancePrefs.ui(.extraBold, 18, .title3)).foregroundStyle(Sunnah.Colors.textPrimary)
            Toggle("ذكّرني يوميًا", isOn: Binding(get: { on }, set: { v in
                if v { Task { let ok = await TasmeeDailyReminder.enable(minutes: minutes); on = ok; denied = !ok } }
                else { on = false; denied = false; TasmeeDailyReminder.disable() }
            })).font(AppearancePrefs.ui(.bold, 16, .body)).tint(Sunnah.Colors.primary)
            if on { DatePicker("الوقت", selection: time, displayedComponents: .hourAndMinute).font(AppearancePrefs.ui(.bold, 16, .body)) }
            if denied {
                Text("الإشعارات مغلقة لسُنّة. فعّلها من إعدادات الجهاز ثم أعد المحاولة.")
                    .font(AppearancePrefs.ui(.regular, 14, .footnote)).foregroundStyle(Sunnah.Colors.danger)
            }
            Spacer(minLength: 0)
        }
        .padding(Sunnah.Spacing.pageX)
        .environment(\.layoutDirection, .rightToLeft)
        .background(Sunnah.Colors.bg)
    }
}
