import Foundation

/// محوّلات قسم المكتبة: من شكل التصدير إلى ما تعرضه القوالب.
/// القبول: المنشور فقط، ولا بيانات تجريبية، ولا نص منسوب بلا مصدر. لا نص شرعي من الكود.
enum LibraryAdapters {

    // MARK: الأبحاث

    static func published(_ file: LibraryResearchFile) -> [LibraryResearch] {
        file.records.filter { $0.reviewStatus == "published" && $0.isDemo != true && !$0.title.isBlank && !$0.abstract.isBlank }
    }

    static func research(_ file: LibraryResearchFile) -> [ContentItem] {
        let labels = Dictionary(file.categories.map { ($0.id, $0.label) }, uniquingKeysWith: { a, _ in a })
        return published(file).map { r in
            let authors = r.authors.map { a in a.role.map { "\(a.name) (\($0))" } ?? a.name }.joined(separator: "، ")
            let place = [r.university, r.college, r.country].compactMap { $0 }.filter { !$0.isBlank }.joined(separator: "، ")
            return ContentItem(
                libraryID: r.slug.isBlank ? r.id : r.slug, title: r.title,
                subtitle: [authors, r.year.map(String.init)].compactMap { $0 }.filter { !$0.isBlank }.joined(separator: " · "),
                body: paragraphs([
                    r.abstract,
                    lines([place.isEmpty ? nil : "الجهة: \(place)", r.supervisor.map { "الإشراف: \($0)" }, r.publisher.map { "الناشر: \($0)" }]),
                    r.keywords.isEmpty ? nil : "الكلمات المفتاحية: " + r.keywords.joined(separator: "، "),
                    r.referencesNote,
                    lines([r.doi.map { "DOI: \($0)" }, r.sourceUrl.map { "المصدر: \($0)" }, r.copyrightNote]),
                ]),
                tags: r.categoryIds.compactMap { labels[$0] }
            )
        }
    }

    /// يطابق المعرّف أو الـslug كما يفعل getResearchByIdOrSlug.
    static func research(_ file: LibraryResearchFile, id: String) -> ContentItem? {
        guard let r = published(file).first(where: { $0.id == id || $0.slug == id }) else { return nil }
        return research(LibraryResearchFile(records: [r], categories: file.categories)).first
    }

    /// مساعد الباحث: تغطية كل تصنيف بالأبحاث المنشورة (الأقل أولًا = فجوات) وأكثر الكلمات تكرارًا.
    struct ResearchInsights: Equatable {
        struct Row: Hashable { let label: String; let count: Int }
        var coverage: [Row]
        var topKeywords: [Row]
    }

    static func insights(_ file: LibraryResearchFile, keywordLimit: Int = 15) -> ResearchInsights {
        let pub = published(file)
        var perCat: [String: Int] = [:]
        var perKw: [String: Int] = [:]
        for r in pub {
            for c in Set(r.categoryIds) { perCat[c, default: 0] += 1 }
            for k in Set(r.keywords.map { $0.trimmingCharacters(in: .whitespacesAndNewlines) }) where !k.isEmpty { perKw[k, default: 0] += 1 }
        }
        let cats = file.categories.sorted { ($0.sortOrder ?? .max) < ($1.sortOrder ?? .max) }
            .map { ResearchInsights.Row(label: $0.label, count: perCat[$0.id] ?? 0) }
            .enumerated().sorted { $0.element.count != $1.element.count ? $0.element.count < $1.element.count : $0.offset < $1.offset }
            .map { $0.element }
        let kws = perKw.sorted { $0.value != $1.value ? $0.value > $1.value : $0.key < $1.key }
            .prefix(keywordLimit).map { ResearchInsights.Row(label: $0.key, count: $0.value) }
        return ResearchInsights(coverage: cats, topKeywords: Array(kws))
    }

    // MARK: دروس (اللغة العربية، الموسوعات)

    static func darsSections(_ sections: [LibraryDarsSection]) -> [ContentItem] {
        sections.compactMap { s in
            let lessons = s.lessons.filter { !$0.title.isBlank }
            guard !lessons.isEmpty else { return nil }
            let body = lessons.map { l in paragraphs([l.title, l.summary, isEcho(l.body, of: l.summary) ? nil : l.body]) }
            return ContentItem(libraryID: s.id, title: s.title, subtitle: "\(lessons.count) موضوعًا", body: paragraphs(body))
        }
    }

