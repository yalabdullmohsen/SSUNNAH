import SwiftUI
import AVFoundation

/// مسودة «أضف محتوى» بقيود الويب نفسها (العنوان 3–500، التفاصيل 3–8000، الاسم ≤ 200).
struct AccountSubmissionDraft: Equatable, Sendable {
    static let types = ["درس", "فائدة", "معلومة", "سؤال لعبة", "فكرة"]

    var type = "درس"
    var title = ""
    var details = ""
    var author = ""

    var isValid: Bool {
        let t = title.trimmingCharacters(in: .whitespacesAndNewlines).count
        let d = details.trimmingCharacters(in: .whitespacesAndNewlines).count
        return Self.types.contains(type) && (3...500).contains(t) && (3...8000).contains(d) && author.count <= 200
    }
}

/// /submit — أضف محتوى: يصل المقترح للأدمن لمراجعته قبل النشر.
struct AccountSubmitContentScreen: View {
    private enum Status: Equatable { case idle, loading, success(String), error(String) }

    @State private var draft = AccountSubmissionDraft()
    @State private var status: Status = .idle

    var body: some View {
        Form {
            Section {
                AccountHeader(eyebrow: nil, title: "أضف محتوى", subtitle: "يصل مقترحك للأدمن لمراجعته قبل النشر.")
                    .listRowBackground(Color.clear)
                Button { draft.type = "درس" } label: {
                    HStack(spacing: Sunnah.Spacing.s3) {
                        Image(systemName: "graduationcap").font(Sunnah.Typography.sectionTitle).foregroundStyle(Sunnah.Colors.primary)
                            .accessibilityHidden(true)
                        VStack(alignment: .leading, spacing: Sunnah.Spacing.s1) {
                            Text("أضف درساً علمياً").font(Sunnah.Typography.cardTitle).foregroundStyle(Sunnah.Colors.textPrimary)
                            Text("شارك درساً، محاضرة، أو موضوعاً علمياً مفيداً").font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.textSecondary)
                        }
                    }
                }
                .buttonStyle(.plain)
            }

            switch status {
            case .success(let message):
                Section { Text(message).font(Sunnah.Typography.body).foregroundStyle(Sunnah.Colors.primary) }
            case .error(let message):
                Section { Text(message).font(Sunnah.Typography.body).foregroundStyle(Sunnah.Colors.danger) }
            default:
                EmptyView()
            }

            Section("نوع المحتوى") {
                Picker("نوع المحتوى", selection: $draft.type) {
                    ForEach(AccountSubmissionDraft.types, id: \.self) { Text($0).tag($0) }
                }
            }
            Section("عنوان الموضوع") {
                TextField("اكتب عنواناً مختصراً للموضوع", text: Binding(get: { draft.title }, set: { draft.title = String($0.prefix(500)) }))
            }
            Section("التفاصيل") {
                TextField("اكتب التفاصيل هنا...", text: Binding(get: { draft.details }, set: { draft.details = String($0.prefix(8000)) }), axis: .vertical)
                    .lineLimit(6...12)
            }
            Section("اسمك (اختياري)") {
                TextField("للنسب الصحيح", text: Binding(get: { draft.author }, set: { draft.author = String($0.prefix(200)) }))
            }

            Section {
                SunnahButton(status == .loading ? "إرسال…" : "إرسال المقترح") { Task { await submit() } }
                    .disabled(status == .loading || !draft.isValid)
                    .opacity(draft.isValid ? 1 : 0.5)
                    .listRowBackground(Color.clear)
            }
        }
        .font(Sunnah.Typography.body)
        .scrollContentBackground(.hidden)
        .background(Sunnah.Colors.bg)
        .navigationTitle("أضف محتوى")
    }

    @MainActor private func submit() async {
        guard draft.isValid else { return }
        status = .loading
        do {
            let message = try await AccountAPI().submitContent(draft)
            status = .success(message)
            draft = AccountSubmissionDraft(type: draft.type)
        } catch AccountAPIError.server(let message) {
            status = .error(message)
        } catch {
            status = .error("تعذر الاتصال، حاول مرة أخرى.")
        }
    }
}

