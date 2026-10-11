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

    public init(id: String, title: String, subtitle: String? = nil, body: String? = nil, tags: [String] = [], audioURL: URL? = nil, route: String? = nil) {
        self.id = id; self.title = title; self.subtitle = subtitle; self.body = body
        self.tags = tags; self.audioURL = audioURL; self.route = route
    }

    /// يقبل شكل DATA_CONTRACT: id نصيًا أو رقميًا؛ العنوان title|question|titleAr|title_ar؛
    /// النص body|full_content|answer|text؛ الوصف subtitle|summary|category.
    private struct AnyKey: CodingKey {
        var stringValue: String; var intValue: Int? { nil }
        init?(stringValue: String) { self.stringValue = stringValue }
        init?(intValue: Int) { return nil }
    }

    public init(from decoder: Decoder) throws {
        let c = try decoder.container(keyedBy: AnyKey.self)
        func str(_ keys: [String]) -> String? {
            for k in keys {
                guard let key = AnyKey(stringValue: k) else { continue }
                if let v = try? c.decodeIfPresent(String.self, forKey: key), !v.isEmpty { return v }
            }
            return nil
        }
        if let key = AnyKey(stringValue: "id"), let i = try? c.decode(Int.self, forKey: key) { id = String(i) }
        else if let v = str(["id", "slug"]) { id = v }
        else { throw DecodingError.keyNotFound(AnyKey(stringValue: "id")!, .init(codingPath: c.codingPath, debugDescription: "id")) }
        guard let t = str(["title", "question", "titleAr", "title_ar", "nameAr"]) else {
            throw DecodingError.keyNotFound(AnyKey(stringValue: "title")!, .init(codingPath: c.codingPath, debugDescription: "title"))
        }
        title = t
        subtitle = str(["subtitle", "summary", "summary_ar", "category"])
        body = str(["body", "full_content", "answer", "text", "description"])
        tags = (AnyKey(stringValue: "tags").flatMap { try? c.decodeIfPresent([String].self, forKey: $0) } ?? nil) ?? []
        audioURL = str(["audioURL", "audio_url"]).flatMap(URL.init(string:))
        route = str(["route"])
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

    /// سؤال مفتوح: لا مشتّتات، فيُعرض الجواب ثم يقيّم المستخدم نفسه (عرفتها/لم أعرفها).
    public var isOpen: Bool { options.count <= 1 }

    private enum CodingKeys: String, CodingKey { case id, prompt, question, options, choices, answerIndex, answer, explanation }

    /// العقد: `{id, question, answer, explanation?}` بلا خيارات؛ نقبل options|choices إن وُجدت،
    /// وإلا يكون الجواب الخيار الوحيد (المشتّتات تُولَّد في طبقة البيانات لا هنا).
    public init(from decoder: Decoder) throws {
        let c = try decoder.container(keyedBy: CodingKeys.self)
        id = try c.decode(String.self, forKey: .id)
        prompt = try c.decodeIfPresent(String.self, forKey: .prompt) ?? c.decode(String.self, forKey: .question)
        explanation = try c.decodeIfPresent(String.self, forKey: .explanation)
        let answer = try c.decodeIfPresent(String.self, forKey: .answer)
        var opts = try c.decodeIfPresent([String].self, forKey: .options) ?? c.decodeIfPresent([String].self, forKey: .choices) ?? []
        if let i = try c.decodeIfPresent(Int.self, forKey: .answerIndex) {
            answerIndex = i
        } else if let answer {
            if let i = opts.firstIndex(of: answer) { answerIndex = i } else { opts.append(answer); answerIndex = opts.count - 1 }
        } else {
            answerIndex = 0
        }
        options = opts
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
