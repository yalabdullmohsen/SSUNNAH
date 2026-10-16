import Foundation

/// آية اليوم وحديث اليوم: مجموعتان وخوارزمية مصدّرة من كود الموقع (ن1). لا يُعرض شيء إلا باكتمال التصدير بحقوله الثلاثة.
public struct HomeDailyAyah: Decodable, Equatable, Sendable {
    public let id: String
    public let surah: String
    public let ayahNumber: Int
    public let reference: String
    public let meaning: String?
    public let reviewStatus: String
    public let sourceOrigin: String
    /// رقم السورة من المرجع المصدَّر («القرآن الكريم — 94:6»)، لا من اسمها.
    public var surahNumber: Int? {
        guard let r = reference.range(of: #"(\d+):(\d+)\s*$"#, options: .regularExpression) else { return nil }
        return Int(reference[r].split(separator: ":")[0])
    }
    enum CodingKeys: String, CodingKey {
        case id, surah, ayahNumber, reference, meaning
        case reviewStatus = "review_status", sourceOrigin = "source_origin"
    }
}

public struct HomeDailyHadith: Decodable, Equatable, Sendable {
    public let id: String
    public let text: String
    public let narrator: String?
    public let source: String
    public let number: String?
    public let grade: String?
    public let reviewStatus: String
    public let sourceOrigin: String
    enum CodingKeys: String, CodingKey {
        case id, text, narrator, source, number, grade
        case reviewStatus = "review_status", sourceOrigin = "source_origin"
    }

    public init(from d: Decoder) throws {
        let c = try d.container(keyedBy: CodingKeys.self)
        id = try c.decode(String.self, forKey: .id)
        text = try c.decode(String.self, forKey: .text)
        narrator = try c.decodeIfPresent(String.self, forKey: .narrator)
        source = try c.decode(String.self, forKey: .source)
        // الرقم نصّ أو عدد في التصدير؛ يُعرض كما هو.
        if let s = try? c.decodeIfPresent(String.self, forKey: .number) { number = s }
        else if let n = try? c.decodeIfPresent(Int.self, forKey: .number) { number = String(n) }
        else { number = nil }
        grade = try c.decodeIfPresent(String.self, forKey: .grade)
        reviewStatus = try c.decode(String.self, forKey: .reviewStatus)
        sourceOrigin = try c.decode(String.self, forKey: .sourceOrigin)
    }
}

/// خوارزمية الموقع (`getDayIndex`): تاريخ الكويت → `floor(Date.UTC(y,m-1,d)/86400000)`، والاختيار `index % pool.count`.
public enum HomeDailyPick {
    public static func dayIndex(_ date: Date) -> Int {
        var kuwait = Calendar(identifier: .gregorian)
        kuwait.timeZone = TimeZone(identifier: "Asia/Kuwait") ?? TimeZone(secondsFromGMT: 3 * 3600)!
        let c = kuwait.dateComponents([.year, .month, .day], from: date)
        var utc = Calendar(identifier: .gregorian)
        utc.timeZone = TimeZone(secondsFromGMT: 0)!
        let midnight = utc.date(from: DateComponents(year: c.year, month: c.month, day: c.day)) ?? date
        return Int(floor(midnight.timeIntervalSince1970 / 86400))
    }

    public static func pick<T>(_ pool: [T], on date: Date) -> T? {
        guard !pool.isEmpty else { return nil }
        let i = dayIndex(date) % pool.count
        return pool[i < 0 ? i + pool.count : i]
    }
}

public struct HomeDailyContent: Equatable, Sendable {
    public let ayah: HomeDailyAyah
    public let ayahText: String
    public let hadith: HomeDailyHadith

    /// nil إن غاب أي ملف من التصدير أو فسد أو خلا من review_status/source_origin أو تعذّر نص الآية من المصحف.
    public static func load(on date: Date, bundle: Bundle = .main) -> HomeDailyContent? {
        func read<T: Decodable>(_ name: String, latin: Bool = false) -> [T]? {
            guard let url = bundle.url(forResource: name, withExtension: "json", subdirectory: "Data/home"),
                  let data = try? Data(contentsOf: url) else { return nil }
            return try? JSONDecoder().decode([T].self, from: latin ? data.asLatinDigitsJSON : data)
        }
        guard let ayahs: [HomeDailyAyah] = read("daily-ayah"), let hadiths: [HomeDailyHadith] = read("daily-hadith", latin: true),
              let a = HomeDailyPick.pick(ayahs, on: date), let h = HomeDailyPick.pick(hadiths, on: date),
              let text = ayahText(surah: a.surahNumber ?? 0, ayah: a.ayahNumber, bundle: bundle) else { return nil }
        return HomeDailyContent(ayah: a, ayahText: text, hadith: h)
    }

    /// نص الآية من ملفات المصحف في التطبيق نفسه (لا نسخة قرآنية أخرى).
    static func ayahText(surah: Int, ayah: Int, bundle: Bundle) -> String? {
        struct File: Decodable { struct A: Decodable { let numberInSurah: Int; let text: String }; let ayahs: [A] }
        guard let dir = bundle.url(forResource: "quran", withExtension: nil, subdirectory: "Data"),
              let data = try? Data(contentsOf: dir.appendingPathComponent(String(format: "surah-%03d.json", surah))),
              let f = try? JSONDecoder().decode(File.self, from: data),
              let a = f.ayahs.first(where: { $0.numberInSurah == ayah }) else { return nil }
        return QuranDisplayText.clean(a.text, surah: surah, ayah: ayah)
    }
}