/// صف من user_submissions (USER_SUBMISSIONS_COLS).
struct AccountSubmission: Decodable, Sendable, Identifiable, Hashable {
    let id: String
    let type: String
    let title: String
    let status: String
    let reviewerNote: String?
    let fileName: String?
    let fileSizeKB: Double?
    let fileURL: String?
    let fileMime: String?
    let createdAt: String

    enum CodingKeys: String, CodingKey {
        case id, type, title, status
        case reviewerNote = "reviewer_note", fileName = "file_name", fileSizeKB = "file_size_kb"
        case fileURL = "file_url", fileMime = "file_mime", createdAt = "created_at"
    }

    init(from decoder: Decoder) throws {
        let c = try decoder.container(keyedBy: CodingKeys.self)
        id = try c.decode(AccountAnyID.self, forKey: .id).value
        type = try c.decode(String.self, forKey: .type)
        title = try c.decode(String.self, forKey: .title)
        status = try c.decode(String.self, forKey: .status)
        reviewerNote = try c.decodeIfPresent(String.self, forKey: .reviewerNote)
        fileName = try c.decodeIfPresent(String.self, forKey: .fileName)
        fileSizeKB = try c.decodeIfPresent(Double.self, forKey: .fileSizeKB)
        fileURL = try c.decodeIfPresent(String.self, forKey: .fileURL)
        fileMime = try c.decodeIfPresent(String.self, forKey: .fileMime)
        createdAt = try c.decode(String.self, forKey: .createdAt)
    }

    static let statusLabel = ["pending": "قيد التدقيق", "approved": "مقبول", "rejected": "مرفوض"]
    static let typeLabel = ["adhan": "أذان", "lesson": "درس"]

    var isAudio: Bool { fileMime?.hasPrefix("audio") == true && fileURL.flatMap(URL.init(string:)) != nil }

    /// حجم الملف كما في formatFileSize: «—» للفارغ، ثم KB حتى 1024، ثم MB بمنزلة عشرية.
    static func formatSize(_ kb: Double?) -> String {
        guard let kb, kb != 0 else { return "—" }
        if kb < 1024 { return (kb.truncatingRemainder(dividingBy: 1) == 0 ? String(Int(kb)) : String(kb)) + " KB" }
        return String(format: "%.1f MB", kb / 1024)
    }

    var date: Date? {
        let f = ISO8601DateFormatter()
        f.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        return f.date(from: createdAt) ?? ISO8601DateFormatter().date(from: createdAt)
    }
}

