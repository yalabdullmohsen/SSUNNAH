import Foundation

// نقل حرفي لمحرك مواريث الموقع (src/lib/inheritance/{engine,fraction,estate,types}.ts).
// ممنوع تعديل الخوارزمية هنا بمعزل عن الموقع: المطابقة تُثبتها لقطات ذهبية (MawarithParityTests).
// الفرق الوحيد: Int (64 بت) بدل BigInt — مقامات الفرائض صغيرة جدًا فلا تفيض.

// MARK: - Fraction

public struct MawarithFraction: Equatable, Hashable, Sendable {
    public let num: Int
    public let den: Int

    public init(_ num: Int, _ den: Int = 1) {
        precondition(den != 0, "Fraction: قاسم بصفر غير مسموح")
        var n = num, d = den
        if d < 0 { n = -n; d = -d }
        let g = Self.gcd(n, d)
        self.num = n / g
        self.den = d / g
    }

    static func gcd(_ a: Int, _ b: Int) -> Int {
        var x = abs(a), y = abs(b)
        while y != 0 { (x, y) = (y, x % y) }
        return x == 0 ? 1 : x
    }

    public static let zero = MawarithFraction(0)
    public static let one = MawarithFraction(1)

    public func add(_ o: Self) -> Self { Self(num * o.den + o.num * den, den * o.den) }
    public func sub(_ o: Self) -> Self { Self(num * o.den - o.num * den, den * o.den) }
    public func mul(_ o: Self) -> Self { Self(num * o.num, den * o.den) }
    public func div(_ o: Self) -> Self {
        precondition(o.num != 0, "Fraction: قسمة على صفر")
        return Self(num * o.den, den * o.num)
    }
    public var isZero: Bool { num == 0 }
    public var isPositive: Bool { num > 0 }
    public func greaterThan(_ o: Self) -> Bool { num * o.den > o.num * den }
    public var description: String { den == 1 ? "\(num)" : "\(num)/\(den)" }
    /// «num/den» دائمًا — صيغة اللقطات الذهبية.
    public var ratioText: String { "\(num)/\(den)" }
}

// MARK: - الأنواع

public enum MawarithHeirKey: String, CaseIterable, Sendable {
    case husband, wife, father, mother
    case paternalGrandfather, paternalGrandmother, maternalGrandmother
    case sons, daughters, sonsOfSon, daughtersOfSon
    case fullBrothers, fullSisters, paternalBrothers, paternalSisters
    case maternalBrothers, maternalSisters
}

public struct MawarithFiqhConfig: Equatable, Sendable {
    public enum GrandfatherWithSiblings: String, Sendable { case muqasama, grandfatherExcludes }
    public var grandfatherWithSiblings: GrandfatherWithSiblings
    public var raddToSpouse: Bool
    public var mushtarakaShareWithMaternalSiblings: Bool

    public init(grandfatherWithSiblings: GrandfatherWithSiblings = .muqasama,
                raddToSpouse: Bool = false,
                mushtarakaShareWithMaternalSiblings: Bool = true) {
        self.grandfatherWithSiblings = grandfatherWithSiblings
        self.raddToSpouse = raddToSpouse
        self.mushtarakaShareWithMaternalSiblings = mushtarakaShareWithMaternalSiblings
    }

    public static let `default` = MawarithFiqhConfig()
}

public enum MawarithShareBasis: String, Sendable {
    case fixed, asaba, radd
    case asabaWithDaughters = "asaba-with-daughters"
}

public enum MawarithHajbType: String, Sendable { case hirman, nuqsan }

public struct MawarithHeirShare: Equatable, Sendable {
    public var heir: MawarithHeirKey
    public var count: Int
    public var basis: MawarithShareBasis
    public var totalShare: MawarithFraction
    public var perPersonShare: MawarithFraction
    public var reason: String
}

public struct MawarithHajbEntry: Equatable, Sendable {
    public var heir: MawarithHeirKey
    public var type: MawarithHajbType
    public var reason: String
    public var excludedBy: [MawarithHeirKey]
}

public struct MawarithStep: Equatable, Sendable {
    public var title: String
    public var detail: String
}

public struct MawarithResult: Equatable, Sendable {
    public var originalBase: Int
    public var awlBase: Int?
    public var radd: Bool
    public var shares: [MawarithHeirShare]
    public var hajbLog: [MawarithHajbEntry]
    public var steps: [MawarithStep]
    public var warnings: [String]
    public var netEstate: MawarithFraction
}

