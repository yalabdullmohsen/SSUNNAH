import Foundation
import SwiftUI

/// نماذج المحتوى التي تستهلكها القوالب. التنفيذ الحقيقي (الشبكة/الكاش) من طبقة بيانات ن3؛ القوالب لا تعرف غير هذا البروتوكول.
public struct ContentItem: Identifiable, Hashable, Sendable {
    public let id: String
    public let title: String
    public var subtitle: String?
    public var body: String?
    public var tags: [String]
    public var audioURL: URL?
    public var route: String?
    public init(id: String, title: String, subtitle: String? = nil, body: String? = nil, tags: [String] = [], audioURL: URL? = nil, route: String? = nil) {
        self.id = id; self.title = title; self.subtitle = subtitle; self.body = body
        self.tags = tags; self.audioURL = audioURL; self.route = route
    }
}

public struct QuizQuestion: Identifiable, Hashable, Sendable {
    public let id: String
    public let prompt: String
    public let options: [String]
    public let answerIndex: Int
    public var explanation: String?
    public init(id: String, prompt: String, options: [String], answerIndex: Int, explanation: String? = nil) {
        self.id = id; self.prompt = prompt; self.options = options; self.answerIndex = answerIndex; self.explanation = explanation
    }
}

public struct SectionLink: Identifiable, Hashable, Sendable {
    public let id: String
    public let title: String
    public var subtitle: String?
    public let route: String
    public init(id: String, title: String, subtitle: String? = nil, route: String) {
        self.id = id; self.title = title; self.subtitle = subtitle; self.route = route
    }
}

public protocol ContentRepository: Sendable {
    func items(section: String) async throws -> [ContentItem]
    func item(section: String, id: String) async throws -> ContentItem
    func search(section: String?, query: String) async throws -> [ContentItem]
    func quiz(section: String) async throws -> [QuizQuestion]
    func links(section: String) async throws -> [SectionLink]
}

private struct ContentRepositoryKey: EnvironmentKey {
    static let defaultValue: (any ContentRepository)? = nil
}

public extension EnvironmentValues {
    /// يُحقن من جذر التطبيق (طبقة بيانات ن3). غيابه يُظهر حالة خطأ لا انهيارًا.
    var contentRepository: (any ContentRepository)? {
        get { self[ContentRepositoryKey.self] }
        set { self[ContentRepositoryKey.self] = newValue }
    }
}

public enum ContentError: Error { case noRepository }

/// حالة تحميل موحّدة للقوالب.
public enum LoadState<Value> {
    case loading, loaded(Value), failed
}
