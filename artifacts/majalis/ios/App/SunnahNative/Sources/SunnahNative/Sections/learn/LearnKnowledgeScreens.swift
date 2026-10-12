import SwiftUI

// MARK: - الرسم المعرفي

/// /knowledge-graph — العقد مجمّعة حسب النوع، وكل عقدة تعرض علاقاتها (من كتبه، شرحه...) وتنتقل إليها.
struct LearnKnowledgeGraphScreen: View {
    var body: some View {
        LearnLoadHost(LearnSources.graph) { (graph: LearnKnowledgeGraph) in
            if graph.nodes.isEmpty { EmptyStateView() } else {
                List {
                    ForEach(graph.groups) { group in
                        Section(LearnKnowledgeGraph.kindLabel(group.kind)) {
                            ForEach(group.nodes) { node in
                                SunnahNavigationLink { LearnGraphNodeView(graph: graph, node: node) } label: {
                                    SunnahListRow(title: node.titleAr)
                                }
                            }
                        }
                        .listRowBackground(Sunnah.Colors.surface)
                    }
                }
                .listStyle(.plain).scrollContentBackground(.hidden).background(Sunnah.Colors.bg)
            }
        }
        .navigationTitle("الرسم المعرفي")
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
        .navigationTitle(node.titleAr)
    }
}

// MARK: - أقسام المعرفة

/// /knowledge/:section — عناصر القسم المعتمدة، ثم العنصر بأدلته ومصادره.
struct LearnKnowledgeSectionScreen: View {
    let section: String

    var body: some View {
        let section = self.section
        LearnLoadHost(load: { try await LearnSources.loadKnowledge(section: section, with: $0) }) { (items: [LearnKnowledgeItem]) in
            LearnList(items: items, emptyTitle: "لا محتوى معتمد في هذا القسم بعد") { item in
                SunnahNavigationLink { LearnKnowledgeItemView(item: item) } label: {
                    SunnahListRow(title: item.title, subtitle: item.summary)
                }
            }
        }
        .navigationTitle(LearnKnowledgeSections.titles[section] ?? "المعرفة")
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
            if !item.body.isEmpty { Text(item.body).font(Sunnah.Typography.body).foregroundStyle(Sunnah.Colors.textPrimary) }
            if !item.evidences.isEmpty {
                Text("الأدلة").font(Sunnah.Typography.sectionTitle).foregroundStyle(Sunnah.Colors.textPrimary).accessibilityAddTraits(.isHeader)
                ForEach(Array(item.evidences.enumerated()), id: \.offset) { _, e in
                    SunnahCard {
                        VStack(alignment: .leading, spacing: Sunnah.Spacing.s2) {
                            if let t = e.text { Text(t).font(Sunnah.Typography.body).foregroundStyle(Sunnah.Colors.textPrimary) }
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
        LearnLoadHost(source) { (sections: [LearnDarsSection]) in
            LearnList(items: sections) { section in
                SunnahNavigationLink {
                    LearnList(items: section.lessons) { lesson in
                        SunnahNavigationLink {
                            LearnDetailPage(title: lesson.title) {
                                if let s = lesson.summary { Text(s).font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.textSecondary) }
                                if let b = lesson.body { Text(b).font(Sunnah.Typography.body).foregroundStyle(Sunnah.Colors.textPrimary) }
                            }
                        } label: {
                            SunnahListRow(title: lesson.title, subtitle: lesson.summary)
                        }
                    }
                    .navigationTitle(section.title)
                } label: {
                    SunnahListRow(title: section.title, subtitle: learnLine(section.num, "\(section.lessons.count) درسًا"))
                }
            }
        }
        .navigationTitle(title)
    }
}
