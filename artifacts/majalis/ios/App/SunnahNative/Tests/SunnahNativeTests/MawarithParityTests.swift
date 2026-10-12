import XCTest
@testable import SunnahNative

/// يقارن محرك Swift بمخرجات محرك الموقع (src/lib/inheritance) حرفيًا لكل لقطة ذهبية:
/// Fixtures/mawarith/golden.json مُولَّدة بـscripts/gen-mawarith-golden.mjs من الكود الحقيقي. أي اختلاف = فشل.
final class MawarithParityTests: XCTestCase {
    private func golden() throws -> [String: Any] {
        let url = URL(fileURLWithPath: #filePath).deletingLastPathComponent().appendingPathComponent("Fixtures/mawarith/golden.json")
        return try XCTUnwrap(JSONSerialization.jsonObject(with: Data(contentsOf: url)) as? [String: Any])
    }

    private func config(_ name: String) -> MawarithFiqhConfig {
        switch name {
        case "gfExcludes": return MawarithFiqhConfig(grandfatherWithSiblings: .grandfatherExcludes)
        case "raddSpouse": return MawarithFiqhConfig(raddToSpouse: true)
        case "noMush": return MawarithFiqhConfig(mushtarakaShareWithMaternalSiblings: false)
        default: return .default
        }
    }

    func testInheritanceMatchesSite() throws {
        let cases = try XCTUnwrap(golden()["inheritance"] as? [[String: Any]])
        XCTAssertGreaterThanOrEqual(cases.count, 10)
        var okCount = 0
        for c in cases {
            let id = "\(c["id"] as! String)[\(c["config"] as! String)]"
            let heirs = (c["heirs"] as! [String: Any]).mapValues { ($0 as! NSNumber).doubleValue }
            let cfg = config(c["config"] as! String)
            if let err = c["error"] as? String {
                XCTAssertThrowsError(try MawarithEngine.calculate(raw: heirs, config: cfg), id) {
                    XCTAssertEqual(($0 as? MawarithInputError)?.message, err, id)
                }
                continue
            }
            okCount += 1
            let want = c["ok"] as! [String: Any]
            let got = try MawarithEngine.calculate(raw: heirs, config: cfg)
            XCTAssertEqual(String(got.originalBase), want["originalBase"] as? String, id)
            XCTAssertEqual(got.awlBase.map(String.init), want["awlBase"] as? String, id)
            XCTAssertEqual(got.radd, want["radd"] as? Bool, id)
            XCTAssertEqual(got.netEstate.ratioText, want["net"] as? String, id)
            XCTAssertEqual(got.warnings, want["warnings"] as? [String], id)
            let ws = want["shares"] as! [[String: Any]]
            XCTAssertEqual(got.shares.count, ws.count, "\(id) shares")
            for (g, w) in zip(got.shares, ws) {
                XCTAssertEqual(g.heir.rawValue, w["heir"] as? String, id)
                XCTAssertEqual(g.count, w["count"] as? Int, id)
                XCTAssertEqual(g.basis.rawValue, w["basis"] as? String, id)
                XCTAssertEqual(g.totalShare.ratioText, w["total"] as? String, "\(id) total \(g.heir)")
                XCTAssertEqual(g.perPersonShare.ratioText, w["per"] as? String, "\(id) per \(g.heir)")
                XCTAssertEqual(g.reason, w["reason"] as? String, "\(id) reason \(g.heir)")
            }
            let wh = want["hajb"] as! [[String: Any]]
            XCTAssertEqual(got.hajbLog.count, wh.count, "\(id) hajb")
            for (g, w) in zip(got.hajbLog, wh) {
                XCTAssertEqual(g.heir.rawValue, w["heir"] as? String, id)
                XCTAssertEqual(g.type.rawValue, w["type"] as? String, id)
                XCTAssertEqual(g.reason, w["reason"] as? String, id)
                XCTAssertEqual(g.excludedBy.map(\.rawValue), w["by"] as? [String], id)
            }
            let wst = want["steps"] as! [[String: Any]]
            XCTAssertEqual(got.steps.map(\.title), wst.map { $0["title"] as! String }, "\(id) steps")
            XCTAssertEqual(got.steps.map(\.detail), wst.map { $0["detail"] as! String }, "\(id) step details")
        }
        XCTAssertGreaterThanOrEqual(okCount, 10)
    }

    func testEstateMatchesSite() throws {
        let cases = try XCTUnwrap(golden()["estates"] as? [[String: Any]])
        XCTAssertGreaterThanOrEqual(cases.count, 5)
        for c in cases {
            let i = c["input"] as! [String: Any]
            let id = i["id"] as! String
            let input = MawarithEstateInput(
                assets: (i["assets"] as! [[String: Any]]).map { ($0["value"] as! NSNumber).doubleValue },
                debts: (i["debts"] as! NSNumber).doubleValue, funeralCosts: (i["funeralCosts"] as! NSNumber).doubleValue,
                bequest: (i["bequest"] as! NSNumber).doubleValue, bequestApprovedByHeirs: i["bequestApprovedByHeirs"] as! Bool)
            if let err = c["error"] as? String {
                XCTAssertThrowsError(try MawarithEstate.compute(input), id) { XCTAssertEqual(($0 as? MawarithInputError)?.message, err, id) }
                continue
            }
            let w = c["ok"] as! [String: Any]
            let g = try MawarithEstate.compute(input)
            func d(_ k: String) -> Double { (w[k] as! NSNumber).doubleValue }
            XCTAssertEqual(g.grossEstate, d("grossEstate"), id); XCTAssertEqual(g.funeralCosts, d("funeralCosts"), id)
            XCTAssertEqual(g.debts, d("debts"), id); XCTAssertEqual(g.afterDebts, d("afterDebts"), id)
            XCTAssertEqual(g.bequestRequested, d("bequestRequested"), id); XCTAssertEqual(g.bequestCap, d("bequestCap"), id)
            XCTAssertEqual(g.bequestPaid, d("bequestPaid"), id); XCTAssertEqual(g.netForHeirs, d("netForHeirs"), id)
            XCTAssertEqual(g.bequestCapped, w["bequestCapped"] as? Bool, id)
            XCTAssertEqual(g.netForHeirsFraction.ratioText, w["netForHeirsFraction"] as? String, id)
            XCTAssertEqual(g.warnings, w["warnings"] as? [String], id)
        }
    }
}
