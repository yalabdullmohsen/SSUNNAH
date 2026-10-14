import XCTest
import SwiftUI
@testable import SunnahNative

/// نصوص القسم المنقولة حرفيًا، البحث، دمج المستجدات، جرد الحزم، وتسجيل الشاشات.
final class AccountContentTests: XCTestCase {
    // MARK: النصوص المستخرجة (أعداد مطابقة لمصادر الويب وقت الاستخراج)

    // تحديث 2026-10-13: بعد 85df5e781 (حذف وعود التسميع/الميكروفون/المساعد غير الموجودة): privacy 17→16، fatwaPolicy 6→5 (حُذف قسم المساعد العلمي)،
    // sourceTypes 17→16 (حُذف نموذج التسميع)، وإدخالاتها 33→28 (حُذفت 7 وأُضيفت 2).
    func testExtractedTextCounts() {
        XCTAssertEqual(AccountTexts.about.sections.count, 6)
        XCTAssertEqual(AccountTexts.privacy.sections.count, 16)
        XCTAssertEqual(AccountTexts.fatwaPolicy.sections.count, 5)
        XCTAssertEqual(AccountTexts.contactFAQ.count, 5)
        XCTAssertEqual(AccountTexts.contactTopics.count, 5)
        XCTAssertEqual(AccountTexts.tourSlides.count, 6)
        XCTAssertEqual(AccountTexts.globalStats.count, 12)
        XCTAssertEqual(AccountTexts.populationBars.count, 15)
        XCTAssertEqual(AccountTexts.historyTimeline.count, 23)
        XCTAssertEqual(AccountTexts.historyAchievements.count, 12)
        XCTAssertEqual(AccountTexts.qiblaCities.count, 20)
        XCTAssertEqual(AccountTexts.badges.count, 17)
        XCTAssertEqual(AccountTexts.sourceTypes.count, 21)
        XCTAssertEqual(AccountTexts.sourceTypes.reduce(0) { $0 + $1.entries.count }, 36)
    }

    func testTextIdsAreUnique() {
        XCTAssertEqual(Set(AccountTexts.contactTopics.map(\.id)).count, AccountTexts.contactTopics.count)
        XCTAssertEqual(Set(AccountTexts.tourSlides.map(\.id)).count, AccountTexts.tourSlides.count)
        XCTAssertEqual(Set(AccountTexts.sourceTypes.map(\.id)).count, AccountTexts.sourceTypes.count)
        XCTAssertEqual(Set(AccountTexts.qiblaCities.map(\.id)).count, AccountTexts.qiblaCities.count)
    }

    func testPopulationBarFractionsInRange() {
        for bar in AccountTexts.populationBars {
            XCTAssertTrue((0...1).contains(bar.fraction), bar.label)
        }
    }

    // MARK: البحث

    func testArabicSearchNormalization() {
        XCTAssertEqual(AccountSearch.normalize("الإِسْلَامُ"), "الاسلام")
        XCTAssertEqual(AccountSearch.normalize("مكتبةٌ   كبرى"), "مكتبه كبري")
        XCTAssertTrue(AccountSearch.matches(["بيت الحكمة في بغداد"], "الحكمه"))
        XCTAssertTrue(AccountSearch.matches([nil], "  "))
        XCTAssertFalse(AccountSearch.matches(["قرطبة", nil], "دمشق"))
    }

    // MARK: المستجدات

    private func decode<T: Decodable>(_ type: T.Type, _ json: String) throws -> T {
        try JSONDecoder().decode(T.self, from: Data(json.utf8))
    }

