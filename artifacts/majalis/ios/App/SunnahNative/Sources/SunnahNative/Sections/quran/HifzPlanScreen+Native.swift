import SwiftUI
#if canImport(UserNotifications)
import UserNotifications
#endif

// MARK: - /quran/memorization-plans — خطة حفظ المصحف (تضم خطط السور القديمة بلا فقد بيانات)

struct HifzPlanScreen: View {
    var store = QuranLocalStore()
    @State private var state = HifzPlanState(plan: nil)
    @State private var legacyCount = 0
    @State private var editing = false
    @State private var juzStarts: [Int] = []

    private var cal: Calendar { Calendar.current }

    var body: some View {
        ScrollView {
            LazyVStack(alignment: .leading, spacing: Sunnah.Spacing.s4) {
                if state.plan == nil || editing {
                    HifzPlanWizard(initial: state.plan, juzStarts: juzStarts) { plan in
                        state.plan = plan; editing = false; persist()
                    }
                    // الحالة تُعبّأ في init مرة واحدة: إن وصل فهرس الأجزاء بعد فتح المعالج يُعاد بناؤه ليأخذ حدوده (لا الصيغة الاحتياطية).
                    .id(juzStarts.count)
                } else {
                    HifzPlanDashboard(state: $state, today: Date(), calendar: cal, onChange: persist, onEdit: { editing = true })
                }
                if legacyCount > 0 {
                    SunnahNavigationLink { MemorizationPlansScreen() } label: {
                        SunnahCard {
                            HStack {
                                Text("خطط السور السابقة (\(legacyCount.arabicDigits))").font(Sunnah.Typography.cardTitle).foregroundStyle(Sunnah.Colors.textPrimary)
                                Spacer()
                                Image(systemName: "chevron.left").foregroundStyle(Sunnah.Colors.textSecondary)
                            }.frame(minHeight: 44)
                        }
                    }.buttonStyle(.plain)
                }
            }
            .padding(.horizontal, Sunnah.Spacing.s4).padding(.bottom, 110)
        }
        .background(Sunnah.Colors.bg)
        .task { juzStarts = await Task.detached { (try? MushafRepository(bundle: .main)?.index())?.juzStart ?? [] }.value }
        .onAppear {
            state = store.loadHifzPlan()
            legacyCount = (store.load([MemorizationPlan].self, .plans) ?? []).count
        }
        .quranTitle("خطة الحفظ")
    }

    private func persist() {
        store.saveHifzPlan(state)
        HifzReminder.sync(state: state, today: Date(), calendar: cal)
    }
}

// MARK: - المعالج

struct HifzPlanWizard: View {
    enum Goal: Hashable { case whole, juzAmma, juzRange }
    enum StartKind: Hashable { case fatiha, nas, resume }

    let initial: HifzPlan?
    let juzStarts: [Int]
    let onDone: (HifzPlan) -> Void

    @State private var goal: Goal
    @State private var juzFrom: Int
    @State private var juzTo: Int
    @State private var startKind: StartKind
    @State private var resumePage: Int
    @State private var lines: Int
    @State private var weekdays: Set<Int>

    /// التعديل يبدأ من الخطة المحفوظة (الهدف والبداية والوتيرة والأيام)، لا من القيم الافتراضية.
    init(initial: HifzPlan?, juzStarts: [Int], onDone: @escaping (HifzPlan) -> Void) {
        self.initial = initial; self.juzStarts = juzStarts; self.onDone = onDone
        let s = HifzPlanWizardMath.seed(initial, juzStarts: juzStarts)
        _goal = State(initialValue: s.goal); _juzFrom = State(initialValue: s.juzFrom); _juzTo = State(initialValue: s.juzTo)
        _startKind = State(initialValue: s.startKind); _resumePage = State(initialValue: s.resumePage)
        _lines = State(initialValue: s.lines); _weekdays = State(initialValue: s.weekdays)
    }
    @State private var finishShift = 0   // أسابيع مضافة إلى التاريخ المحسوب
    private let cal = Calendar.current
    private let today = Date()

    private static let pace: [(Int, String)] = [(5, "٥ أسطر"), (10, "١٠ أسطر"), (15, "صفحة"), (30, "صفحتان")]
    private static let days: [(Int, String, String)] = [(7, "سبت", "السبت"), (1, "أحد", "الأحد"), (2, "اثنين", "الاثنين"), (3, "ثلاثاء", "الثلاثاء"), (4, "أربعاء", "الأربعاء"), (5, "خميس", "الخميس"), (6, "جمعة", "الجمعة")]

