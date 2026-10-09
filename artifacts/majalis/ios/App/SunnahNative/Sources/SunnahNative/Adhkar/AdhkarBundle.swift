import Foundation

/// حزمة الأذكار المضمَّنة (Resources/adhkar.json) — مولَّدة من adhkar-seed على الويب
/// بـ`scripts/export-native-adhkar.mjs`، ويمنع check-data-integrity انحرافها عن المصدر.
public struct AdhkarBundle: Decodable, Equatable {
    public struct Category: Decodable, Equatable, Identifiable {
        public let id: String
        public let name: String
        public let slug: String
        public let description: String
    }

    public struct Item: Decodable, Equatable, Identifiable {
        public let id: String
        public let categoryId: String
        public let text: String
        public let count: Int
        public let source: String
        public let grade: String
        public let reference: String?
    }

    public let categories: [Category]
    public let items: [Item]

    public static let shared: AdhkarBundle = {
        guard let url = Bundle.module.url(forResource: "adhkar", withExtension: "json"),
              let data = try? Data(contentsOf: url),
              let bundle = try? JSONDecoder().decode(AdhkarBundle.self, from: data)
        else { return AdhkarBundle(categories: [], items: []) }
        return bundle
    }()

    public func category(slug: String) -> Category? {
        categories.first { $0.slug == slug }
    }

    public func items(in category: Category) -> [Item] {
        items.filter { $0.categoryId == category.id }
    }
}

public enum AdhkarRoute {
    public static let root = "/adhkar"

    public static func path(slug: String) -> String { "\(root)/\(slug)" }

    /// `/adhkar/<slug>` → slug؛ nil لغير ذلك.
    public static func slug(from path: String) -> String? {
        let base = Route.normalize(path).split(separator: "?").first.map(String.init) ?? ""
        let parts = base.split(separator: "/")
        guard parts.count == 2, parts[0] == "adhkar" else { return nil }
        return String(parts[1])
    }
}
