import Foundation

/// مسارات القسم كما في AppRoutes.tsx.
enum FiqhRoutes {
    static let hub = "/fiqh"
    static func book(_ b: String) -> String { "/fiqh/books/\(b)" }
    static func chapter(_ b: String, _ c: String) -> String { "/fiqh/books/\(b)/chapters/\(c)" }
    static func lesson(_ b: String, _ l: String) -> String { "/fiqh/books/\(b)/lessons/\(l)" }
    static func madhhab(_ id: String) -> String { "/madhahib/\(id)" }
    static func sin(_ slug: String) -> String { "/sins-and-rights/\(slug)" }

    /// `/fiqh/topics/:topicId` مسارات قديمة تُحوَّل (TOPIC_REDIRECTS في FiqhTopicView.tsx)؛ المرساة تُسقط.
    static func topicRedirect(_ topicId: String) -> String {
        let map = [
            "muamalat": hub, "atima": book("atima"), "medical": hub, "islamic-finance": "/riba",
            "usul-fiqh": "/fiqh/usul", "nawazil": hub, "hudud": book("hudud"), "minorities": hub,
            "tech-fiqh": hub, "patients": book("taharah"), "financing": "/riba",
        ]
        return map[topicId] ?? hub
    }
}

/// محوّلات البيانات: نموذج المصدر → صفحة قراءة. عناوين الأقسام نسخة من نصوص واجهة الويب، والمحتوى كما هو.
enum FiqhAdapters {
    static let categoryOrder = ["ibadat", "muamalat", "usrah", "jinayat", "qada"]
    static let categoryLabels = ["ibadat": "العبادات", "muamalat": "المعاملات", "usrah": "الأسرة", "jinayat": "الجنايات والحدود", "qada": "القضاء"]

    static func sourcesLine(_ sources: [FiqhSource]?) -> [String] {
        (sources ?? []).map { [$0.book, $0.author, $0.ref].compactMap(FiqhReading.trimmed).joined(separator: " — ") }
    }

    // MARK: كتب الفقه

    static func hub(_ catalog: FiqhCatalog) -> FiqhReading {
        let books = catalog.publishedBooks
        var links: [FiqhReading.Link] = []
        for cat in categoryOrder {
            for b in books where b.category == cat {
                links.append(FiqhReading.Link(title: b.title, subtitle: b.description, route: FiqhRoutes.book(b.id), group: categoryLabels[cat]))
            }
        }
        // كتب بتصنيف خارج القائمة المعروفة لا تُسقط.
        for b in books where !categoryOrder.contains(b.category ?? "") {
            links.append(FiqhReading.Link(title: b.title, subtitle: b.description, route: FiqhRoutes.book(b.id)))
        }
        let supporting = [("أصول الفقه", "/fiqh/usul"), ("القواعد الفقهية", "/fiqh-qawaid"), ("المذاهب الأربعة", "/madhahib")]
        for (title, route) in supporting {
            links.append(FiqhReading.Link(title: title, route: route, group: "مباحث مساندة"))
        }
        return FiqhReading(title: "الفقه", links: links)
    }

    /// «العبادات»: مدخل إلى شاشات موجودة فقط (لا نص شرعي جديد)؛ يُعلَن «قيد المراجعة» حتى يُعتمد.
    static func worship() -> FiqhReading {
        let groups: [(String, [(String, String, String)])] = [
            ("الصلاة", [("مواقيت الصلاة", "تنبيهات الصلاة والصلاة القادمة", "/prayer-times"),
                        ("مراتب المصلين", "", "/prayer-ranks"),
                        ("دليل الصلاة", "", "/salah-guide")]),
            ("الذكر والدعاء", [("الأذكار", "", "/adhkar"), ("الأدعية", "", "/duas"), ("التسبيح", "", "/tasbih")]),
            ("أدوات", [("القبلة", "", "/qibla")]),
        ]
        let links = groups.flatMap { g in
            g.1.map { FiqhReading.Link(title: $0.0, subtitle: FiqhReading.trimmed($0.1), route: $0.2, group: g.0) }
        }
        return FiqhReading(title: "العبادات", subtitle: "قيد المراجعة", links: links)
    }