    private var pages: (Int, Int) {
        switch goal {
        case .whole: return (1, HifzPlanMath.pageCount)
        case .juzAmma: return (HifzPlanWizardMath.juzStart(30, juzStarts), HifzPlanMath.pageCount)
        case .juzRange: return (HifzPlanWizardMath.juzStart(juzFrom, juzStarts), HifzPlanWizardMath.juzEnd(max(juzFrom, juzTo), juzStarts))
        }
    }

    private var start: HifzPlanMath.Start {
        switch startKind {
        case .fatiha: return .fatiha
        case .nas: return .nas
        case .resume: return .resume(page: resumePage)
        }
    }

    private var plan: HifzPlan {
        HifzPlan(start: start, firstPage: pages.0, lastPage: pages.1, linesPerDay: effectiveLines, weekdays: weekdays, startDate: initial?.startDate ?? cal.startOfDay(for: today), reminderHour: initial?.reminderHour)
    }

    private var baseFinish: Date? {
        HifzPlanMath.finishDate(start: cal.startOfDay(for: today), totalLines: plan0.totalLines, linesPerDay: lines, weekdays: weekdays, calendar: cal)
    }
    private var plan0: HifzPlan { HifzPlan(start: start, firstPage: pages.0, lastPage: pages.1, linesPerDay: lines, weekdays: weekdays, startDate: today) }

    private var targetFinish: Date? {
        guard let b = baseFinish else { return nil }
        return cal.date(byAdding: .day, value: 7 * finishShift, to: b)
    }

    /// الوتيرة بعد تعديل التاريخ (عكسيًا)، وإلا الوتيرة المختارة.
    private var effectiveLines: Int {
        guard finishShift != 0, let t = targetFinish,
              let l = HifzPlanMath.linesPerDay(toFinishBy: t, start: cal.startOfDay(for: today), totalLines: plan0.totalLines, weekdays: weekdays, calendar: cal) else { return lines }
        return l
    }

    var body: some View {
        VStack(alignment: .leading, spacing: Sunnah.Spacing.s4) {
            SunnahSectionLabel("١ · الهدف")
            SunnahSegmented([(Goal.whole, "المصحف كاملًا"), (.juzAmma, "جزء عمّ"), (.juzRange, "أجزاء")], selection: $goal)
            if goal == .juzRange {
                SunnahCard {
                    VStack(spacing: Sunnah.Spacing.s2) {
                        HifzStepRow(title: "من الجزء", value: $juzFrom, range: 1...30) { if juzTo < $0 { juzTo = $0 } }
                        HifzStepRow(title: "إلى الجزء", value: $juzTo, range: 1...30) { if juzFrom > $0 { juzFrom = $0 } }
                    }
                }
            }
            SunnahSectionLabel("٢ · البداية")
            SunnahSegmented([(StartKind.fatiha, "من الفاتحة"), (.nas, "من الناس"), (.resume, "من حيث وقفت")], selection: $startKind)
            if startKind == .resume {
                SunnahCard { HifzStepRow(title: "الصفحة", value: $resumePage, range: pages.0...pages.1) { _ in } }
            }
            SunnahSectionLabel("٣ · الوتيرة اليومية")
            HStack(spacing: Sunnah.Spacing.s2) {
                ForEach(Self.pace, id: \.0) { p in
                    Button { lines = p.0; finishShift = 0 } label: { SunnahChip(p.1, selected: lines == p.0 && finishShift == 0) }.buttonStyle(.plain)
                }
            }
            Text("أيام الحفظ (بلا تحديد = كل يوم)").font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.textSecondary)
            HStack(spacing: 6) {
                ForEach(Self.days, id: \.0) { d in
                    Button { if weekdays.contains(d.0) { weekdays.remove(d.0) } else { weekdays.insert(d.0) }; finishShift = 0 } label: {
                        HifzDayPill(text: d.1, selected: weekdays.contains(d.0))
                    }.buttonStyle(.plain).accessibilityLabel(d.2)
                }
            }
            SunnahSectionLabel("٤ · تاريخ الختم المتوقع")
            SunnahCard {
                VStack(alignment: .leading, spacing: Sunnah.Spacing.s2) {
                    Text(targetFinish.map { HifzFormat.date($0) } ?? "—").font(Sunnah.Typography.pageTitle).foregroundStyle(Sunnah.Colors.textPrimary)
                    Text("الوتيرة: \(HifzFormat.pace(effectiveLines)) · \(ArabicCount.label(pages.1 - pages.0 + 1, one: "صفحة واحدة", two: "صفحتان", few: "صفحات", many: "صفحة", genitive: "صفحة"))").font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.textSecondary)
                    HStack(spacing: Sunnah.Spacing.s2) {
                        Button { finishShift -= 1 } label: { SunnahChip("أسبوع أبكر") }.buttonStyle(.plain)
                        Button { finishShift += 1 } label: { SunnahChip("أسبوع أبعد") }.buttonStyle(.plain)
                    }
                }
            }
            SunnahButton(initial == nil ? "ابدأ الخطة" : "احفظ التعديل") { onDone(plan) }
        }
    }
}

