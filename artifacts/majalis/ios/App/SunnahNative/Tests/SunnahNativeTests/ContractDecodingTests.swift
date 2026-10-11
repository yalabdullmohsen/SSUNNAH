import XCTest
@testable import SunnahNative

final class ContractDecodingTests: XCTestCase {
    private func decode<T: Decodable>(_ json: String) throws -> T {
        try JSONDecoder().decode(T.self, from: Data(json.utf8))
    }

    func testStoryShape() throws {
        let i: ContentItem = try decode(#"{"id":7,"slug":"s","title":"قصة","category":"سير","summary":"ملخص","full_content":"نص","tags":["a"]}"#)
        XCTAssertEqual(i.id, "7"); XCTAssertEqual(i.title, "قصة"); XCTAssertEqual(i.subtitle, "ملخص"); XCTAssertEqual(i.body, "نص")
    }

    func testQAShape() throws {
        let i: ContentItem = try decode(#"{"id":"q1","question":"س؟","answer":"ج","category_id":"c"}"#)
        XCTAssertEqual(i.title, "س؟"); XCTAssertEqual(i.body, "ج")
    }

    func testQuizShapeWithoutOptions() throws {
        let q: QuizQuestion = try decode(#"{"id":"x","question":"س؟","answer":"ج","explanation":"ش"}"#)
        XCTAssertEqual(q.prompt, "س؟"); XCTAssertEqual(q.options[q.answerIndex], "ج"); XCTAssertEqual(q.explanation, "ش")
    }

    func testQuizShapeWithOptions() throws {
        let q: QuizQuestion = try decode(#"{"id":"x","question":"س؟","options":["أ","ب"],"answer":"ب"}"#)
        XCTAssertEqual(q.answerIndex, 1)
    }
}
