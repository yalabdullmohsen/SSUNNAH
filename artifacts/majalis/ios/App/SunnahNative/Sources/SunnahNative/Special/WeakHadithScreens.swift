import SwiftUI

/// حديث ضعيف/موضوع كما في `Data/hadith/weak-{daif,mawdu}.json` (قرار يوسف، DATA_CONTRACT §5.2).
/// يُقرأ هذان الملفان من هذه الشاشات حصرًا: لا ويدجت ولا «حديث اليوم» ولا إشعارات ولا اقتراح عشوائي (يحرسه WeakHadithTests).
public struct WeakHadithItem: Decodable, Identifiable, Hashable, Sendable {
    public let id: String
    public let title: String
    public let text: String
    public var narrator: String?
    public var sourceName: String
    public var grade: String
    public var chapter: String?
    public var explanation: String?
    public var muhaddith: String
    public var authenticityClass: String
    public var reviewStatus: String
    public var hidden: Bool

    enum CodingKeys: String, CodingKey {
        case id, title, text, narrator, grade, chapter, explanation, muhaddith, hidden
        case sourceName = "source_name"
        case authenticityClass = "authenticity_class"
        case reviewStatus = "review_status"
    }

    /// قاعدة المالك: لا يظهر ضعيف ولا موضوع قبل اعتماده (`review_status == "approved"`)؛ أي حالة أخرى (pending_review…) لا تُعرض ولا تُبحث.
    public var isApproved: Bool { reviewStatus == "approved" && !hidden }

    public var isMawdu: Bool { authenticityClass == "mawdu" }
    public var label: String { isMawdu ? "موضوع" : "ضعيف" }

    /// نص المشاركة والنسخ: الحكم والمحدّث والمصدر ملازمة للنص دائمًا.
    public var shareText: String {
        "\(text)\n\nالحكم: \(grade)\nالمحدّث: \(muhaddith)\nالمصدر: \(sourceName)\n(\(label) — لا تجوز نسبته إلى النبي ﷺ إلا مع بيان حاله)"
    }
}

enum WeakHadithWarning {
    static let text = "لا تجوز نسبة هذه الأحاديث إلى النبي ﷺ إلا مع بيان حالها"
}

struct WeakHadithBadge: View {
    let item: WeakHadithItem
    var body: some View {
        let c = item.isMawdu ? Sunnah.Colors.danger : Sunnah.Colors.gold
        HStack(spacing: Sunnah.Spacing.s1) {
            Text(item.label).font(Sunnah.Typography.tag).foregroundStyle(c)
            Text("قيد المراجعة").font(Sunnah.Typography.tag).foregroundStyle(Sunnah.Colors.textSecondary)
        }
        .padding(.horizontal, Sunnah.Spacing.s2).padding(.vertical, 2)
        .background(c.opacity(0.14), in: Capsule())
        .accessibilityElement(children: .combine)
    }
}

struct WeakHadithWarningBanner: View {
    var body: some View {
        Label { Text(SunnahArabicText.enlargingSalawat(AttributedString(WeakHadithWarning.text), size: 15)) }
            icon: { Image(systemName: "exclamationmark.triangle.fill") }
            .font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.danger)
            .frame(maxWidth: .infinity, alignment: .leading).padding(Sunnah.Spacing.s3)
            .background(Sunnah.Colors.danger.opacity(0.10))
            .accessibilityElement(children: .combine)
    }
}

struct WeakHadithListView: View {
    @Environment(\.contentLoader) private var loader
    let file: String; let title: String
    @State private var phase: Phase = .loading
    @State private var query = ""
    private enum Phase { case loading, failed, ready([WeakHadithItem]) }

    /// لقطات التدقيق فقط (DEBUG): أول مادة مفتوحة مباشرة؛ في الإصدار دائمًا nil.
    private static func pinned(_ rows: [WeakHadithItem]) -> WeakHadithItem? {
        #if DEBUG
        return ProcessInfo.processInfo.environment["SNAP_DETAIL"] == "1" ? rows.first : nil
        #else
        return nil
        #endif
    }

    var body: some View {
        VStack(spacing: 0) {
            WeakHadithWarningBanner()
            Group {
                switch phase {
                case .loading: LoadingStateView()
                case .failed: ErrorStateView { Task { await load() } }
                case .ready(let all):
                    let q = ArabicSearch.normalize(query.trimmingCharacters(in: .whitespaces))
                    let rows = Self.visibleRows(all, file: file, normalizedQuery: q)
                    if let first = Self.pinned(rows) {
                        WeakHadithDetailView(item: first)
                    } else if rows.isEmpty && q.isEmpty {
                        EmptyStateView(title: "لا مواد معتمدة بعد").frame(maxWidth: .infinity, maxHeight: .infinity)
                    } else {
                    List(rows) { item in
                        SunnahNavigationLink { WeakHadithDetailView(item: item) } label: {
                            VStack(alignment: .leading, spacing: Sunnah.Spacing.s1) {
                                WeakHadithBadge(item: item)
                                Text(item.title).font(Sunnah.Typography.body).foregroundStyle(Sunnah.Colors.textPrimary)
                                Text("المحدّث: \(item.muhaddith)").font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.textSecondary)
                            }
                        }.sunnahRowChrome()
                    }
                    .listStyle(.plain).scrollContentBackground(.hidden)
                    .searchable(text: $query, prompt: "ابحث في \(title)")
                    }
                }
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity).background(Sunnah.Colors.bg)
        .sunnahNavTitle(title)
        .task(id: file) { phase = .loading; await load() }
    }