    /// في الموسوعات يكرر body الملخصَ مسبوقًا بـ«باب …»؛ لا يُعرض مكررًا.
    static func isEcho(_ body: String?, of summary: String?) -> Bool {
        guard let b = body?.trimmingCharacters(in: .whitespacesAndNewlines), let s = summary?.trimmingCharacters(in: .whitespacesAndNewlines), !s.isEmpty else { return false }
        return b == s || (b.hasPrefix("باب") && b.hasSuffix(s))
    }

    // MARK: المصطلحات (ذات المصدر فقط)

    static let glossaryCategories = ["aqeedah": "العقيدة", "fiqh": "الفقه", "hadith": "علم الحديث", "quran": "علوم القرآن",
                                     "seerah": "السيرة والتاريخ", "tazkiya": "التزكية والأخلاق"]

    static func glossary(_ terms: [LibraryGlossaryTerm]) -> [ContentItem] {
        terms.filter { !$0.term.isBlank && !$0.definition.isBlank && !($0.source ?? "").isBlank }
            .sorted { $0.term < $1.term }
            .map { t in
                ContentItem(
                    libraryID: t.id.value, title: t.term, subtitle: t.definition,
                    body: paragraphs([
                        t.plural.map { "الجمع: \($0)" }, t.definition, t.detail,
                        (t.related ?? []).isEmpty ? nil : "مصطلحات ذات صلة: " + (t.related ?? []).joined(separator: "، "),
                        t.source.map { "المصدر: \($0)" },
                    ]),
                    tags: [t.category.flatMap { glossaryCategories[$0] }].compactMap { $0 }
                )
            }
    }

    // MARK: الخرائط الذهنية — الشجرة مخطّطًا بالإزاحة

    static func mindMaps(_ maps: [LibraryMindMap]) -> [ContentItem] {
        maps.map { m in
            var rows: [String] = []
            func walk(_ n: LibraryMindMap.Node, depth: Int) {
                rows.append(String(repeating: "\u{2003}", count: depth) + (depth == 0 ? "" : "• ") + n.label)
                for c in n.children ?? [] { walk(c, depth: depth + 1) }
            }
            walk(m.root, depth: 0)
            return ContentItem(libraryID: m.id, title: m.title, subtitle: m.description,
                               body: paragraphs([m.description, rows.joined(separator: "\n")]), tags: [m.category].compactMap { $0 })
        }
    }

    // MARK: الإعلانات العلمية

    static func announcements(_ rows: [LibraryAnnouncement]) -> [ContentItem] {
        rows.map { a in
            ContentItem(
                libraryID: a.id, title: a.announcementTitle,
                subtitle: [a.sheikh, a.lessonTitle].compactMap { $0 }.filter { !$0.isBlank }.joined(separator: " · "),
                body: paragraphs([
                    lines([a.bookTitle.map { "الكتاب: \($0)" + (a.bookAuthor.map { " — \($0)" } ?? "") }, a.organizer.map { "الجهة المنظمة: \($0)" }]),
                    lines([[a.day, a.date, a.time].compactMap { $0 }.filter { !$0.isBlank }.joined(separator: " · "),
                           [a.mosque, a.venue, a.region, a.governorate].compactMap { $0 }.filter { !$0.isBlank }.joined(separator: "، ")]),
                    lines((a.notes ?? []).map { "• " + $0 }),
                    lines([a.registrationUrl.map { "التسجيل: \($0)" }, a.liveUrl.map { "البث: \($0)" }, a.websiteUrl.map { "الموقع: \($0)" }]),
                ]),
                tags: a.tags ?? []
            )
        }
    }

    // MARK: المصادر

    static func sources(_ file: LibrarySourceAccountsFile) -> [ContentItem] {
        file.accounts.filter { $0.enabled != false && !$0.nameAr.isBlank }.map { a in
            ContentItem(libraryID: a.id, title: a.nameAr,
                        subtitle: [a.platform, a.handle.map { "@" + $0 }, a.regionAr].compactMap { $0 }.filter { !$0.isBlank }.joined(separator: " · "),
                        body: paragraphs([a.url, (a.topics ?? []).isEmpty ? nil : "الموضوعات: " + (a.topics ?? []).joined(separator: "، ")]),
                        tags: [a.kind].compactMap { $0 })
        }
    }

    static func source(id: String, accounts: LibrarySourceAccountsFile, feed: LibraryFeedFile?) -> ContentItem? {
        guard let base = sources(accounts).first(where: { $0.id == id }) else { return nil }
        let recent = (feed?.items ?? []).filter { ($0.sources ?? []).contains { $0.id == id } }.map { f in
            lines([f.titleAr, [f.sheikh, f.place, f.timeText].compactMap { $0 }.filter { !$0.isBlank }.joined(separator: " · "), f.summaryAr])
        }
        return ContentItem(libraryID: base.id, title: base.title, subtitle: base.subtitle,
                           body: paragraphs([base.body, recent.isEmpty ? nil : "آخر ما نُشر"] + recent.map { Optional($0) }), tags: base.tags)
    }

