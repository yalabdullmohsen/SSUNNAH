import SwiftUI

// MARK: - الفوائد

/// فائدة من `Data/learn/fawaid.json` (المعتمد `approved` فقط، بعد مهارة sharia-content).
struct LearnFaidah: Codable, Identifiable, Hashable, Sendable {
    let id: String
    let text: String
    let category: String?
    let source: String?
    let authorName: String?

    enum CodingKeys: String, CodingKey { case id, text, category, source; case authorName = "author_name" }

    /// كـhasPublicSource في الويب: لا تُعرض فائدة بلا مصدر أو قائل.
    var hasPublicSource: Bool { !(source ?? "").trimmingCharacters(in: .whitespaces).isEmpty || !(authorName ?? "").trimmingCharacters(in: .whitespaces).isEmpty }

    static func filter(_ all: [LearnFaidah], query: String, category: String?) -> [LearnFaidah] {
        let q = query.trimmingCharacters(in: .whitespacesAndNewlines)
        return all.filter { f in
            f.hasPublicSource && !f.text.isEmpty
                && (category == nil || f.category == category)
                && (q.isEmpty || [f.text, f.source ?? "", f.authorName ?? ""].contains { $0.localizedCaseInsensitiveContains(q) })
        }
    }
}

/// /fawaid — فوائد علمية موثّقة المصدر، مع بحث وتصفية بالتصنيف. الإرسال يحتاج منفذ حساب (غير متاح هنا).
struct LearnFawaidScreen: View {
    @State private var query = ""
    @State private var category: String?

    var body: some View {
        LearnLoadHost(load: { try await LearnSources.loadIfExported([LearnFaidah].self, from: LearnSources.fawaid, with: $0) }) { (all: [LearnFaidah]) in
            let categories = Array(Set(all.compactMap(\.category))).sorted()
            VStack(spacing: Sunnah.Spacing.s2) {
                if !categories.isEmpty {
                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(spacing: Sunnah.Spacing.s2) {
                            Button { category = nil } label: { SunnahChip("الكل", selected: category == nil) }.buttonStyle(.plain)
                            ForEach(categories, id: \.self) { c in
                                Button { category = c } label: { SunnahChip(c, selected: category == c) }.buttonStyle(.plain)
                                    .accessibilityAddTraits(category == c ? .isSelected : [])
                            }
                        }
                        .padding(.horizontal, Sunnah.Spacing.pageX)
                    }
                }
                LearnList(items: LearnFaidah.filter(all, query: query, category: category), emptyTitle: "المحتوى قيد التوثيق") { f in
                    VStack(alignment: .leading, spacing: Sunnah.Spacing.s2) {
                        Text(f.text).font(Sunnah.Typography.body).foregroundStyle(Sunnah.Colors.textPrimary)
                        if let line = learnLine(f.authorName, f.source, separator: " — ") {
                            Text(line).font(Sunnah.Typography.tag).foregroundStyle(Sunnah.Colors.textSecondary)
                        }
                    }
                    .padding(.vertical, Sunnah.Spacing.s2)
                    .accessibilityElement(children: .combine)
                }
            }
        }
        .searchable(text: $query)
        .navigationTitle("الفوائد")
    }
}

// MARK: - الدورات السنوية

/// دورة من `Data/learn/annual-courses.json` (جدول annual_courses المعتمد؛ البذرة التجريبية لا تُصدَّر).
struct LearnAnnualCourse: Codable, Identifiable, Hashable, Sendable {
    struct Slot: Codable, Hashable, Sendable { let day: String?; let time: String?; let topic: String?; let sheikh: String? }

    let id: String
    let externalKey: String?
    let title: String
    let summary: String?
    let body: String?
    let courseType: String?
    let season: String?
    let year: String?
    let sheikhNames: [String]?
    let mutoon: [String]?
    let schedule: [Slot]?
    let venueName: String?
    let venueAddress: String?
    let venueCity: String?
    let mapUrl: String?
    let registrationUrl: String?
    let registrationOpen: Bool?
    let status: String?

    enum CodingKeys: String, CodingKey {
        case id, title, summary, body, season, year, mutoon, schedule, status
        case externalKey = "external_key", courseType = "course_type", sheikhNames = "sheikh_names"
        case venueName = "venue_name", venueAddress = "venue_address", venueCity = "venue_city", mapUrl = "map_url"
        case registrationUrl = "registration_url", registrationOpen = "registration_open"
    }

