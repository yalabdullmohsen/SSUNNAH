import XCTest
@testable import SunnahNative

final class ContentLoaderTests: XCTestCase {
    struct Sample: Decodable, Sendable, Equatable { let a: Int }

    func testMissingBundledFileThrows() async {
        do {
            _ = try await ContentLoader(bundle: Bundle(for: Self.self)).load(Sample.self, from: .bundled(name: "nope"))
            XCTFail("expected throw")
        } catch {
            XCTAssertEqual(error as? ContentError, .missingBundledFile("nope"))
        }
    }

    func testRemoteWithoutStoreThrows() async {
        do {
            _ = try await ContentLoader().load(Sample.self, from: .remote(path: "/x"))
            XCTFail("expected throw")
        } catch {
            XCTAssertEqual(error as? ContentError, .noStore)
        }
    }

    func testNativeRoutePath() {
        XCTAssertEqual(Route.native(id: "adhkar").path, "/native/adhkar")
    }
}