    // MARK: التنقل (المزيد، الأقسام، خريطة الموقع)

    struct NavGroup: Equatable {
        let title: String
        let links: [SectionLink]
    }

    /// /more: مجموعات القائمة الجانبية كما صدّرها الموقع (بلا الحساب، بلا المخفي/قريبًا) ثم صفوف الإعدادات؛ المسارات المبقاة فقط.
    static func more(_ nav: LibraryNavigation, scope: (String) -> Bool = LibraryRouteScope.contains) -> [NavGroup] {
        let groups = nav.groups.filter { $0.id != "account" }.compactMap { g -> NavGroup? in
            let links = g.sections.filter { scope($0.route) }
                .map { SectionLink(id: $0.id, title: $0.title, subtitle: $0.subtitle, route: $0.route) }
            return links.isEmpty ? nil : NavGroup(title: g.title, links: links)
        }
        let settings = nav.settingsRows.filter { scope($0.href) }.map { SectionLink(id: $0.id, title: $0.title, subtitle: $0.description, route: $0.href) }
        return groups + (settings.isEmpty ? [] : [NavGroup(title: "الحساب والإعدادات", links: settings)])
    }

    /// صفحة «كل الأقسام»: كل مسار في SectionsCatalog داخل نطاق التطبيق، مجمَّعًا بمجموعته، والعنوان الفرعي من التصدير إن وُجد.
    static func sectionsPage(_ nav: LibraryNavigation?, scope: (String) -> Bool = LibraryRouteScope.contains) -> [NavGroup] {
        var sub: [String: String] = [:]
        if let nav {
            for s in nav.sections { sub[s.route] = s.subtitle }
            for g in nav.groups { for s in g.sections { sub[s.route] = s.subtitle } }
            for r in nav.settingsRows { sub[r.href] = r.description }
        }
        return SectionsCatalog.groupOrder.compactMap { group in
            let links = SectionsCatalog.entries.filter { $0.group == group && scope($0.route) }
                .map { SectionLink(id: $0.route, title: $0.title, subtitle: sub[$0.route], route: $0.route) }
            return links.isEmpty ? nil : NavGroup(title: group, links: links)
        }
    }

    /// /sections: أقسام التنقل بترتيب التصدير (مجموعة ثم ترتيب السجل).
    static func sections(_ nav: LibraryNavigation, scope: (String) -> Bool = LibraryRouteScope.contains) -> [SectionLink] {
        nav.sections.filter { scope($0.route) }
            .map { SectionLink(id: $0.id, title: $0.title, subtitle: $0.subtitle, route: $0.route) }
    }

    static func sitemap(_ nav: LibraryNavigation, scope: (String) -> Bool = LibraryRouteScope.contains) -> [NavGroup] {
        nav.sitemap.compactMap { g in
            let links = g.links.filter { scope($0.href) }.map { SectionLink(id: $0.href, title: $0.label, subtitle: $0.desc, route: $0.href) }
            return links.isEmpty ? nil : NavGroup(title: g.title, links: links)
        }
    }

    // MARK: وثائق تُنقل حرفيًا

    static func document(_ doc: LibraryTextDocument, id: String) -> ContentItem {
        let parts = doc.sections.map { s in paragraphs([s.title] + s.paragraphs) }
        return ContentItem(libraryID: id, title: doc.title, subtitle: doc.updatedAt.map { "آخر تحديث: \($0)" }, body: paragraphs(parts))
    }

    // MARK: البحث — تطبيع عربي (تشكيل، تطويل، همزات، تاء مربوطة، ألف مقصورة)

    static func normalize(_ s: String) -> String {
        var out = ""
        for u in s.unicodeScalars {
            switch u.value {
            case 0x064B...0x065F, 0x0670, 0x06D6...0x06ED, 0x0640: continue
            case 0x0622, 0x0623, 0x0625, 0x0671: out.unicodeScalars.append("\u{0627}")
            case 0x0629: out.unicodeScalars.append("\u{0647}")
            case 0x0649: out.unicodeScalars.append("\u{064A}")
            case 0x0624: out.unicodeScalars.append("\u{0648}")
            case 0x0626: out.unicodeScalars.append("\u{064A}")
            default: out.unicodeScalars.append(u)
            }
        }
        return out.lowercased().split(whereSeparator: { $0.isWhitespace }).joined(separator: " ")
    }

