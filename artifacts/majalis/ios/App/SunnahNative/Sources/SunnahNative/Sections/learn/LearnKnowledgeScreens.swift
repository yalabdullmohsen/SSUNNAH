import SwiftUI

// MARK: - الرسم المعرفي

/// /knowledge-graph — العقد مجمّعة حسب النوع، وكل عقدة تعرض علاقاتها (من كتبه، شرحه...) وتنتقل إليها.
struct LearnKnowledgeGraphScreen: View {
    var body: some View {
        LearnLoadHost(LearnSources.graph) { (graph: LearnKnowledgeGraph) in
            if graph.nodes.isEmpty { EmptyStateView() } else {
                SunnahRowStack {
                    ForEach(graph.groups) { group in
                        SunnahRowGroupHeader(LearnKnowledgeGraph.kindLabel(group.kind))
                        ForEach(group.nodes) { node in
                            SunnahNavigationLink { LearnGraphNodeView(graph: graph, node: node) } label: {
                                SunnahListRow(title: node.titleAr)
                            }
                            .sunnahStackRow()
                        }
                    }
                }
            }
        }
        .sunnahNavTitle("الرسم المعرفي")
    }
}

struct LearnGraphNodeView: View {
    let graph: LearnKnowledgeGraph; let node: LearnKnowledgeGraph.Node
    var body: some View {
        let relations = graph.relations(of: node)
        LearnList(items: relations, emptyTitle: "لا علاقات مسجّلة") { r in
            SunnahNavigationLink { LearnGraphNodeView(graph: graph, node: r.node) } label: {
                SunnahListRow(title: r.node.titleAr, subtitle: r.label)
            }
        }
        .sunnahNavTitle(node.titleAr)
    }
}

// MARK: - أقسام المعرفة

/// /knowledge/:section — عناصر القسم المعتمدة، ثم العنصر بأدلته ومصادره.
struct LearnKnowledgeSectionScreen: View {
    let section: String

    /// مطلع المتن نصًّا صرفًا (بلا رموز Markdown) كسطر وصف حين لا يوجد ملخص؛ من المتن نفسه بلا إضافة.
    static func lead(_ body: String) -> String? {
        let para = body.split(whereSeparator: \.isNewline).map { $0.trimmingCharacters(in: .whitespaces) }.first { !$0.isEmpty && !$0.hasPrefix("#") } ?? ""
        let t = SunnahMarkdown.renderedPlainText(para).trimmingCharacters(in: .whitespacesAndNewlines)
        if t.isEmpty { return nil }
        return t.count > 110 ? String(t.prefix(110)) + "…" : t
    }

    var body: some View {
        let section = self.section
        LearnLoadHost(load: { try await LearnSources.loadKnowledge(section: section, with: $0) }) { (items: [LearnKnowledgeItem]) in
            LearnTileGrid(items: items, emptyTitle: "لا محتوى معتمد في هذا القسم بعد", idPrefix: "knowledge",
                          tile: { SunnahTileItem(id: $0.id, title: $0.title, subtitle: $0.summary ?? Self.lead($0.body), symbol: "book.closed") },
                          destination: { LearnKnowledgeItemView(item: $0) })
        }
        .sunnahNavTitle(LearnKnowledgeSections.titles[section] ?? "المعرفة")
    }
}

struct LearnKnowledgeItemView: View {
    let item: LearnKnowledgeItem
    var body: some View {
        LearnDetailPage(title: item.title) {
            if !item.tags.isEmpty {
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: Sunnah.Spacing.s2) { ForEach(item.tags, id: \.self) { SunnahChip($0) } }
                }
            }
            if !item.body.isEmpty { SunnahCard { SunnahSectionedMarkdown(item.body, key: "knowledge-\(item.id)", style: .body) } }
            if !item.evidences.isEmpty {
                Text("الأدلة").font(Sunnah.Typography.sectionTitle).foregroundStyle(Sunnah.Colors.textPrimary).accessibilityAddTraits(.isHeader)
                ForEach(Array(item.evidences.enumerated()), id: \.offset) { _, e in
                    SunnahCard {
                        VStack(alignment: .leading, spacing: Sunnah.Spacing.s2) {
                            if let t = e.text { SunnahArabicText(t, style: .body) }
                            if let line = learnLine(e.ref, e.grade, e.gradedBy, separator: " · ") {
                                Text(line).font(Sunnah.Typography.tag).foregroundStyle(Sunnah.Colors.textSecondary)
                            }
                        }
                    }
                }
            }
            if !item.sources.isEmpty {
                Text("المصادر").font(Sunnah.Typography.sectionTitle).foregroundStyle(Sunnah.Colors.textPrimary).accessibilityAddTraits(.isHeader)
                ForEach(Array(item.sources.enumerated()), id: \.offset) { _, s in
                    if let line = learnLine(s.book, s.author, s.locator, separator: " — ") {
                        Text(line).font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.textSecondary)
                    }
                }
            }
        }
    }
}

// MARK: - الدروس الإيمانية والمتنوعة

/// /durus-imaniyya و/durus-mutanawwia — فهرس أبواب ثم دروس الباب (عنوان + ملخص + متن موجز) كما في الويب.
struct LearnDurusScreen: View {
    let source: ContentSource; let title: String

    var body: some View {
        LearnLoadHost(source) { (list: LearnDarsList) in
            LearnTileGrid(items: list.sections, idPrefix: "durus",
                          tile: { SunnahTileItem(id: $0.id, title: $0.title, subtitle: learnLine($0.num, "\($0.lessons.count) درسًا"), symbol: "book") },
                          destination: { section in
                LearnTileGrid(items: section.lessons, idPrefix: "durus-lesson",
                              tile: { SunnahTileItem(id: $0.id, title: $0.title, subtitle: $0.summary, symbol: "doc.text") },
                              destination: { lesson in
                    LearnDetailPage(title: lesson.title) {
                        if let s = lesson.summary { Text(s).font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.textSecondary) }
                        if let b = lesson.body { LearnBodyText(b) }
                    }
                })
                .sunnahNavTitle(section.title)
            })
        }
        .sunnahNavTitle(title)
    }
}