    init(from decoder: Decoder) throws {
        let c = try decoder.container(keyedBy: CodingKeys.self)
        id = try c.decode(String.self, forKey: .id)
        title = try c.decode(String.self, forKey: .title)
        externalKey = try c.decodeIfPresent(String.self, forKey: .externalKey)
        summary = try c.decodeIfPresent(String.self, forKey: .summary)
        body = try c.decodeIfPresent(String.self, forKey: .body)
        courseType = try c.decodeIfPresent(String.self, forKey: .courseType)
        season = try c.decodeIfPresent(String.self, forKey: .season)
        // السنة رقم في الجدول ونص أحيانًا.
        year = (try? c.decodeIfPresent(String.self, forKey: .year)) ?? (try? c.decodeIfPresent(Int.self, forKey: .year)).map { String($0) }
        sheikhNames = try c.decodeIfPresent([String].self, forKey: .sheikhNames)
        mutoon = try c.decodeIfPresent([String].self, forKey: .mutoon)
        schedule = try c.decodeIfPresent([Slot].self, forKey: .schedule)
        venueName = try c.decodeIfPresent(String.self, forKey: .venueName)
        venueAddress = try c.decodeIfPresent(String.self, forKey: .venueAddress)
        venueCity = try c.decodeIfPresent(String.self, forKey: .venueCity)
        mapUrl = try c.decodeIfPresent(String.self, forKey: .mapUrl)
        registrationUrl = try c.decodeIfPresent(String.self, forKey: .registrationUrl)
        registrationOpen = try c.decodeIfPresent(Bool.self, forKey: .registrationOpen)
        status = try c.decodeIfPresent(String.self, forKey: .status)
    }

    var isApproved: Bool { status == nil || status == "approved" }
    var metaLine: String? { learnLine(courseType, season, year, separator: " · ") }

    /// يطابق getAnnualCourseById: بالمعرّف ثم external_key، والمعتمد فقط.
    static func find(_ key: String, in all: [LearnAnnualCourse]) -> LearnAnnualCourse? {
        let approved = all.filter(\.isApproved)
        return approved.first { $0.id == key } ?? approved.first { $0.externalKey == key }
    }
}

/// /annual-courses/:id — تفاصيل الدورة: المشايخ والمتون والجدول والمكان والتسجيل، ثم دورات أخرى.
struct LearnAnnualCourseScreen: View {
    let id: String
    @Environment(\.openRoute) private var openRoute
    init(id: String) { self.id = id }

    var body: some View {
        LearnLoadHost(load: { try await LearnSources.loadIfExported([LearnAnnualCourse].self, from: LearnSources.annualCourses, with: $0) }) { (all: [LearnAnnualCourse]) in
            if let course = LearnAnnualCourse.find(id, in: all) {
                LearnDetailPage(title: course.title) {
                    if let m = course.metaLine { SunnahChip(m) }
                    if let s = course.summary { Text(s).font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.textSecondary) }
                    if let b = course.body { Text(b).font(Sunnah.Typography.body).foregroundStyle(Sunnah.Colors.textPrimary) }
                    LearnInfoRow(label: "المشايخ", value: course.sheikhNames?.joined(separator: "، "))
                    LearnInfoRow(label: "المتون", value: course.mutoon?.joined(separator: "، "))
                    if let slots = course.schedule, !slots.isEmpty {
                        Text("الجدول").font(Sunnah.Typography.sectionTitle).foregroundStyle(Sunnah.Colors.textPrimary).accessibilityAddTraits(.isHeader)
                        ForEach(Array(slots.enumerated()), id: \.offset) { _, s in
                            SunnahListRow(title: learnLine(s.day, s.time) ?? "—", subtitle: learnLine(s.topic, s.sheikh, separator: " · "))
                        }
                    }
                    LearnInfoRow(label: "مكان الإقامة", value: learnLine(course.venueName, course.venueAddress, course.venueCity, separator: "، "))
                    LearnExternalLink(title: "الموقع على الخريطة", urlString: course.mapUrl)
                    if course.registrationOpen == true { LearnExternalLink(title: "التسجيل في الدورة", urlString: course.registrationUrl) }
                    let related = all.filter { $0.isApproved && $0.id != course.id }.prefix(4)
                    if !related.isEmpty {
                        Text("دورات أخرى").font(Sunnah.Typography.sectionTitle).foregroundStyle(Sunnah.Colors.textPrimary).accessibilityAddTraits(.isHeader)
                        ForEach(related) { r in
                            Button { openRoute("/annual-courses/" + r.id) } label: { SunnahListRow(title: r.title, subtitle: r.metaLine) }.buttonStyle(.plain)
                        }
                    }
                }
            } else {
                EmptyStateView(title: "الدورة غير متاحة")
            }
        }
    }
}