public struct MawarithInputError: Error, Equatable, Sendable {
    public let message: String
}

// MARK: - المحرك

public enum MawarithEngine {
    private typealias F = MawarithFraction
    private typealias K = MawarithHeirKey
    private static let half = F(1, 2), third = F(1, 3), twoThirds = F(2, 3)
    private static let quarter = F(1, 4), eighth = F(1, 8), sixth = F(1, 6)

    /// مدخل متوافق مع JSON/الواجهة: القيم غير الصحيحة تُرفض كما يفعل الموقع (Number.isInteger).
    public static func calculate(raw: [String: Double],
                                 config: MawarithFiqhConfig = .default) throws -> MawarithResult {
        var ints: [K: Int] = [:]
        for key in K.allCases {
            let v = raw[key.rawValue] ?? 0
            guard v == v.rounded(), v >= 0, v < 1e9 else {
                throw MawarithInputError(message: "عدد الورثة غير صالح للصنف \"\(key.rawValue)\": يجب أن يكون عددًا صحيحًا غير سالب")
            }
            ints[key] = Int(v)
        }
        return try calculate(counts: ints, config: config)
    }

    public static func calculate(counts: [MawarithHeirKey: Int],
                                 config: MawarithFiqhConfig = .default) throws -> MawarithResult {
        var h: [K: Int] = [:]
        for key in K.allCases {
            let v = counts[key] ?? 0
            guard v >= 0 else {
                throw MawarithInputError(message: "عدد الورثة غير صالح للصنف \"\(key.rawValue)\": يجب أن يكون عددًا صحيحًا غير سالب")
            }
            h[key] = v
        }
        if h[.husband]! > 1 { throw MawarithInputError(message: "لا يمكن أن يكون هناك أكثر من زوج واحد") }
        if h[.wife]! > 4 { throw MawarithInputError(message: "لا يمكن أن يزيد عدد الزوجات عن 4") }
        if h[.husband]! > 0 && h[.wife]! > 0 {
            throw MawarithInputError(message: "لا يجتمع زوج وزوجة في مسألة واحدة (المتوفى إما ذكر وله زوجة/زوجات، أو أنثى ولها زوج)")
        }
        return compute(h, config)
    }

    // MARK: الحجب

    private static func joined(_ keys: [K]) -> String { keys.map(\.rawValue).joined(separator: "، ") }

    private static func computeHajb(_ h: [K: Int]) -> (excluded: Set<K>, log: [MawarithHajbEntry]) {
        var excluded = Set<K>()
        var log: [MawarithHajbEntry] = []
        func exclude(_ heir: K, _ reason: String, _ by: [K]) {
            if h[heir]! <= 0 { return }
            excluded.insert(heir)
            log.append(MawarithHajbEntry(heir: heir, type: .hirman, reason: reason, excludedBy: by))
        }
        let hasSon = h[.sons]! > 0
        let hasSonsOfSon = h[.sonsOfSon]! > 0 && !excluded.contains(.sonsOfSon)   // تُحسب قبل أي حجب كما في الموقع
        let hasFather = h[.father]! > 0
        let hasMother = h[.mother]! > 0

        if hasSon { exclude(.sonsOfSon, "الابن يحجب ابن الابن حرمانًا", [.sons]) }
        if hasSon { exclude(.daughtersOfSon, "الابن يحجب بنت الابن حرمانًا (لا فرض ولا تعصيب لها معه)", [.sons]) }
        if !hasSon && h[.daughters]! >= 2 && !hasSonsOfSon {
            exclude(.daughtersOfSon, "بنتان فأكثر يحجبان بنت الابن حرمانًا إذا لم يوجد ابن ابن يُعصِّبها", [.daughters])
        }
        if hasFather { exclude(.paternalGrandfather, "الأب يحجب الجد حرمانًا", [.father]) }
        if hasFather { exclude(.paternalGrandmother, "الأب يحجب الجدة لأب حرمانًا", [.father]) }
        if hasMother {
            exclude(.paternalGrandmother, "الأم تحجب الجدة لأب حرمانًا", [.mother])
            exclude(.maternalGrandmother, "الأم تحجب الجدة لأم حرمانًا", [.mother])
        }
        let childOrGrandchildPresent = hasSon || h[.daughters]! > 0 || hasSonsOfSon
            || (h[.daughtersOfSon]! > 0 && !excluded.contains(.daughtersOfSon))

        var fullEx: [K] = []
        if hasFather { fullEx.append(.father) }
        if hasSon { fullEx.append(.sons) }
        if hasSonsOfSon { fullEx.append(.sonsOfSon) }
        if !fullEx.isEmpty {
            exclude(.fullBrothers, "يحجب الإخوة الأشقاء: " + joined(fullEx), fullEx)
            exclude(.fullSisters, "يحجب الأخوات الشقيقات: " + joined(fullEx), fullEx)
        }
        let hasFullBrother = h[.fullBrothers]! > 0 && !excluded.contains(.fullBrothers)
        var patEx = fullEx
        if hasFullBrother { patEx.append(.fullBrothers) }
        if !patEx.isEmpty {
            exclude(.paternalBrothers, "يحجب الإخوة لأب: " + joined(patEx), patEx)
            exclude(.paternalSisters, "يحجب الأخوات لأب: " + joined(patEx), patEx)
        }
        var matEx: [K] = []
        if hasFather { matEx.append(.father) }
        if h[.paternalGrandfather]! > 0 && !excluded.contains(.paternalGrandfather) { matEx.append(.paternalGrandfather) }
        if childOrGrandchildPresent {
            if hasSon { matEx.append(.sons) }
            if h[.daughters]! > 0 { matEx.append(.daughters) }
            if hasSonsOfSon { matEx.append(.sonsOfSon) }
            if h[.daughtersOfSon]! > 0 && !excluded.contains(.daughtersOfSon) { matEx.append(.daughtersOfSon) }
        }
        if !matEx.isEmpty {
            exclude(.maternalBrothers, "يحجب الإخوة لأم: " + joined(matEx), matEx)
            exclude(.maternalSisters, "يحجب الأخوات لأم: " + joined(matEx), matEx)
        }
        return (excluded, log)
    }