/// حدود الأجزاء وتعبئة المعالج من خطة محفوظة (نقية للاختبار).
enum HifzPlanWizardMath {
    /// بداية الجزء من فهرس المصحف (`MushafIndex.juzStart`، كما في خريطة «حفظي»)؛ الصيغة التقريبية احتياط إن غاب الفهرس.
    /// الصيغة 2+20(j−1) تخطئ صفحة في الجزأين 7 (121) و11 (201).
    static func juzStart(_ j: Int, _ starts: [Int]) -> Int {
        starts.count == 30 ? HifzProgress.juzPages(j, juzStart: starts).lowerBound : (j <= 1 ? 1 : 2 + (j - 1) * 20)
    }
    static func juzEnd(_ j: Int, _ starts: [Int]) -> Int {
        starts.count == 30 ? HifzProgress.juzPages(j, juzStart: starts).upperBound
            : (j >= 30 ? HifzPlanMath.pageCount : juzStart(j + 1, starts) - 1)
    }
    /// الجزء الذي فيه الصفحة.
    static func juz(ofPage p: Int, _ starts: [Int]) -> Int {
        (1...30).last { juzStart($0, starts) <= p } ?? 1
    }

    struct Seed: Equatable {
        var goal: HifzPlanWizard.Goal, juzFrom: Int, juzTo: Int
        var startKind: HifzPlanWizard.StartKind, resumePage: Int, lines: Int, weekdays: Set<Int>
    }

    static func seed(_ plan: HifzPlan?, juzStarts: [Int]) -> Seed {
        guard let p = plan else { return Seed(goal: .whole, juzFrom: 1, juzTo: 30, startKind: .fatiha, resumePage: 1, lines: 15, weekdays: []) }
        let last = HifzPlanMath.pageCount
        let goal: HifzPlanWizard.Goal = p.firstPage <= 1 && p.lastPage >= last ? .whole
            : (p.firstPage == juzStart(30, juzStarts) && p.lastPage >= last ? .juzAmma : .juzRange)
        let (kind, resume): (HifzPlanWizard.StartKind, Int) = {
            switch p.start {
            case .fatiha: return (.fatiha, p.firstPage)
            case .nas: return (.nas, p.firstPage)
            case .resume(let page): return (.resume, page)
            }
        }()
        return Seed(goal: goal, juzFrom: juz(ofPage: p.firstPage, juzStarts), juzTo: juz(ofPage: p.lastPage, juzStarts),
                    startKind: kind, resumePage: resume, lines: max(1, p.linesPerDay), weekdays: p.weekdays)
    }
}

private struct HifzDayPill: View {
    let text: String; let selected: Bool
    var body: some View {
        Text(text).font(Sunnah.Typography.tag).lineLimit(1).minimumScaleFactor(0.6)
            .padding(.horizontal, 2).frame(maxWidth: .infinity, minHeight: 44)
            .foregroundStyle(selected ? Sunnah.Colors.textOnPrimary : Sunnah.Colors.textPrimary)
            .background(selected ? Sunnah.Colors.primary : Sunnah.Colors.surface, in: Capsule())
            .overlay(Capsule().stroke(selected ? Sunnah.Colors.primary : Sunnah.Colors.border, lineWidth: 1))
    }
}

