import Foundation

/// خطة حفظ المصحف (صفحات 1…604): إعداد الخطة + حالة كل صفحة حُفظت. منطق نقي فوق `HifzPlanMath`، والتخزين المحلي عبر `QuranLocalStore`.
/// الوحدة صفحة: وتيرة أقل من صفحة تعني صفحة في اليوم الدراسي نفسه مع حساب التقدّم بالأسطر.
struct HifzPlan: Codable, Equatable, Sendable {
    var start: HifzPlanMath.Start
    var firstPage: Int
    var lastPage: Int
    var linesPerDay: Int
    /// أيام الدراسة بترقيم Calendar (1=الأحد…7=السبت)؛ فارغ = كل يوم.
    var weekdays: Set<Int>
    var startDate: Date
    /// ساعة التذكير اليومي (0…23)؛ nil = بلا تذكير.
    var reminderHour: Int?

    var range: ClosedRange<Int> { max(1, firstPage)...min(HifzPlanMath.pageCount, max(firstPage, lastPage)) }
    var sequence: [Int] { HifzPlanMath.pageSequence(start: start, range: range) }
    var totalLines: Int { HifzPlanMath.totalLines(pages: sequence.count) }
}

struct HifzPageState: Codable, Equatable, Sendable {
    var page: Int
    var memorizedOn: Date
    var lastReviewed: Date?
    var strength: Int
}

struct HifzPlanState: Codable, Equatable, Sendable {
    var plan: HifzPlan?
    var pages: [HifzPageState] = []

    var memorized: Set<Int> { Set(pages.map(\.page)) }
    var records: [HifzPlanMath.PageRecord] {
        pages.map { .init(page: $0.page, memorizedOn: $0.memorizedOn, lastReviewed: $0.lastReviewed, strength: $0.strength) }
    }
    var doneInPlan: Int { plan.map { p in memorized.intersection(Set(p.sequence)).count } ?? 0 }
    var remainingPages: Int { plan.map { $0.sequence.count - doneInPlan } ?? 0 }

    func wird(today: Date, calendar: Calendar) -> HifzPlanMath.DailyWird? {
        guard let p = plan else { return nil }
        return HifzPlanMath.dailyWird(sequence: p.sequence, memorized: memorized, linesPerDay: p.linesPerDay, records: records, today: today, calendar: calendar)
    }

    func progress(today: Date, calendar: Calendar) -> HifzPlanMath.Progress? {
        guard let p = plan else { return nil }
        return HifzPlanMath.progress(start: p.startDate, today: today, totalLines: p.totalLines, linesPerDay: p.linesPerDay,
                                     doneLines: HifzPlanMath.totalLines(pages: doneInPlan), weekdays: p.weekdays, calendar: calendar)
    }

    /// تاريخ الختم المتوقع من المتبقي وبدءًا من اليوم (يتكيّف تلقائيًا مع التقدّم الفعلي).
    func expectedFinish(today: Date, calendar: Calendar) -> Date? {
        guard let p = plan else { return nil }
        let from = max(calendar.startOfDay(for: today), calendar.startOfDay(for: p.startDate))
        return HifzPlanMath.finishDate(start: from, totalLines: HifzPlanMath.totalLines(pages: remainingPages), linesPerDay: p.linesPerDay, weekdays: p.weekdays, calendar: calendar)
    }

    /// حفظ جديد: تُسجَّل الصفحة بقوة 0 وتاريخ اليوم.
    mutating func markNew(page: Int, today: Date) {
        guard !memorized.contains(page) else { return }
        pages.append(.init(page: page, memorizedOn: today, lastReviewed: nil, strength: 0))
    }

    /// مراجعة: نجاح يرفع القوة وفشل يخفضها، وتُحدَّث آخر مراجعة.
    mutating func markReview(page: Int, recalled: Bool, today: Date) {
        guard let i = pages.firstIndex(where: { $0.page == page }) else { return }
        pages[i].strength = HifzPlanMath.strength(after: pages[i].strength, recalled: recalled)
        pages[i].lastReviewed = today
    }

    /// ضبط الوتيرة من تاريخ ختم مطلوب (يحسب الأسطر اليومية عكسيًا)؛ nil إن لم يكن التاريخ ممكنًا.
    func paceToFinish(by end: Date, today: Date, calendar: Calendar) -> Int? {
        guard let p = plan else { return nil }
        return HifzPlanMath.linesPerDay(toFinishBy: end, start: max(calendar.startOfDay(for: today), calendar.startOfDay(for: p.startDate)),
                                        totalLines: HifzPlanMath.totalLines(pages: remainingPages), weekdays: p.weekdays, calendar: calendar)
    }
}

extension QuranLocalStore {
    func loadHifzPlan() -> HifzPlanState { load(HifzPlanState.self, .hifzPlan) ?? HifzPlanState(plan: nil) }
    func saveHifzPlan(_ s: HifzPlanState) { save(s, .hifzPlan) }
}