    // MARK: الفروض

    private struct Fixed { var heir: K; var count: Int; var totalShare: F; var reason: String }

    private static func computeFixedShares(_ h: [K: Int], _ excluded: Set<K>,
                                           _ config: MawarithFiqhConfig) -> (fixed: [Fixed], hasDescendant: Bool) {
        var fixed: [Fixed] = []
        func has(_ k: K) -> Bool { h[k]! > 0 && !excluded.contains(k) }
        func cnt(_ k: K) -> Int { has(k) ? h[k]! : 0 }

        let hasSon = has(.sons), hasSonsOfSon = has(.sonsOfSon)
        let hasDaughters = has(.daughters), hasDaughtersOfSon = has(.daughtersOfSon)
        let hasDescendant = hasSon || hasSonsOfSon || hasDaughters || hasDaughtersOfSon
        let numSiblings = cnt(.fullBrothers) + cnt(.fullSisters) + cnt(.paternalBrothers)
            + cnt(.paternalSisters) + cnt(.maternalBrothers) + cnt(.maternalSisters)

        if has(.husband) {
            fixed.append(Fixed(heir: .husband, count: 1, totalShare: hasDescendant ? quarter : half,
                               reason: hasDescendant ? "الربع لوجود فرع وارث" : "النصف لعدم وجود فرع وارث"))
        }
        if has(.wife) {
            fixed.append(Fixed(heir: .wife, count: h[.wife]!, totalShare: hasDescendant ? eighth : quarter,
                               reason: hasDescendant ? "الثمن لوجود فرع وارث، يُقسَّم بين الزوجات بالتساوي" : "الربع لعدم وجود فرع وارث، يُقسَّم بين الزوجات بالتساوي"))
        }
        if has(.mother) {
            let sixthCase = hasDescendant || numSiblings >= 2
            fixed.append(Fixed(heir: .mother, count: 1, totalShare: sixthCase ? sixth : third,
                               reason: hasDescendant ? "السدس لوجود فرع وارث"
                               : numSiblings >= 2 ? "السدس لوجود اثنين فأكثر من الإخوة/الأخوات"
                               : "الثلث لعدم وجود فرع وارث ولا اثنين من الإخوة"))
        }
        if has(.father) {
            if hasSon || hasSonsOfSon {
                fixed.append(Fixed(heir: .father, count: 1, totalShare: sixth, reason: "السدس فرضًا لوجود ابن أو ابن ابن"))
            } else if hasDaughters || hasDaughtersOfSon {
                fixed.append(Fixed(heir: .father, count: 1, totalShare: sixth, reason: "السدس فرضًا، ويأخذ الباقي تعصيبًا لوجود بنات بلا ابن"))
            }
        }
        if has(.paternalGrandfather) {
            if hasSon || hasSonsOfSon {
                fixed.append(Fixed(heir: .paternalGrandfather, count: 1, totalShare: sixth, reason: "السدس فرضًا لوجود ابن أو ابن ابن (الجد كالأب عند عدمه)"))
            } else if hasDaughters || hasDaughtersOfSon {
                fixed.append(Fixed(heir: .paternalGrandfather, count: 1, totalShare: sixth, reason: "السدس فرضًا، ويأخذ الباقي تعصيبًا لوجود بنات بلا ابن (الجد كالأب عند عدمه)"))
            }
        }
        var grandmothers: [K] = []
        if has(.paternalGrandmother) { grandmothers.append(.paternalGrandmother) }
        if has(.maternalGrandmother) { grandmothers.append(.maternalGrandmother) }
        if grandmothers.count == 1 {
            fixed.append(Fixed(heir: grandmothers[0], count: 1, totalShare: sixth, reason: "السدس فرضًا للجدة الوارثة"))
        } else if grandmothers.count == 2 {
            for g in grandmothers {
                fixed.append(Fixed(heir: g, count: 1, totalShare: sixth.div(F(2)), reason: "السدس يُقسَّم بالتساوي بين الجدتين الوارثتين"))
            }
        }
        if hasDaughters && !hasSon {
            let one = h[.daughters]! == 1
            fixed.append(Fixed(heir: .daughters, count: h[.daughters]!, totalShare: one ? half : twoThirds,
                               reason: one ? "النصف لبنت واحدة بلا ابن" : "الثلثان لبنتين فأكثر بلا ابن"))
        }
        if hasDaughtersOfSon && !hasSon && !hasSonsOfSon {
            if h[.daughters]! == 0 {
                let one = h[.daughtersOfSon]! == 1
                fixed.append(Fixed(heir: .daughtersOfSon, count: h[.daughtersOfSon]!, totalShare: one ? half : twoThirds,
                                   reason: one ? "النصف لبنت ابن واحدة بلا فرع أقرب" : "الثلثان لبنات ابن فأكثر بلا فرع أقرب"))
            } else if h[.daughters]! == 1 {
                fixed.append(Fixed(heir: .daughtersOfSon, count: h[.daughtersOfSon]!, totalShare: sixth, reason: "السدس تكملةً للثلثين مع بنت واحدة"))
            }
        }
        let maternalCount = cnt(.maternalBrothers) + cnt(.maternalSisters)
        if maternalCount == 1 {
            fixed.append(Fixed(heir: has(.maternalBrothers) ? .maternalBrothers : .maternalSisters, count: 1, totalShare: sixth,
                               reason: "السدس فرضًا لولد الأم الواحد (ذكرًا كان أو أنثى، كلالة)"))
        } else if maternalCount >= 2 {
            let b = cnt(.maternalBrothers), s = cnt(.maternalSisters), total = b + s
            let r = "الثلث يُقسَّم بالتساوي بين أولاد الأم (لا للذكر مثل حظ الأنثيين)"
            if b > 0 { fixed.append(Fixed(heir: .maternalBrothers, count: b, totalShare: third.mul(F(b, total)), reason: r)) }
            if s > 0 { fixed.append(Fixed(heir: .maternalSisters, count: s, totalShare: third.mul(F(s, total)), reason: r)) }
        }
        let hasFullBrotherPresent = has(.fullBrothers)
        if has(.fullSisters) && !hasFullBrotherPresent {
            let femaleDesc = (hasDaughters || hasDaughtersOfSon) && !hasSon && !hasSonsOfSon
            if !femaleDesc {
                let one = h[.fullSisters]! == 1
                fixed.append(Fixed(heir: .fullSisters, count: h[.fullSisters]!, totalShare: one ? half : twoThirds,
                                   reason: one ? "النصف لأخت شقيقة واحدة بلا معصِّب ولا فرع وارث مؤنَّث" : "الثلثان لأختين شقيقتين فأكثر بلا معصِّب ولا فرع وارث مؤنَّث"))
            }
        }
        let hasPaternalBrotherPresent = has(.paternalBrothers)
        if has(.paternalSisters) && !hasPaternalBrotherPresent {
            let femaleDesc = (hasDaughters || hasDaughtersOfSon) && !hasSon && !hasSonsOfSon
            let fullTookTwoThirds = has(.fullSisters) && !hasFullBrotherPresent && h[.fullSisters]! >= 2 && !femaleDesc
            if !femaleDesc && !fullTookTwoThirds && !(has(.fullSisters) && h[.fullSisters]! == 1 && !hasFullBrotherPresent) {
                let one = h[.paternalSisters]! == 1
                fixed.append(Fixed(heir: .paternalSisters, count: h[.paternalSisters]!, totalShare: one ? half : twoThirds,
                                   reason: one ? "النصف لأخت لأب واحدة بلا معصِّب" : "الثلثان لأختين لأب فأكثر بلا معصِّب"))
            } else if has(.fullSisters) && h[.fullSisters]! == 1 && !hasFullBrotherPresent && !femaleDesc {
                fixed.append(Fixed(heir: .paternalSisters, count: h[.paternalSisters]!, totalShare: sixth, reason: "السدس تكملةً للثلثين مع أخت شقيقة واحدة آخذة للنصف"))
            }
        }
        return (fixed, hasDescendant)
    }

