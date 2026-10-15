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

    private func approved(_ items: [WeakHadithItem]) -> [WeakHadithItem] {
        items.map { var h = $0; h.reviewStatus = "approved"; h.hidden = false; return h }
    }

    /// انحدار: التنقل بين /hadith/daif و/hadith/mawdu بالاتجاهين يعرض عناصر حكم الملف المفتوح فقط (على نسخ معتمدة تركيبية).
    func testVisibleRowsMatchOpenedFileInBothDirections() throws {
        let daif = approved(try load("weak-daif")), mawdu = approved(try load("weak-mawdu"))
        for (file, cls, own, other) in [("weak-daif", "daif", daif, mawdu), ("weak-mawdu", "mawdu", mawdu, daif)] {
            let rows = WeakHadithListView.visibleRows(own, file: file, normalizedQuery: "")
            XCTAssertFalse(rows.isEmpty); XCTAssertTrue(rows.allSatisfy { $0.authenticityClass == cls })
            XCTAssertTrue(WeakHadithListView.visibleRows(other, file: file, normalizedQuery: "").isEmpty, "بيانات ملف آخر ظهرت تحت \(file)")
        }
    }

    /// قاعدة المالك: لا يظهر ضعيف ولا موضوع قبل اعتماده — لا في القائمة ولا في البحث، وأي حالة غير `approved` تُخفى.
    func testNothingUnapprovedIsEverVisible() throws {
        for (file, _, _) in [("weak-daif", 0, 0), ("weak-mawdu", 0, 0)] {
            let items = try load(file)
            let pending = items.filter { $0.reviewStatus != "approved" }
            XCTAssertFalse(pending.isEmpty)
            XCTAssertTrue(items.filter(\.isApproved).allSatisfy { $0.reviewStatus == "approved" })
            for q in ["", ArabicSearch.normalize(items[0].title)] {
                let shown = WeakHadithListView.visibleRows(items.filter { $0.reviewStatus != "approved" }, file: file, normalizedQuery: q)
                XCTAssertTrue(shown.isEmpty, "ظهر سجل غير معتمد في \(file)")
            }
            let one = approved([items[0]]) + items.dropFirst().map { var h = $0; h.reviewStatus = "pending_review"; return h }
            XCTAssertEqual(WeakHadithListView.visibleRows(one, file: file, normalizedQuery: "").count, 1)
            var hid = approved([items[0]])[0]; hid.hidden = true
            XCTAssertTrue(WeakHadithListView.visibleRows([hid], file: file, normalizedQuery: "").isEmpty)
        }
    }

    /// حجب أخبار /api/auto-content المعلّقة المراجعة (seed فيه 21 سجل pending_review).
    func testAutoContentPendingReviewIsNotMerged() throws {
        let js = #"[{"id":"1","title":"أ","slug":"a","content_type":"news","review_status":"pending_review"},{"id":"2","title":"ب","slug":"b","content_type":"news","review_status":"approved"},{"id":"3","title":"ج","slug":"c","content_type":"news"}]"#
        let auto = try JSONDecoder().decode([AccountAutoContent].self, from: Data(js.utf8))
        let merged = AccountUpdates.merge(platform: [], auto: auto)
        XCTAssertEqual(Set(merged.map(\.id)), ["2", "3"])
        let seed = repoRoot.appendingPathComponent("ios-native/Data/seed/auto-content.json")
        let obj = try JSONSerialization.jsonObject(with: Data(contentsOf: seed)) as? [String: Any]
        let all = try JSONDecoder().decode([AccountAutoContent].self, from: JSONSerialization.data(withJSONObject: obj?["items"] ?? []))
        XCTAssertTrue(AccountUpdates.merge(platform: [], auto: all.filter { $0.reviewStatus != "approved" }).isEmpty)
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
