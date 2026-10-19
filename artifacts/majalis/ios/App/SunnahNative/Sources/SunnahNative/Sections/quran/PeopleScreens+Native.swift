import SwiftUI

/// تحميل أعلام القرآن المحزومة؛ غياب الملف = «قيد التوثيق».
struct QuranPeopleLoader<V: View>: View {
    @Environment(\.contentLoader) private var loader
    @State private var phase: Phase = .loading
    @ViewBuilder let content: ([QuranPerson]) -> V

    private enum Phase { case loading, failed, unavailable, ready([QuranPerson]) }

    var body: some View {
        Group {
            switch phase {
            case .loading: LoadingStateView()
            case .failed: ErrorStateView { Task { await load() } }
            case .unavailable: EmptyStateView(title: QuranSection.pendingTitle)
            case .ready(let p): content(p)
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Sunnah.Colors.bg)
        .task { await load() }
    }

    private func load() async {
        phase = .loading
        do {
            let p = try await loader.load([QuranPerson].self, from: PeopleData.file)
            phase = p.isEmpty ? .unavailable : .ready(p)
        } catch ContentError.missingBundledFile { phase = .unavailable }
        catch { phase = .failed }
    }
}

struct QuranPeopleListView: View {
    let people: [QuranPerson]
    let surahNames: [Int: String]
    var body: some View {
        ScrollView {
            LazyVStack(spacing: 0) {
                ForEach(PeopleAdapters.grouped(people), id: \.title) { g in
                    SunnahSectionLabel(g.title)
                    SunnahNavTileGrid(g.people, idPrefix: "person", padded: false,
                                      tile: { SunnahTileItem(id: "\($0.id)", title: $0.nameAr, subtitle: g.title, symbol: "person") }) { QuranPersonView(person: $0, surahNames: surahNames) }
                }
            }
            .padding(.horizontal, Sunnah.Spacing.s4)
        }
        .background(Sunnah.Colors.bg)
    }
}

struct QuranPersonView: View {
    let person: QuranPerson
    var surahNames: [Int: String] = [:]

    var body: some View {
        ScrollView {
            VStack(spacing: 0) {
            DetailHero(title: person.nameAr, subtitle: person.aliases.isEmpty ? nil : person.aliases.joined(separator: "، "))
            VStack(alignment: .leading, spacing: Sunnah.Spacing.s4) {
                block("التعريف", person.definition)
                block("سبب الذكر", person.whyMentioned)
                if !person.lessons.isEmpty {
                    Text("الدروس").font(Sunnah.Typography.sectionTitle).foregroundStyle(Sunnah.Colors.textPrimary)
                    ForEach(person.lessons, id: \.self) { Text("• \($0)".arabicDigits).font(Sunnah.Typography.body).foregroundStyle(Sunnah.Colors.textPrimary) }
                }
                let occ = PeopleAdapters.occurrenceText(person.occurrences) { surahNames[$0] ?? "سورة \($0)" }.map(\.arabicDigits)
                if !occ.isEmpty {
                    Text("مواضع الذكر").font(Sunnah.Typography.sectionTitle).foregroundStyle(Sunnah.Colors.textPrimary)
                    ForEach(occ, id: \.self) { Text($0).font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.textSecondary) }
                }
            }
            .padding(Sunnah.Spacing.s4).frame(maxWidth: .infinity, alignment: .leading)
            }
        }
        .background(Sunnah.Colors.bg)
        .environment(\.layoutDirection, .rightToLeft)
    }

    @ViewBuilder private func block(_ title: String, _ text: String) -> some View {
        Text(title).font(Sunnah.Typography.sectionTitle).foregroundStyle(Sunnah.Colors.textPrimary)
        Text(text).font(Sunnah.Typography.body).foregroundStyle(Sunnah.Colors.textPrimary)
    }
}
