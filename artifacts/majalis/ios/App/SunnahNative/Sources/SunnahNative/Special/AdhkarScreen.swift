import SwiftUI

/// نموذج الأذكار المحزوم (`data/adhkar.json`، يُولَّد من adhkar-seed بلا الضعيف) — يُقرأ كما هو.
public struct AdhkarBundle: Decodable, Sendable {
    public struct Category: Decodable, Identifiable, Hashable, Sendable {
        public let id: String
        public let name: String
        public let slug: String
        public let description: String
    }
    public struct Item: Decodable, Identifiable, Hashable, Sendable {
        public let id: String
        public let categoryId: String
        public let text: String
        public let count: Int
        public var narrator: String?
        public var source: String?
        public var grade: String?
        public var reference: String?
    }
    public let categories: [Category]
    public let items: [Item]

    public func items(in category: Category) -> [Item] { items.filter { $0.categoryId == category.id } }
}

/// الأذكار: التصنيفات ثم أذكار التصنيف بعدّاد لمس لكل ذكر.
public struct AdhkarScreen: ScreenTemplate {
    public static let id = "adhkar"
    public static let title = "الأذكار"
    public static let source = ContentSource.bundled(name: "adhkar", subdirectory: "data")

    let content: AdhkarBundle
    public init(content: AdhkarBundle) { self.content = content }

    public var body: some View {
        List(content.categories) { category in
            NavigationLink {
                AdhkarListView(category: category, items: content.items(in: category))
            } label: {
                SunnahListRow(title: category.name, subtitle: category.description)
            }
            .listRowBackground(Sunnah.Colors.surface)
        }
        .listStyle(.plain).scrollContentBackground(.hidden).background(Sunnah.Colors.bg)
    }
}

struct AdhkarListView: View {
    let category: AdhkarBundle.Category
    let items: [AdhkarBundle.Item]
    @State private var done: [String: Int] = [:]

    var body: some View {
        ScrollView {
            LazyVStack(spacing: Sunnah.Spacing.s3) {
                ForEach(items) { item in
                    let taps = done[item.id, default: 0]
                    Button { if taps < item.count { done[item.id] = taps + 1 } } label: {
                        SunnahCard {
                            VStack(alignment: .leading, spacing: Sunnah.Spacing.s2) {
                                Text(item.text).font(Sunnah.Typography.body).foregroundStyle(Sunnah.Colors.textPrimary)
                                if let source = item.source ?? item.reference {
                                    Text(source).font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.textSecondary)
                                }
                                Text("\(taps) / \(item.count)").font(Sunnah.Typography.tag)
                                    .foregroundStyle(taps >= item.count ? Sunnah.Colors.primary : Sunnah.Colors.textSecondary)
                            }
                        }
                    }.buttonStyle(.plain)
                }
            }.padding(Sunnah.Spacing.pageX)
        }
        .background(Sunnah.Colors.bg)
        .navigationTitle(category.name)
    }
}