    static func book(_ book: FiqhBook) -> FiqhReading {
        let links = FiqhVisibility.publishedChapters(book).map {
            FiqhReading.Link(title: $0.title, subtitle: $0.summary, route: FiqhRoutes.chapter(book.id, $0.id), group: "الأبواب")
        }
        return .single(title: book.title, subtitle: book.description, blocks: [
            FiqhReading.block("order", "موضع الكتاب", text: book.orderReason),
            FiqhReading.block("sources", "المصادر", bullets: sourcesLine(book.sources)),
        ], links: links)
    }

    static func chapter(_ book: FiqhBook, _ chapter: FiqhChapter) -> FiqhReading {
        let links = FiqhVisibility.publishedLessons(chapter).map {
            FiqhReading.Link(title: $0.title, subtitle: $0.level, route: FiqhRoutes.lesson(book.id, $0.id), group: "المسائل")
        }
        return .single(title: chapter.title, subtitle: book.title, blocks: [
            FiqhReading.block("def", "تعريف الباب", text: chapter.definition),
            FiqhReading.block("topics", "موضوعات الباب", bullets: chapter.topics),
            FiqhReading.block("sum", "الخلاصة", text: chapter.summary),
            FiqhReading.block("notes", "التنبيهات", text: chapter.notes),
            FiqhReading.block("ev", "الأدلة", quote: FiqhVisibility.stripTemplate(chapter.evidence)),
            FiqhReading.block("sources", "المصادر", bullets: sourcesLine(chapter.sources)),
        ], links: links)
    }

    /// ترتيب أقسام المسألة ومصادر حقولها كما في FiqhLessonView.tsx.
    static func lesson(_ book: FiqhBook, _ chapter: FiqhChapter, _ lesson: FiqhLesson) -> FiqhReading {
        let madhhab = FiqhVisibility.stripTemplate(lesson.madhhabNotes)
        let scholarly = FiqhReading.trimmed(lesson.scholarlyNotes) ?? madhhab
        return .single(title: lesson.title, subtitle: "\(book.title) · \(chapter.title)", blocks: [
            FiqhReading.block("summary", "ملخص مختصر", text: lesson.summary),
            FiqhReading.block("definition", "تعريف المسألة", text: lesson.definition),
            FiqhReading.block("ruling", "الحكم المختصر", text: FiqhReading.trimmed(lesson.ruling) ?? lesson.preferred),
            FiqhReading.block("evidence", "الأدلة", quote: FiqhVisibility.stripTemplate(lesson.evidence)),
            FiqhReading.block("scholarly", "أقوال أهل العلم", text: scholarly),
            FiqhReading.block("practical", "الخلاصة", text: lesson.practicalSummary),
            FiqhReading.block("notes", "تنبيهات مهمة", text: lesson.notes),
            FiqhReading.block("mistakes", "أخطاء شائعة", bullets: lesson.commonMistakes),
            FiqhReading.block("examples", "أمثلة تطبيقية", bullets: lesson.examples),
            FiqhReading.block("review", "أسئلة مراجعة", bullets: lesson.reviewQuestions),
            FiqhReading.block("sources", "المصادر", bullets: sourcesLine(lesson.sources)),
        ])
    }

    // MARK: أدلة الأبواب

    static func guide(_ g: FiqhGuide) -> FiqhReading {
        var tabs: [FiqhReading.Tab] = []
        for tab in g.tabs {
            var blocks: [FiqhReading.Block] = []
            if let intro = FiqhReading.block("\(tab.id)-intro", nil, text: tab.intro) { blocks.append(intro) }
            for card in tab.cards {
                let text = [card.summary, card.note].compactMap { $0 }.joined(separator: "\n")
                if let b = FiqhReading.block(card.id, card.title, text: text, bullets: card.points, quote: card.evidence, reference: card.evidenceRef) {
                    blocks.append(b)
                }
            }
            if !blocks.isEmpty { tabs.append(FiqhReading.Tab(id: tab.id, label: tab.label, blocks: blocks)) }
        }
        if let m = FiqhReading.block("methodology", "منهج العرض", text: g.methodology), !tabs.isEmpty {
            tabs[0].blocks.insert(m, at: 0)
        }
        let links = (g.related ?? []).map { FiqhReading.Link(title: $0.label, route: $0.href, group: "ذو صلة") }
        return FiqhReading(title: g.title, subtitle: g.subtitle, tabs: tabs, links: links)
    }

    // MARK: المذاهب

    static func madhahib(_ list: [Madhhab]) -> FiqhReading {
        FiqhReading(title: "المذاهب الفقهية", links: list.map { FiqhReading.Link(title: $0.name, subtitle: $0.fullName, route: FiqhRoutes.madhhab($0.id)) })
    }

