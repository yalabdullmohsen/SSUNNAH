import Foundation

/// محوّلات قسم السيرة: من شكل التصدير إلى `ContentItem`/`SectionLink` التي تعرضها القوالب.
/// قواعد القبول هنا (DATA_CONTRACT §5 وCLOUD_RULES §7): لا يُعرض ما لم يُصدَّق،
/// ولا حديث بلا درجة، ولا نص منسوب بلا مصدر. لا يُضاف أي نص شرعي من الكود.
enum SirahAdapters {

    // MARK: fikr-waqia — قسم دروس ← عنصر واحد يجمع دروسه

    static func darsSections(_ sections: [SirahDarsSection]) -> [ContentItem] {
        sections.compactMap { s in
            let lessons = s.lessons.filter { !$0.title.isBlank }
            guard !lessons.isEmpty else { return nil }
            let body = lessons.map { l in
                paragraphs([l.title, l.summary, l.body == l.summary ? nil : l.body])
            }
            return ContentItem(sirahID: s.id, title: s.title, subtitle: "\(lessons.count) موضوعًا", body: paragraphs(body))
        }
    }

    // MARK: المعالم

    static func landmarks(_ rows: [SirahLandmark]) -> [ContentItem] {
        rows.filter { !$0.name.isBlank && !$0.description.isBlank }.map { m in
            let facts = lines([
                m.builtYear.map { "سنة البناء: \($0)" },
                m.capacity.map { "السعة: \($0)" },
                m.area.map { "المساحة: \($0)" },
            ])
            return ContentItem(
                sirahID: m.id, title: m.name,
                subtitle: [m.city, m.country].filter { !$0.isBlank }.joined(separator: "، "),
                body: paragraphs([m.description, m.significance, facts]),
                tags: [m.type, m.era ?? ""].filter { !$0.isBlank }
            )
        }
    }

    // MARK: الأمم السابقة

    /// يُقبل من الأدلة: القرآن والتفسير المنسوب، والحديث ذو الدرجة فقط. «unverified» و«disputed» لا تُعرض كحقائق.
    static func acceptedEvidence(_ e: SirahEvidence) -> Bool {
        guard !e.text.isBlank, !e.ref.isBlank else { return false }
        switch e.kind {
        case "quran", "tafsir": return true
        case "hadith": return !(e.grade ?? "").isBlank
        default: return false
        }
    }

    static func evidenceText(_ e: SirahEvidence) -> String {
        lines([e.text, "— " + e.ref + (e.grade.map { "، \($0)" } ?? "")])
    }

    static func nations(_ rows: [SirahNation]) -> [ContentItem] {
        rows.filter { !$0.name.isBlank && !$0.summary.isBlank }
            .sorted { ($0.eraOrder ?? .max) < ($1.eraOrder ?? .max) }
            .map(nation)
    }

    static func nation(_ n: SirahNation) -> ContentItem {
        var parts: [String?] = [n.summary]
        for ch in n.chapters {
            parts.append(lines(["## " + ch.title] + ch.body))
            parts += (ch.evidences ?? []).filter(acceptedEvidence).map { evidenceText($0) as String? }
            parts.append(ch.notKnown.map { "لم يرد فيه نص: \($0)" })
        }
        let refs = n.quranRefs.map { "سورة \($0.surah): \($0.ayahs)" + ($0.note.map { " — \($0)" } ?? "") }
        if !refs.isEmpty { parts.append(lines(["مواضع القصة في القرآن"] + refs)) }
        parts += n.hadiths.filter(acceptedEvidence).map { evidenceText($0) as String? }
        if !n.lessons.isEmpty { parts.append(lines(["العبر"] + n.lessons.map { "• " + $0 })) }
        return ContentItem(sirahID: n.slug, title: n.name, subtitle: [n.place, n.era].filter { !$0.isBlank }.joined(separator: " · "),
                           body: paragraphs(parts), tags: n.tags ?? [])
    }

    // MARK: المناسبات (المعتمد فقط، وله مصدر)

    static let hijriMonths = ["محرم", "صفر", "ربيع الأول", "ربيع الآخر", "جمادى الأولى", "جمادى الآخرة",
                              "رجب", "شعبان", "رمضان", "شوال", "ذو القعدة", "ذو الحجة"]

