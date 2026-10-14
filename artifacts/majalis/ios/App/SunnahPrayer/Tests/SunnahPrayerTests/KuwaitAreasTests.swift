import XCTest
@testable import SunnahPrayer

private struct AwqafRow: Decodable {
    let area: String
    let day: String
    /// HH:mm بتوقيت الكويت: fajr, sunrise, dhuhr, asr, maghrib, isha.
    let times: [String: String]
}

final class KuwaitAreasTests: XCTestCase {
    func testSixGovernoratesAndRemoteAreasInsideKuwait() {
        XCTAssertEqual(KuwaitAreas.governorates.count, 6)
        for a in KuwaitAreas.governorates + KuwaitAreas.remote {
            XCTAssertTrue((28.4...30.2).contains(a.latitude) && (46.5...48.5).contains(a.longitude), a.label)
            XCTAssertEqual(a.timeZoneIdentifier, "Asia/Kuwait")
        }
    }

    func testEveryAreaYieldsSixOrderedTimes() throws {
        let settings = PrayerSettings()
        for a in KuwaitAreas.governorates + KuwaitAreas.remote {
            let t = try XCTUnwrap(PrayerCalculator.times(for: a, on: Date(timeIntervalSince1970: 1_792_000_000), settings: settings), a.label)
            XCTAssertEqual(t.ordered.count, 6, a.label)
            XCTAssertEqual(t.ordered.map(\.time), t.ordered.map(\.time).sorted(), a.label)
        }
    }

    /// مقارنة بتقويم وزارة الأوقاف (±دقيقة). المرجع الرسمي يضعه المالك في Resources/awqaf-calendar.json؛
    /// بغيابه يُتخطّى الاختبار صراحةً ولا يُختلق أي مرجع.
    func testMatchesAwqafCalendarWithinOneMinute() throws {
        let url = URL(fileURLWithPath: #filePath).deletingLastPathComponent().appendingPathComponent("Resources/awqaf-calendar.json")
        guard FileManager.default.fileExists(atPath: url.path) else { throw XCTSkip("awqaf-calendar.json غير موجود: يلزم مرجع رسمي من وزارة الأوقاف") }
        let rows = try JSONDecoder().decode([AwqafRow].self, from: Data(contentsOf: url))
        var tz = Calendar(identifier: .gregorian); tz.timeZone = TimeZone(identifier: "Asia/Kuwait")!
        var bad: [String] = []
        for r in rows {
            let loc = try XCTUnwrap((KuwaitAreas.governorates + KuwaitAreas.remote).first { $0.label == r.area }, r.area)
            let p = r.day.split(separator: "-").compactMap { Int($0) }
            let noon = try XCTUnwrap(tz.date(from: DateComponents(year: p[0], month: p[1], day: p[2], hour: 12)))
            let t = try XCTUnwrap(PrayerCalculator.times(for: loc, on: noon, settings: PrayerSettings()))
            for item in t.ordered {
                guard let exp = r.times[item.prayer.rawValue] else { continue }
                let hm = exp.split(separator: ":").compactMap { Int($0) }
                let c = tz.dateComponents([.hour, .minute], from: item.time)
                let diff = abs((c.hour! * 60 + c.minute!) - (hm[0] * 60 + hm[1]))
                if diff > 1 { bad.append("\(r.area) \(r.day) \(item.prayer.rawValue): \(diff)د") }
            }
        }
        XCTAssertTrue(bad.isEmpty, bad.prefix(10).joined(separator: "\n"))
    }
}
