import XCTest
@testable import SunnahNative

/// قرار يوسف (DATA_CONTRACT §5.2): الضعيف والموضوع يظهران في شاشتيهما بوسمهما فقط، ويُستبعدان من كل ما عداهما.
final class WeakHadithTests: XCTestCase {
    private var repoRoot: URL {
        var u = URL(fileURLWithPath: #filePath)
        while u.path != "/", !FileManager.default.fileExists(atPath: u.appendingPathComponent("ios-native/Data/hadith").path) { u.deleteLastPathComponent() }
        return u
    }
    private func load(_ n: String) throws -> [WeakHadithItem] {
        try JSONDecoder().decode([WeakHadithItem].self, from: Data(contentsOf: repoRoot.appendingPathComponent("ios-native/Data/hadith/\(n).json")))
    }

    func testWeakFilesAreLabelledAndPendingReview() throws {
        for (f, cls, label) in [("weak-daif", "daif", "ضعيف"), ("weak-mawdu", "mawdu", "موضوع")] {
            let items = try load(f)
            XCTAssertFalse(items.isEmpty)
            for h in items {
                XCTAssertEqual(h.authenticityClass, cls); XCTAssertEqual(h.label, label)
                XCTAssertEqual(h.reviewStatus, "pending_review")
                if !h.hidden { XCTAssertFalse(h.muhaddith.isEmpty); XCTAssertFalse(h.sourceName.isEmpty) }
            }
        }
    }

    func testShareTextAlwaysCarriesGradeAndMuhaddith() throws {
        let h = try XCTUnwrap(try load("weak-daif").first)
        XCTAssertTrue(h.shareText.contains(h.text)); XCTAssertTrue(h.shareText.contains(h.grade))
        XCTAssertTrue(h.shareText.contains(h.muhaddith)); XCTAssertTrue(h.shareText.contains(h.sourceName))
    }

    func testVerifiedSahihContainsOnlySahih() throws {
        let d = try Data(contentsOf: repoRoot.appendingPathComponent("ios-native/Data/hadith/verified-sahih.json"))
        let rows = try XCTUnwrap(JSONSerialization.jsonObject(with: d) as? [[String: Any]])
        XCTAssertFalse(rows.contains { ($0["authenticity_class"] as? String) != "sahih" })
    }

    /// لا يقرأ ملفي الضعيف/الموضوع إلا الشاشتان (ويدجت، حديث اليوم، إشعارات، اقتراح عشوائي: خارج النطاق).
    func testWeakFilesReferencedOnlyByTheirScreens() throws {
        let fm = FileManager.default
        let dirs = ["artifacts/majalis/ios/App/SunnahNative/Sources", "ios-native/SunnahApp", "ios-native/Sources", "ios-native/PrayerWidgetResources"]
        var offenders: [String] = []
        for d in dirs {
            guard let en = fm.enumerator(at: repoRoot.appendingPathComponent(d), includingPropertiesForKeys: nil) else { continue }
            for case let u as URL in en where u.pathExtension == "swift" {
                let name = u.lastPathComponent
                if name == "HadithScreens.swift" || name == "WeakHadithScreens.swift" { continue }
                let s = (try? String(contentsOf: u, encoding: .utf8)) ?? ""
                if s.contains("weak-daif") || s.contains("weak-mawdu") || s.contains("WeakHadithItem") { offenders.append(name) }
            }
        }
        XCTAssertEqual(offenders, [])
    }

    /// انحدار: التنقل بين /hadith/daif و/hadith/mawdu بالاتجاهين يعرض عناصر حكم الملف المفتوح فقط.
    func testVisibleRowsMatchOpenedFileInBothDirections() throws {
        let daif = try load("weak-daif"), mawdu = try load("weak-mawdu")
        for (file, cls, own, other) in [("weak-daif", "daif", daif, mawdu), ("weak-mawdu", "mawdu", mawdu, daif)] {
            let rows = WeakHadithListView.visibleRows(own, file: file, normalizedQuery: "")
            XCTAssertFalse(rows.isEmpty); XCTAssertTrue(rows.allSatisfy { $0.authenticityClass == cls })
            XCTAssertTrue(WeakHadithListView.visibleRows(other, file: file, normalizedQuery: "").isEmpty, "بيانات ملف آخر ظهرت تحت \(file)")
        }
    }

    /// انحدار جذري: أي `.task`/`.onAppear` يحمّل بحسب معامل (file/id/slug/source/name…) في شاشة تحمل معاملًا يجب أن يكون `.task(id:)`،
    /// وإلا بقيت بيانات المعامل القديم عند إعادة استخدام العرض (حالة «الموضوعة» تعرض الضعيف).
    func testParameterisedLoadersKeyTheirTaskOnTheParameter() throws {
        let src = repoRoot.appendingPathComponent("artifacts/majalis/ios/App/SunnahNative/Sources/SunnahNative")
        let files = FileManager.default.enumerator(at: src, includingPropertiesForKeys: nil)!.compactMap { $0 as? URL }.filter { $0.pathExtension == "swift" }
        let param = try NSRegularExpression(pattern: #"^    (?:public )?let (file|id|slug|name|source|surahId|book|item|key): "#)
        // المستثنى: Templates/AudioPlayerTemplate (onAppear لإنشاء المحرّك مرة، لا تحميل بيانات) وMushafReaderView (visit للتتبّع).
        let allowed = ["AudioPlayerTemplate.swift", "MushafReaderView.swift"]
        var bad: [String] = []
        for f in files where !allowed.contains(f.lastPathComponent) {
            var hasParam = false
            for (n, line) in (try String(contentsOf: f, encoding: .utf8)).components(separatedBy: "\n").enumerated() {
                if line.hasPrefix("struct ") || line.hasPrefix("public struct ") || line.hasPrefix("final class ") { hasParam = false }
                if param.firstMatch(in: line, range: NSRange(line.startIndex..., in: line)) != nil { hasParam = true }
                if hasParam, line.contains(".task {") || line.contains(".task { ") { bad.append("\(f.lastPathComponent):\(n + 1)") }
            }
        }
        XCTAssertTrue(bad.isEmpty, "`.task` بلا id في شاشات ذات معامل: \(bad)")
    }
}