private struct HifzStepRow: View {
    let title: String
    @Binding var value: Int
    let range: ClosedRange<Int>
    let changed: (Int) -> Void
    var body: some View {
        HStack {
            Text("\(title) \(value.arabicDigits)").font(Sunnah.Typography.cardTitle).foregroundStyle(Sunnah.Colors.textPrimary)
            Spacer()
            stepper("chevron.down", enabled: value > range.lowerBound, label: "أنقص") { value -= 1; changed(value) }
            stepper("chevron.up", enabled: value < range.upperBound, label: "زِد") { value += 1; changed(value) }
        }
    }
    private func stepper(_ symbol: String, enabled: Bool, label: String, _ action: @escaping () -> Void) -> some View {
        Button(action: action) {
            Image(systemName: symbol).font(.system(size: 16, weight: .bold)).foregroundStyle(Sunnah.Colors.primary)
                .frame(width: 44, height: 44).background(Sunnah.Colors.surface, in: Circle()).overlay(Circle().stroke(Sunnah.Colors.border, lineWidth: 1))
        }.buttonStyle(.plain).disabled(!enabled).opacity(enabled ? 1 : 0.4).accessibilityLabel(label)
    }
}

// MARK: - لوحة الورد اليومي والتقدّم

private struct HifzPlanDashboard: View {
    @Binding var state: HifzPlanState
    let today: Date
    let calendar: Calendar
    let onChange: () -> Void
    let onEdit: () -> Void

    var body: some View {
        let wird = state.wird(today: today, calendar: calendar)
        VStack(alignment: .leading, spacing: Sunnah.Spacing.s4) {
            progressCard
            if let w = wird {
                section("حفظ جديد", pages: w.newPages, empty: "أتممت صفحات الخطة") { page in
                    state.markNew(page: page, today: today); onChange()
                }
                section("مراجعة قريبة", pages: w.nearPages, empty: "لا مراجعة قريبة اليوم") { page in
                    state.markReview(page: page, recalled: true, today: today); onChange()
                } stumble: { page in
                    state.markReview(page: page, recalled: false, today: today); onChange()
                }
                section("مراجعة بعيدة", pages: w.farPages, empty: "لا مراجعة بعيدة مستحقة") { page in
                    state.markReview(page: page, recalled: true, today: today); onChange()
                } stumble: { page in
                    state.markReview(page: page, recalled: false, today: today); onChange()
                }
            }
            reminderCard
            SunnahButton("تعديل الخطة", style: .outline, action: onEdit)
        }
    }

    private var progressCard: some View {
        let total = state.plan?.sequence.count ?? 0
        let p = state.progress(today: today, calendar: calendar)
        let fraction = total > 0 ? Double(state.doneInPlan) / Double(total) : 0
        return SunnahCard {
            VStack(alignment: .leading, spacing: Sunnah.Spacing.s2) {
                Text("حُفظ \(state.doneInPlan.arabicDigits) من \(total.arabicDigits) صفحة · \(Int(fraction * 100).arabicDigits)٪").font(Sunnah.Typography.cardTitle).foregroundStyle(Sunnah.Colors.textPrimary)
                ProgressView(value: fraction).tint(Sunnah.Colors.primary)
                if let p { Text(HifzFormat.status(p)).font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.textSecondary) }
                if let end = state.expectedFinish(today: today, calendar: calendar) {
                    Text("الختم المتوقع: \(HifzFormat.date(end))").font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.textSecondary)
                }
                if let p, p.state == .behind, let plan = state.plan, let end = state.expectedFinish(today: today, calendar: calendar) {
                    Text("تأخّرت قليلًا؛ حُسب الختم من المتبقي فتبقى الوتيرة \(HifzFormat.pace(plan.linesPerDay)) وتاريخه \(HifzFormat.date(end)).").font(Sunnah.Typography.tag).foregroundStyle(Sunnah.Colors.textSecondary)
                }
            }
        }
    }

    private func section(_ title: String, pages: [Int], empty: String, done: @escaping (Int) -> Void, stumble: ((Int) -> Void)? = nil) -> some View {
        VStack(alignment: .leading, spacing: 0) {
            SunnahSectionLabel(title)
            SunnahCard {
                VStack(spacing: Sunnah.Spacing.s2) {
                    if pages.isEmpty { Text(empty).font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.textSecondary).frame(maxWidth: .infinity, alignment: .leading) }
                    ForEach(pages, id: \.self) { page in
                        HStack(spacing: Sunnah.Spacing.s2) {
                            Text("الصفحة \(page.arabicDigits)").font(Sunnah.Typography.cardTitle).foregroundStyle(Sunnah.Colors.textPrimary)
                            Spacer()
                            if let stumble { Button { stumble(page) } label: { SunnahChip("تعثّرت") }.buttonStyle(.plain) }
                            Button { done(page) } label: { SunnahChip("أنجزت", selected: true) }.buttonStyle(.plain)
                                .accessibilityLabel("أنجزت الصفحة \(page.arabicDigits)")
                        }.frame(minHeight: 44)
                    }
                }
            }
        }
    }

    private var reminderCard: some View {
        VStack(alignment: .leading, spacing: 0) {
            SunnahSectionLabel("تذكير يومي (اختياري)")
            HStack(spacing: Sunnah.Spacing.s2) {
                ForEach([(nil as Int?, "بلا تذكير"), (6, "٦ ص"), (13, "١ ظ"), (21, "٩ م")], id: \.1) { h in
                    Button {
                        state.plan?.reminderHour = h.0; onChange()
                        if h.0 != nil { HifzReminder.requestPermission() }
                    } label: { SunnahChip(h.1, selected: state.plan?.reminderHour == h.0) }.buttonStyle(.plain)
                }
            }
        }
    }
}

