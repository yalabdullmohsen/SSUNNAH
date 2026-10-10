import SwiftUI

/// نماذج المحتوى التي تفكّها القوالب من JSON (ContentLoader/ContentSource من طبقة ن3).
public struct ContentItem: Identifiable, Hashable, Sendable, Decodable {
    public let id: String
    public let title: String
    public var subtitle: String?
    public var body: String?
    public var tags: [String]
    public var audioURL: URL?
    public var route: String?

    private enum CodingKeys: String, CodingKey { case id, title, subtitle, body, tags, audioURL, route }

    public init(id: String, title: String, subtitle: String? = nil, body: String? = nil, tags: [String] = [], audioURL: URL? = nil, route: String? = nil) {
        self.id = id; self.title = title; self.subtitle = subtitle; self.body = body
        self.tags = tags; self.audioURL = audioURL; self.route = route
    }

    public init(from decoder: Decoder) throws {
        let c = try decoder.container(keyedBy: CodingKeys.self)
        id = try c.decode(String.self, forKey: .id)
        title = try c.decode(String.self, forKey: .title)
        subtitle = try c.decodeIfPresent(String.self, forKey: .subtitle)
        body = try c.decodeIfPresent(String.self, forKey: .body)
        tags = try c.decodeIfPresent([String].self, forKey: .tags) ?? []
        audioURL = try c.decodeIfPresent(URL.self, forKey: .audioURL)
        route = try c.decodeIfPresent(String.self, forKey: .route)
    }
}

public struct QuizQuestion: Identifiable, Hashable, Sendable, Decodable {
    public let id: String
    public let prompt: String
    public let options: [String]
    public let answerIndex: Int
    public var explanation: String?
    public init(id: String, prompt: String, options: [String], answerIndex: Int, explanation: String? = nil) {
        self.id = id; self.prompt = prompt; self.options = options; self.answerIndex = answerIndex; self.explanation = explanation
    }
}

public struct SectionLink: Identifiable, Hashable, Sendable, Decodable {
    public let id: String
    public let title: String
    public var subtitle: String?
    public let route: String
    public init(id: String, title: String, subtitle: String? = nil, route: String) {
        self.id = id; self.title = title; self.subtitle = subtitle; self.route = route
    }
}

private struct OpenRouteKey: EnvironmentKey {
    static let defaultValue: (String) -> Void = { _ in }
}

public extension EnvironmentValues {
    /// يفتح مسارًا من داخل قالب؛ يُحقن من جذر التطبيق (AppRouter).
    var openRoute: (String) -> Void {
        get { self[OpenRouteKey.self] }
        set { self[OpenRouteKey.self] = newValue }
    }
}

extension ContentItem {
    /// مسار فتح العنصر: route الصريح أو قاعدة التفاصيل + المعرّف.
    func path(base: String) -> String { route ?? base + "/" + id }
}
