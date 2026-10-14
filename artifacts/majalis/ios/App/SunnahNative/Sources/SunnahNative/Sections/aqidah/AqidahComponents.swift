import SwiftUI

/// يحمّل ملف القسم ثم يختار منه العنصر المطلوب (مسارات :slug/:id)؛ غير الموجود حالة فراغ صريحة لا خطأ.
struct AqidahItemHost<Value: Decodable & Sendable, Item, Content: View>: View {
    @Environment(\.contentLoader) private var loader
    @State private var phase: Phase = .loading
    let file: String
    var missingTitle = "المحتوى قيد التوثيق"
    var missingMessage: String? = nil
    let pick: (Value) -> Item?
    @ViewBuilder let content: (Item) -> Content

    private enum Phase { case loading, failed, missing, ready(Item) }

    var body: some View {
        Group {
            switch phase {
            case .loading: LoadingStateView()
            case .failed: ErrorStateView { Task { await load() } }
            case .missing: EmptyStateView(title: missingTitle, message: missingMessage)
            case .ready(let item): content(item)
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Sunnah.Colors.bg)
        .task(id: file) { await load() }
    }

    private func load() async {
        phase = .loading
        do {
            let value = try await loader.load(Value.self, from: AqidahContent.source(file))
            if let item = pick(value) { phase = .ready(item) } else { phase = .missing }
        } catch { phase = .failed }
    }
}

/// صفحة تفاصيل قابلة للتمرير بهامش الصفحة الموحّد.
struct AqidahPage<Content: View>: View {
    let title: String
    /// عنوان الترويسة الخضراء v5 (شاشات التفاصيل)؛ nil = بلا ترويسة.
    var hero: String? = nil
    @ViewBuilder let content: () -> Content

    var body: some View {
        ScrollView {
            VStack(spacing: 0) {
                if let hero { DetailHero(title: hero) }
                VStack(alignment: .leading, spacing: Sunnah.Spacing.s4) { content() }
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(Sunnah.Spacing.pageX)
            }
        }
        .background(Sunnah.Colors.bg)
        .navigationTitle(title)
    }
}

/// كتلة نصية: عنوان قسم ثم نص، داخل بطاقة.
struct AqidahTextBlock: View {
    let title: String?
    let text: String

    var body: some View {
        SunnahCard {
            VStack(alignment: .leading, spacing: Sunnah.Spacing.s2) {
                if let title { Text(title).font(Sunnah.Typography.cardTitle).foregroundStyle(Sunnah.Colors.primary) }
                AqidahParagraphs(text: text)
            }
        }
    }
}

/// يقسم النص الطويل إلى فقرات على الأسطر الفارغة.
struct AqidahParagraphs: View {
    let text: String

    var body: some View {
        VStack(alignment: .leading, spacing: Sunnah.Spacing.s3) {
            ForEach(Array(text.components(separatedBy: "\n\n").enumerated()), id: \.offset) { _, p in
                Text(p).font(Sunnah.Typography.body).lineSpacing(Sunnah.Spacing.s1)
                    .foregroundStyle(Sunnah.Colors.textPrimary)
                    .frame(maxWidth: .infinity, alignment: .leading)
            }
        }
    }
}

/// شاهد (آية/حديث) مع إحالته ودرجته إن وُجدت.
struct AqidahQuote: View {
    let text: String
    let reference: String

    var body: some View {
        VStack(alignment: .leading, spacing: Sunnah.Spacing.s1) {
            Text(text).font(Sunnah.Typography.body).foregroundStyle(Sunnah.Colors.textPrimary)
            Text(reference).font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.textSecondary)
        }
        .padding(Sunnah.Spacing.s3)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Sunnah.Colors.primarySoft, in: RoundedRectangle(cornerRadius: Sunnah.Radius.small))
        .accessibilityElement(children: .combine)
    }
}

struct AqidahEvidenceList: View {
    let evidences: [DawahEvidence]

    var body: some View {
        if !evidences.isEmpty {
            VStack(alignment: .leading, spacing: Sunnah.Spacing.s2) {
                Text("الأدلة").font(Sunnah.Typography.sectionTitle).foregroundStyle(Sunnah.Colors.textPrimary)
                ForEach(Array(evidences.enumerated()), id: \.offset) { _, e in
                    AqidahQuote(text: e.text, reference: [e.ref, e.grading].compactMap { $0 }.joined(separator: " — "))
                }
            }
        }
    }
}

struct AqidahSourcesList: View {
    let sources: [DawahSource]

    var body: some View {
        if !sources.isEmpty {
            VStack(alignment: .leading, spacing: Sunnah.Spacing.s2) {
                Text("المصادر").font(Sunnah.Typography.sectionTitle).foregroundStyle(Sunnah.Colors.textPrimary)
                ForEach(Array(sources.enumerated()), id: \.offset) { _, s in
                    sourceRow(s)
                }
            }
        }
    }

    @ViewBuilder private func sourceRow(_ s: DawahSource) -> some View {
        let label = [s.title, s.author].compactMap { $0 }.joined(separator: " — ")
        if let raw = s.url, let url = URL(string: raw), ["http", "https"].contains(url.scheme ?? "") {
            Link(label, destination: url).font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.primary)
        } else {
            Text(label).font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.textSecondary)
        }
    }
}

/// قائمة صفوف قابلة للنقر تفتح مسارًا.
struct AqidahLinkList<Item: Identifiable>: View {
    @Environment(\.openRoute) private var openRoute
    let items: [Item]
    let title: (Item) -> String
    let subtitle: (Item) -> String?
    let path: (Item) -> String

    var body: some View {
        LazyVStack(spacing: Sunnah.Spacing.s3) {
            ForEach(items) { item in
                Button { openRoute(path(item)) } label: {
                    SunnahCard { SunnahListRow(title: title(item), subtitle: subtitle(item)) }
                }
                .buttonStyle(.plain)
            }
        }
    }
}
