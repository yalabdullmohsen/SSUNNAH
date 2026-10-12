import SwiftUI

/// صف ذكر موثَّق كما في عقد البيانات (`Data/adhkar/verified-adhkar.json`، حقول snake_case) — يُقرأ كما هو.
public struct AdhkarItem: Decodable, Identifiable, Hashable, Sendable {
    public let id: String
    public let categoryId: String
    public let text: String
    public let repeatCount: Int
    public var narrator: String?
    public var sourceName: String?
    public var grade: String?
    public var reference: String?

    enum CodingKeys: String, CodingKey {
        case id, text, narrator, grade, reference
        case categoryId = "category_id"
        case repeatCount = "repeat_count"
        case sourceName = "source_name"
    }
}

public struct AdhkarCategory: Identifiable, Hashable, Sendable {
    public let id: String
    public let items: [AdhkarItem]
}

/// الأذكار: المجموعات ثم أذكار المجموعة بعدّاد لمس لكل ذكر. الفارغ (لا موثَّق بعد) حالة صريحة.
public struct AdhkarScreen: ScreenTemplate {
    public static let id = "adhkar"
    public static let title = "الأذكار"
    public static let source = ContentSource.bundled(name: "verified-adhkar", subdirectory: "Data/adhkar")

    let categories: [AdhkarCategory]
    public init(content: [AdhkarItem]) {
        var order: [String] = []
        var grouped: [String: [AdhkarItem]] = [:]
        for item in content {
            if grouped[item.categoryId] == nil { order.append(item.categoryId) }
            grouped[item.categoryId, default: []].append(item)
        }
        categories = order.map { AdhkarCategory(id: $0, items: grouped[$0] ?? []) }
    }

    public var body: some View {
        if categories.isEmpty {
            EmptyStateView(title: "الأذكار قيد التوثيق")
                .frame(maxWidth: .infinity, maxHeight: .infinity).background(Sunnah.Colors.bg)
        } else {
            List(categories) { category in
                NavigationLink {
                    AdhkarListView(items: category.items)
                } label: {
                    SunnahListRow(title: category.id, subtitle: "\(category.items.count)", showsChevron: false)
                }
                .listRowBackground(Sunnah.Colors.surface)
            }
            .listStyle(.plain).scrollContentBackground(.hidden).background(Sunnah.Colors.bg)
        }
    }
}

struct AdhkarListView: View {
    let items: [AdhkarItem]
    @State private var done: [String: Int] = [:]

    var body: some View {
        ScrollView {
            LazyVStack(spacing: Sunnah.Spacing.s3) {
                ForEach(items) { item in
                    let taps = done[item.id, default: 0]
                    Button { if taps < item.repeatCount { done[item.id] = taps + 1 } } label: {
                        SunnahCard {
                            VStack(alignment: .leading, spacing: Sunnah.Spacing.s2) {
                                Text(item.text).font(Sunnah.Typography.body).foregroundStyle(Sunnah.Colors.textPrimary)
                                if let source = item.sourceName ?? item.reference {
                                    Text(source).font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.textSecondary)
                                }
                                Text("\(taps) / \(item.repeatCount)").font(Sunnah.Typography.tag)
                                    .foregroundStyle(taps >= item.repeatCount ? Sunnah.Colors.primary : Sunnah.Colors.textSecondary)
                            }
                        }
                    }.buttonStyle(.plain)
                }
            }.padding(Sunnah.Spacing.pageX)
        }
        .background(Sunnah.Colors.bg)
    }
}
