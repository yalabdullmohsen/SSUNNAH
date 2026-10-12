import SwiftUI
#if canImport(UIKit)
import UIKit
#endif

/// مادة مستوردة آليًا من /api/auto-content (AutoImportedContent) — الحقول المعروضة فقط.
struct AccountAutoContent: Decodable, Sendable, Hashable, Identifiable {
    let id: String
    let title: String
    let slug: String
    let contentType: String
    let category: String?
    let summary: String?
    let content: String?
    let sourceName: String?
    let originalURL: String?
    let tags: [String]?
    let publishedAt: String?
    let createdAt: String?

    enum CodingKeys: String, CodingKey {
        case id, title, slug, category, summary, content, tags
        case contentType = "content_type", sourceName = "source_name", originalURL = "original_url"
        case publishedAt = "published_at", createdAt = "created_at"
    }

    init(from decoder: Decoder) throws {
        let c = try decoder.container(keyedBy: CodingKeys.self)
        id = try c.decode(AccountAnyID.self, forKey: .id).value
        title = try c.decode(String.self, forKey: .title)
        slug = try c.decode(String.self, forKey: .slug)
        contentType = try c.decodeIfPresent(String.self, forKey: .contentType) ?? ""
        category = try c.decodeIfPresent(String.self, forKey: .category)
        summary = try c.decodeIfPresent(String.self, forKey: .summary) ?? c.decodeIfPresent(String.self, forKey: .content)
        content = try c.decodeIfPresent(String.self, forKey: .content)
        sourceName = try c.decodeIfPresent(String.self, forKey: .sourceName)
        originalURL = try c.decodeIfPresent(String.self, forKey: .originalURL)
        tags = try c.decodeIfPresent([String].self, forKey: .tags)
        publishedAt = try c.decodeIfPresent(String.self, forKey: .publishedAt)
        createdAt = try c.decodeIfPresent(String.self, forKey: .createdAt)
    }

    /// mapContentTypeToUpdateType في الويب.
    static func updateType(for contentType: String) -> String {
        ["fatwa": "فتوى", "resolution": "قرار", "recommendation": "قرار"][contentType] ?? "خبر علمي"
    }
}

/// غلاف استجابة /api/auto-content: `{items:[…]}` أو `{item:{…}}`.
struct AccountAutoContentResponse: Decodable, Sendable {
    let items: [AccountAutoContent]
    let item: AccountAutoContent?

    enum CodingKeys: String, CodingKey { case items, item }
    init(from decoder: Decoder) throws {
        let c = try decoder.container(keyedBy: CodingKeys.self)
        items = (try? c.decodeIfPresent([AccountAutoContent].self, forKey: .items)) ?? []
        item = try? c.decodeIfPresent(AccountAutoContent.self, forKey: .item)
    }

    var first: AccountAutoContent? { item ?? items.first }
}

/// تحديث منصة: صف platform_updates المعتمد، أو عنصر /api/updates ({id,title,content}).
struct AccountPlatformUpdate: Decodable, Sendable, Hashable {
    let id: String
    let title: String
    let summary: String?
    let updateType: String
    let sourceURL: String?
    let publishedAt: String?

    enum CodingKeys: String, CodingKey {
        case id, title, summary, content
        case updateType = "update_type", sourceURL = "source_url", publishedAt = "published_at"
    }

    init(from decoder: Decoder) throws {
        let c = try decoder.container(keyedBy: CodingKeys.self)
        id = try c.decode(AccountAnyID.self, forKey: .id).value
        title = try c.decode(String.self, forKey: .title)
        summary = try c.decodeIfPresent(String.self, forKey: .summary) ?? c.decodeIfPresent(String.self, forKey: .content)
        updateType = try c.decodeIfPresent(String.self, forKey: .updateType) ?? "خبر علمي"
        sourceURL = try c.decodeIfPresent(String.self, forKey: .sourceURL)
        publishedAt = try c.decodeIfPresent(String.self, forKey: .publishedAt)
    }
}

/// عنصر المستجدات المدمج (MergedUpdateItem).
struct AccountUpdateItem: Hashable, Sendable, Identifiable {
    let id: String
    let title: String
    let summary: String?
    let updateType: String
    let link: String?
    let publishedAt: String?
    let isAuto: Bool
    let sourceName: String?

    var key: String { (isAuto ? "auto-" : "platform-") + id }

    var date: Date? { publishedAt.flatMap(AccountUpdates.parseDate) }
}