/// /my-submissions — مساهماتي: تتبّع حالة الأذانات والدروس المرسلة بالبريد المستعمل عند الإرسال.
struct AccountMySubmissionsScreen: View {
    @Environment(\.contentLoader) private var loader
    @Environment(\.openRoute) private var openRoute
    @State private var email = ""
    @State private var list: [AccountSubmission]?
    @State private var loading = false
    @State private var error = ""
    @State private var player: AVPlayer?
    @State private var playingId: String?
    @Environment(\.platform) private var platform

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: Sunnah.Spacing.s4) {
                AccountHeader(eyebrow: "المساهمات", title: "مساهماتي", subtitle: "تتبّع حالة الأذانات والدروس التي أرسلتها للمراجعة.")

                if AccountSession.read(from: platform.auth) == nil {
                    SunnahCard {
                        VStack(alignment: .leading, spacing: Sunnah.Spacing.s3) {
                            Text("سجّل الدخول لتربط مساهماتك بحسابك وتتابعها في أي وقت.")
                                .font(Sunnah.Typography.body).foregroundStyle(Sunnah.Colors.textPrimary)
                            SunnahButton("تسجيل الدخول", style: .secondary) { openRoute("/login?next=/my-submissions") }
                        }
                    }
                }

                SunnahCard {
                    VStack(alignment: .leading, spacing: Sunnah.Spacing.s3) {
                        Text("ابحث بالبريد الإلكتروني الذي أدخلته عند الإرسال:")
                            .font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.textSecondary)
                        TextField("بريدك@مثال.com", text: $email)
                            .font(Sunnah.Typography.body)
                            #if os(iOS)
                            .textContentType(.emailAddress)
                            .keyboardType(.emailAddress)
                            .textInputAutocapitalization(.never)
                            #endif
                            .autocorrectionDisabled()
                            .frame(minHeight: Sunnah.Spacing.touch)
                            .onSubmit { Task { await search() } }
                        SunnahButton(loading ? "..." : "بحث") { Task { await search() } }
                            .disabled(loading || email.trimmingCharacters(in: .whitespaces).isEmpty)
                    }
                }

                if !error.isEmpty {
                    Text(error).font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.danger)
                }

                if let list {
                    AccountTileGrid(items: stats(list)) { AccountStatTile(value: $0.value, label: $0.label) }
                    if list.isEmpty {
                        EmptyStateView(title: "لا يتوفر محتوى هنا الآن.")
                        SunnahButton("ارفع درساً", style: .secondary) { openRoute("/upload") }
                    } else {
                        Text("\(list.count) مساهمة").font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.textSecondary)
                        ForEach(list) { row($0) }
                    }
                } else if !loading {
                    Text("أو ارفع محتوىً جديداً:").font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.textSecondary)
                    SunnahButton("رفع درس علمي", style: .secondary) { openRoute("/upload") }
                }
                AccountShareRow(title: "مساهماتي — سُنّة", path: "/my-submissions")
            }
            .padding(Sunnah.Spacing.pageX)
        }
        .background(Sunnah.Colors.bg)
        .navigationTitle("مساهماتي")
        .onDisappear { player?.pause(); playingId = nil }
    }

    private func stats(_ list: [AccountSubmission]) -> [AccountStatCard] {
        [AccountStatCard(value: "\(list.count)", label: "الكل", sub: nil)]
            + ["pending", "approved", "rejected"].map { s in
                AccountStatCard(value: "\(list.filter { $0.status == s }.count)", label: AccountSubmission.statusLabel[s] ?? s, sub: nil)
            }
    }

    private func row(_ sub: AccountSubmission) -> some View {
        SunnahCard {
            VStack(alignment: .leading, spacing: Sunnah.Spacing.s2) {
                HStack {
                    SunnahChip(AccountSubmission.statusLabel[sub.status] ?? sub.status, selected: sub.status == "approved")
                    Spacer()
                    if let date = sub.date {
                        Text(date.formatted(date: .abbreviated, time: .omitted)).font(Sunnah.Typography.tag).foregroundStyle(Sunnah.Colors.textSecondary)
                    }
                }
                Text(sub.title).font(Sunnah.Typography.cardTitle).foregroundStyle(Sunnah.Colors.textPrimary)
                Text((AccountSubmission.typeLabel[sub.type] ?? sub.type)
                     + (sub.fileName.map { " · \($0) (\(AccountSubmission.formatSize(sub.fileSizeKB)))" } ?? ""))
                    .font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.textSecondary)
                if sub.isAudio {
                    SunnahButton(playingId == sub.id ? "⏹ إيقاف" : "▶ استمع للتسجيل", style: .secondary) { toggleAudio(sub) }
                }
                if let note = sub.reviewerNote, !note.isEmpty {
                    AccountRichText("**ملاحظة الفريق:** " + note, font: Sunnah.Typography.secondary)
                }
                if sub.type == "adhan" {
                    Text("ميزة رفع الأذان أُلغيت نهائيًا. هذا سجل قديم للعرض فقط.").font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.textSecondary)
                }
                if sub.status == "approved" && sub.type == "lesson" {
                    Text("تهانينا! قُبل درسك وهو في مسار النشر ضمن قسم الدروس.").font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.primary)
                }
                if sub.status == "rejected" && sub.type == "lesson" {
                    AccountLinkRow(title: "إعادة الإرسال بعد التعديل", path: "/upload")
                }
            }
        }
    }

    private func toggleAudio(_ sub: AccountSubmission) {
        if playingId == sub.id { player?.pause(); playingId = nil; return }
        guard let link = sub.fileURL, let url = URL(string: link) else { return }
        player?.pause()
        let p = AVPlayer(url: url)
        p.play()
        player = p
        playingId = sub.id
    }

    @MainActor private func search() async {
        let e = email.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !e.isEmpty else { return }
        loading = true
        error = ""
        list = nil
        defer { loading = false }
        do {
            list = try await loader.load([AccountSubmission].self, from: AccountEndpoints.submissions(email: e))
        } catch {
            self.error = ErrorStateView.offlineMessage
        }
    }
}
