import SwiftUI

// MARK: - الجامعات

/// /universities — دليل الجامعات الشرعية مع حقل بحث محلي بالاسم/الدولة/المدينة.
struct LearnUniversitiesScreen: View {
    @Environment(\.openRoute) private var openRoute
    @State private var query = ""

    var body: some View {
        LearnLoadHost(LearnSources.universities) { (all: [LearnUniversity]) in
            LearnTileGrid(items: filter(all), emptyTitle: query.isEmpty ? "المحتوى قيد التوثيق" : "لا نتائج", idPrefix: "universities",
                          tile: { SunnahTileItem(id: $0.slug, title: $0.nameAr, subtitle: learnLine($0.country, $0.city), symbol: "graduationcap") },
                          destination: { LearnUniversityDetail(university: $0) }) {
                VStack(spacing: Sunnah.Spacing.s2) {
                    SunnahSearchField(text: $query, idPrefix: "sunnah.searchable")
                    SunnahButton("قارن", style: .secondary) { openRoute("/universities/compare") }
                        .padding(.horizontal, Sunnah.Spacing.pageX)
                }
            }
        }
        .sunnahNavTitle("الجامعات")
    }

    private func filter(_ list: [LearnUniversity]) -> [LearnUniversity] {
        let q = query.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !q.isEmpty else { return list }
        return list.filter { u in [u.nameAr, u.nameEn ?? "", u.country ?? "", u.city ?? ""].contains { $0.localizedCaseInsensitiveContains(q) } }
    }
}

/// /universities/:slug — نبذة، الاعتماد، البرامج، الأسئلة الشائعة، الموقع الرسمي.
struct LearnUniversityDetailScreen: View {
    let slug: String
    var body: some View {
        LearnLoadHost(LearnSources.universities) { (all: [LearnUniversity]) in
            if let u = all.first(where: { $0.slug == slug }) { LearnUniversityDetail(university: u) } else { EmptyStateView(title: "الجامعة غير موجودة") }
        }
    }
}

struct LearnUniversityDetail: View {
    let university: LearnUniversity
    var body: some View {
        LearnDetailPage(title: university.nameAr) {
            SunnahChip(university.accreditationLabel)
            LearnInfoRow(label: "الاسم بالإنجليزية", value: university.nameEn)
            LearnInfoRow(label: "الدولة", value: university.country)
            LearnInfoRow(label: "المدينة", value: university.city)
            if let about = university.about { LearnBodyText(about) }
            if let programs = university.programs, !programs.isEmpty {
                Text("البرامج").font(Sunnah.Typography.sectionTitle).foregroundStyle(Sunnah.Colors.textPrimary).accessibilityAddTraits(.isHeader)
                ForEach(Array(programs.enumerated()), id: \.offset) { _, p in
                    SunnahCard {
                        VStack(alignment: .leading, spacing: Sunnah.Spacing.s2) {
                            Text(p.programName ?? p.specialization ?? "برنامج").font(Sunnah.Typography.cardTitle).foregroundStyle(Sunnah.Colors.textPrimary)
                            LearnInfoRow(label: "الكلية", value: p.facultyDepartment)
                            LearnInfoRow(label: "الدرجة", value: p.degreeLevel)
                            LearnInfoRow(label: "المدة", value: p.duration)
                            LearnInfoRow(label: "لغة الدراسة", value: p.studyLanguage)
                            LearnInfoRow(label: "نمط الدراسة", value: p.studyMode)
                            LearnInfoRow(label: "المنح", value: p.hasScholarship == true ? (p.scholarshipDetails ?? "متاحة") : nil)
                        }
                    }
                }
            }
            if let faqs = university.faqs, !faqs.isEmpty {
                Text("أسئلة شائعة").font(Sunnah.Typography.sectionTitle).foregroundStyle(Sunnah.Colors.textPrimary).accessibilityAddTraits(.isHeader)
                ForEach(faqs, id: \.question) { f in LearnInfoRow(label: f.question, value: f.answer) }
            }
            LearnExternalLink(title: "الموقع الرسمي", urlString: university.websiteURL)
        }
    }
}

