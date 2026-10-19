import SwiftUI

// MARK: مسار المسلم الجديد — /discover-islam/new-muslim و /:day

/// مفتاح التقدّم المحلي (أيام مكتملة مفصولة بفواصل). المزامنة مع new_muslim_progress للمسجَّل تُطلب في requests/aqidah.md.
let aqidahNewMuslimProgressKey = "aqidah.newMuslim.completed"

public struct AqidahNewMuslimPathScreen: ScreenTemplate {
    public static let id = "discover-islam.new-muslim"
    public static let title = "مسار الثلاثين يومًا"
    public static let source = AqidahContent.source("discover-islam-new-muslim")

    let days: [NewMuslimDay]
    @AppStorage(aqidahNewMuslimProgressKey) private var progressRaw = ""
    public init(content: [NewMuslimDay]) { days = AqidahContent.accepted(content) }

    public var body: some View {
        let done = AqidahContent.decodeProgress(progressRaw)
        if days.isEmpty { EmptyStateView() } else {
            ScrollView {
                VStack(alignment: .leading, spacing: Sunnah.Spacing.s4) {
                    Text("لا سباق ولا حساب للتأخر — أكمل بالسرعة التي تناسبك، وارجع إلى أي يوم متى شئت.")
                        .font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.textSecondary)
                    ProgressView(value: Double(days.filter { done.contains($0.dayNumber) }.count), total: Double(days.count))
                        .tint(Sunnah.Colors.primary)
                        .accessibilityLabel("التقدّم في المسار")
                    AqidahLinkList(items: days,
                                   title: { "اليوم \($0.dayNumber): \($0.title)" },
                                   subtitle: { done.contains($0.dayNumber) ? "مكتمل" : nil },
                                   path: { "/discover-islam/new-muslim/\($0.dayNumber)" })
                }
                .padding(Sunnah.Spacing.pageX)
            }
            .background(Sunnah.Colors.bg)
        }
    }
}

struct AqidahNewMuslimDayView: View {
    let day: NewMuslimDay
    @AppStorage(aqidahNewMuslimProgressKey) private var progressRaw = ""

    var body: some View {
        let done = AqidahContent.decodeProgress(progressRaw).contains(day.dayNumber)
        AqidahPage(title: "اليوم \(day.dayNumber)", hero: day.title) {
            AqidahParagraphs(text: day.contentAr)
            SunnahButton(done ? "مكتمل ✓" : "أكملت هذا اليوم", style: done ? .secondary : .primary) {
                var set = AqidahContent.decodeProgress(progressRaw)
                if done { set.remove(day.dayNumber) } else { set.insert(day.dayNumber) }
                progressRaw = AqidahContent.encodeProgress(set)
            }
        }
    }
}

// MARK: التواصل مع داعية — /discover-islam/contact

/// طلب تواصل بأعمدة `dawah_contact_requests` نفسها (كما يرسلها `submitDawahContactRequest` على الويب).
public struct DawahContactRequest: Encodable, Equatable, Sendable {
    public var trackingCode: String
    public var name: String?
    public var isAnonymous: Bool
    public var lang: String
    public var preferredDaeeGender: String
    public var religiousBackground: String
    public var country: String?
    public var topic: String
    public var contactMethod: String
    public var contactValue: String
    public var privacyConsent: Bool

    enum CodingKeys: String, CodingKey {
        case name, lang, country, topic
        case trackingCode = "tracking_code"
        case isAnonymous = "is_anonymous"
        case preferredDaeeGender = "preferred_daee_gender"
        case religiousBackground = "religious_background"
        case contactMethod = "contact_method"
        case contactValue = "contact_value"
        case privacyConsent = "privacy_consent"
    }

    public enum Invalid: Error, Equatable { case consentRequired, topicRequired, contactRequired }

