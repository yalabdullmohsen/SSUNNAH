import Foundation

// نقل حرفي لـ src/lib/inheritance/estate.ts: التجهيز ← الديون ← الوصية بحد الثلث ← الصافي.

public struct MawarithEstateInput: Equatable, Sendable {
    public var assets: [Double]
    public var debts: Double
    public var funeralCosts: Double
    public var bequest: Double
    public var bequestApprovedByHeirs: Bool

    public init(assets: [Double], debts: Double, funeralCosts: Double, bequest: Double, bequestApprovedByHeirs: Bool) {
        self.assets = assets; self.debts = debts; self.funeralCosts = funeralCosts
        self.bequest = bequest; self.bequestApprovedByHeirs = bequestApprovedByHeirs
    }
}

public struct MawarithEstateBreakdown: Equatable, Sendable {
    public var grossEstate: Double
    public var funeralCosts: Double
    public var debts: Double
    public var afterDebts: Double
    public var bequestRequested: Double
    public var bequestCap: Double
    public var bequestPaid: Double
    public var bequestCapped: Bool
    public var netForHeirs: Double
    public var netForHeirsFraction: MawarithFraction
    public var warnings: [String]
}

public enum MawarithEstate {
    public static func compute(_ input: MawarithEstateInput) throws -> MawarithEstateBreakdown {
        var warnings: [String] = []
        let gross = input.assets.reduce(0, +)
        if gross < 0 { throw MawarithInputError(message: "قيمة التركة الإجمالية لا يمكن أن تكون سالبة") }
        if input.debts < 0 || input.funeralCosts < 0 || input.bequest < 0 {
            throw MawarithInputError(message: "الديون ومؤن التجهيز والوصية يجب أن تكون قيمًا غير سالبة")
        }
        let afterFuneral = max(0, gross - input.funeralCosts)
        if input.funeralCosts > gross {
            warnings.append("مؤن التجهيز تتجاوز إجمالي التركة — لا يتبقّى شيء للديون أو الورثة.")
        }
        let afterDebts = max(0, afterFuneral - input.debts)
        if input.debts > afterFuneral {
            warnings.append("الديون تستغرق التركة بالكامل بعد مؤن التجهيز — لا وصية ولا ميراث حتى تُسدَّد الديون.")
        }
        let cap = afterDebts / 3
        let capped = input.bequest > cap && !input.bequestApprovedByHeirs
        let paid = input.bequestApprovedByHeirs ? min(input.bequest, afterDebts) : min(input.bequest, cap)
        if capped {
            warnings.append("الوصية (\(jsNumber(input.bequest))) تتجاوز ثلث ما بقي بعد الديون (\(String(format: "%.2f", cap))) — نُفِّذت في حدود الثلث فقط. تُنفَّذ كاملة فقط إن أجازها جميع الورثة صراحة.")
        }
        let net = max(0, afterDebts - paid)
        return MawarithEstateBreakdown(
            grossEstate: gross, funeralCosts: min(input.funeralCosts, gross), debts: min(input.debts, afterFuneral),
            afterDebts: afterDebts, bequestRequested: input.bequest, bequestCap: cap, bequestPaid: paid,
            bequestCapped: capped, netForHeirs: net,
            netForHeirsFraction: MawarithFraction(Int((net * 1_000_000).rounded()), 1_000_000), warnings: warnings)
    }

    /// تمثيل الرقم كما تفعله JS في القوالب النصية (60000 لا 60000.0).
    static func jsNumber(_ v: Double) -> String {
        v == v.rounded() && abs(v) < 1e15 ? String(Int(v)) : String(v)
    }
}