/// /universities/compare — اختيار حتى أربع جامعات ثم مقارنتها جنبًا إلى جنب.
struct LearnUniversitiesCompareScreen: View {
    @State private var selection = LearnCompareSelection()

    var body: some View {
        LearnLoadHost(LearnSources.universities) { (all: [LearnUniversity]) in
            if all.isEmpty { EmptyStateView(title: "لا جامعات بعد") } else {
                SunnahRowStack {
                    let chosen = selection.slugs.compactMap { s in all.first { $0.slug == s } }
                    if chosen.count >= 2 {
                        SunnahRowGroupHeader("المقارنة")
                        VStack(spacing: 0) {
                            LearnCompareRow(label: "الدولة", values: chosen.map { $0.country ?? "—" })
                            LearnCompareRow(label: "المدينة", values: chosen.map { $0.city ?? "—" })
                            LearnCompareRow(label: "الاعتماد", values: chosen.map(\.accreditationLabel))
                            LearnCompareRow(label: "عدد البرامج", values: chosen.map { "\($0.programs?.count ?? 0)" })
                            LearnCompareRow(label: "الدرجات", values: chosen.map { $0.degreeLevels.isEmpty ? "—" : $0.degreeLevels.joined(separator: "، ") })
                            LearnCompareRow(label: "منح", values: chosen.map { $0.offersScholarship ? "نعم" : "لا" })
                        }
                        .sunnahStackRow()
                    }
                    SunnahRowGroupHeader(selection.canAdd ? "اختر جامعتين إلى أربع" : "بلغت الحد الأقصى (أربع)")
                    VStack(spacing: 0) {
                        ForEach(all) { u in
                            Button { selection.toggle(u.slug) } label: {
                                HStack(spacing: Sunnah.Spacing.s3) {
                                    Image(systemName: selection.contains(u.slug) ? "checkmark.circle.fill" : "circle")
                                        .foregroundStyle(Sunnah.Colors.primary)
                                    Text(u.nameAr).font(Sunnah.Typography.body).foregroundStyle(Sunnah.Colors.textPrimary)
                                }
                                .frame(minHeight: Sunnah.Spacing.touch)
                            }
                            .buttonStyle(.plain)
                            .disabled(!selection.contains(u.slug) && !selection.canAdd)
                            .accessibilityAddTraits(selection.contains(u.slug) ? .isSelected : [])
                        }
                    }
                    .sunnahStackRow()
                }
            }
        }
        .sunnahNavTitle("مقارنة الجامعات")
    }
}

struct LearnCompareRow: View {
    let label: String; let values: [String]
    var body: some View {
        VStack(alignment: .leading, spacing: Sunnah.Spacing.s1) {
            Text(label).font(Sunnah.Typography.tag).foregroundStyle(Sunnah.Colors.textSecondary)
            HStack(alignment: .top, spacing: Sunnah.Spacing.s2) {
                ForEach(Array(values.enumerated()), id: \.offset) { _, v in
                    Text(v).font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.textPrimary)
                        .frame(maxWidth: .infinity, alignment: .leading)
                }
            }
        }
        .accessibilityElement(children: .combine)
    }
}

// MARK: - المؤسسات

/// /institutions — دليل المساجد والمراكز والمكتبات والجامعات، مع تصفية بالنوع.
struct LearnInstitutionsScreen: View {
    @State private var selectedType: String?
    private struct TypeFilter { let id: String?; let label: String }
    private static let types = [TypeFilter(id: nil, label: "الكل"), TypeFilter(id: "mosque", label: "المساجد"), TypeFilter(id: "center", label: "المراكز"),
                                TypeFilter(id: "library", label: "المكتبات"), TypeFilter(id: "university", label: "الجامعات")]

