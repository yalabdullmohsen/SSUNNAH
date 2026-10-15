import XCTest
@testable import SunnahNative

/// قاعدة المالك: لا يظهر شيء بحالة غير معتمدة في أي مستهلك (بحث، حديث اليوم، ويدجت، إشعارات، مشاركة، تفضيلات، قوائم).
final class PendingReviewConsumersTests: XCTestCase {
    private var repoRoot: URL {
        var u = URL(fileURLWithPath: #filePath)
        while u.path != "/", !FileManager.default.fileExists(atPath: u.appendingPathComponent("ios-native/Data/hadith").path) { u.deleteLastPathComponent() }
        return u
    }
    private var sources: URL { repoRoot.appendingPathComponent("artifacts/majalis/ios/App/SunnahNative/Sources") }

    private func files(_ root: URL, ext: String) -> [URL] {
        (FileManager.default.enumerator(at: root, includingPropertiesForKeys: nil)?.allObjects as? [URL] ?? []).filter { $0.pathExtension == ext }
    }

    /// كل ملف بيانات فيه `pending_review` حرفيًا معروف ومحروس؛ ملف جديد بهذه الحالة يفرض قرارًا صريحًا هنا.
    func testPendingReviewDatasetsAreExactlyTheGuardedOnes() throws {
        let data = repoRoot.appendingPathComponent("ios-native/Data")
        var found: Set<String> = []
        for f in files(data, ext: "json") {
            let s = try String(contentsOf: f, encoding: .utf8)
            if s.contains("\"review_status\":\"pending_review\"") || s.contains("\"review_status\": \"pending_review\"") { found.insert(f.deletingPathExtension().lastPathComponent) }
        }
        XCTAssertEqual(found, ["weak-daif", "weak-mawdu", "auto-content"], "ملف بيانات جديد بحالة pending_review: أضفه إلى الحجب واختباره")
    }

    /// لا مستهلك آخر (بحث/حديث اليوم/ويدجت/إشعار/مشاركة/تفضيلات) يقرأ تلك الملفات: المحمّلان المحروسان فقط.
    func testNoOtherConsumerReadsPendingFiles() throws {
        let allowed: [String: Set<String>] = [
            "weak-daif": ["WeakHadithScreens.swift", "HadithScreens.swift"], "weak-mawdu": ["WeakHadithScreens.swift", "HadithScreens.swift"],
            "auto-content": ["RemoteSeeds.swift", "AccountUpdatesScreens.swift", "AccountNetwork.swift"],
        ]
        for f in files(sources, ext: "swift") {
            let s = try String(contentsOf: f, encoding: .utf8)
            for (name, ok) in allowed where s.contains(name) {
                XCTAssertTrue(ok.contains(f.lastPathComponent), "\(f.lastPathComponent) يقرأ \(name) غير المعتمد")
            }
        }
        // حديث اليوم والويدجت والإشعارات تقرأ من التصدير المعتمد فقط
        for f in files(sources, ext: "swift") where ["HomeDailyContent.swift"].contains(f.lastPathComponent) {
            let s = try String(contentsOf: f, encoding: .utf8)
            XCTAssertFalse(s.contains("weak-") || s.contains("WeakHadithItem"), "حديث اليوم يقرأ الضعيف")
        }
        let appSide = repoRoot.appendingPathComponent("ios-native")
        for ext in ["swift"] { for f in files(appSide.appendingPathComponent("Sources"), ext: ext) + files(appSide.appendingPathComponent("SunnahApp"), ext: ext) {
            let s = try String(contentsOf: f, encoding: .utf8)
            XCTAssertFalse(s.contains("weak-daif") || s.contains("weak-mawdu"), "\(f.lastPathComponent) (ويدجت/إشعار/تطبيق) يقرأ الضعيف")
        } }
    }

    /// البحث: فهرس البحث المصدَّر لا يحوي أي حديث ضعيف/موضوع، ومساراتهما لا تُعاد حين عدد المعتمد صفر.
    func testSearchNeverReturnsWeakHadithAndGatedRoutesHiddenAtZero() throws {
        let old = WeakHadithAvailability.approvedCount; defer { WeakHadithAvailability.approvedCount = old }
        WeakHadithAvailability.approvedCount = { _ in 0 }
        let idx = try JSONDecoder().decode(LibrarySearchIndex.self, from: Data(contentsOf: repoRoot.appendingPathComponent("ios-native/Data/library/search-index.json")))
        XCTAssertFalse(idx.docs.contains { $0.href.contains("/hadith/daif") || $0.href.contains("/hadith/mawdu") })
        let fake = LibrarySearchIndex(docs: [.init(id: "w", kind: "hadith", titleAr: "الأحاديث الضعيفة", href: "/hadith/daif", norm: nil)])
        XCTAssertTrue(LibraryAdapters.search(fake, query: "الأحاديث الضعيفة").isEmpty)
        WeakHadithAvailability.approvedCount = { _ in 3 }
        XCTAssertEqual(LibraryAdapters.search(fake, query: "الأحاديث الضعيفة").count, 1)
    }

    /// مدخل القسم يُخفى من «كل الأقسام» و«المزيد» والخريطة حين المعتمد صفر، ويظهر تلقائيًا بعد الاعتماد.
    func testEntryHiddenFromAllListsAtZeroAndAppearsWhenApproved() {
        let old = WeakHadithAvailability.approvedCount; defer { WeakHadithAvailability.approvedCount = old }
        func routes() -> Set<String> { Set(LibraryAdapters.sectionsPage(nil).flatMap { $0.links.map(\.route) }) }
        WeakHadithAvailability.approvedCount = { _ in 0 }
        XCTAssertFalse(routes().contains("/hadith/daif")); XCTAssertFalse(routes().contains("/hadith/mawdu"))
        XCTAssertFalse(LibraryRouteScope.contains("/hadith/daif"))
        WeakHadithAvailability.approvedCount = { $0 == "weak-daif" ? 5 : 0 }
        XCTAssertTrue(routes().contains("/hadith/daif")); XCTAssertFalse(routes().contains("/hadith/mawdu"))
        XCTAssertTrue(LibraryRouteScope.contains("/hadith/daif")); XCTAssertTrue(LibraryRouteScope.contains("/hadith/sahih"))
    }

    /// على البيانات الفعلية: المعتمد صفر ⇒ المدخلان مخفيان في الإصدار الحالي.
    func testRealDataHasZeroApprovedSoEntriesAreHidden() throws {
        for f in ["weak-daif", "weak-mawdu"] {
            let items = try JSONDecoder().decode([WeakHadithItem].self, from: Data(contentsOf: repoRoot.appendingPathComponent("ios-native/Data/hadith/\(f).json")))
            XCTAssertEqual(items.filter(\.isApproved).count, 0, "ظهر معتمد: حدّث هذا الاختبار عند الاعتماد")
        }
    }
}
