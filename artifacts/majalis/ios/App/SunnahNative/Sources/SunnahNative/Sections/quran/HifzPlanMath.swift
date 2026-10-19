import Foundation

/// حساب خطة حفظ القرآن (منطق صرف بلا تخزين ولا واجهة): الوتيرة وتاريخ الختم والتقدّم والمراجعة المتباعدة.
/// المصحف 604 صفحة × 15 سطرًا؛ لا يمسّ هذا الملف نصّ القرآن ولا ترقيمه.
enum HifzPlanMath {
    static let pageCount = 604
    static let linesPerPage = 15

    /// نقطة البداية في المصحف.
    enum Start: Codable, Equatable, Sendable { case fatiha, nas, resume(page: Int) }

    /// ترتيب الصفحات المطلوب حفظها: من الفاتحة تصاعديًا، أو من الناس تنازليًا، أو من صفحة الوقوف تصاعديًا؛ مقيّدة بالنطاق المختار.
    static func pageSequence(start: Start, range: ClosedRange<Int> = 1...pageCount) -> [Int] {
        let lo = max(1, range.lowerBound), hi = min(pageCount, range.upperBound)
        guard lo <= hi else { return [] }
        switch start {
        case .fatiha: return Array(lo...hi)
        case .nas: return Array((lo...hi).reversed())
        case .resume(let p):
            let from = min(max(p, lo), hi)
            return Array(from...hi)
        }
    }

    static func totalLines(pages: Int) -> Int { max(0, pages) * linesPerPage }

    /// عدد أيام الحفظ اللازمة بوتيرة أسطر/يوم.
    static func studyDaysNeeded(totalLines: Int, linesPerDay: Int) -> Int {
        guard totalLines > 0, linesPerDay > 0 else { return 0 }
        return (totalLines + linesPerDay - 1) / linesPerDay
    }

    /// أيام الأسبوع بترقيم Calendar (1 = الأحد … 7 = السبت).
    static func isStudyDay(_ date: Date, weekdays: Set<Int>, calendar: Calendar) -> Bool {
        weekdays.isEmpty || weekdays.contains(calendar.component(.weekday, from: date))
    }

    /// تاريخ اليوم الأخير للحفظ: يبدأ العدّ من `start` (يُحسب إن كان يوم حفظ)، ويتخطى الأيام غير المختارة.
    static func finishDate(start: Date, totalLines: Int, linesPerDay: Int, weekdays: Set<Int>, calendar: Calendar) -> Date? {
        var remaining = studyDaysNeeded(totalLines: totalLines, linesPerDay: linesPerDay)
        guard remaining > 0 else { return nil }
        var day = calendar.startOfDay(for: start)
        for _ in 0..<(remaining * 7 + 7) {
            if isStudyDay(day, weekdays: weekdays, calendar: calendar) {
                remaining -= 1
                if remaining == 0 { return day }
            }
            guard let next = calendar.date(byAdding: .day, value: 1, to: day) else { return nil }
            day = next
        }
        return nil
    }

    /// عدد أيام الحفظ المتاحة من `start` حتى `end` شاملين.
    static func studyDays(from start: Date, to end: Date, weekdays: Set<Int>, calendar: Calendar) -> Int {
        var day = calendar.startOfDay(for: start); let last = calendar.startOfDay(for: end)
        var n = 0
        while day <= last {
            if isStudyDay(day, weekdays: weekdays, calendar: calendar) { n += 1 }
            guard let next = calendar.date(byAdding: .day, value: 1, to: day) else { break }
            day = next
        }
        return n
    }

    /// الوتيرة العكسية: أقل عدد أسطر يوميًا يبلغ الختم في `end` أو قبله؛ nil إن لم يبقَ يوم حفظ.
    static func linesPerDay(toFinishBy end: Date, start: Date, totalLines: Int, weekdays: Set<Int>, calendar: Calendar) -> Int? {
        let days = studyDays(from: start, to: end, weekdays: weekdays, calendar: calendar)
        guard days > 0, totalLines > 0 else { return nil }
        return (totalLines + days - 1) / days
    }

    /// تقدّم الخطة عن الجدول: الأسطر المتوقعة حتى `today` (شاملًا) مقابل المحفوظة فعلًا.
    struct Progress: Equatable, Sendable {
        let expectedLines: Int, doneLines: Int, linesPerDay: Int
        var deltaLines: Int { doneLines - expectedLines }
        /// موجب = متقدّم، سالب = متأخر، بالأيام (تقريبًا بالوتيرة المخططة).
        var deltaDays: Int { linesPerDay > 0 ? Int((Double(deltaLines) / Double(linesPerDay)).rounded(.towardZero)) : 0 }
        enum State: Sendable { case ahead, onTrack, behind }
        var state: State { deltaLines > 0 && deltaDays >= 1 ? .ahead : (deltaLines < 0 && deltaDays <= -1 ? .behind : .onTrack) }
    }

