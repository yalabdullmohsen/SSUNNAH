import XCTest
@testable import SunnahNative

final class PeopleAdaptersTests: XCTestCase {
    private func p(_ slug: String, _ cat: String, occ: [(Int, Int)] = []) -> QuranPerson {
        QuranPerson(slug: slug, nameAr: slug, aliases: [], category: cat, definition: "", whyMentioned: "", lessons: [],
                    occurrences: occ.map { QuranOccurrence(surah: $0.0, ayah: $0.1) })
    }

    func testGroupedKeepsFixedCategoryOrderAndDropsEmpty() {
        let g = PeopleAdapters.grouped([p("a", "tyrant"), p("b", "prophet"), p("c", "prophet")])
        XCTAssertEqual(g.map(\.title), ["الأنبياء", "الطغاة"])
        XCTAssertEqual(g[0].people.map(\.slug), ["b", "c"])
    }

    func testOccurrenceTextGroupsBySurahSorted() {
        let t = PeopleAdapters.occurrenceText([.init(surah: 28, ayah: 24), .init(surah: 2, ayah: 5), .init(surah: 28, ayah: 23)]) { "س\($0)" }
        XCTAssertEqual(t, ["س2: 5", "س28: 23، 24"])
    }

    func testOccurrenceTextDropsRepeatedAyah() {
        // ورود العلَم مرتين في الآية نفسها يُذكر مرة واحدة («بلا تكرار» كما يقول العقد).
        let t = PeopleAdapters.occurrenceText([.init(surah: 12, ayah: 4), .init(surah: 12, ayah: 4), .init(surah: 12, ayah: 3)]) { "س\($0)" }
        XCTAssertEqual(t, ["س12: 3، 4"])
        XCTAssertEqual(PeopleAdapters.occurrenceText([]) { "س\($0)" }, [])
    }
}
