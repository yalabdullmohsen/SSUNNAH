import XCTest
@testable import SunnahNative

final class GeneratedScreensTests: XCTestCase {
    func testKnownPathsResolve() {
        for p in ["/hadith", "/hadith/5", "/lessons/3/audio", "/quizzes", "/search", "/knowledge", "/qa/9"] {
            XCTAssertNotNil(GeneratedScreens.resolve(path: p, open: { _ in }), p)
        }
    }

    func testUnknownPathIsNil() {
        XCTAssertNil(GeneratedScreens.resolve(path: "/prayer-times", open: { _ in }))
        XCTAssertNil(GeneratedScreens.resolve(path: "/hadith/5/extra", open: { _ in }))
    }
}
