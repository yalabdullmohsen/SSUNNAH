import SwiftUI

// MARK: - الجامعات

/// /universities — دليل الجامعات الشرعية مع حقل بحث محلي بالاسم/الدولة/المدينة.
struct LearnUniversitiesScreen: View {
    @Environment(\.openRoute) private var openRoute
    @State private var query = ""

    var body: some View {
        LearnLoadHost(LearnSources.universities) { (all: [LearnUniversity]) in
            LearnList(items: filter(all), emptyTitle: query.isEmpty ? "المحتوى قيد التوثيق" : "لا نتائج") { u in
                Button { openRoute("/universities/" + u.slug) } label: {
                    SunnahListRow(title: u.nameAr, subtitle: learnLine(u.country, u.city))
                }
                .buttonStyle(.plain)
            }
        }
        .searchable(text: $query)
        .toolbar {
            ToolbarItem(placement: .primaryAction) {
                Button("قارن") { openRoute("/universities/compare") }
            }
        }
        .navigationTitle("الجامعات")
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
            if let about = university.about { Text(about).font(Sunnah.Typography.body).foregroundStyle(Sunnah.Colors.textPrimary) }
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
                List {
                    let chosen = selection.slugs.compactMap { s in all.first { $0.slug == s } }
                    if chosen.count >= 2 {
                        Section("المقارنة") {
                            LearnCompareRow(label: "الدولة", values: chosen.map { $0.country ?? "—" })
                            LearnCompareRow(label: "المدينة", values: chosen.map { $0.city ?? "—" })
                            LearnCompareRow(label: "الاعتماد", values: chosen.map(\.accreditationLabel))
                            LearnCompareRow(label: "عدد البرامج", values: chosen.map { "\($0.programs?.count ?? 0)" })
                            LearnCompareRow(label: "الدرجات", values: chosen.map { $0.degreeLevels.isEmpty ? "—" : $0.degreeLevels.joined(separator: "، ") })
                            LearnCompareRow(label: "منح", values: chosen.map { $0.offersScholarship ? "نعم" : "لا" })
                        }
                        .listRowBackground(Sunnah.Colors.surface)
                    }
                    Section(selection.canAdd ? "اختر جامعتين إلى أربع" : "بلغت الحد الأقصى (أربع)") {
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
                    .listRowBackground(Sunnah.Colors.surface)
                }
                .listStyle(.plain).scrollContentBackground(.hidden).background(Sunnah.Colors.bg)
            }
        }
        .navigationTitle("مقارنة الجامعات")
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

    var body: some View {
        LearnLoadHost(load: { try await LearnSources.loadIfExported([LearnInstitution].self, from: LearnSources.institutions, with: $0) }) { (loaded: [LearnInstitution]) in
            // المؤسسة غير المعتمدة تُعرض بعلامة «قيد المراجعة» ظاهرة، وتتحول إلى «معتمد» حين تصل حالتها من الشبكة.
            let all = loaded
            if all.isEmpty { EmptyStateView(title: "قيد التوثيق") } else {
                VStack(spacing: Sunnah.Spacing.s2) {
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
                    LearnList(items: all.filter { selectedType == nil || $0.type == selectedType }, emptyTitle: "لا مؤسسات في هذا النوع") { inst in
                        SunnahNavigationLink {
                            LearnDetailPage(title: inst.name) {
                                if let t = inst.typeLabel { SunnahChip(t) }
                                if !inst.isReviewed { SunnahChip(LearnInstitution.pendingBadge) }
                                LearnInfoRow(label: "المدينة", value: inst.city)
                                LearnInfoRow(label: "الدولة", value: inst.country)
                                if let d = inst.description { Text(d).font(Sunnah.Typography.body).foregroundStyle(Sunnah.Colors.textPrimary) }
                                LearnExternalLink(title: "الموقع الرسمي", urlString: inst.website)
                            }
                        } label: {
                            HStack(spacing: Sunnah.Spacing.s2) {
                                SunnahListRow(title: inst.name, subtitle: learnLine(inst.typeLabel, inst.city))
                                if !inst.isReviewed { SunnahChip(LearnInstitution.pendingBadge) }
                            }
                        }
                    }
                }
            }
        }
        .navigationTitle("المؤسسات العلمية")
    }
}

// MARK: - المسابقات

/// /competitions — إعلانات مسابقات خارجية (ليست أسئلة). المنشور في الإنتاج اليوم صفر، فالحالة الفارغة صريحة.
struct LearnCompetitionsScreen: View {
    @Environment(\.openRoute) private var openRoute
    var body: some View {
        LearnLoadHost(LearnSources.competitions) { (list: [LearnCompetition]) in
            LearnList(items: list, emptyTitle: "لا توجد مسابقات حالياً") { c in
                Button { openRoute("/competitions/" + c.id) } label: {
                    SunnahListRow(title: c.title, subtitle: learnLine(c.organizerName, c.registrationStatus))
                }
                .buttonStyle(.plain)
            }
        }
        .navigationTitle("المسابقات")
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
                    if let d = c.description { Text(d).font(Sunnah.Typography.body).foregroundStyle(Sunnah.Colors.textPrimary) }
                    LearnExternalLink(title: "التسجيل", urlString: c.registrationUrl)
                    LearnExternalLink(title: "المصدر" + (c.sourceName.map { ": " + $0 } ?? ""), urlString: c.sourceUrl)
                }
            } else {
                EmptyStateView(title: "المسابقة غير موجودة")
            }
        }
    }
}