    private static func symbol(_ type: String?) -> String {
        switch type {
        case "mosque": "building.columns"
        case "library": "books.vertical"
        case "university": "graduationcap"
        default: "building.2"
        }
    }

    var body: some View {
        LearnLoadHost(load: { try await LearnSources.loadIfExported([LearnInstitution].self, from: LearnSources.institutions, with: $0) }) { (loaded: [LearnInstitution]) in
            // المؤسسة غير المعتمدة تُعرض بعلامة «قيد المراجعة» ظاهرة، وتتحول إلى «معتمد» حين تصل حالتها من الشبكة.
            LearnTileGrid(items: loaded.filter { selectedType == nil || $0.type == selectedType }, emptyTitle: loaded.isEmpty ? "قيد التوثيق" : "لا مؤسسات في هذا النوع", idPrefix: "institutions",
                          tile: { SunnahTileItem(id: $0.id, title: $0.name, subtitle: learnLine($0.typeLabel, $0.city, $0.isReviewed ? nil : LearnInstitution.pendingBadge), symbol: Self.symbol($0.type)) },
                          destination: { inst in
                LearnDetailPage(title: inst.name) {
                    if let t = inst.typeLabel { SunnahChip(t) }
                    if !inst.isReviewed { SunnahChip(LearnInstitution.pendingBadge) }
                    LearnInfoRow(label: "المدينة", value: inst.city)
                    LearnInfoRow(label: "الدولة", value: inst.country)
                    if let d = inst.description { LearnBodyText(d) }
                    LearnExternalLink(title: "الموقع الرسمي", urlString: inst.website)
                }
            }) {
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: Sunnah.Spacing.s2) {
                        ForEach(Self.types, id: \.label) { t in
                            Button { selectedType = t.id } label: { SunnahChip(t.label, selected: selectedType == t.id) }
                                .buttonStyle(.plain)
                                .accessibilityAddTraits(selectedType == t.id ? .isSelected : [])
                        }
                    }
                    .padding(.horizontal, Sunnah.Spacing.pageX)
                }
            }
        }
        .sunnahNavTitle("المؤسسات العلمية")
    }
}

// MARK: - المسابقات

/// /competitions — إعلانات مسابقات خارجية (ليست أسئلة). المنشور في الإنتاج اليوم صفر، فالحالة الفارغة صريحة.
struct LearnCompetitionsScreen: View {
    var body: some View {
        LearnLoadHost(LearnSources.competitions) { (list: [LearnCompetition]) in
            LearnTileGrid(items: list, emptyTitle: "لا توجد مسابقات حالياً", idPrefix: "competitions",
                          tile: { SunnahTileItem(id: $0.id, title: $0.title, subtitle: learnLine($0.organizerName, $0.registrationStatus), symbol: "trophy") },
                          destination: { LearnCompetitionDetailScreen(id: $0.id) })
        }
        .sunnahNavTitle("المسابقات")
    }
}

/// /competitions/:id
struct LearnCompetitionDetailScreen: View {
    let id: String
    var body: some View {
        LearnLoadHost(LearnSources.competitions) { (list: [LearnCompetition]) in
            if let c = list.first(where: { $0.id == id }) {
                LearnDetailPage(title: c.title) {
                    LearnInfoRow(label: "الجهة المنظّمة", value: c.organizerName)
                    LearnInfoRow(label: "حالة التسجيل", value: c.registrationStatus)
                    LearnInfoRow(label: "الفئة", value: c.genderTarget)
                    LearnInfoRow(label: "المكان", value: c.location)
                    LearnInfoRow(label: "الجوائز", value: c.prizeText)
                    if let d = c.description { LearnBodyText(d) }
                    LearnExternalLink(title: "التسجيل", urlString: c.registrationUrl)
                    LearnExternalLink(title: "المصدر" + (c.sourceName.map { ": " + $0 } ?? ""), urlString: c.sourceUrl)
                }
            } else {
                EmptyStateView(title: "المسابقة غير موجودة")
            }
        }
    }
}