    func testUpdatesMergeSortsNewestFirstAndMapsTypes() throws {
        let platform = try decode([AccountPlatformUpdate].self, #"""
        [{"id": 1, "title": "درس جديد", "update_type": "درس", "source_url": "/lessons/1", "published_at": "2026-10-09T10:00:00Z"},
         {"id": "2", "title": "إعلان", "update_type": "إعلان", "published_at": "2026-10-01T10:00:00.000Z"}]
        """#)
        let auto = try decode(AccountAutoContentResponse.self, #"""
        {"items": [{"id": "a1", "title": "فتوى", "slug": "f-1", "content_type": "fatwa", "source_name": "مصدر", "published_at": "2026-10-10T08:00:00Z"},
                   {"id": "a2", "title": "خبر", "slug": "n-1", "content_type": "news", "created_at": "2026-10-05"}]}
        """#)
        let merged = AccountUpdates.merge(platform: platform, auto: auto.items)
        XCTAssertEqual(merged.map(\.key), ["auto-a1", "platform-1", "auto-a2", "platform-2"])
        XCTAssertEqual(merged[0].updateType, "فتوى")
        XCTAssertEqual(merged[0].link, "/updates/auto/f-1")
        XCTAssertEqual(merged[2].updateType, "خبر علمي")
        XCTAssertEqual(AccountUpdates.merge(platform: platform, auto: auto.items, limit: 2).count, 2)

        XCTAssertEqual(AccountUpdates.filter(merged, type: "درس", search: "").map(\.key), ["platform-1"])
        XCTAssertEqual(AccountUpdates.filter(merged, type: "الكل", search: "مصدر").map(\.key), ["auto-a1"])
    }

    func testPlatformUpdateDecodesSiteApiShape() throws {
        let u = try decode([AccountPlatformUpdate].self, #"[{"id":"update-qa-330","title":"تحديث","content":"نص التحديث"}]"#)
        XCTAssertEqual(u.first?.summary, "نص التحديث")
        XCTAssertEqual(u.first?.updateType, "خبر علمي")
    }

    func testAutoContentTypeMapping() {
        XCTAssertEqual(AccountAutoContent.updateType(for: "resolution"), "قرار")
        XCTAssertEqual(AccountAutoContent.updateType(for: "recommendation"), "قرار")
        XCTAssertEqual(AccountAutoContent.updateType(for: "fatwa"), "فتوى")
        XCTAssertEqual(AccountAutoContent.updateType(for: "other"), "خبر علمي")
    }

    func testAutoContentSingleItemResponse() throws {
        let r = try decode(AccountAutoContentResponse.self, #"{"item": {"id": 5, "title": "ت", "slug": "s"}}"#)
        XCTAssertEqual(r.first?.id, "5")
        XCTAssertNil(try decode(AccountAutoContentResponse.self, #"{"items": []}"#).first)
    }

    // MARK: جرد البيانات المحلية

    func testManifestPacks() throws {
        let m = try decode(AccountDataManifest.self, #"""
        {"version": 3, "counts": {"quranAyahs": 6236, "tafsir": {"muyassar": 6236, "saadi": 6236}, "hadith": {}, "adhkar": 300},
         "files": [{"path": "quran/ayahs.json", "bytes": 100, "sha256": "x"}, {"path": "tafsir/muyassar.json", "bytes": 40},
                   {"path": "tafsir/saadi.json", "bytes": 60}, {"path": "adhkar/all.json", "bytes": 7}]}
        """#)
        XCTAssertEqual(m.packs.map(\.id), ["quran", "tafsir", "adhkar"])
        XCTAssertEqual(m.packs[1].records, 12_472)
        XCTAssertEqual(m.packs[1].bytes, 100)
        XCTAssertEqual(m.totalBytes, 207)
    }

    // MARK: التسجيل والتوجيه

    @MainActor func testAllScreensRegister() {
        let registry = TemplateRegistry()
        AccountSection.register(in: registry)
        XCTAssertEqual(AccountSection.ids.count, 19)
        for id in AccountSection.ids {
            XCTAssertNotNil(registry.view(for: id), id)
        }
    }

    func testAutoContentRouteResolves() {
        XCTAssertNotNil(AccountSection.resolve(["updates", "auto", "some-slug"]))
        XCTAssertNil(AccountSection.resolve(["updates", "auto"]))
        XCTAssertNil(AccountSection.resolve(["updates", "auto", ""]))
        XCTAssertNil(AccountSection.resolve(["updates"]))
    }
}

final class SourcesCoverageTests: XCTestCase {
    func testSourcesCoverEverySectionFamily() {
        let ids = Set(AccountTexts.sourceTypes.map(\.id))
        for id in ["quran-text", "tafsir", "hadith", "adhkar", "prayer-times", "lessons-scholars", "fiqh-books", "editorial", "sirah-aqidah", "library-catalog", "fiqh-topics", "hadith-collections", "learn-content", "islam-stats"] {
            XCTAssertTrue(ids.contains(id), id)
        }
    }
}
