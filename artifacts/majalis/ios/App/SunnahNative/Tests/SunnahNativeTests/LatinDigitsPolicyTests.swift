import XCTest
import SunnahDataKit
@testable import SunnahNative

/// النموذج ٢ (قرار المالك 2026-10-18): أرقام عربية-هندية موحّدة. يفشل إن ظهر رقم فارسي (۰-۹) في مصدر التطبيق.
final class LatinDigitsPolicyTests: XCTestCase {
    func testNoEasternArabicDigitsInSourceStringLiterals() throws {
        let root = URL(fileURLWithPath: #filePath)
            .deletingLastPathComponent().deletingLastPathComponent().deletingLastPathComponent()
            .appendingPathComponent("Sources")
        let digits = CharacterSet(charactersIn: "۰۱۲۳۴۵۶۷۸۹")
        var offenders: [String] = []
        let en = FileManager.default.enumerator(at: root, includingPropertiesForKeys: nil)!
        for case let url as URL in en where url.pathExtension == "swift" {
            let s = try String(contentsOf: url, encoding: .utf8)
            for (i, line) in s.components(separatedBy: "\n").enumerated() {
                let t = line.trimmingCharacters(in: .whitespaces)
                if t.hasPrefix("//") || t.hasPrefix("///") { continue }
                if t.contains("۰۱۲۳۴۵۶۷۸۹") || t.contains("replacingOccurrences") || t.contains("MawarithStep(") { continue }   // محلّلات إدخال/جداول التحويل
                if line.unicodeScalars.contains(where: { digits.contains($0) }) {
                    offenders.append("\(url.lastPathComponent):\(i + 1)")
                }
            }
        }
        XCTAssertTrue(offenders.isEmpty, "أرقام فارسية: \(offenders.prefix(20))")
    }
}

final class LatinDigitsHelperTests: XCTestCase {
    func testConvertsLatinAndPersianToArabicIndic() {
        XCTAssertEqual("2 فأكثر ۱۲ و3".asArabicDigits, "٢ فأكثر ١٢ و٣")
    }
}

final class LatinDigitsDataTests: XCTestCase {
    struct Row: Decodable, Sendable { let t: String }

    func testDataConversionKeepsLetters() {
        let raw = Data("{\"t\":\"رواه البخاري ٢٣٠٠ و۲۵٫٥ ﴿آية﴾\",\"n\":12}".utf8)
        let s = String(data: raw.asLatinDigitsJSON, encoding: .utf8)
        XCTAssertEqual(s, "{\"t\":\"رواه البخاري ٢٣٠٠ و٢٥٫٥ ﴿آية﴾\",\"n\":12}")
    }

    func testLoaderConvertsBundledButNotMushaf() async throws {
        let root = FileManager.default.temporaryDirectory.appendingPathComponent("latin-\(UUID().uuidString)")
        for dir in ["Data/x", "Data/mushaf"] {
            try FileManager.default.createDirectory(at: root.appendingPathComponent(dir), withIntermediateDirectories: true)
            try Data("{\"t\":\"٣\"}".utf8).write(to: root.appendingPathComponent("\(dir)/f.json"))
        }
        let loader = ContentLoader(bundle: Bundle(path: root.path)!)
        let x = try await loader.load(Row.self, from: .bundled(name: "f", subdirectory: "Data/x"))
        let m = try await loader.load(Row.self, from: .bundled(name: "f", subdirectory: "Data/mushaf"))
        XCTAssertEqual(x.t, "٣")
        XCTAssertEqual(m.t, "٣")
    }

    func testLoaderConvertsRemoteData() async throws {
        let dir = FileManager.default.temporaryDirectory.appendingPathComponent("latin-r-\(UUID().uuidString)")
        defer { try? FileManager.default.removeItem(at: dir) }
        let up = ClosureTransport { _, _ in Data("{\"t\":\"درس ٣ من ۱۲ في ٢٫٥\"}".utf8) }
        let loader = ContentLoader(store: DataStore(transport: up, cache: DiskCache(directory: dir)))
        let r = try await loader.load(Row.self, from: .remote(path: "/api/r", maxAge: 0))
        XCTAssertEqual(r.t, "درس ٣ من ١٢ في ٢٫٥")
        let again = try await loader.load(Row.self, from: .remote(path: "/api/r", maxAge: 3600))
        XCTAssertEqual(again.t, "درس ٣ من ١٢ في ٢٫٥")
    }
}
