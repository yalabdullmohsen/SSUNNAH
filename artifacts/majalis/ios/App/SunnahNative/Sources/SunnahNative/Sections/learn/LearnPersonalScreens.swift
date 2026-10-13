import SwiftUI

// MARK: - مركز التقدّم

/// /progress — أقسام: البطاقات، خطط القراءة، غرفة المذاكرة، والخصوصية. كله محلي (الويب أيضًا محلي هنا).
struct LearnProgressScreen: View {
    @Environment(\.openRoute) private var openRoute
    var store = LearnLocalStore()
    @State private var summary: LearnLocalSummary?
    @State private var confirmClear = false

    var body: some View {
        List {
            if let s = summary {
                Section("بطاقات المراجعة") {
                    LearnInfoRow(label: "روجعت", value: "\(s.flashcards.total)")
                    LearnInfoRow(label: "مستحقة الآن", value: "\(s.flashcards.due)")
                    LearnInfoRow(label: "متقنة", value: "\(s.flashcards.mastered)")
                    Button("افتح البطاقات") { openRoute("/flashcards") }
                }
                .listRowBackground(Sunnah.Colors.surface)
                Section("خطط القراءة") {
                    if s.activePlans.isEmpty {
                        SunnahMessageState(symbol: "book.closed", title: "لا خطط جارية", message: "ابدأ خطة قراءة من المكتبة.")
                    }
                    ForEach(s.activePlans) { plan in
                        SunnahListRow(title: plan.bookTitle, subtitle: "\(plan.currentPage) من \(plan.totalPages) صفحة · \(plan.statusLabel)")
                    }
                    Button("خطط القراءة") { openRoute("/reading-plans") }
                }
                .listRowBackground(Sunnah.Colors.surface)
                Section("غرفة المذاكرة") {
                    LearnInfoRow(label: "دورات عمل مكتملة", value: "\(s.studyCycles)")
                    Button("غرفة المذاكرة") { openRoute("/study-room") }
                }
                .listRowBackground(Sunnah.Colors.surface)
            }
            Section("الخصوصية") {
                Text("هذه البيانات محفوظة على جهازك فقط.").font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.textSecondary)
                Button("مسح بيانات التعلّم المحلية", role: .destructive) { confirmClear = true }
            }
            .listRowBackground(Sunnah.Colors.surface)
        }
        .listStyle(.plain).scrollContentBackground(.hidden).background(Sunnah.Colors.bg)
        .confirmationDialog("مسح مراجعات البطاقات وخطط القراءة والملف البحثي وسجلّ المذاكرة؟", isPresented: $confirmClear, titleVisibility: .visible) {
            Button("مسح", role: .destructive) { store.clearAll(); summary = LearnLocalSummary.read(from: store) }
        }
        .onAppear { summary = LearnLocalSummary.read(from: store) }
        .navigationTitle("مركز التقدّم")
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
        List {
            Section {
                if let email = platform.authService.currentEmail {
                    SunnahListRow(title: String(email.split(separator: "@").first ?? Substring(email)), subtitle: email)
                } else {
                    Text("سجّل الدخول لمزامنة تقدّمك بين أجهزتك لاحقًا؛ ما تراه هنا محفوظ على هذا الجهاز.")
                        .font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.textSecondary)
                    Button("تسجيل الدخول") { openRoute("/login") }
                }
            }
            .listRowBackground(Sunnah.Colors.surface)
            if let s = summary {
                if !s.activePlans.isEmpty {
                    Section("أكمل من حيث توقفت") {
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
                    .listRowBackground(Sunnah.Colors.surface)
                }
                Section("إحصائياتي") {
                    LearnInfoRow(label: "بطاقات روجعت", value: "\(s.flashcards.total)")
                    LearnInfoRow(label: "بطاقات متقنة", value: "\(s.flashcards.mastered)")
                    LearnInfoRow(label: "خطط قراءة جارية", value: "\(s.activePlans.count)")
                    LearnInfoRow(label: "دورات مذاكرة", value: "\(s.studyCycles)")
                }
                .listRowBackground(Sunnah.Colors.surface)
            }
            Section("روابط سريعة") {
                ForEach(Self.links) { link in
                    Button { openRoute(link.id) } label: { SunnahListRow(title: link.title) }.buttonStyle(.plain)
                }
            }
            .listRowBackground(Sunnah.Colors.surface)
        }
        .listStyle(.plain).scrollContentBackground(.hidden).background(Sunnah.Colors.bg)
        .onAppear { summary = LearnLocalSummary.read(from: store) }
        .navigationTitle("تعلّمي")
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
        Form {
            Section("المعلومات الأساسية") {
                TextField("الاسم المعروض", text: $profile.displayName)
                TextField("الجهة / المؤسسة", text: $profile.institution)
                Picker("التخصص", selection: $profile.specialization) {
                    Text("اختر").tag("")
                    ForEach(LearnResearcherProfile.specializations, id: \.self) { Text($0).tag($0) }
                }
                TextField("نبذة", text: $profile.bio, axis: .vertical).lineLimit(3...8)
            }
            Section("الاهتمامات البحثية") {
                ForEach(LearnResearcherProfile.interestTags, id: \.self) { tag in
                    Toggle(tag, isOn: Binding(get: { profile.interests.contains(tag) }, set: { _ in profile.toggleInterest(tag) }))
                }
            }
            Section("الأعمال والأبحاث") {
                ForEach(profile.publications.indices, id: \.self) { i in
                    TextField("عنوان العمل", text: $profile.publications[i])
                }
                Button("إضافة عمل") { profile.publications.append("") }
            }
            Section {
                Button("حفظ") { profile = profile.cleaned; store.save(profile, .researcher); savedProfile = profile }
                if savedProfile == profile { Text("تم الحفظ على هذا الجهاز").font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.primary) }
            }
        }
        .scrollContentBackground(.hidden).background(Sunnah.Colors.bg)
        .onAppear {
            guard !loaded else { return }
            loaded = true
            profile = store.load(LearnResearcherProfile.self, .researcher) ?? LearnResearcherProfile()
        }
        .navigationTitle("الملف البحثي")
    }
}