    static func madhhab(_ m: Madhhab) -> FiqhReading {
        var meta: [String] = []
        if let v = FiqhReading.trimmed(m.fullName) { meta.append("الاسم الكامل: \(v)") }
        if let f = FiqhReading.trimmed(m.founder) {
            let years = [m.born, m.died].compactMap(FiqhReading.trimmed)
            meta.append("المؤسس: الإمام \(f)" + (years.count == 2 ? " (\(years[0])–\(years[1]))" : ""))
        }
        if let v = FiqhReading.trimmed(m.origin) { meta.append("المنشأ: \(v)") }
        if let v = FiqhReading.trimmed(m.spread) { meta.append("الانتشار: \(v)") }
        return .single(title: m.fullName ?? m.name, blocks: [
            FiqhReading.block("overview", "نظرة عامة", text: m.summary),
            FiqhReading.block("meta", "النشأة والسياق", bullets: meta),
            FiqhReading.block("method", "المنهج الأصولي", text: m.methodology),
            FiqhReading.block("sources", "مصادر التشريع", bullets: m.sources),
            FiqhReading.block("features", "أبرز المميزات", bullets: m.features),
            FiqhReading.block("books", "أهم المصنَّفات", bullets: (m.books ?? []).map { "\($0.title) — \($0.author)" }),
            FiqhReading.block("scholars", "كبار علماء المذهب", bullets: m.scholars),
            FiqhReading.block("quote", "نص منقول", quote: m.quote.map { "«\($0.text)»" }, reference: m.quote?.source),
        ])
    }

    // MARK: فهارس الدروس (مقاصد الشريعة)

    static func dars(title: String, _ sections: [DarsSection]) -> FiqhReading {
        let tabs = sections.map { s in
            FiqhReading.Tab(id: s.id, label: s.title, blocks: s.lessons.compactMap {
                FiqhReading.block($0.id, $0.title, text: $0.body ?? $0.summary)
            })
        }.filter { !$0.blocks.isEmpty }
        return FiqhReading(title: title, tabs: tabs)
    }

    // MARK: مراتب المصلين

    static func prayerRanks(_ ranks: [PrayerRank]) -> FiqhReading {
        .single(title: "مراتب المصلين", blocks: ranks.enumerated().map { i, r in
            FiqhReading.block("rank-\(i)", "\(r.title): \(r.label)", text: [r.text, r.benefit].compactMap { $0 }.joined(separator: "\n"), reference: r.ruling)
        })
    }

    // MARK: أصول الفقه

    static func usul(_ topics: [UsulTopic]) -> FiqhReading {
        let overview = topics.filter { $0.href == nil }.compactMap {
            FiqhReading.block($0.id, $0.title, text: $0.summary,
                              reference: $0.status == "structure" ? sourcesLine($0.source.map { [$0] }).first : $0.kind)
        }
        var tabs = overview.isEmpty ? [] : [FiqhReading.Tab(id: "topics", label: "الأبواب", blocks: overview)]
        for t in topics where t.status == "ready" {
            let blocks = (t.details ?? []).enumerated().compactMap { i, d in
                FiqhReading.block("\(t.id)-\(i)", d.title, text: d.summary, quote: d.evidence, reference: sourcesLine(d.source.map { [$0] }).first)
            }
            if !blocks.isEmpty { tabs.append(FiqhReading.Tab(id: t.id, label: t.title, blocks: blocks)) }
        }
        let links = topics.compactMap { t in t.href.map { FiqhReading.Link(title: t.title, subtitle: t.summary, route: $0) } }
        return FiqhReading(title: "أصول الفقه", tabs: tabs, links: links)
    }

    // MARK: الذنوب والحقوق — يُعرض المراجَع فقط (reviewStatus == reviewed)

    static func reviewedSins(_ bundle: SinsAndRightsBundle) -> [SinTopic] { bundle.topics.filter { $0.reviewStatus == "reviewed" } }

    static func sinsList(_ bundle: SinsAndRightsBundle) -> FiqhReading {
        let topics = reviewedSins(bundle)
        let bySlug = Dictionary(topics.map { ($0.slug, $0) }, uniquingKeysWith: { a, _ in a })
        var used = Set<String>(), links: [FiqhReading.Link] = []
        for cat in bundle.categories ?? [] {
            for slug in cat.topicSlugs { if let t = bySlug[slug], used.insert(slug).inserted {
                links.append(FiqhReading.Link(title: t.title, subtitle: t.shortDescription, route: FiqhRoutes.sin(slug), group: cat.title))
            } }
        }
        for t in topics where !used.contains(t.slug) {
            links.append(FiqhReading.Link(title: t.title, subtitle: t.shortDescription, route: FiqhRoutes.sin(t.slug)))
        }
        return FiqhReading(title: "الذنوب والحقوق", links: links)
    }