enum AccountUpdates {
    /// دمج منصة + مستورد آلي، الأحدث أولًا، بحد أقصى `limit` (getMergedPlatformUpdates).
    static func merge(platform: [AccountPlatformUpdate], auto: [AccountAutoContent], limit: Int = 100) -> [AccountUpdateItem] {
        let p = platform.map {
            AccountUpdateItem(id: $0.id, title: $0.title, summary: $0.summary, updateType: $0.updateType, link: $0.sourceURL,
                              publishedAt: $0.publishedAt, isAuto: false, sourceName: nil)
        }
        let a = auto.map {
            AccountUpdateItem(id: $0.id, title: $0.title, summary: $0.summary, updateType: AccountAutoContent.updateType(for: $0.contentType),
                              link: "/updates/auto/" + $0.slug, publishedAt: $0.publishedAt ?? $0.createdAt, isAuto: true, sourceName: $0.sourceName)
        }
        let sorted = (p + a).enumerated().sorted { l, r in
            let dl = l.element.date ?? .distantPast, dr = r.element.date ?? .distantPast
            return dl == dr ? l.offset < r.offset : dl > dr
        }.map(\.element)
        return Array(sorted.prefix(limit))
    }

    static func filter(_ items: [AccountUpdateItem], type: String, search: String) -> [AccountUpdateItem] {
        let byType = type == "الكل" ? items : items.filter { $0.updateType == type }
        return byType.filter { AccountSearch.matches([$0.title, $0.summary, $0.sourceName, $0.updateType], search) }
    }

    static func parseDate(_ s: String) -> Date? {
        let f = ISO8601DateFormatter()
        f.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        if let d = f.date(from: s) { return d }
        f.formatOptions = [.withInternetDateTime]
        if let d = f.date(from: s) { return d }
        f.formatOptions = [.withFullDate]
        return f.date(from: String(s.prefix(10)))
    }
}

/// /updates — آخر المستجدات: دروس ودورات وكتب وإعلانات، مرتّبة زمنياً.
struct AccountUpdatesScreen: View {
    @Environment(\.contentLoader) private var loader
    @Environment(\.openRoute) private var openRoute
    @Environment(\.openURL) private var openURL
    @State private var phase: AccountLoadPhase<[AccountUpdateItem]> = .loading
    @State private var filter = "الكل"
    @State private var search = ""

    var body: some View {
        ScrollView {
            LazyVStack(alignment: .leading, spacing: Sunnah.Spacing.s3) {
                AccountHeader(eyebrow: "النشاط العلمي", title: "آخر المستجدات",
                              subtitle: "دروس ودورات وكتب وإعلانات ومستجدات علمية، مرتّبة زمنياً حسب ما يُنشر على المنصة.")
                AccountChipBar(options: ["الكل"] + AccountTexts.updateTypes, selection: $filter)
                switch phase {
                case .loading: LoadingStateView()
                case .failed: ErrorStateView { Task { await load() } }
                case .ready(let items):
                    AccountSearchField(placeholder: "ابحث في المستجدات...", text: $search)
                    let shown = AccountUpdates.filter(items, type: filter, search: search)
                    if shown.isEmpty {
                        EmptyStateView(title: "لا مستجدات")
                    }
                    ForEach(shown, id: \.key) { item in card(item) }
                }
                AccountShareRow(title: "آخر المستجدات — سُنّة", path: "/updates")
            }
            .padding(Sunnah.Spacing.pageX)
        }
        .background(Sunnah.Colors.bg)
        .navigationTitle("آخر المستجدات")
        .task { await load() }
        .refreshable { await load() }
    }