    static func occasions(_ rows: [SirahOccasion]) -> [ContentItem] {
        rows.filter { $0.reviewStatus == "approved" && !($0.sourceName ?? "").isBlank && !$0.verifiedDescription.isBlank }
            .sorted { (($0.hijriMonth ?? 13), ($0.hijriDay ?? 0)) < (($1.hijriMonth ?? 13), ($1.hijriDay ?? 0)) }
            .map { o in
                let month = o.hijriMonth.flatMap { (1...12).contains($0) ? hijriMonths[$0 - 1] : nil }
                let date = [o.hijriDay.map(String.init), month].compactMap { $0 }.joined(separator: " ")
                let actions = (o.recommendedActions ?? []).map { "• " + $0 }
                return ContentItem(
                    sirahID: o.id, title: o.eventName, subtitle: date.isEmpty ? nil : date,
                    body: paragraphs([
                        o.verifiedDescription,
                        actions.isEmpty ? nil : lines(["ما يُشرع فيه"] + actions),
                        o.evidence.map { "الدليل: \($0)" },
                        o.caveat.map { "تنبيه: \($0)" },
                        o.sourceName.map { "المصدر: \($0)" },
                    ])
                )
            }
    }

    // MARK: قصص الأنبياء (طبقة المعرفة الموثّقة فقط)

    static func prophets(_ rows: [SirahKnowledgeItem]) -> [ContentItem] {
        rows.filter { $0.reviewStatus == "verified" && !$0.body.isBlank && !($0.sources ?? []).isEmpty }.map { k in
            let ev = (k.evidences ?? []).filter { !$0.text.isBlank }.map { e in
                lines([e.text, e.ref.map { "— " + $0 + (e.grade.map { "، \($0)" } ?? "") }])
            }
            let src = (k.sources ?? []).map { s in
                "• " + [s.book, s.author, s.locator].compactMap { $0 }.filter { !$0.isBlank }.joined(separator: "، ")
            }
            let slug = k.id.hasPrefix("prophet-") ? String(k.id.dropFirst("prophet-".count)) : k.id
            return ContentItem(sirahID: slug, title: k.title, body: paragraphs([k.body] + ev + [lines(["المصادر"] + src)]), tags: k.tags ?? [])
        }
    }

    // MARK: شجرة الأنبياء — تُسطَّح بترتيب العمق مع الإزاحة في العنوان الفرعي

    static func lineage(_ root: SirahLineageNode) -> [ContentItem] {
        var out: [ContentItem] = []
        func walk(_ n: SirahLineageNode, depth: Int, parent: String?) {
            let kind = n.isAncestor == true ? "من الآباء" : (n.isUlulAzm == true ? "من أولي العزم" : nil)
            let sub = [parent.map { "من ذرية \($0)" }, n.people.map { "أُرسل إلى \($0)" }, n.era, kind]
                .compactMap { $0 }.filter { !$0.isBlank }.joined(separator: " · ")
            out.append(ContentItem(sirahID: n.id, title: n.name, subtitle: sub.isEmpty ? nil : sub,
                                   body: paragraphs([n.linkNote, n.generationsGap.map { "عدد الأجيال غير المسمّاة بينهما: \($0)" }]),
                                   tags: depth == 0 ? [] : ["الجيل \(depth + 1)"]))
            for c in n.children ?? [] { walk(c, depth: depth + 1, parent: n.name) }
        }
        walk(root, depth: 0, parent: nil)
        return out
    }

    // MARK: الصحابة (بلا «quote»: نص منسوب بلا مصدر)

    static func sahabah(_ rows: [SirahSahabi]) -> [ContentItem] {
        rows.filter { !$0.name.isBlank }.map { s in
            ContentItem(
                sirahID: s.id, title: s.name, subtitle: s.kunya,
                body: paragraphs([
                    lines([s.born.map { "المولد: \($0)" }, s.died.map { "الوفاة: \($0)" }, s.origin.map { "النسب: \($0)" }]),
                    s.islam.map { "إسلامه: \($0)" },
                    s.fadl,
                    (s.legacy ?? []).isEmpty ? nil : lines(["من أثره"] + (s.legacy ?? []).map { "• " + $0 }),
                ]),
                tags: s.category ?? []
            )
        }
    }

    // MARK: مراحل السيرة

    static func seerah(_ rows: [SirahSeerahPhase]) -> [ContentItem] {
        rows.sorted { ($0.num ?? .max) < ($1.num ?? .max) }.map { p in
            ContentItem(
                sirahID: p.id, title: p.title, subtitle: p.year,
                body: paragraphs([
                    p.desc,
                    (p.keyEvents ?? []).isEmpty ? nil : lines(["أبرز الأحداث"] + (p.keyEvents ?? []).map { "• " + $0 }),
                ]),
                tags: p.topics ?? []
            )
        }
    }