// MARK: - تنسيق (أرقام عربية)

enum HifzFormat {
    static func pace(_ lines: Int) -> String {
        let unit = lines % HifzPlanMath.linesPerPage == 0
            ? ArabicCount.label(lines / HifzPlanMath.linesPerPage, one: "صفحة", two: "صفحتان", few: "صفحات", many: "صفحة", genitive: "صفحة")
            : ArabicCount.label(lines, one: "سطر", two: "سطران", few: "أسطر", many: "سطرًا", genitive: "سطر")
        return unit + " يوميًا"
    }

    static func date(_ d: Date) -> String {
        let f = DateFormatter(); f.locale = Locale(identifier: "ar"); f.dateStyle = .long
        return f.string(from: d).arabicDigits
    }

    static func status(_ p: HifzPlanMath.Progress) -> String {
        switch p.state {
        case .onTrack: return "أنت على الجدول"
        case .ahead: return "متقدّم عن الجدول بنحو " + ArabicCount.label(abs(p.deltaDays), one: "يوم", two: "يومين", few: "أيام", many: "يومًا", genitive: "يوم")
        case .behind: return "متأخر عن الجدول بنحو " + ArabicCount.label(abs(p.deltaDays), one: "يوم", two: "يومين", few: "أيام", many: "يومًا", genitive: "يوم")
        }
    }
}

// MARK: - التذكير السياقي

enum HifzReminder {
    private static let id = "sunnah.hifz-plan.daily"

    static func requestPermission() {
        #if canImport(UserNotifications)
        UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .sound]) { _, _ in }
        #endif
    }

    /// يعيد جدولة التذكير اليومي بنص يذكر ورد اليوم الفعلي؛ يُلغى حين يُطفأ.
    static func sync(state: HifzPlanState, today: Date, calendar: Calendar) {
        #if canImport(UserNotifications)
        let center = UNUserNotificationCenter.current()
        center.removePendingNotificationRequests(withIdentifiers: [id])
        guard let hour = state.plan?.reminderHour, let w = state.wird(today: today, calendar: calendar) else { return }
        let content = UNMutableNotificationContent()
        content.title = "وردك من الحفظ"
        content.body = body(w)
        var c = DateComponents(); c.hour = hour; c.minute = 0
        center.add(UNNotificationRequest(identifier: id, content: content, trigger: UNCalendarNotificationTrigger(dateMatching: c, repeats: true)))
        #endif
    }

    static func body(_ w: HifzPlanMath.DailyWird) -> String {
        var parts: [String] = []
        if let p = w.newPages.first { parts.append("حفظ جديد: صفحة \(p.arabicDigits)") }
        let review = w.nearPages.count + w.farPages.count
        if review > 0 { parts.append("مراجعة " + ArabicCount.label(review, one: "صفحة واحدة", two: "صفحتين", few: "صفحات", many: "صفحة", genitive: "صفحة")) }
        return parts.isEmpty ? "حان وقت وردك" : parts.joined(separator: " · ")
    }
}
