import Foundation

/// صف درس كما في public/data/lessons/chunk-000.json (عقد البيانات §2) — الحقول المستعملة فقط.
struct AccountLesson: Decodable, Hashable, Sendable, Identifiable {
    let id: String
    let externalKey: String?
    let title: String
    let speakerName: String?
    let category: String?
    let mosque: String?
    let dayOfWeek: String?
    let lessonTime: String?
    let schedule: String?
    let description: String?
    let liveURL: String?
    let audioURL: String?
    let startDate: String?
    let endDate: String?
    let isRecurring: Bool?
    let status: String?

    enum CodingKeys: String, CodingKey {
        case id, title, category, mosque, schedule, description, status
        case externalKey = "external_key"
        case speakerName = "speaker_name"
        case dayOfWeek = "day_of_week"
        case lessonTime = "lesson_time"
        case liveURL = "live_url"
        case audioURL = "audio_url"
        case startDate = "start_date"
        case endDate = "end_date"
        case isRecurring = "is_recurring"
    }

    init(id: String, title: String, speakerName: String? = nil, category: String? = nil, mosque: String? = nil,
         dayOfWeek: String? = nil, lessonTime: String? = nil, description: String? = nil, liveURL: String? = nil,
         audioURL: String? = nil, startDate: String? = nil, endDate: String? = nil, isRecurring: Bool? = nil, status: String? = nil) {
        self.id = id; self.externalKey = nil; self.title = title; self.speakerName = speakerName; self.category = category
        self.mosque = mosque; self.dayOfWeek = dayOfWeek; self.lessonTime = lessonTime; self.schedule = nil
        self.description = description; self.liveURL = liveURL; self.audioURL = audioURL; self.startDate = startDate
        self.endDate = endDate; self.isRecurring = isRecurring; self.status = status
    }

    /// متكرر ما لم يُنص على خلافه ولم يكن له تاريخ نهاية (مطابق لـ mapLessonRow).
    var recurring: Bool { isRecurring != false && (endDate ?? "").isEmpty }

    /// معرّف العرض العام: external_key إن وُجد (كما في وضع السيارة والروابط).
    var publicId: String { (externalKey?.isEmpty == false ? externalKey : nil) ?? id }

    var time: String { [lessonTime, schedule].compactMap { $0 }.first { !$0.isEmpty } ?? "" }

    /// رابط الصوت لوضع السيارة: التسجيل أولًا ثم البث.
    var playableURL: URL? { [audioURL, liveURL].compactMap { $0 }.first { !$0.isEmpty }.flatMap(URL.init(string:)) }
}

enum AccountLessonFilter {
    /// النشط: لم تنته نهايته الصريحة، وغير المتكرر لم يمض تاريخه (بتوقيت الكويت كما في الويب).
    static func active(_ lessons: [AccountLesson], now: Date = Date()) -> [AccountLesson] {
        let today = AccountCalendarMath.dateKey(now, timeZone: AccountCalendarMath.kuwait)
        return lessons.filter { lesson in
            if lesson.status.map({ $0 != "approved" }) ?? false { return false }
            if let end = lesson.endDate, !end.isEmpty { return end >= today }
            if !lesson.recurring, let start = lesson.startDate, !start.isEmpty { return start >= today }
            return true
        }
    }
}

/// حدث في تقويم الدروس (مطابق لـ lib/calendar-events.ts).
struct AccountCalendarEvent: Hashable, Sendable, Identifiable {
    let id: String
    let title: String
    let sheikh: String
    let mosque: String
    let time: String
    let day: String
    let date: String?
    let recurring: Bool
    let description: String?
    let path: String

    init(lesson: AccountLesson) {
        id = lesson.publicId
        title = lesson.title
        sheikh = lesson.speakerName ?? ""
        mosque = lesson.mosque ?? ""
        time = lesson.time
        day = AccountCalendarMath.normalizeDay(lesson.dayOfWeek ?? "")
        date = (lesson.startDate?.isEmpty == false) ? lesson.startDate : nil
        recurring = lesson.recurring && date == nil
        description = lesson.description
        path = "/lessons/" + lesson.publicId
    }
}

enum AccountCalendarMath {
    static let kuwait = TimeZone(identifier: "Asia/Kuwait") ?? .current

    /// الأحد = 0 … السبت = 6 (CALENDAR_WEEKDAY_LABELS).
    static let weekdayLabels = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"]

    static func normalizeDay(_ day: String) -> String {
        let d = day.trimmingCharacters(in: .whitespaces)
        return d == "الإثنين" || d == "الأثنين" ? "الاثنين" : d
    }

    static var gregorian: Calendar {
        var c = Calendar(identifier: .gregorian)
        c.firstWeekday = 1
        c.locale = Locale(identifier: "ar-u-nu-latn")
        return c
    }

    static func dateKey(_ date: Date, timeZone: TimeZone = .current) -> String {
        var c = Calendar(identifier: .gregorian)
        c.timeZone = timeZone
        let p = c.dateComponents([.year, .month, .day], from: date)
        return String(format: "%04d-%02d-%02d", p.year ?? 0, p.month ?? 0, p.day ?? 0)
    }

