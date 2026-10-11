import Foundation

/// قواعد النشر منقولة كما هي من src/lib/fiqh-books.ts (isPublishedLesson/Chapter/Book):
/// ما لا يجتازها لا يُعرض. المحجوز (content-hold.json) يُستبعد في التصدير قبل التحزيم.
enum FiqhVisibility {
    static func filled(_ s: String?) -> Bool { !(s?.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty ?? true) }

    static func sourcesComplete(_ sources: [FiqhSource]?) -> Bool {
        guard let sources, !sources.isEmpty else { return false }
        return sources.allSatisfy { filled($0.book) && filled($0.author) && filled($0.ref) }
    }

    static func isPublished(_ lesson: FiqhLesson) -> Bool {
        lesson.status == "published" && lesson.needsReview != true
            && filled(lesson.bookId) && filled(lesson.chapterId)
            && filled(lesson.summary) && filled(lesson.evidence) && filled(lesson.preferred)
            && sourcesComplete(lesson.sources)
    }

    static func publishedLessons(_ chapter: FiqhChapter) -> [FiqhLesson] {
        chapter.lessons.filter(isPublished)
    }

    static func isPublished(_ chapter: FiqhChapter) -> Bool {
        let topics = chapter.topics ?? []
        return (chapter.status ?? "published") == "published"
            && filled(chapter.definition) && filled(chapter.summary) && filled(chapter.evidence) && filled(chapter.notes)
            && !topics.isEmpty && topics.allSatisfy { filled($0) }
            && sourcesComplete(chapter.sources)
            && !publishedLessons(chapter).isEmpty
    }

    static func publishedChapters(_ book: FiqhBook) -> [FiqhChapter] {
        book.chapters.filter(isPublished).sorted { ($0.order ?? 0) < ($1.order ?? 0) }
    }

    static func isPublished(_ book: FiqhBook) -> Bool {
        (book.status ?? "published") == "published"
            && filled(book.description) && filled(book.orderReason)
            && sourcesComplete(book.sources)
            && !publishedChapters(book).isEmpty
    }

    /// جُمل قالبية لا تحمل معلومة؛ تُخفى عند العرض كما في stripFiqhTemplate دون المساس بالمخزَّن.
    private static let templateSentences = [
        "وعمل أهل العلم في المذهب الحنبلي جارٍ على الجمع بين النص وفقه الإمام أحمد رحمه الله\\.?",
        "مع مراعاة قواعد المذهب الحنبلي في الجمع بين النص والفقه\\.?",
        "يُعرض الأدب هنا على طريقة فقهاء الحنابلة مع الاستناد إلى النصوص(?:،? دون اختراع أحكام)?\\.?",
    ]

    static func stripTemplate(_ text: String?) -> String {
        var out = text ?? ""
        for pattern in templateSentences {
            out = out.replacingOccurrences(of: pattern, with: "", options: .regularExpression)
        }
        out = out.replacingOccurrences(of: "[ \\t]{2,}", with: " ", options: .regularExpression)
        return out.trimmingCharacters(in: .whitespacesAndNewlines)
    }
}

extension FiqhCatalog {
    /// الكتب المنشورة بترتيبها.
    var publishedBooks: [FiqhBook] {
        books.filter(FiqhVisibility.isPublished).sorted { ($0.order ?? 0) < ($1.order ?? 0) }
    }

    /// يحلّ المعرّف أو الاسم البديل (resolveFiqhBookId) ثم يعيد الكتاب إن كان له باب منشور.
    func visibleBook(_ idOrAlias: String, aliases: [FiqhBookAlias] = []) -> FiqhBook? {
        let id = books.contains { $0.id == idOrAlias } ? idOrAlias : (aliases.first { $0.aliasId == idOrAlias }?.targetBookId ?? idOrAlias)
        guard let book = books.first(where: { $0.id == id }), !FiqhVisibility.publishedChapters(book).isEmpty else { return nil }
        return book
    }

    func visibleChapter(book bookId: String, chapter chapterId: String, aliases: [FiqhBookAlias] = []) -> (FiqhBook, FiqhChapter)? {
        guard let book = visibleBook(bookId, aliases: aliases),
              let chapter = FiqhVisibility.publishedChapters(book).first(where: { $0.id == chapterId }) else { return nil }
        return (book, chapter)
    }

    /// المسألة تُطلب بمعرّف الكتاب ومعرّفها (/fiqh/books/:bookId/lessons/:lessonId)؛ يُبحث في الأبواب المنشورة فقط.
    func visibleLesson(book bookId: String, lesson lessonId: String, aliases: [FiqhBookAlias] = []) -> (FiqhBook, FiqhChapter, FiqhLesson)? {
        guard let book = visibleBook(bookId, aliases: aliases) else { return nil }
        for chapter in FiqhVisibility.publishedChapters(book) {
            if let lesson = FiqhVisibility.publishedLessons(chapter).first(where: { $0.id == lessonId }) {
                return (book, chapter, lesson)
            }
        }
        return nil
    }
}
