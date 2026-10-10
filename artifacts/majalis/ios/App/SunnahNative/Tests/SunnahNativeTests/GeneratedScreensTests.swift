import XCTest
@testable import SunnahNative

@MainActor
final class GeneratedScreensTests: XCTestCase {
    func testNonParamRoutesRegister() {
        let registry = TemplateRegistry()
        GeneratedScreens.registerAll(in: registry)
        for id in ["hadith", "knowledge", "knowledge.topics", "lessons", "fiqh.topics", "qa", "stories", "quizzes", "search"] {
            XCTAssertNotNil(registry.view(for: id), id)
        }
    }

    func testParamRoutesResolve() {
        for p in ["/hadith/5", "/lessons/3/audio", "/lessons/3", "/knowledge/topics/7", "/qa/9"] {
            XCTAssertNotNil(GeneratedScreens.resolve(path: p), p)
        }
        XCTAssertNil(GeneratedScreens.resolve(path: "/prayer-times"))
        XCTAssertNil(GeneratedScreens.resolve(path: "/hadith/5/extra"))
    }
}
