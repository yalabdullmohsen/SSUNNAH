import XCTest
@testable import SunnahNative

/// حارس: لا HStack يرصّ أزرار `SunnahButton` متجاورة خارج `SunnahActionRow`.
final class ActionRowGuardTests: XCTestCase {
    func testNoHStackOfSunnahButtonsOutsideActionRow() throws {
        var root = URL(fileURLWithPath: #filePath)
        for _ in 0..<8 { root.deleteLastPathComponent() }
        let src = root.appendingPathComponent("artifacts/majalis/ios/App/SunnahNative/Sources/SunnahNative")
        let en = try XCTUnwrap(FileManager.default.enumerator(at: src, includingPropertiesForKeys: nil))
        for case let url as URL in en where url.pathExtension == "swift" {
            let lines = try String(contentsOf: url, encoding: .utf8).components(separatedBy: "\n")
            for (i, line) in lines.enumerated() where line.contains("HStack") && line.contains("{") {
                let indent = line.prefix { $0 == " " }.count
                var buttons = 0
                for next in lines.dropFirst(i + 1) {
                    let ind = next.prefix { $0 == " " }.count
                    if !next.trimmingCharacters(in: .whitespaces).isEmpty && ind <= indent { break }
                    if next.contains("SunnahButton(") { buttons += 1 }
                }
                XCTAssertLessThan(buttons, 2, "\(url.lastPathComponent):\(i + 1) HStack بأزرار متجاورة — استعمل SunnahActionRow")
            }
        }
    }
}