    static func evidenceLines(_ list: [SinEvidence]?) -> [String] {
        (list ?? []).map { e in [e.text, e.source, e.grade].compactMap(FiqhReading.trimmed).joined(separator: " — ") }
    }

    static func sin(_ t: SinTopic, related: [SinTopic]) -> FiqhReading {
        let r = t.repentanceConditions
        let repentance = [r?.restitutionDetails, r?.forgivenessDetails, r?.expiationDetails, r?.ifOwnerUnreachable].compactMap { $0 }.joined(separator: "\n")
        return .single(title: t.title, subtitle: t.shortDescription, blocks: [
            FiqhReading.block("explanation", "الشرح", text: t.explanation),
            FiqhReading.block("quran", "من القرآن", bullets: evidenceLines(t.quranEvidence)),
            FiqhReading.block("hadith", "من السنة", bullets: evidenceLines(t.hadithEvidence)),
            FiqhReading.block("effects", "الآثار", bullets: t.effects),
            FiqhReading.block("repentance", "شروط التوبة", text: repentance, bullets: r?.general),
            FiqhReading.block("mistakes", "أخطاء شائعة", bullets: t.commonMistakes),
            FiqhReading.block("refs", "المراجع", bullets: t.references),
        ], links: related.map { FiqhReading.Link(title: $0.title, subtitle: $0.shortDescription, route: FiqhRoutes.sin($0.slug), group: "ذو صلة") })
    }

    // MARK: الطب النبوي

    /// تبويب لكل تصنيف بترتيب ظهوره (362 عنصرًا لا تُعرض في صفحة واحدة).
    static func propheticMedicine(_ items: [PropheticMedicineItem]) -> FiqhReading {
        var order: [String] = [], grouped: [String: [FiqhReading.Block]] = [:]
        for i in items {
            let text = [i.arabicName, i.body, i.disclaimer].compactMap { $0 }.joined(separator: "\n")
            guard let block = FiqhReading.block(i.id, i.name, text: text, bullets: i.benefits, quote: i.hadith, reference: i.hadithSource) else { continue }
            let cat = i.category ?? ""
            if grouped[cat] == nil { order.append(cat) }
            grouped[cat, default: []].append(block)
        }
        let tabs = order.map { FiqhReading.Tab(id: $0.isEmpty ? "other" : $0, label: $0, blocks: grouped[$0] ?? []) }
        return FiqhReading(title: "الطب النبوي", tabs: tabs)
    }

    // MARK: الأمر بالمعروف

    static func amrBilMaruf(_ b: AmrBilMarufBundle) -> FiqhReading {
        let levels = b.levels.sorted { ($0.rank ?? 0) < ($1.rank ?? 0) }.compactMap { l in
            FiqhReading.block(l.id, l.title, text: [l.description, l.notes, l.whoCanDo].compactMap { $0 }.joined(separator: "\n"),
                              bullets: (l.conditions ?? []) + (l.evidence ?? []).map { [$0.text, $0.source].compactMap(FiqhReading.trimmed).joined(separator: " — ") })
        }
        let conditions = (b.conditions ?? []).compactMap { FiqhReading.block($0.id, $0.title, text: [$0.detail, $0.scholarNote].compactMap { $0 }.joined(separator: "\n")) }
        let matter: ([AmrMatter]?) -> [FiqhReading.Block] = { ($0 ?? []).compactMap { FiqhReading.block($0.id, $0.title, text: $0.explanation) } }
        let tabs = [
            FiqhReading.Tab(id: "levels", label: "المراتب", blocks: levels),
            FiqhReading.Tab(id: "conditions", label: "الشروط", blocks: conditions),
            FiqhReading.Tab(id: "munkar", label: "من المنكرات", blocks: matter(b.munkaraat)),
            FiqhReading.Tab(id: "maruf", label: "من المعروف", blocks: matter(b.maaruf)),
        ].filter { !$0.blocks.isEmpty }
        return FiqhReading(title: "الأمر بالمعروف والنهي عن المنكر", tabs: tabs)
    }
}