    /// مراحل السيرة فصولًا للقارئ المتسلسل: الفترة = السنة، الأحداث = أبرز الأحداث، و«مرتبط» من أقسام التطبيق المذكورة في النص.
    static func seerahChapters(_ rows: [SirahSeerahPhase]) -> [SeriesChapter] {
        rows.sorted { ($0.num ?? .max) < ($1.num ?? .max) }.map { p in
            let text = ([p.desc ?? ""] + (p.keyEvents ?? [])).joined(separator: " ")
            return SeriesChapter(id: p.id, title: [p.num.map { "\($0). " }, p.title].compactMap { $0 }.joined(),
                                 period: p.year, paragraphs: [p.desc].compactMap { $0 }.filter { !$0.isBlank },
                                 events: p.keyEvents ?? [], related: SeriesRelated.sections(in: text))
        }
    }

    // MARK: الشمائل — لا يُعرض حديث بلا درجة ومصدر (DATA_CONTRACT §5.2)

    static let shamailTabs = ["khalq": "صفاته الخَلقية", "khuluq": "أخلاقه", "sira": "هديه وسيرته", "mahabbah": "محبته ﷺ"]

    static func shamail(_ abwab: [SirahShamailBab]) -> [ContentItem] {
        abwab.compactMap { bab in
            let ok = bab.hadiths.filter { !$0.text.isBlank && !($0.source ?? "").isBlank && !($0.grade ?? "").isBlank }
            guard !ok.isEmpty else { return nil }
            let body = ok.map { h in
                lines([h.text, "— " + [h.rawi, h.source, h.grade].compactMap { $0 }.filter { !$0.isBlank }.joined(separator: "، ")])
            }
            return ContentItem(sirahID: bab.id, title: bab.title, subtitle: shamailTabs[bab.tab], body: paragraphs(body))
        }
    }

    // MARK: القصص (المعتمد والمراجَع تحريريًا وذو المصادر فقط)

    static func stories(_ rows: [SirahStory]) -> [ContentItem] {
        rows.filter { $0.isApproved && $0.editorialReviewStatus == "reviewed" && !($0.sources ?? []).isEmpty && !($0.fullContent ?? "").isBlank }
            .map { s in
                ContentItem(
                    sirahID: s.slug ?? s.id, title: s.title,
                    subtitle: [s.category, s.era].compactMap { $0 }.filter { !$0.isBlank }.joined(separator: " · "),
                    body: paragraphs([
                        s.fullContent,
                        (s.keyLessons ?? []).isEmpty ? nil : lines(["من العبر"] + (s.keyLessons ?? []).map { "• " + $0 }),
                        lines(["المصادر"] + (s.sources ?? []).map { "• " + $0 }),
                    ]),
                    tags: s.tags ?? []
                )
            }
    }

    // MARK: التاريخ الإسلامي (لا «needs-review»، ولا عنصر بلا مصادر)

    static let verificationLabel = ["confirmed": "ثابت", "likely": "راجح", "disputed": "مختلف فيه"]

    static func history(_ rows: [SirahHistoryItem]) -> [ContentItem] {
        rows.filter { verificationLabel[$0.verification] != nil && !$0.sources.isEmpty && !$0.summary.isBlank }
            .sorted { ($0.timelineOrder ?? .infinity) < ($1.timelineOrder ?? .infinity) }
            .map { h in
                ContentItem(
                    sirahID: h.id, title: h.title,
                    subtitle: [h.hijriDate, h.gregorianDate, h.place].compactMap { $0 }.filter { !$0.isBlank }.joined(separator: " · "),
                    body: paragraphs([
                        h.summary, h.detail,
                        h.causes.map { "الأسباب: \($0)" }, h.outcomes.map { "النتائج: \($0)" }, h.lessons.map { "العبر: \($0)" },
                        (h.relatedPersons ?? []).isEmpty ? nil : "أعلام: " + (h.relatedPersons ?? []).joined(separator: "، "),
                        lines(["المصادر"] + h.sources.map { "• " + $0 }),
                    ]),
                    tags: [verificationLabel[h.verification], h.era].compactMap { $0 }.filter { !$0.isBlank }
                )
            }
    }

    // MARK: المشايخ — من صفوف الدروس المعتمدة فقط

