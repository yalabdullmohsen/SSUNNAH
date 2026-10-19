import SwiftUI

// MARK: - مركز التقدّم

/// /progress — أقسام: البطاقات، خطط القراءة، غرفة المذاكرة، والخصوصية. كله محلي (الويب أيضًا محلي هنا).
struct LearnProgressScreen: View {
    @Environment(\.openRoute) private var openRoute
    var store = LearnLocalStore()
    @State private var summary: LearnLocalSummary?
    @State private var confirmClear = false

    var body: some View {
        LearnCardsPage {
            if let s = summary {
                AccountSectionCard(title: "بطاقات المراجعة") {
                    LearnInfoRow(label: "روجعت", value: "\(s.flashcards.total)")
                    LearnInfoRow(label: "مستحقة الآن", value: "\(s.flashcards.due)")
                    LearnInfoRow(label: "متقنة", value: "\(s.flashcards.mastered)")
                    Button("افتح البطاقات") { openRoute("/flashcards") }
                }
                AccountSectionCard(title: "خطط القراءة") {
                    if s.activePlans.isEmpty {
                        SunnahMessageState(symbol: "book.closed", title: "لا خطط جارية", message: "ابدأ خطة قراءة من المكتبة.")
                    }
                    ForEach(s.activePlans) { plan in
                        SunnahListRow(title: plan.bookTitle, subtitle: "\(plan.currentPage) من \(plan.totalPages) صفحة · \(plan.statusLabel)")
                    }
                    Button("خطط القراءة") { openRoute("/reading-plans") }
                }
                AccountSectionCard(title: "غرفة المذاكرة") {
                    LearnInfoRow(label: "دورات عمل مكتملة", value: "\(s.studyCycles)")
                    Button("غرفة المذاكرة") { openRoute("/study-room") }
                }
            }
            AccountSectionCard(title: "الخصوصية") {
                Text("هذه البيانات محفوظة على جهازك فقط.").font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.textSecondary)
                Button("مسح بيانات التعلّم المحلية", role: .destructive) { confirmClear = true }
            }
        }
        .confirmationDialog("مسح مراجعات البطاقات وخطط القراءة والملف البحثي وسجلّ المذاكرة؟", isPresented: $confirmClear, titleVisibility: .visible) {
            Button("مسح", role: .destructive) { store.clearAll(); summary = LearnLocalSummary.read(from: store) }
        }
        .onAppear { summary = LearnLocalSummary.read(from: store) }
        .sunnahNavTitle("مركز التقدّم")
    }
}

// MARK: - تعلّمي

/// /my-learning — بطاقة الحساب ثم «أكمل من حيث توقفت» وإحصاءات محلية وروابط سريعة.
/// الشهادات والمكتبة الشخصية والملاحظات في الويب من Supabase بحساب؛ تنتظر منفذ بيانات المستخدم.
struct LearnMyLearningScreen: View {
    @Environment(\.openRoute) private var openRoute
    @Environment(\.platform) private var platform
    var store = LearnLocalStore()
    @State private var summary: LearnLocalSummary?

    private struct QuickLink: Identifiable { let id: String; let title: String }
    private static let links = [QuickLink(id: "/lessons", title: "الدروس"), QuickLink(id: "/flashcards", title: "بطاقات المراجعة"),
                                QuickLink(id: "/reading-plans", title: "خطط القراءة"), QuickLink(id: "/quiz", title: "الأسئلة"),
                                QuickLink(id: "/study-room", title: "غرفة المذاكرة"), QuickLink(id: "/progress", title: "مركز التقدّم")]

    var body: some View {
        LearnCardsPage {
            SunnahCard {
              VStack(alignment: .leading, spacing: Sunnah.Spacing.s2) {
                if let email = platform.authService.currentEmail {
                    SunnahListRow(title: String(email.split(separator: "@").first ?? Substring(email)), subtitle: email)
                } else {
                    Text("سجّل الدخول لمزامنة تقدّمك بين أجهزتك لاحقًا؛ ما تراه هنا محفوظ على هذا الجهاز.")
                        .font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.textSecondary)
                    Button("تسجيل الدخول") { openRoute("/login") }
                }
              }
            }
            if let s = summary {
                if !s.activePlans.isEmpty {
                    AccountSectionCard(title: "أكمل من حيث توقفت") {
                        ForEach(s.activePlans.prefix(3)) { plan in
                            Button { openRoute("/reading-plans") } label: {
                                VStack(alignment: .leading, spacing: Sunnah.Spacing.s1) {
                                    SunnahListRow(title: plan.bookTitle, subtitle: "\(Int(plan.progress * 100))٪")
                                    ProgressView(value: plan.progress).tint(Sunnah.Colors.primary)
                                }
                            }
                            .buttonStyle(.plain)
                        }
                    }
                }
                AccountSectionCard(title: "إحصائياتي") {
                    LearnInfoRow(label: "بطاقات روجعت", value: "\(s.flashcards.total)")
                    LearnInfoRow(label: "بطاقات متقنة", value: "\(s.flashcards.mastered)")
                    LearnInfoRow(label: "خطط قراءة جارية", value: "\(s.activePlans.count)")
                    LearnInfoRow(label: "دورات مذاكرة", value: "\(s.studyCycles)")
                }
            }
            AccountSectionCard(title: "روابط سريعة") {
                ForEach(Self.links) { link in
                    Button { openRoute(link.id) } label: { SunnahListRow(title: link.title) }.buttonStyle(.plain)
                }
            }
        }
        .onAppear { summary = LearnLocalSummary.read(from: store) }
        .sunnahNavTitle("تعلّمي")
    }
}