    static let kindLabels = ["qa": "سؤال وجواب", "tafsir": "تفسير", "adhkar": "ذكر", "history": "تاريخ", "surah": "سورة",
                             "prophet": "نبي", "nation": "أمة", "lesson": "درس", "person": "علَم", "hadith": "حديث"]

    /// يطابق كل كلمات الاستعلام بعد التطبيع؛ يقدّم ما يبدأ عنوانه بالاستعلام. نتيجة مسارها خارج المبقاة لا تُعرض.
    static func search(_ index: LibrarySearchIndex, query: String, limit: Int = 60, scope: (String) -> Bool = LibraryRouteScope.contains) -> [ContentItem] {
        let q = normalize(query)
        let terms = q.split(separator: " ").map(String.init)
        guard q.count >= 2 else { return [] }
        return index.docs.compactMap { d -> (Int, LibrarySearchIndex.Doc)? in
            guard scope(d.href) else { return nil }
            let title = normalize(d.titleAr)
            let hay = title + " " + normalize(d.norm ?? "")
            guard terms.allSatisfy({ hay.contains($0) }) else { return nil }
            return (title.hasPrefix(q) ? 0 : (title.contains(q) ? 1 : 2), d)
        }
        .enumerated().sorted { $0.element.0 != $1.element.0 ? $0.element.0 < $1.element.0 : $0.offset < $1.offset }
        .prefix(limit)
        .map { e in
            let d = e.element.1
            var item = ContentItem(libraryID: d.id, title: d.titleAr, subtitle: kindLabels[d.kind])
            item.route = d.href
            return item
        }
    }

    // MARK: مساعدات

    static func lines(_ parts: [String?]) -> String {
        parts.compactMap { $0?.trimmingCharacters(in: .whitespacesAndNewlines) }.filter { !$0.isEmpty }.joined(separator: "\n")
    }

    static func paragraphs(_ parts: [String?]) -> String {
        parts.compactMap { $0?.trimmingCharacters(in: .whitespacesAndNewlines) }.filter { !$0.isEmpty }.joined(separator: "\n\n")
    }
}

/// روابط ثابتة للتنقل (ليست محتوى): مطابقة لـIslamicDirectoryHubPage.
enum LibraryLinks {
    /// محور «اللغة والمكتبة والبحث»: كل وجهات القسم عدا الصفحة نفسها (تُتصفَّح أبحاثها من الزر).
    static let hub: [SectionLink] = [
        SectionLink(id: "assistant", title: "مساعد البحث", subtitle: "أسئلة وإحصاءات عن الأبحاث", route: "/academic-research/assistant"),
        SectionLink(id: "submit", title: "تقديم بحث", subtitle: "إرسال بحث للمراجعة", route: "/academic-research/submit"),
        SectionLink(id: "arabic", title: "النحو والعربية", subtitle: "دروس اللغة العربية", route: "/arabic-language"),
        SectionLink(id: "glossary", title: "المصطلحات", subtitle: "معاني المصطلحات الشرعية", route: "/islamic-glossary"),
        SectionLink(id: "mawsuaat", title: "الموسوعات", subtitle: "مراجع موسعة مبوّبة", route: "/mawsuaat"),
        SectionLink(id: "directory", title: "الدليل الإسلامي", subtitle: "الجامعات والمؤسسات والمساجد", route: "/islamic-directory"),
        SectionLink(id: "cards", title: "البطاقات", subtitle: "بطاقات مراجعة سريعة", route: "/cards"),
    ].filter { LibraryRouteScope.contains($0.route) }
    static let directory = [
        SectionLink(id: "universities", title: "دليل الجامعات والكليات الشرعية", route: "/universities"),
        SectionLink(id: "institutions", title: "المؤسسات الإسلامية", route: "/institutions"),
        SectionLink(id: "islamic-landmarks", title: "المساجد والمشاهد", route: "/islamic-landmarks"),
    ].filter { LibraryRouteScope.contains($0.route) }
}

fileprivate extension ContentItem {
    init(libraryID: String, title: String, subtitle: String? = nil, body: String? = nil, tags: [String] = []) {
        self.id = libraryID
        self.title = title
        self.subtitle = subtitle.flatMap { $0.isEmpty ? nil : $0 }
        self.body = body.flatMap { $0.isEmpty ? nil : $0 }
        self.tags = tags
        self.audioURL = nil
        self.route = nil
    }
}

private extension String {
    var isBlank: Bool { trimmingCharacters(in: .whitespacesAndNewlines).isEmpty }
}