    static func teacherSlug(_ name: String) -> String {
        name.trimmingCharacters(in: .whitespacesAndNewlines).addingPercentEncoding(withAllowedCharacters: .urlPathAllowed.subtracting(CharacterSet(charactersIn: "/"))) ?? name
    }

    private static func approvedWithSpeaker(_ rows: [SirahLessonRow]) -> [(String, SirahLessonRow)] {
        rows.compactMap { r in
            guard r.status == "approved", let n = r.speakerName?.trimmingCharacters(in: .whitespacesAndNewlines), !n.isEmpty else { return nil }
            return (n, r)
        }
    }

    static func teachers(_ rows: [SirahLessonRow]) -> [SectionLink] {
        let groups = Dictionary(grouping: approvedWithSpeaker(rows), by: { $0.0 })
        return groups.keys.sorted { a, b in
            let (ca, cb) = (groups[a]?.count ?? 0, groups[b]?.count ?? 0)
            return ca != cb ? ca > cb : a < b
        }.map { name in
            SectionLink(id: teacherSlug(name), title: name, subtitle: "\(groups[name]?.count ?? 0) درسًا", route: "/teachers/" + teacherSlug(name))
        }
    }

    static func teacher(slug: String, rows: [SirahLessonRow]) -> ContentItem? {
        let mine = approvedWithSpeaker(rows).filter { teacherSlug($0.0) == slug || $0.0 == slug.removingPercentEncoding }
        guard let name = mine.first?.0 else { return nil }
        let body = mine.map { pair -> String in
            let r = pair.1
            return lines([r.title, [r.mosque, r.city].compactMap { $0 }.filter { !$0.isBlank }.joined(separator: "، "),
                   [r.schedule, r.lessonTime].compactMap { $0 }.map(LessonTimeFormat.display).filter { !$0.isBlank }.joined(separator: " · ")])
        }
        return ContentItem(sirahID: slug, title: name, subtitle: "\(mine.count) درسًا", body: paragraphs(body))
    }

    /// مشايخ الدروس فصولًا متتابعة لقارئ السلسلة (الترتيب نفسه كقائمة المشايخ).
    static func teacherChapters(_ rows: [SirahLessonRow]) -> [SeriesChapter] {
        let groups = Dictionary(grouping: approvedWithSpeaker(rows), by: { $0.0 })
        return teachers(rows).compactMap { link in
            guard let mine = groups[link.title] else { return nil }
            let paras = mine.map { pair -> String in
                let r = pair.1
                return lines([r.title, [r.mosque, r.city].compactMap { $0 }.filter { !$0.isBlank }.joined(separator: "، "),
                              [r.schedule, r.lessonTime].compactMap { $0 }.map(LessonTimeFormat.display).filter { !$0.isBlank }.joined(separator: " · ")])
            }.filter { !$0.isBlank }
            return SeriesChapter(id: link.id, title: link.title, period: link.subtitle, paragraphs: paras)
        }
    }

    // MARK: مساعدات نصية

    static func lines(_ parts: [String?]) -> String {
        parts.compactMap { $0?.trimmingCharacters(in: .whitespacesAndNewlines) }.filter { !$0.isEmpty }.joined(separator: "\n")
    }

    /// صفحة مقال واحدة لقالب «مقال» (ROUTE_TEMPLATE_MAP): العناصر متتابعة بعناوينها، ولا مسار تفاصيل لكل عنصر.
    static func article(_ items: [ContentItem], id: String, title: String) -> ContentItem? {
        guard !items.isEmpty else { return nil }
        let parts = items.map { paragraphs([$0.title, $0.subtitle, $0.body]) }
        return ContentItem(sirahID: id, title: title, body: paragraphs(parts.map { Optional($0) }))
    }

    static func paragraphs(_ parts: [String?]) -> String {
        parts.compactMap { $0?.trimmingCharacters(in: .whitespacesAndNewlines) }.filter { !$0.isEmpty }.joined(separator: "\n\n")
    }
}

/// روابط ثابتة للتنقل (ليست محتوى شرعيًا): مطابقة لـOccasionsLessonsHubPage.
enum SirahLinks {
    static let occasionsLessons = [
        SectionLink(id: "occasions", title: "المناسبات الإسلامية", route: "/occasions"),
        SectionLink(id: "calendar", title: "تقويم الدروس", route: "/calendar"),
    ]
}

fileprivate extension ContentItem {
    init(sirahID: String, title: String, subtitle: String? = nil, body: String? = nil, tags: [String] = []) {
        self.id = sirahID
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