    /// يبني الطلب ويتحقق منه؛ رمز المتابعة يُولَّد على الجهاز (RLS يمنع قراءته بعد الإدخال).
    public static func make(name: String, isAnonymous: Bool, gender: String, religion: String, country: String,
                            topic: String, contactMethod: String, contactValue: String, consent: Bool,
                            trackingCode: String = String(UUID().uuidString.replacingOccurrences(of: "-", with: "").lowercased().prefix(10))) throws -> DawahContactRequest {
        guard consent else { throw Invalid.consentRequired }
        let t = topic.trimmingCharacters(in: .whitespacesAndNewlines)
        let v = contactValue.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !t.isEmpty else { throw Invalid.topicRequired }
        guard !v.isEmpty else { throw Invalid.contactRequired }
        let n = name.trimmingCharacters(in: .whitespacesAndNewlines)
        let c = country.trimmingCharacters(in: .whitespacesAndNewlines)
        return DawahContactRequest(trackingCode: trackingCode, name: isAnonymous || n.isEmpty ? nil : n, isAnonymous: isAnonymous,
                                   lang: "ar", preferredDaeeGender: gender, religiousBackground: religion,
                                   country: c.isEmpty ? nil : c, topic: t, contactMethod: contactMethod,
                                   contactValue: v, privacyConsent: true)
    }
}

/// منفذ الإرسال: ينفّذه هدف التطبيق فوق عميل Supabase (إدخال في dawah_contact_requests). غيابه = الإرسال غير متاح.
public protocol DawahContactSubmitting: Sendable {
    func submit(_ request: DawahContactRequest) async throws
}

private struct DawahContactKey: EnvironmentKey {
    static let defaultValue: (any DawahContactSubmitting)? = nil
}

public extension EnvironmentValues {
    var dawahContact: (any DawahContactSubmitting)? {
        get { self[DawahContactKey.self] }
        set { self[DawahContactKey.self] = newValue }
    }
}

/// الخيارات كما في الويب حرفيًا (CONTACT_RELIGIONS ووسائل التواصل وتفضيل الداعية).
struct DawahContactOption: Hashable { let code: String; let label: String }

enum DawahContactOptions {
    static let genders: [DawahContactOption] = [
        .init(code: "no_preference", label: "لا تفضيل لجنس الداعية"),
        .init(code: "male", label: "أفضّل التحدث مع داعية"),
        .init(code: "female", label: "أفضّل التحدث مع داعية (امرأة)"),
    ]
    static let religions: [DawahContactOption] = [
        .init(code: "christian", label: "المسيحية"), .init(code: "jewish", label: "اليهودية"), .init(code: "hindu", label: "الهندوسية"), .init(code: "buddhist", label: "البوذية"),
        .init(code: "sikh", label: "السيخية"), .init(code: "jain", label: "الجاينية"), .init(code: "zoroastrian", label: "الزرادشتية"), .init(code: "bahai", label: "البهائية"),
        .init(code: "chinese_folk", label: "التقاليد الصينية (كونفوشيوسية/طاوية)"), .init(code: "atheist_agnostic", label: "لا أدين / لا أؤمن بوجود إله"),
        .init(code: "other_religion", label: "ديانة أخرى"), .init(code: "no_specific", label: "لا أنتمي لديانة محددة"), .init(code: "prefer_not_to_say", label: "أفضّل عدم الذكر"),
    ]
    static let methods: [DawahContactOption] = [.init(code: "email", label: "البريد الإلكتروني"), .init(code: "whatsapp", label: "واتساب"), .init(code: "phone", label: "هاتف")]
}

struct AqidahDiscoverIslamContactNativeScreen: View {
    @Environment(\.dawahContact) private var submitter
    @State private var isAnonymous = false
    @State private var name = ""
    @State private var gender = "no_preference"
    @State private var religion = "prefer_not_to_say"
    @State private var country = ""
    @State private var topic = ""
    @State private var method = "email"
    @State private var contactValue = ""
    @State private var consent = false
    @State private var busy = false
    @State private var error: String?
    @State private var trackingCode: String?

    var body: some View {
        Group {
            if let code = trackingCode { receipt(code) } else { form }
        }
        .sunnahNavTitle("تواصل سرّي مع داعية")
    }