    // MARK: الحساب الرئيسي

    private struct Claimant { var heir: K; var count: Int; var weight: Int }

    private static func compute(_ h: [K: Int], _ config: MawarithFiqhConfig) -> MawarithResult {
        let totalHeirs = K.allCases.reduce(0) { $0 + h[$1]! }
        var steps: [MawarithStep] = []
        var warnings: [String] = []

        if totalHeirs == 0 {
            warnings.append("لا يوجد أي وارث من الورثة المُدخَلين. إن لم يوجد صاحب فرض أو عصبة أو ذو رحم معروف، تؤول التركة لبيت المال — راجع مختصًا شرعيًا/قانونيًا.")
            return MawarithResult(originalBase: 1, awlBase: nil, radd: false, shares: [], hajbLog: [], steps: steps, warnings: warnings, netEstate: .zero)
        }

        var (excluded, hajbLog) = computeHajb(h)
        steps.append(MawarithStep(title: "الحجب", detail: hajbLog.isEmpty ? "لا يوجد وارث محجوب في هذه المسألة." : "حُجب \(hajbLog.count) صنفًا من الورثة، راجع سجلّ الحجب للتفاصيل."))

        var (fixed, hasDescendant) = computeFixedShares(h, excluded, config)

        // العمريتان
        let spouseKey: K? = h[.husband]! > 0 ? .husband : h[.wife]! > 0 ? .wife : nil
        let siblingKeys: [K] = [.fullBrothers, .fullSisters, .paternalBrothers, .paternalSisters, .maternalBrothers, .maternalSisters]
        let numSiblingsPresent = siblingKeys.reduce(0) { $0 + (excluded.contains($1) ? 0 : h[$1]!) }
        if let spouseKey, h[.father]! > 0, h[.mother]! > 0, !hasDescendant, numSiblingsPresent == 0 {
            if let i = fixed.firstIndex(where: { $0.heir == .mother }) {
                let remainder = F.one.sub(spouseKey == .husband ? half : quarter)
                fixed[i].totalShare = remainder.mul(third)
                fixed[i].reason = "مسألة العمريتين (الغرّاوان): للأم ثلث الباقي بعد فرض الزوج/الزوجة، لا ثلث كل التركة"
                steps.append(MawarithStep(title: "حالة خاصة: العمريتان", detail: "زوج/زوجة + أب + أم بلا فرع وارث ولا إخوة — للأم ثلث ما يبقى بعد نصيب الزوجية، والباقي كله للأب."))
            }
        }

        // مقاسمة الجد مع الإخوة
        if h[.paternalGrandfather]! > 0 && !excluded.contains(.paternalGrandfather) && h[.father]! == 0 {
            func c(_ k: K) -> Int { excluded.contains(k) ? 0 : h[k]! }
            let siblingCount = c(.fullBrothers) + c(.fullSisters) + c(.paternalBrothers) + c(.paternalSisters)
            if siblingCount > 0 && config.grandfatherWithSiblings == .grandfatherExcludes {
                for k in [K.fullBrothers, .fullSisters, .paternalBrothers, .paternalSisters] { excluded.insert(k) }
                hajbLog.append(MawarithHajbEntry(heir: .fullBrothers, type: .hirman, reason: "الجدّ يُسقط الإخوة والأخوات (حسب الإعداد الفقهي المختار)", excludedBy: [.paternalGrandfather]))
                steps.append(MawarithStep(title: "الجد مع الإخوة", detail: "بحسب الإعداد الفقهي الحالي، الجدّ يحجب جميع الإخوة والأخوات حجب حرمان (لا مقاسمة)."))
            } else if siblingCount > 0 {
                steps.append(MawarithStep(title: "الجد مع الإخوة", detail: "الجد يقاسم الإخوة والأخوات الأشقاء/لأب (وفق قول الجمهور) — تُطبَّق المقاسمة ضمن توزيع الباقي."))
            }
        }

        // المشرَّكة
        func pos(_ k: K) -> Int { h[k]! > 0 && !excluded.contains(k) ? h[k]! : 0 }
        let matCount = pos(.maternalBrothers) + pos(.maternalSisters)
        let fullCount = pos(.fullBrothers) + pos(.fullSisters)
        let isMushtaraka = h[.husband]! > 0 && h[.father]! == 0
            && (h[.paternalGrandfather]! == 0 || excluded.contains(.paternalGrandfather))
            && !hasDescendant && h[.mother]! > 0 && !excluded.contains(.mother)
            && matCount >= 2 && fullCount >= 1
        if isMushtaraka && config.mushtarakaShareWithMaternalSiblings {
            let totalHeads = matCount + fullCount
            for key in [K.maternalBrothers, .maternalSisters] {
                if let i = fixed.firstIndex(where: { $0.heir == key }) { fixed.remove(at: i) }
            }
            let perHead = third.div(F(totalHeads))
            func pushShared(_ key: K, _ count: Int) {
                if count <= 0 { return }
                fixed.append(Fixed(heir: key, count: count, totalShare: perHead.mul(F(count)),
                                   reason: "مسألة المشرَّكة (الحمارية): يُشرَّك مع إخوة الأم في الثلث بالتساوي للرأس (حكم الجمهور)"))
            }
            pushShared(.maternalBrothers, pos(.maternalBrothers))
            pushShared(.maternalSisters, pos(.maternalSisters))
            pushShared(.fullBrothers, pos(.fullBrothers))
            pushShared(.fullSisters, pos(.fullSisters))
            steps.append(MawarithStep(title: "حالة خاصة: المشرَّكة (الحمارية)", detail: "زوج + أم + إخوة لأم (٢ فأكثر) + إخوة أشقاء بلا أب ولا جد: يُشرَّك الإخوة الأشقاء مع إخوة الأم في ثلث التركة بالتساوي، بدل حرمانهم كليًا (حكم الجمهور، قابل للتعطيل في الإعداد الفقهي)."))
        } else if isMushtaraka {
            steps.append(MawarithStep(title: "حالة خاصة: المشرَّكة (الحمارية)", detail: "بحسب الإعداد الفقهي الحالي، لا يُشرَّك الإخوة الأشقاء مع إخوة الأم؛ يُطبَّق القياس المجرَّد (فلا يبقى للإخوة الأشقاء شيء في هذه الصورة تحديدًا)."))
        }

        var fixedSum = fixed.reduce(F.zero) { $0.add($1.totalShare) }

        // أصحاب البقية
        var claimants: [Claimant] = []
        func pres(_ k: K) -> Bool { h[k]! > 0 && !excluded.contains(k) }
        let hasSon = pres(.sons), hasSonsOfSon = pres(.sonsOfSon)
        let hasDaughters = pres(.daughters), hasDaughtersOfSon = pres(.daughtersOfSon)
        let hasFullBrother = pres(.fullBrothers), hasFullSister = pres(.fullSisters)
        let hasPaternalBrother = pres(.paternalBrothers), hasPaternalSister = pres(.paternalSisters)

        func dropFixed(_ k: K) {
            if let i = fixed.firstIndex(where: { $0.heir == k }) {
                fixedSum = fixedSum.sub(fixed[i].totalShare)
                fixed.remove(at: i)
            }
        }

        if hasSon {
            claimants.append(Claimant(heir: .sons, count: h[.sons]!, weight: 2))
            if hasDaughters { claimants.append(Claimant(heir: .daughters, count: h[.daughters]!, weight: 1)) }
            dropFixed(.daughters)
        } else if hasSonsOfSon {
            claimants.append(Claimant(heir: .sonsOfSon, count: h[.sonsOfSon]!, weight: 2))
            if hasDaughtersOfSon {
                claimants.append(Claimant(heir: .daughtersOfSon, count: h[.daughtersOfSon]!, weight: 1))
                dropFixed(.daughtersOfSon)
            }
        } else if hasDaughters || hasDaughtersOfSon {
            if hasFullSister {
                claimants.append(Claimant(heir: .fullSisters, count: h[.fullSisters]!, weight: 1))
                dropFixed(.fullSisters)
                steps.append(MawarithStep(title: "تعصيب مع الغير", detail: "الأخت الشقيقة أصبحت عصبة مع البنت/بنت الابن (تُعصِّبها البنات لا محجوبة ولا صاحبة فرض مستقل)."))
            } else if hasPaternalSister && !hasFullSister {
                claimants.append(Claimant(heir: .paternalSisters, count: h[.paternalSisters]!, weight: 1))
                dropFixed(.paternalSisters)
            }
        }

        if claimants.isEmpty {
            if h[.father]! > 0 && !excluded.contains(.father) && !hasDescendant {
                claimants.append(Claimant(heir: .father, count: 1, weight: 1))
            } else if h[.father]! > 0 && !excluded.contains(.father) && (hasDaughters || hasDaughtersOfSon) && !hasSon && !hasSonsOfSon {
                claimants.append(Claimant(heir: .father, count: 1, weight: 1))
            } else if h[.paternalGrandfather]! > 0 && !excluded.contains(.paternalGrandfather) && h[.father]! == 0 {
                let siblingCount = (hasFullBrother ? h[.fullBrothers]! : 0) + (hasFullSister ? h[.fullSisters]! : 0)
                    + (hasPaternalBrother ? h[.paternalBrothers]! : 0) + (hasPaternalSister ? h[.paternalSisters]! : 0)
                if siblingCount == 0 || config.grandfatherWithSiblings == .grandfatherExcludes {
                    claimants.append(Claimant(heir: .paternalGrandfather, count: 1, weight: 1))
                } else if hasFullBrother || hasFullSister {
                    claimants.append(Claimant(heir: .paternalGrandfather, count: 1, weight: 2))
                    if hasFullBrother { claimants.append(Claimant(heir: .fullBrothers, count: h[.fullBrothers]!, weight: 2)) }
                    if hasFullSister { claimants.append(Claimant(heir: .fullSisters, count: h[.fullSisters]!, weight: 1)) }
                } else {
                    claimants.append(Claimant(heir: .paternalGrandfather, count: 1, weight: 2))
                    if hasPaternalBrother { claimants.append(Claimant(heir: .paternalBrothers, count: h[.paternalBrothers]!, weight: 2)) }
                    if hasPaternalSister { claimants.append(Claimant(heir: .paternalSisters, count: h[.paternalSisters]!, weight: 1)) }
                }
            } else if (hasFullBrother || hasFullSister) && !(isMushtaraka && config.mushtarakaShareWithMaternalSiblings) {
                if hasFullBrother { claimants.append(Claimant(heir: .fullBrothers, count: h[.fullBrothers]!, weight: 2)) }
                if hasFullSister { claimants.append(Claimant(heir: .fullSisters, count: h[.fullSisters]!, weight: 1)) }
            } else if hasPaternalBrother || hasPaternalSister {
                if hasPaternalBrother { claimants.append(Claimant(heir: .paternalBrothers, count: h[.paternalBrothers]!, weight: 2)) }
                if hasPaternalSister { claimants.append(Claimant(heir: .paternalSisters, count: h[.paternalSisters]!, weight: 1)) }
            }
        }

        let totalWeight = claimants.reduce(0) { $0 + $1.count * $1.weight }
        let remainder = F.one.sub(fixedSum)
        var radd = false
        var awl = false
        var shares: [MawarithHeirShare] = []

        func fixedShare(_ f: Fixed) -> MawarithHeirShare {
            MawarithHeirShare(heir: f.heir, count: f.count, basis: .fixed, totalShare: f.totalShare,
                              perPersonShare: f.totalShare.div(F(f.count)), reason: f.reason)
        }

        if fixedSum.greaterThan(F.one) {
            steps.append(MawarithStep(title: "العول", detail: "مجموع الفروض (\(fixedSum.description)) يتجاوز أصل المسألة — تُعال المسألة فيُقسَّم كل نصيب على المجموع الفعلي بدل الواحد الصحيح."))
            for f in fixed {
                let adjusted = f.totalShare.div(fixedSum)
                shares.append(MawarithHeirShare(heir: f.heir, count: f.count, basis: .fixed, totalShare: adjusted,
                                                perPersonShare: adjusted.div(F(f.count)), reason: f.reason))
            }
            awl = true
        } else if totalWeight > 0 {
            for f in fixed { shares.append(fixedShare(f)) }
            for c in claimants {
                let share = remainder.mul(F(c.count * c.weight, totalWeight))
                let female: Set<K> = [.daughters, .daughtersOfSon, .fullSisters, .paternalSisters]
                let basis: MawarithShareBasis = female.contains(c.heir) && c.weight == 1 && claimants.count > 1 ? .asabaWithDaughters : .asaba
                shares.append(MawarithHeirShare(heir: c.heir, count: c.count, basis: basis, totalShare: share,
                                                perPersonShare: share.div(F(c.count)), reason: "تعصيبًا (الباقي بعد أصحاب الفروض)"))
            }
        } else if !remainder.isZero && remainder.isPositive {
            let eligibleFn: (Fixed) -> Bool = { config.raddToSpouse || ($0.heir != .husband && $0.heir != .wife) }
            let raddEligible = fixed.filter(eligibleFn)
            let raddSum = raddEligible.reduce(F.zero) { $0.add($1.totalShare) }
            if !raddEligible.isEmpty && raddSum.isPositive {
                radd = true
                steps.append(MawarithStep(title: "الرد", detail: "بقي جزء من التركة بعد الفروض بلا عصبة تستحقّه — يُرَدّ على أصحاب الفروض (غير الزوجين، ما لم يُفعَّل ردّ الزوجين في الإعداد) بنسبة أنصبتهم."))
                for f in fixed {
                    let eligible = eligibleFn(f)
                    let extra = eligible ? remainder.mul(f.totalShare).div(raddSum) : F.zero
                    let total = f.totalShare.add(extra)
                    let withExtra = eligible && extra.isPositive
                    shares.append(MawarithHeirShare(heir: f.heir, count: f.count, basis: withExtra ? .radd : .fixed, totalShare: total,
                                                    perPersonShare: total.div(F(f.count)), reason: f.reason + (withExtra ? " + نصيب من الرد" : "")))
                }
            } else {
                warnings.append("توجد بقية من التركة بلا عصبة معروفة ولا صاحب فرض يُرَدّ عليه ضمن الورثة المُدخَلين — تؤول لذوي الأرحام أو بيت المال بحسب الحالة؛ يلزم مراجعة مختص شرعي/قانوني لتحديد ذلك بدقة.")
                for f in fixed { shares.append(fixedShare(f)) }
            }
        } else {
            for f in fixed { shares.append(fixedShare(f)) }
        }

        if fixed.isEmpty && claimants.isEmpty {
            warnings.append("لا يوجد بين الورثة المُدخَلين صاحب فرض معروف ولا عصبة — راجع بيانات المسألة، أو أنها تحتاج توريث ذوي الأرحام (يتطلب مختصًا).")
        }

        var base = 1
        for f in fixed { base = (base * f.totalShare.den) / MawarithFraction.gcd(base, f.totalShare.den) }
        if base < 1 { base = 1 }

        var awlBase: Int? = nil
        if awl {
            let scale = base / fixedSum.den
            awlBase = fixedSum.num * (scale == 0 ? 1 : scale)
        }

        var merged: [MawarithHeirShare] = []
        for s in shares {
            if let i = merged.firstIndex(where: { $0.heir == s.heir }) {
                merged[i].totalShare = merged[i].totalShare.add(s.totalShare)
                merged[i].perPersonShare = merged[i].totalShare.div(F(merged[i].count))
                merged[i].reason = "\(merged[i].reason)؛ و\(s.reason)"
                if s.basis == .asaba || s.basis == .asabaWithDaughters { merged[i].basis = s.basis }
            } else {
                merged.append(s)
            }
        }
        return MawarithResult(originalBase: base, awlBase: awlBase, radd: radd, shares: merged, hajbLog: hajbLog,
                              steps: steps, warnings: warnings, netEstate: .zero)
    }
}