// MARK: - الملف البحثي

struct LearnResearcherProfile: Codable, Equatable, Sendable {
    var displayName = ""
    var institution = ""
    var specialization = ""
    var bio = ""
    var interests: [String] = []
    var publications: [String] = []

    /// قوائم الاختيار كما في `src/lib/researcher-profile-service.ts`.
    static let specializations = ["الفقه وأصوله", "الحديث وعلومه", "التفسير وعلوم القرآن", "العقيدة والكلام", "السيرة والتاريخ الإسلامي", "اللغة العربية",
                                  "الفقه المقارن", "الاقتصاد الإسلامي", "الفقه الطبي", "الفقه المعاصر", "الدراسات الإسلامية المقارنة", "أخرى"]
    static let interestTags = ["الفقه الحنبلي", "الفقه الشافعي", "الفقه المالكي", "الفقه الحنفي", "علم الرجال", "مصطلح الحديث", "التفسير الموضوعي",
                               "الفقه الأسري", "مقاصد الشريعة", "أصول الفقه", "الحديث النبوي", "السيرة النبوية", "التاريخ الإسلامي", "الفتوى المعاصرة", "الفقه الميسر"]

    mutating func toggleInterest(_ tag: String) {
        if let i = interests.firstIndex(of: tag) { interests.remove(at: i) } else { interests.append(tag) }
    }

    /// يُسقط الفراغات قبل الحفظ.
    var cleaned: LearnResearcherProfile {
        var p = self
        p.displayName = displayName.trimmingCharacters(in: .whitespacesAndNewlines)
        p.institution = institution.trimmingCharacters(in: .whitespacesAndNewlines)
        p.bio = bio.trimmingCharacters(in: .whitespacesAndNewlines)
        p.publications = publications.map { $0.trimmingCharacters(in: .whitespacesAndNewlines) }.filter { !$0.isEmpty }
        return p
    }
}

/// /researcher — نموذج الملف البحثي. يُحفظ على الجهاز؛ جعله عامًّا يحتاج منفذ researcher_profiles.
struct LearnResearcherScreen: View {
    var store = LearnLocalStore()
    @State private var profile = LearnResearcherProfile()
    @State private var savedProfile: LearnResearcherProfile?
    @State private var loaded = false

    var body: some View {
        SunnahPage("الملف البحثي", trailing: { EmptyView() }) {
            VStack(alignment: .leading, spacing: Sunnah.Spacing.s3) {
                AccountSectionCard(title: "المعلومات الأساسية") {
                    TextField("الاسم المعروض", text: $profile.displayName).sunnahFieldChrome()
                    TextField("الجهة / المؤسسة", text: $profile.institution).sunnahFieldChrome()
                    TextField("نبذة", text: $profile.bio, axis: .vertical).lineLimit(3...8).sunnahFieldChrome()
                }
                SunnahRowGroupHeader("التخصص")
                SunnahChoiceChips(options: LearnResearcherProfile.specializations.map { .init(id: $0, title: $0) }, selection: $profile.specialization)
                AccountSectionCard(title: "الاهتمامات البحثية") {
                    ForEach(LearnResearcherProfile.interestTags, id: \.self) { tag in
                        SunnahSwitch(tag, isOn: Binding(get: { profile.interests.contains(tag) }, set: { _ in profile.toggleInterest(tag) }))
                    }
                }
                AccountSectionCard(title: "الأعمال والأبحاث") {
                    ForEach(profile.publications.indices, id: \.self) { i in
                        TextField("عنوان العمل", text: $profile.publications[i]).sunnahFieldChrome()
                    }
                    Button("إضافة عمل") { profile.publications.append("") }
                }
                SunnahButton("حفظ") { profile = profile.cleaned; store.save(profile, .researcher); savedProfile = profile }
                if savedProfile == profile { Text("تم الحفظ على هذا الجهاز").font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.primary) }
            }
            .padding(.horizontal, Sunnah.Spacing.pageX)
        }
        .onAppear {
            guard !loaded else { return }
            loaded = true
            profile = store.load(LearnResearcherProfile.self, .researcher) ?? LearnResearcherProfile()
        }
    }
}