    private var form: some View {
        ScrollView {
            LazyVStack(alignment: .leading, spacing: Sunnah.Spacing.s4) {
            SunnahCard {
              VStack(alignment: .leading, spacing: Sunnah.Spacing.s3) {
                Text("بياناتك تُستخدَم فقط للتواصل معك، ولا تُعرض لأي طرف آخر أبدًا.")
                    .font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.textSecondary)
                SunnahSwitch("أفضّل عدم كتابة اسمي", isOn: $isAnonymous)
                if !isAnonymous { TextField("الاسم (اختياري)", text: $name) }
                picker("تفضيل جنس الداعية", $gender, DawahContactOptions.genders)
                picker("الخلفية الدينية", $religion, DawahContactOptions.religions)
                TextField("الدولة (اختياري)", text: $country)
              }
            }
            SunnahCard {
              VStack(alignment: .leading, spacing: Sunnah.Spacing.s3) {
                TextField("ما الذي تودّ التحدث عنه؟", text: $topic, axis: .vertical).lineLimit(4...8)
                picker("وسيلة التواصل", $method, DawahContactOptions.methods)
                TextField("بيانات التواصل", text: $contactValue)
                    .environment(\.layoutDirection, .leftToRight)
                    .aqidahPlainInput()
              }
            }
            SunnahCard {
              VStack(alignment: .leading, spacing: Sunnah.Spacing.s3) {
                SunnahSwitch("أوافق على استخدام بياناتي فقط لغرض التواصل معي في هذا الطلب.", isOn: $consent)
                if let error { Text(error).font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.danger) }
                SunnahButton(busy ? "إرسال…" : "إرسال الطلب") { Task { await send() } }
                    .disabled(busy || submitter == nil)
                if submitter == nil {
                    Text("الإرسال غير متاح في هذه النسخة.").font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.textSecondary)
                }
              }
            }
            }
            .padding(.horizontal, Sunnah.Spacing.s4)
        }
        .font(Sunnah.Typography.body)
        .background(Sunnah.Colors.bg)
    }

    private func picker(_ label: String, _ selection: Binding<String>, _ options: [DawahContactOption]) -> some View {
        VStack(alignment: .leading, spacing: Sunnah.Spacing.s2) {
            Text(label).font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.textSecondary)
            ScrollView(.horizontal, showsIndicators: false) {
                SunnahSegmented(options.map { (id: $0.code, title: $0.label) }, selection: selection)
            }
        }
    }

    private func receipt(_ code: String) -> some View {
        AqidahPage(title: "تم استلام طلبك") {
            Text("تم استلام طلبك. سيتواصل معك أحد الدعاة على الوسيلة التي اخترتها. رمز المتابعة:")
                .font(Sunnah.Typography.body).foregroundStyle(Sunnah.Colors.textPrimary)
            Text(code).font(Sunnah.Typography.sectionTitle).foregroundStyle(Sunnah.Colors.primary).textSelection(.enabled)
            Text("احتفظ بهذا الرمز إن احتجت للاستفسار عن حالة طلبك لاحقًا.")
                .font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.textSecondary)
        }
    }

    private func send() async {
        guard let submitter else { return }
        error = nil
        let request: DawahContactRequest
        do {
            request = try DawahContactRequest.make(name: name, isAnonymous: isAnonymous, gender: gender, religion: religion,
                                                   country: country, topic: topic, contactMethod: method,
                                                   contactValue: contactValue, consent: consent)
        } catch DawahContactRequest.Invalid.consentRequired {
            error = "الموافقة على سياسة الخصوصية مطلوبة."; return
        } catch {
            self.error = "أكمل الحقول المطلوبة."; return
        }
        busy = true
        defer { busy = false }
        do {
            try await submitter.submit(request)
            trackingCode = request.trackingCode
        } catch {
            self.error = "تعذّر الاتصال. تحقق من الشبكة ثم أعد المحاولة."
        }
    }
}

private extension View {
    /// بيانات التواصل: بلا تصحيح ولا أحرف كبيرة تلقائية (iOS).
    @ViewBuilder func aqidahPlainInput() -> some View {
        #if os(iOS)
        self.textInputAutocapitalization(.never).autocorrectionDisabled()
        #else
        self.autocorrectionDisabled()
        #endif
    }
}
