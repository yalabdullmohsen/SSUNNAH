import SwiftUI

// واجهة حاسبة المواريث: تطابق معالج الموقع (MawarithCalculatorView.tsx) ثلاث خطوات: الورثة ← التركة ← النتيجة.
// لا منطق شرعي هنا: كل الأحكام في MawarithEngine / MawarithEstate (نقل حرفي مُثبَت باختبارات ذهبية).

enum MawarithLabels {
    static let heir: [MawarithHeirKey: String] = [
        .husband: "الزوج", .wife: "الزوجة", .father: "الأب", .mother: "الأم",
        .paternalGrandfather: "الجدّ لأب", .paternalGrandmother: "الجدّة لأب", .maternalGrandmother: "الجدّة لأم",
        .sons: "الابن", .daughters: "البنت", .sonsOfSon: "ابن الابن", .daughtersOfSon: "بنت الابن",
        .fullBrothers: "الأخ الشقيق", .fullSisters: "الأخت الشقيقة",
        .paternalBrothers: "الأخ لأب", .paternalSisters: "الأخت لأب",
        .maternalBrothers: "الأخ لأم", .maternalSisters: "الأخت لأم",
    ]
    static let basis: [MawarithShareBasis: String] = [
        .fixed: "فرض", .asaba: "تعصيب", .asabaWithDaughters: "تعصيب مع الغير", .radd: "فرض + ردّ",
    ]
    static let groups: [(title: String, keys: [MawarithHeirKey])] = [
        ("الأصول", [.father, .mother, .paternalGrandfather, .paternalGrandmother, .maternalGrandmother]),
        ("الفروع", [.sons, .daughters, .sonsOfSon, .daughtersOfSon]),
        ("الحواشي (الإخوة والأخوات)", [.fullBrothers, .fullSisters, .paternalBrothers, .paternalSisters, .maternalBrothers, .maternalSisters]),
    ]
    static let presets: [(title: String, heirs: [MawarithHeirKey: Int])] = [
        ("زوجة + ابنان + بنت", [.wife: 1, .sons: 2, .daughters: 1]),
        ("العمريتان: زوج + أب + أم", [.husband: 1, .father: 1, .mother: 1]),
        ("المشرَّكة (الحمارية): زوج + أم + أخوان لأم + أخوان أشقاء", [.husband: 1, .mother: 1, .maternalBrothers: 2, .fullBrothers: 2]),
        ("بنت واحدة + أب + أم", [.daughters: 1, .father: 1, .mother: 1]),
        ("زوجة + بنتان + أب", [.wife: 1, .daughters: 2, .father: 1]),
        ("أب + أم فقط", [.father: 1, .mother: 1]),
        ("زوجتان + ابن + بنتان", [.wife: 2, .sons: 1, .daughters: 2]),
        ("عَوْل: زوج + أختان شقيقتان", [.husband: 1, .fullSisters: 2]),
        ("زوج + جدة لأب + جدة لأم", [.husband: 1, .paternalGrandmother: 1, .maternalGrandmother: 1]),
        ("ابن ابن + بنت ابن (بلا ابن ولا بنات)", [.sonsOfSon: 1, .daughtersOfSon: 1]),
        ("رَدّ: بنت واحدة + أم", [.daughters: 1, .mother: 1]),
        ("مقاسمة الجد: جد + أخوان شقيقان (بلا أب)", [.paternalGrandfather: 1, .fullBrothers: 2]),
    ]
    static let disclaimer = "تذكير: النتائج تقديرية وفق قواعد جمهور الفقهاء المُعدَّة في هذه الأداة، ولا تُغني عن استشارة عالم شرعي مختص عند التطبيق الفعلي، خصوصًا في القضايا المعقّدة أو المتنازَع عليها."
}

struct MawarithCalculatorScreen: View {
    private enum Step { case heirs, estate, result }
    private enum Spouse { case none, husband, wife }

    @State private var step: Step = .heirs
    @State private var counts: [MawarithHeirKey: Int] = [:]
    @State private var spouse: Spouse = .none
    @State private var wives = 1
    @State private var assets: [String] = [""]
    @State private var debts = ""
    @State private var funeral = ""
    @State private var bequest = ""
    @State private var bequestApproved = false
    @State private var config = MawarithFiqhConfig.default
    @State private var showAdvanced = false
    @State private var result: MawarithResult?
    @State private var estate: MawarithEstateBreakdown?
    @State private var error: String?

