import XCTest

/// حارس «لا آية بخط النظام»: لا `Text(...)` عادي يعرض نصًا قرآنيًا (﴿ ﴾ أو نص آية من المصدر) خارج `QuranAyahText`/`MushafAyahText`.
/// سقف ratchet للمخالفين الحاليين فقط؛ يُخفَّض ولا يُرفع.
final class QuranTextOnlyViaComponentGuardTests: XCTestCase {
    static let allowed: [String: Int] = [
        "Sections/quran/TafsirScreens+Native.swift": 1,   // رقم الآية بين قوسين في صف التفسير
        "Mushaf/MushafTafsirView.swift": 1,               // الصف نفسه داخل المصحف
    ]

    private var sources: URL {
        URL(fileURLWithPath: #filePath).deletingLastPathComponent().deletingLastPathComponent().deletingLastPathComponent()
            .appendingPathComponent("Sources/SunnahNative")
    }

    static func isViolation(_ line: String) -> Bool {
        let t = line.trimmingCharacters(in: .whitespaces)
        guard !t.hasPrefix("//"), line.range(of: #"(^|[^A-Za-z])Text\("#, options: .regularExpression) != nil else { return false }
        return line.contains("﴿") || line.contains("﴾") || line.contains("ayahText(") || line.contains("QuranDisplayText")
    }

    func testNoPlainTextForQuran() throws {
        let en = try XCTUnwrap(FileManager.default.enumerator(at: sources, includingPropertiesForKeys: nil))
        var found: [String: Int] = [:]
        for case let url as URL in en where url.pathExtension == "swift" {
            let rel = String(url.path.dropFirst(sources.path.count + 1))
            if rel == "Mushaf/QuranAyahText.swift" || rel == "Mushaf/MushafAyahText.swift" { continue }
            let n = ((try? String(contentsOf: url, encoding: .utf8)) ?? "").split(separator: "\n").filter { Self.isViolation(String($0)) }.count
            if n > 0 { found[rel] = n }
        }
        for (rel, n) in found.sorted(by: { $0.key < $1.key }) {
            XCTAssertLessThanOrEqual(n, Self.allowed[rel] ?? 0, "\(rel): Text عادي لنص قرآني — استعملي QuranAyahText")
        }
        for (rel, cap) in Self.allowed where (found[rel] ?? 0) < cap { XCTFail("\(rel): انخفضت المخالفات — اخفضي السقف") }
    }

    func testDetectorCatchesViolations() {
        XCTAssertTrue(Self.isViolation(#"Text("﴿\(t)﴾")"#))
        XCTAssertTrue(Self.isViolation("Text(search.ayahText(key) ?? \"\")"))
        XCTAssertFalse(Self.isViolation("// Text(\"﴿x﴾\")"))
        XCTAssertFalse(Self.isViolation("Text(\"الفاتحة\")"))
    }
}