    static func progress(start: Date, today: Date, totalLines: Int, linesPerDay: Int, doneLines: Int, weekdays: Set<Int>, calendar: Calendar) -> Progress {
        let days = today < start ? 0 : studyDays(from: start, to: today, weekdays: weekdays, calendar: calendar)
        return Progress(expectedLines: min(totalLines, days * linesPerDay), doneLines: min(totalLines, max(0, doneLines)), linesPerDay: linesPerDay)
    }

    /// تعديل تلقائي: الوتيرة الجديدة لتبلغ الختم المعلن بعد ما تأخّر/تقدّم المستخدم (من اليوم لا من البداية).
    static func adjustedLinesPerDay(today: Date, end: Date, remainingLines: Int, weekdays: Set<Int>, calendar: Calendar) -> Int? {
        linesPerDay(toFinishBy: end, start: today, totalLines: remainingLines, weekdays: weekdays, calendar: calendar)
    }

    // MARK: المراجعة
    struct PageRecord: Equatable, Sendable {
        let page: Int
        let memorizedOn: Date
        var lastReviewed: Date?
        /// قوة الحفظ 0…5.
        var strength: Int
    }

    /// المراجعة القريبة: آخر `count` صفحات حُفظت (بحسب تاريخ الحفظ ثم رقم الصفحة)، بين 5 و10.
    static func nearReview(_ records: [PageRecord], count: Int = 7) -> [Int] {
        let n = min(10, max(5, count))
        return records.sorted { $0.memorizedOn != $1.memorizedOn ? $0.memorizedOn > $1.memorizedOn : $0.page < $1.page }
            .prefix(n).map(\.page)
    }

    /// فواصل التكرار المتباعد بالأيام حسب القوة 0…5.
    static let reviewIntervals = [1, 2, 4, 8, 16, 32]

    static func interval(strength: Int) -> Int { reviewIntervals[min(max(strength, 0), reviewIntervals.count - 1)] }

    /// موعد استحقاق المراجعة: آخر مراجعة (أو تاريخ الحفظ) + فاصل القوة.
    static func dueDate(_ r: PageRecord, calendar: Calendar) -> Date {
        calendar.date(byAdding: .day, value: interval(strength: r.strength), to: calendar.startOfDay(for: r.lastReviewed ?? r.memorizedOn)) ?? r.memorizedOn
    }

    /// المراجعة البعيدة: المستحقة اليوم فأقدم، بلا ما في المراجعة القريبة، الأشدّ تأخرًا أولًا، بحدّ `limit`.
    static func farReview(_ records: [PageRecord], today: Date, near: [Int], limit: Int = 5, calendar: Calendar) -> [Int] {
        let t = calendar.startOfDay(for: today), skip = Set(near)
        return records.filter { !skip.contains($0.page) && dueDate($0, calendar: calendar) <= t }
            .sorted { let a = dueDate($0, calendar: calendar), b = dueDate($1, calendar: calendar); return a != b ? a < b : $0.page < $1.page }
            .prefix(max(0, limit)).map(\.page)
    }

    /// قوة بعد مراجعة: ترتفع بمراجعة سلسة وتنخفض عند التعثر.
    static func strength(after current: Int, recalled: Bool) -> Int { recalled ? min(5, current + 1) : max(0, current - 2) }

    /// الورد اليومي: صفحات الحفظ الجديد (بحسب الوتيرة من التسلسل بعد المحفوظ) + القريبة + البعيدة.
    struct DailyWird: Equatable, Sendable { var newPages: [Int]; var nearPages: [Int]; var farPages: [Int] }

    static func dailyWird(sequence: [Int], memorized: Set<Int>, linesPerDay: Int, records: [PageRecord], today: Date, calendar: Calendar) -> DailyWird {
        let pagesToday = max(1, Int((Double(linesPerDay) / Double(linesPerPage)).rounded(.up)))
        let new = Array(sequence.filter { !memorized.contains($0) }.prefix(pagesToday))
        let near = nearReview(records)
        return DailyWird(newPages: new, nearPages: near, farPages: farReview(records, today: today, near: near, calendar: calendar))
    }
}
