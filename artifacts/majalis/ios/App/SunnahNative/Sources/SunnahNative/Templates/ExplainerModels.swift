import Foundation

/// مصدر في الشروح؛ نص العرض بقواعد docs/native/SOURCES_FIELD.md ({author,book,locator} أو {ref} أو {title}).
struct ExplainerSource: Decodable, Hashable, Sendable {
    var author: String?, book: String?, locator: String?, ref: String?, title: String?
    var display: String {
        let parts: [String?] = ref != nil ? [author, book, ref] : (book != nil ? [author, book, locator] : [title, author])
        return parts.compactMap { $0 }.filter { !$0.isEmpty }.joined(separator: "، ")
    }
}

struct ExplainerView: Decodable, Hashable, Sendable { let text: String; let source: ExplainerSource }

struct ExplainerAyahRef: Decodable, Hashable, Sendable { let surah: Int; let from: Int; let to: Int }

struct ExplainerStageData: Decodable, Identifiable, Hashable, Sendable {
    let id: String
    let order: Int
    let title: String
    let body: String
    var ayahRef: [ExplainerAyahRef]?
    var sources: [ExplainerSource]?
    var views: [ExplainerView]?
    var illustrationBrief: String?
}

struct ExplainerData: Decodable, Identifiable, Hashable, Sendable {
    let id: String
    let title: String
    var scopeNote: String?
    var stages: [ExplainerStageData]
    enum CodingKeys: String, CodingKey { case id, title, stages, scopeNote = "scope_note" }

    /// الموثَّق فقط: كل مرحلة بمصدر واحد على الأقل، مرتّبة بـ`order`.
    var displayable: ExplainerData? {
        let ok = stages.filter { !($0.sources ?? []).filter { !$0.display.isEmpty }.isEmpty }.sorted { $0.order < $1.order }
        return ok.isEmpty ? nil : ExplainerData(id: id, title: title, scopeNote: scopeNote, stages: ok)
    }
}
