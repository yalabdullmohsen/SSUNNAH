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
        Label(WeakHadithWarning.text, systemImage: "exclamationmark.triangle.fill")
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

    var body: some View {
        VStack(spacing: 0) {
            WeakHadithWarningBanner()
            Group {
                switch phase {
                case .loading: LoadingStateView()
                case .failed: ErrorStateView { Task { await load() } }
                case .ready(let all):
                    let q = ArabicSearch.normalize(query.trimmingCharacters(in: .whitespaces))
                    let rows = all.filter { !$0.hidden && (q.isEmpty || ArabicSearch.normalize($0.title + " " + $0.text).contains(q)) }
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
        .frame(maxWidth: .infinity, maxHeight: .infinity).background(Sunnah.Colors.bg)
        .navigationTitle(title)
        .task(id: file) { phase = .loading; await load() }
    }

    private func load() async {
        phase = .loading
        do { phase = .ready(try await loader.load([WeakHadithItem].self, from: .bundled(name: file, subdirectory: "Data/hadith"))) }
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
                        Text(item.text).font(Sunnah.Typography.body).foregroundStyle(Sunnah.Colors.textPrimary)
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
                if let e = item.explanation { SunnahCard { Text(e).font(Sunnah.Typography.body).foregroundStyle(Sunnah.Colors.textPrimary) } }
                HStack(spacing: Sunnah.Spacing.s3) {
                    ShareLink(item: item.shareText) { Label("مشاركة", systemImage: "square.and.arrow.up") }
                    Button { copy(item.shareText) } label: { Label("نسخ", systemImage: "doc.on.doc") }
                }.font(Sunnah.Typography.secondary)
            }.padding(Sunnah.Spacing.pageX)
        }
        .background(Sunnah.Colors.bg)
        .navigationTitle(item.label)
    }
}