    /// أحداث يوم: المؤرَّخ غير المتكرر بتاريخه، والمتكرر بيوم الأسبوع؛ بلا تكرار معرّف.
    static func events(on date: Date, in events: [AccountCalendarEvent], calendar: Calendar = gregorian) -> [AccountCalendarEvent] {
        let weekday = calendar.component(.weekday, from: date) - 1
        let key = dateKey(date, timeZone: calendar.timeZone)
        var seen = Set<String>()
        return events.filter { e in
            let match: Bool
            if e.day.isEmpty && e.date == nil { match = false }
            else if let d = e.date, !e.recurring { match = d == key }
            else if e.recurring, !e.day.isEmpty { match = weekdayLabels.firstIndex(of: e.day) == weekday }
            else { match = false }
            return match && seen.insert(e.id).inserted
        }
    }

    /// شبكة الشهر: من أول أحد قبل بداية الشهر إلى آخر سبت بعد نهايته.
    static func monthGrid(for cursor: Date, calendar: Calendar = gregorian) -> [Date] {
        guard let interval = calendar.dateInterval(of: .month, for: cursor),
              let start = calendar.dateInterval(of: .weekOfYear, for: interval.start)?.start,
              let lastDay = calendar.date(byAdding: .day, value: -1, to: interval.end),
              let end = calendar.dateInterval(of: .weekOfYear, for: lastDay)?.end else { return [] }
        var out: [Date] = []
        var d = start
        while d < end {
            out.append(d)
            guard let next = calendar.date(byAdding: .day, value: 1, to: d) else { break }
            d = next
        }
        return out
    }

    static func weekDays(around date: Date, calendar: Calendar = gregorian) -> [Date] {
        guard let start = calendar.dateInterval(of: .weekOfYear, for: date)?.start else { return [] }
        return (0..<7).compactMap { calendar.date(byAdding: .day, value: $0, to: start) }
    }

    /// «رجب ١٤٤٨ هـ» بتقويم أم القرى.
    static func hijriMonthYear(_ date: Date) -> String {
        let f = DateFormatter()
        f.calendar = Calendar(identifier: .islamicUmmAlQura)
        f.locale = Locale(identifier: "ar-u-nu-latn")
        f.dateFormat = "MMMM y"
        return f.string(from: date) + " هـ"
    }

    static func monthTitle(_ date: Date) -> String {
        let f = DateFormatter()
        f.calendar = gregorian
        f.locale = Locale(identifier: "ar-u-nu-latn")
        f.dateFormat = "MMMM y"
        return f.string(from: date)
    }

    // MARK: - ICS (مطابق لـ generateIcs في الويب)

    static func icsTime(_ date: Date, time: String?, calendar: Calendar = gregorian) -> String {
        let p = calendar.dateComponents([.year, .month, .day], from: date)
        let d = String(format: "%04d%02d%02d", p.year ?? 0, p.month ?? 0, p.day ?? 0)
        guard let time, !time.isEmpty else { return d + "T060000" }
        let parts = time.filter { $0.isASCII && ($0.isNumber || $0 == ":") }.split(separator: ":", omittingEmptySubsequences: false)
        let h = parts.first.flatMap { Int($0) } ?? 0
        let m = parts.count > 1 ? Int(parts[1]) ?? 0 : 0
        return d + String(format: "T%02d%02d00", h == 0 ? 6 : h, m)
    }

    /// يزيد أول عدد في نص الوقت بساعة (نهاية الحدث).
    static func plusOneHour(_ time: String) -> String {
        guard let r = time.range(of: "[0-9]+", options: .regularExpression), let n = Int(time[r]) else { return time }
        return time.replacingCharacters(in: r, with: String(n + 1))
    }

    static func ics(_ items: [(date: Date, event: AccountCalendarEvent)], monthLabel: String, stamp: Date = Date(), calendar: Calendar = gregorian) -> String {
        var lines = [
            "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//ssunnah.com//Islamic Lessons Calendar//AR",
            "X-WR-CALNAME:دروس سُنّة — \(monthLabel)", "X-WR-TIMEZONE:Asia/Kuwait", "CALSCALE:GREGORIAN", "METHOD:PUBLISH"
        ]
        let sf = DateFormatter()
        sf.locale = Locale(identifier: "en_US_POSIX")
        sf.calendar = Calendar(identifier: .gregorian)
        sf.dateFormat = "yyyyMMdd'T'HHmmss"
        for (date, ev) in items {
            let key = icsTime(date, time: nil, calendar: calendar).prefix(8)
            let start = icsTime(date, time: ev.time.isEmpty ? nil : ev.time, calendar: calendar)
            let end = icsTime(date, time: ev.time.isEmpty ? nil : plusOneHour(ev.time), calendar: calendar)
            lines += [
                "BEGIN:VEVENT", "UID:\(ev.id)-\(key)@ssunnah.com", "DTSTAMP:\(sf.string(from: stamp))",
                "DTSTART;TZID=Asia/Kuwait:\(start)", "DTEND;TZID=Asia/Kuwait:\(end)", "SUMMARY:\(ev.title)",
                "DESCRIPTION:\([ev.sheikh, ev.mosque, ev.description ?? ""].filter { !$0.isEmpty }.joined(separator: " | "))",
                "LOCATION:\(ev.mosque)", "END:VEVENT"
            ]
        }
        lines.append("END:VCALENDAR")
        return lines.joined(separator: "\r\n")
    }
}