    private var totalHeirs: Int {
        counts.values.reduce(0, +) + (spouse == .husband ? 1 : spouse == .wife ? wives : 0)
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: Sunnah.Spacing.s4) {
                stepHeader
                switch step {
                case .heirs: heirsStep
                case .estate: estateStep
                case .result: resultStep
                }
            }
            .padding(Sunnah.Spacing.s4)
        }
        .background(Sunnah.Colors.bg)
        .sunnahNavTitle("حاسبة المواريث الإسلامية")
        #if os(iOS)
        .navigationBarTitleDisplayMode(.inline)
        #endif
    }

    // MARK: عناصر مشتركة

    private var stepHeader: some View {
        let n = step == .heirs ? 1 : step == .estate ? 2 : 3
        return VStack(alignment: .leading, spacing: Sunnah.Spacing.s2) {
            Text("حدّد الورثة والتركة، وستحصل على توزيع الأنصبة الشرعية مع شرح كل خطوة.")
                .font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.textSecondary)
            // بأحجام Dynamic Type الكبرى لا تتسع الرقائق الثلاث أفقيًا فكانت «النتيجة» تنكسر وسط الكلمة → تُرصّ عموديًا
            let chips = ForEach(Array(["الورثة", "التركة", "النتيجة"].enumerated()), id: \.offset) { i, t in
                SunnahChip("\(i + 1). \(t)", selected: i + 1 == n)
            }
            ViewThatFits(in: .horizontal) {
                HStack(spacing: Sunnah.Spacing.s2) { chips }
                VStack(alignment: .leading, spacing: Sunnah.Spacing.s2) { chips }
            }
        }
    }

    private func sectionTitle(_ t: String) -> some View {
        Text(t).font(Sunnah.Typography.cardTitle).foregroundStyle(Sunnah.Colors.textPrimary)
            .accessibilityAddTraits(.isHeader)
    }

    private func stepper(_ label: String, value: Int, range: ClosedRange<Int>, set: @escaping (Int) -> Void) -> some View {
        HStack {
            Text(label).font(Sunnah.Typography.body).foregroundStyle(Sunnah.Colors.textPrimary)
            Spacer()
            HStack(spacing: Sunnah.Spacing.s3) {
                roundButton("minus", "إنقاص عدد \(label)", enabled: value > range.lowerBound) { set(value - 1) }
                Text("\(value)").font(Sunnah.Typography.cardTitle).foregroundStyle(Sunnah.Colors.textPrimary)
                    .frame(minWidth: 28)
                roundButton("plus", "زيادة عدد \(label)", enabled: value < range.upperBound) { set(value + 1) }
            }
        }
        .frame(minHeight: 44)
    }

    private func roundButton(_ symbol: String, _ label: String, enabled: Bool, _ action: @escaping () -> Void) -> some View {
        Button(action: action) {
            Image(systemName: symbol).font(Sunnah.Typography.body)
                .foregroundStyle(enabled ? Sunnah.Colors.primary : Sunnah.Colors.textSecondary)
                .frame(width: 44, height: 44)
                .background(Sunnah.Colors.surface2, in: Circle())
        }
        .buttonStyle(.plain).disabled(!enabled).accessibilityLabel(label)
    }

    private func moneyField(_ title: String, text: Binding<String>) -> some View {
        VStack(alignment: .leading, spacing: Sunnah.Spacing.s2) {
            Text(title).font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.textSecondary)
            TextField("0", text: text)
                #if os(iOS)
                .keyboardType(.decimalPad)
                #endif
                .font(Sunnah.Typography.body)
                .padding(Sunnah.Spacing.s3).frame(minHeight: 44)
                .background(Sunnah.Colors.surface2, in: RoundedRectangle(cornerRadius: Sunnah.Radius.small))
        }
    }

    // MARK: خطوة الورثة

    private var heirsStep: some View {
        VStack(alignment: .leading, spacing: Sunnah.Spacing.s4) {
            sectionTitle("أمثلة جاهزة للتجربة")
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: Sunnah.Spacing.s2) {
                    ForEach(Array(MawarithLabels.presets.enumerated()), id: \.offset) { _, p in
                        Button { applyPreset(p.heirs) } label: { SunnahChip(p.title) }
                            .buttonStyle(.plain).frame(minHeight: 44)
                    }
                }
            }
            SunnahCard {
                VStack(alignment: .leading, spacing: Sunnah.Spacing.s2) {
                    sectionTitle("الزوج / الزوجة")
                    HStack(spacing: Sunnah.Spacing.s2) {
                        spouseOption("لا يوجد", .none)
                        spouseOption("زوج", .husband)
                        spouseOption("زوجة", .wife)
                    }
                    if spouse == .wife {
                        stepper("عدد الزوجات", value: wives, range: 1...4) { wives = $0 }
                    }
                }
            }
            ForEach(MawarithLabels.groups, id: \.title) { g in
                SunnahCard {
                    VStack(alignment: .leading, spacing: Sunnah.Spacing.s1) {
                        sectionTitle(g.title)
                        ForEach(g.keys, id: \.self) { key in
                            stepper(MawarithLabels.heir[key] ?? key.rawValue, value: counts[key] ?? 0, range: 0...20) { counts[key] = $0 }
                        }
                    }
                }
            }
            if totalHeirs == 0 {
                Text("حدّد وارثًا واحدًا على الأقل للمتابعة.")
                    .font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.textSecondary)
            }
            SunnahButton("التالي") { if totalHeirs > 0 { step = .estate } }
                .opacity(totalHeirs == 0 ? 0.4 : 1).disabled(totalHeirs == 0)
        }
    }

    private func spouseOption(_ title: String, _ value: Spouse) -> some View {
        Button { spouse = value } label: {
            Text(title).font(Sunnah.Typography.body)
                .frame(maxWidth: .infinity, minHeight: 44)
                .foregroundStyle(spouse == value ? Sunnah.Colors.textOnPrimary : Sunnah.Colors.textPrimary)
                .background(spouse == value ? Sunnah.Colors.primary : Sunnah.Colors.surface2,
                            in: RoundedRectangle(cornerRadius: Sunnah.Radius.small))
        }
        .buttonStyle(.plain)
        .accessibilityAddTraits(spouse == value ? .isSelected : [])
    }

    private func applyPreset(_ heirs: [MawarithHeirKey: Int]) {
        var c = heirs
        if (c[.husband] ?? 0) > 0 { spouse = .husband; wives = 1 }
        else if (c[.wife] ?? 0) > 0 { spouse = .wife; wives = max(1, c[.wife] ?? 1) }
        else { spouse = .none }
        c[.husband] = nil; c[.wife] = nil
        counts = c
        step = .heirs
    }

    // MARK: خطوة التركة

    private var estateStep: some View {
        VStack(alignment: .leading, spacing: Sunnah.Spacing.s4) {
            SunnahCard {
                VStack(alignment: .leading, spacing: Sunnah.Spacing.s3) {
                    sectionTitle("أصول التركة")
                    ForEach(assets.indices, id: \.self) { i in
                        HStack(alignment: .bottom, spacing: Sunnah.Spacing.s2) {
                            moneyField("قيمة الأصل \(i + 1)", text: $assets[i])
                            if assets.count > 1 {
                                roundButton("trash", "حذف الأصل \(i + 1)", enabled: true) { assets.remove(at: i) }
                            }
                        }
                    }
                    SunnahButton("إضافة أصل", style: .secondary) { assets.append("") }
                }
            }
            SunnahCard {
                VStack(alignment: .leading, spacing: Sunnah.Spacing.s3) {
                    sectionTitle("الحقوق المتعلقة بالتركة")
                    moneyField("مؤن التجهيز", text: $funeral)
                    moneyField("الديون", text: $debts)
                    moneyField("الوصية", text: $bequest)
                    Toggle("أجازها جميع الورثة", isOn: $bequestApproved)
                        .font(Sunnah.Typography.body).tint(Sunnah.Colors.primary).frame(minHeight: 44)
                }
            }
            SunnahCard {
                VStack(alignment: .leading, spacing: Sunnah.Spacing.s2) {
                    Button { showAdvanced.toggle() } label: {
                        HStack {
                            sectionTitle("خيارات فقهية متقدمة")
                            Spacer()
                            Image(systemName: showAdvanced ? "chevron.up" : "chevron.down")
                                .foregroundStyle(Sunnah.Colors.textSecondary)
                        }
                        .frame(minHeight: 44)
                    }
                    .buttonStyle(.plain)
                    if showAdvanced { advancedOptions }
                }
            }
            if let error {
                Text(error).font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.danger)
                    .accessibilityAddTraits(.isStaticText)
            }
            SunnahButton("احسب الأنصبة") { calculate() }
            SunnahButton("← رجوع", style: .secondary) { step = .heirs }
        }
    }

    private var advancedOptions: some View {
        VStack(alignment: .leading, spacing: Sunnah.Spacing.s2) {
            Toggle("الجدّ يحجب الإخوة (قول أبي حنيفة) بدل المقاسمة",
                   isOn: Binding(get: { config.grandfatherWithSiblings == .grandfatherExcludes },
                                 set: { config.grandfatherWithSiblings = $0 ? .grandfatherExcludes : .muqasama }))
            Toggle("الردّ على الزوجين", isOn: $config.raddToSpouse)
            Toggle("تشريك الأشقاء مع إخوة الأم في المشرَّكة", isOn: $config.mushtarakaShareWithMaternalSiblings)
        }
        .font(Sunnah.Typography.body).tint(Sunnah.Colors.primary)
    }

    private func calculate() {
        // لوحات المفاتيح العربية تُنتج أرقامًا هندية وفاصلة «٫»؛ Double() يرفضها فكانت تُحتسب صفرًا بصمت
        func num(_ s: String) -> Double {
            var t = s
            for (i, d) in "٠١٢٣٤٥٦٧٨٩".enumerated() { t = t.replacingOccurrences(of: String(d), with: String(i)) }
            return Double(t.replacingOccurrences(of: "٫", with: ".").replacingOccurrences(of: ",", with: ".")) ?? 0
        }
        var raw: [String: Double] = [:]
        for (k, v) in counts { raw[k.rawValue] = Double(v) }
        raw[MawarithHeirKey.husband.rawValue] = spouse == .husband ? 1 : 0
        raw[MawarithHeirKey.wife.rawValue] = spouse == .wife ? Double(wives) : 0
        do {
            let b = try MawarithEstate.compute(MawarithEstateInput(
                assets: assets.map(num), debts: num(debts), funeralCosts: num(funeral),
                bequest: num(bequest), bequestApprovedByHeirs: bequestApproved))
            result = try MawarithEngine.calculate(raw: raw, config: config)
            estate = b; error = nil; step = .result
        } catch let e as MawarithInputError {
            error = e.message
        } catch {
            self.error = "حدث خطأ غير متوقع أثناء الحساب."
        }
    }

    // MARK: خطوة النتيجة

    private static let money: NumberFormatter = {
        let f = NumberFormatter()
        f.locale = Locale(identifier: "ar@numbers=arab")
        f.minimumFractionDigits = 0; f.maximumFractionDigits = 2
        return f
    }()

    private func fmt(_ v: Double) -> String { Self.money.string(from: NSNumber(value: v)) ?? "\(v)" }

    /// يطابق Fraction.toDecimal(2) في الموقع: قسمة صحيحة مبتورة ثم ÷100.
    private func decimal(_ f: MawarithFraction) -> Double { Double(f.num * 100 / f.den) / 100 }

    @ViewBuilder private var resultStep: some View {
        if let result, let estate {
            VStack(alignment: .leading, spacing: Sunnah.Spacing.s4) {
                ForEach(result.warnings, id: \.self) { w in noteCard(w) }
                SunnahCard {
                    VStack(alignment: .leading, spacing: Sunnah.Spacing.s2) {
                        sectionTitle("صافي التركة القابل للتوزيع")
                        row("إجمالي التركة", fmt(estate.grossEstate))
                        row("مؤن التجهيز", "− " + fmt(estate.funeralCosts))
                        row("الديون", "− " + fmt(estate.debts))
                        row("الوصية المنفَّذة" + (estate.bequestCapped ? " (بحدّ الثلث)" : ""), "− " + fmt(estate.bequestPaid))
                        row("صافي التركة للورثة", fmt(estate.netForHeirs), bold: true)
                        ForEach(estate.warnings, id: \.self) { w in
                            Text(w).font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.textSecondary)
                        }
                    }
                }
                if !result.shares.isEmpty {
                    sectionTitle("أنصبة الورثة")
                    ForEach(result.shares, id: \.heir) { s in
                        SunnahCard {
                            VStack(alignment: .leading, spacing: Sunnah.Spacing.s1) {
                                Text(((MawarithLabels.heir[s.heir] ?? "") + (s.count > 1 ? " (\(s.count))" : "")).arabicDigits)
                                    .font(Sunnah.Typography.cardTitle).foregroundStyle(Sunnah.Colors.textPrimary)
                                row("النصيب", "\(s.totalShare.ratioText) — " + fmt(decimal(s.totalShare.mul(estate.netForHeirsFraction))))
                                if s.count > 1 {
                                    row("نصيب الفرد", "\(s.perPersonShare.ratioText) — " + fmt(decimal(s.perPersonShare.mul(estate.netForHeirsFraction))))
                                }
                                row("الأساس", MawarithLabels.basis[s.basis] ?? "")
                            }
                        }
                    }
                }
                Text("أصل المسألة: \(result.originalBase)"
                     + (result.awlBase.map { " — بعد العول: \($0)" } ?? "")
                     + (result.radd ? " — وقع ردّ الفائض على أصحاب الفروض" : ""))
                    .font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.textSecondary)
                if !result.steps.isEmpty {
                    DisclosureGroup("خطوات الحساب بالتفصيل") {
                        VStack(alignment: .leading, spacing: Sunnah.Spacing.s2) {
                            ForEach(Array(result.steps.enumerated()), id: \.offset) { _, s in
                                Text("\(s.title): \(s.detail)".asArabicDigits).font(Sunnah.Typography.secondary)
                                    .foregroundStyle(Sunnah.Colors.textPrimary)
                            }
                        }.padding(.top, Sunnah.Spacing.s2)
                    }.font(Sunnah.Typography.body).tint(Sunnah.Colors.primary)
                }
                if !result.hajbLog.isEmpty {
                    DisclosureGroup("سجلّ الحجب (من حُجب ولماذا)") {
                        VStack(alignment: .leading, spacing: Sunnah.Spacing.s2) {
                            ForEach(Array(result.hajbLog.enumerated()), id: \.offset) { _, h in
                                Text("\(MawarithLabels.heir[h.heir] ?? "") — \(h.type == .hirman ? "حجب حرمان كامل" : "حجب نقصان"): \(h.reason)")
                                    .font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.textPrimary)
                            }
                        }.padding(.top, Sunnah.Spacing.s2)
                    }.font(Sunnah.Typography.body).tint(Sunnah.Colors.primary)
                }
                SunnahButton("← تعديل البيانات", style: .secondary) { step = .estate }
                SunnahButton("مسألة جديدة", style: .secondary) { reset() }
                noteCard(MawarithLabels.disclaimer)
            }
        }
    }

    private func row(_ k: String, _ v: String, bold: Bool = false) -> some View {
        HStack(alignment: .firstTextBaseline) {
            Text(k).font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.textSecondary)
            Spacer(minLength: Sunnah.Spacing.s3)
            Text(v).font(bold ? Sunnah.Typography.cardTitle : Sunnah.Typography.body)
                .foregroundStyle(Sunnah.Colors.textPrimary).multilineTextAlignment(.trailing)
        }
    }

    private func noteCard(_ text: String) -> some View {
        Text(text).font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.textPrimary)
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(Sunnah.Spacing.s3)
            .background(Sunnah.Colors.surface2, in: RoundedRectangle(cornerRadius: Sunnah.Radius.small))
    }

    private func reset() {
        counts = [:]; spouse = .none; wives = 1; assets = [""]; debts = ""; funeral = ""
        bequest = ""; bequestApproved = false; config = .default
        result = nil; estate = nil; error = nil; step = .heirs
    }
}