    /// حاجز أخير: لا يُعرض عنصر إلا إن طابق حكمُه الملفَّ المفتوح (weak-daif ← daif، weak-mawdu ← mawdu)، حتى لو بقيت بيانات ملف آخر في الحالة.
    static func expectedClass(for file: String) -> String { file.replacingOccurrences(of: "weak-", with: "") }
    static func visibleRows(_ all: [WeakHadithItem], file: String, normalizedQuery q: String) -> [WeakHadithItem] {
        let cls = expectedClass(for: file)
        return all.filter { $0.authenticityClass == cls && ($0.isApproved || Self.pendingShown) && (q.isEmpty || ArabicSearch.normalize($0.title + " " + $0.text).contains(q)) }
    }

    /// لقطات التدقيق فقط (DEBUG): تعرض العناصر المعلّقة لالتقاط تخطيط التفاصيل؛ قاعدة المالك (DATA_CONTRACT §5.2) سارية في Release.
    #if DEBUG
    static let pendingShown = ProcessInfo.processInfo.environment["SNAP_DETAIL"] == "1"
    #else
    static let pendingShown = false
    #endif
    private static func passes(_ i: WeakHadithItem) -> Bool { i.isApproved || pendingShown }

    private func load() async {
        phase = .loading
        do { phase = .ready(try await loader.load([WeakHadithItem].self, from: .bundled(name: file, subdirectory: "Data/hadith")).filter(Self.passes)) }
        catch { phase = .failed }
    }
}

struct WeakHadithDetailView: View {
    let item: WeakHadithItem
    private func copy(_ s: String) {
        #if canImport(UIKit)
        UIPasteboard.general.string = s
        #endif
    }
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: Sunnah.Spacing.s3) {
                WeakHadithWarningBanner()
                WeakHadithBadge(item: item)
                SunnahCard {
                    VStack(alignment: .leading, spacing: Sunnah.Spacing.s2) {
                        SunnahArabicText(item.text, style: .body).foregroundStyle(Sunnah.Colors.textPrimary)
                        if let n = item.narrator { Text(n).font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.textSecondary) }
                    }
                }
                SunnahCard {
                    VStack(alignment: .leading, spacing: Sunnah.Spacing.s2) {
                        Text("الحكم: \(item.grade)").font(Sunnah.Typography.cardTitle)
                        Text("المحدّث: \(item.muhaddith)").font(Sunnah.Typography.body)
                        Text("المصدر: \(item.sourceName)").font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.textSecondary)
                        if let c = item.chapter { Text(c).font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.textSecondary) }
                    }
                }
                if let e = item.explanation { SunnahCard { SunnahSectionedMarkdown(e, key: "weak-\(item.id)", style: .body).foregroundStyle(Sunnah.Colors.textPrimary) } }
                HStack(spacing: Sunnah.Spacing.s3) {
                    ShareLink(item: item.shareText) { Label("مشاركة", systemImage: "square.and.arrow.up") }
                    Button { copy(item.shareText) } label: { Label("نسخ", systemImage: "doc.on.doc") }
                }.font(Sunnah.Typography.secondary)
                SunnahContentFooter(title: item.title, id: item.id, section: item.sourceName, source: item.sourceName, inset: false, sensitive: true)
            }.padding(Sunnah.Spacing.pageX)
        }
        .background(Sunnah.Colors.bg)
        .sunnahNavTitle(item.label)
        .sunnahReportIssueToolbar(title: item.title, id: item.id, section: item.sourceName)
    }
}

/// عدد المعتمد في كل ملف ضعيف/موضوع: صفر ⇒ يُخفى مدخل القسم من كل القوائم والبحث، ويظهر تلقائيًا بعد الاعتماد.
enum WeakHadithAvailability {
    /// مسار القسم ← ملف بياناته.
    static let gatedRoutes: [String: String] = ["/hadith/daif": "weak-daif", "/hadith/mawdu": "weak-mawdu"]

    nonisolated(unsafe) static var approvedCount: (String) -> Int = { file in
        cache.withLock { c in
            if let n = c[file] { return n }
            let url = Bundle.main.url(forResource: file, withExtension: "json", subdirectory: "Data/hadith")
            let n = url.flatMap { try? Data(contentsOf: $0) }
                .flatMap { try? JSONDecoder().decode([WeakHadithItem].self, from: $0) }?.filter(\.isApproved).count ?? 0
            c[file] = n
            return n
        }
    }
    private static let cache = WeakCountCache<[String: Int]>([:])

    static func isListed(_ route: String) -> Bool {
        guard let file = gatedRoutes[route] else { return true }
        return approvedCount(file) > 0
    }
}

final class WeakCountCache<T>: @unchecked Sendable {
    private var v: T; private let l = NSLock()
    init(_ v: T) { self.v = v }
    func withLock<R>(_ f: (inout T) -> R) -> R { l.lock(); defer { l.unlock() }; return f(&v) }
}
