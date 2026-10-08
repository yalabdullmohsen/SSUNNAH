import XCTest
@testable import SunnahWidgetKit

final class WidgetSchemaTests: XCTestCase {
    func testSchemaVersionIsPositive() {
        XCTAssertGreaterThan(WidgetSchema.version, 0)
    }
}