    private func card(_ item: AccountUpdateItem) -> some View {
        Button { open(item.link) } label: {
            SunnahCard {
                VStack(alignment: .leading, spacing: Sunnah.Spacing.s2) {
                    HStack(spacing: Sunnah.Spacing.s2) {
                        SunnahChip(item.updateType, selected: true)
                        if item.isAuto { SunnahChip("مصدر موثوق") }
                        Spacer(minLength: 0)
                        if let d = item.date {
                            Text(d.formatted(date: .abbreviated, time: .shortened)).font(Sunnah.Typography.tag).foregroundStyle(Sunnah.Colors.textSecondary)
                        }
                    }
                    Text(item.title).font(Sunnah.Typography.cardTitle).foregroundStyle(Sunnah.Colors.textPrimary)
                    if let s = item.summary, !s.isEmpty {
                        Text(s).font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.textSecondary).lineLimit(4)
                    }
                    if item.isAuto, let src = item.sourceName, !src.isEmpty {
                        Text("المصدر: \(src)").font(Sunnah.Typography.tag).foregroundStyle(Sunnah.Colors.textSecondary)
                    }
                }
            }
        }
        .buttonStyle(.plain)
        .disabled(item.link == nil)
    }

    private func open(_ link: String?) {
        guard let link, !link.isEmpty else { return }
        if link.hasPrefix("/") { openRoute(link) }
        else if let url = URL(string: link), ["http", "https"].contains(url.scheme ?? "") { openURL(url) }
    }

    @MainActor private func load() async {
        if case .ready = phase {} else { phase = .loading }
        let loader = self.loader
        async let platform = try? loader.load([AccountPlatformUpdate].self, from: AccountEndpoints.platformUpdates)
        async let auto = try? loader.load(AccountAutoContentResponse.self, from: AccountEndpoints.autoContent)
        let (p, a) = await (platform, auto)
        if p == nil && a == nil { phase = .failed; return }
        phase = .ready(AccountUpdates.merge(platform: p ?? [], auto: a?.items ?? []))
    }
}

/// /updates/auto/:slug — تفاصيل مادة مستوردة.
struct AccountAutoContentDetailScreen: View {
    let slug: String
    @Environment(\.contentLoader) private var loader
    @Environment(\.openRoute) private var openRoute
    @State private var phase: AccountLoadPhase<AccountAutoContent?> = .loading
    @State private var copied = false

    var body: some View {
        Group {
            switch phase {
            case .loading: LoadingStateView()
            case .failed, .ready(nil): EmptyStateView(title: "لا يتوفر محتوى هنا الآن.")
            case .ready(let item?): detail(item)
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Sunnah.Colors.bg)
        .task { await load() }
    }

    private func detail(_ item: AccountAutoContent) -> some View {
        ScrollView {
            VStack(alignment: .leading, spacing: Sunnah.Spacing.s4) {
                Text(item.title).font(Sunnah.Typography.pageTitle).foregroundStyle(Sunnah.Colors.textPrimary)
                if let s = item.summary, !s.isEmpty {
                    Text(s).font(Sunnah.Typography.body).foregroundStyle(Sunnah.Colors.textSecondary)
                }
                Text([AccountAutoContent.updateType(for: item.contentType), item.category, item.sourceName]
                        .compactMap { $0 }.filter { !$0.isEmpty }.joined(separator: " · "))
                    .font(Sunnah.Typography.tag).foregroundStyle(Sunnah.Colors.primary)
                if let tags = item.tags, !tags.isEmpty {
                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(spacing: Sunnah.Spacing.s2) { ForEach(tags, id: \.self) { SunnahChip($0) } }
                    }
                }
                ForEach(Array((item.content ?? item.summary ?? "").components(separatedBy: "\n\n").enumerated()), id: \.offset) { _, p in
                    Text(p).font(Sunnah.Typography.body).foregroundStyle(Sunnah.Colors.textPrimary).lineSpacing(Sunnah.Spacing.s2)
                        .textSelection(.enabled)
                }
                if let link = item.originalURL, let url = URL(string: link) {
                    Link(destination: url) {
                        Label("المصدر", systemImage: "link").font(Sunnah.Typography.cardTitle).foregroundStyle(Sunnah.Colors.primary)
                            .frame(minHeight: Sunnah.Spacing.touch)
                    }
                }
                SunnahButton(copied ? "تم النسخ" : "نسخ", style: .secondary) { copy(item) }
                AccountLinkRow(title: "العودة للمستجدات", path: "/updates")
            }
            .padding(Sunnah.Spacing.pageX)
        }
        .navigationTitle(item.title)
    }

    private func copy(_ item: AccountAutoContent) {
        let text = "\(item.title)\n\n\(item.summary ?? "")\n\n\(item.content ?? "")"
        #if canImport(UIKit)
        UIPasteboard.general.string = text
        #elseif canImport(AppKit)
        NSPasteboard.general.clearContents()
        NSPasteboard.general.setString(text, forType: .string)
        #endif
        copied = true
    }

    @MainActor private func load() async {
        phase = .loading
        do {
            phase = .ready(try await loader.load(AccountAutoContentResponse.self, from: AccountEndpoints.autoContent(slug: slug)).first)
        } catch {
            phase = .failed
        }
    }
}
