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
    var displayTime: String { LessonTimeFormat.display(time) }
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
        // الترتيب مهم: ضبط locale يعيد firstWeekday إلى السبت (7) فيُزاح التقويم يومًا كاملًا.
        c.locale = Locale(identifier: "ar@numbers=arab")
        c.firstWeekday = 1
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
        f.locale = Locale(identifier: "ar@numbers=arab")
        f.dateFormat = "MMMM y"
        return f.string(from: date) + " هـ"
    }

    static func monthTitle(_ date: Date) -> String {
        let f = DateFormatter()
        f.calendar = gregorian
        f.locale = Locale(identifier: "ar@numbers=arab")
        f.dateFormat = "MMMM y"
        return f.string(from: date)
    }

    // MARK: - ICS (بنية generateIcs في الويب، مع تحليل «م/ص» والأرقام العربية وانتقال النهاية إلى اليوم التالي)

    /// الساعة والدقيقة بنظام 24 ساعة من نص وقت الدرس، بأرقام لاتينية أو عربية. «م/مساءً» بعد الرقم تضيف 12 لما دون 12، و«ص» تجعل 12 صفرًا.
    /// يعيد nil إذا لم يوجد في النص وقت صالح («بعد المغرب»).
    static func clock(_ time: String) -> (hour: Int, minute: Int)? {
        let s = time.asLatinDigits
        guard let r = s.range(of: #"[0-9]{1,2}(:[0-9]{2})?"#, options: .regularExpression) else { return nil }
        let parts = s[r].split(separator: ":")
        guard var h = Int(parts[0]), h < 24 else { return nil }
        let m = parts.count > 1 ? Int(parts[1]) ?? 0 : 0
        guard m < 60 else { return nil }
        let suffix = s[r.upperBound...].trimmingCharacters(in: .whitespaces)
        if suffix.hasPrefix("م"), h < 12 { h += 12 } else if suffix.hasPrefix("ص"), h == 12 { h = 0 }
        return (h, m)
    }

    /// «yyyyMMdd'T'HHmm00» لوقت الدرس بعد إضافة `plusHours` ساعة. بلا وقت صالح تكون البداية 06:00.
    /// إذا تجاوز الوقت منتصف الليل انتقل إلى اليوم التالي، فلا تظهر قيمة غير صالحة مثل «T240000».
    static func icsTime(_ date: Date, time: String?, plusHours: Int = 0, calendar: Calendar = gregorian) -> String {
        let c = time.flatMap(clock) ?? (hour: 6, minute: 0)
        let total = (c.hour + plusHours) * 60 + c.minute
        let day = calendar.date(byAdding: .day, value: total / 1440, to: date) ?? date
        let p = calendar.dateComponents([.year, .month, .day], from: day)
        return String(format: "%04d%02d%02dT%02d%02d00", p.year ?? 0, p.month ?? 0, p.day ?? 0, total % 1440 / 60, total % 60)
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
            let start = icsTime(date, time: ev.time, calendar: calendar)
            let end = icsTime(date, time: ev.time, plusHours: 1, calendar: calendar)
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

/// صيغة موحّدة لوقت الدرس في كل الواجهات: «6:00 م» للساعات و«بعد المغرب» للصلوات، بلا التفاف لسطرين.
enum LessonTimeFormat {
    private static let nbsp = "\u{00A0}"

    static func display(_ raw: String) -> String {
        var s = raw.asLatinDigits.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !s.isEmpty else { return "" }
        s = s.replacingOccurrences(of: "بعد صلاة ", with: "بعد ")
            .replacingOccurrences(of: "إلى صلاة ", with: "إلى ")
        for (long, short) in [("مساءً", "م"), ("مساءا", "م"), ("مساء", "م"), ("صباحًا", "ص"), ("صباحاً", "ص"), ("صباحا", "ص"), ("صباح", "ص")] {
            s = s.replacingOccurrences(of: long, with: short)
        }
        s = s.replacingOccurrences(of: "—", with: "–").replacingOccurrences(of: " - ", with: " – ")
        s = s.replacingOccurrences(of: #"(\d{1,2}:\d{2}) ([مص])"#, with: "$1\(nbsp)$2", options: .regularExpression)
        s = s.replacingOccurrences(of: "بعد ", with: "بعد\(nbsp)")
        return s
    }
}
