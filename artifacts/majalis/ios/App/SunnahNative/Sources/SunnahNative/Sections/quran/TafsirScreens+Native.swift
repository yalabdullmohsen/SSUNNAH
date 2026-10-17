import SwiftUI

/// شاشة التفسير: اختيار الكتاب ثم السورة. النسبة (الكتاب والمؤلف والمصدر) ظاهرة دائمًا من بيانات السجل.
struct TafsirHomeView: View {
    @Environment(\.contentLoader) private var loader
    @State private var phase: Phase = .loading
    @State private var selected = 0

    private enum Phase { case loading, failed, unavailable, ready(MushafIndex, [TafsirEntry]) }

    var body: some View {
        Group {
            switch phase {
            case .loading: LoadingStateView()
            case .failed: ErrorStateView { Task { await load() } }
            case .unavailable: EmptyStateView(title: QuranSection.pendingTitle)
            case .ready(let idx, let books): content(idx, books)
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Sunnah.Colors.bg)
        .task { await load() }
    }

    private func content(_ idx: MushafIndex, _ books: [TafsirEntry]) -> some View {
        let book = books[min(selected, books.count - 1)]
        return List {
            Section {
                Picker("التفسير", selection: $selected) {
                    ForEach(Array(books.enumerated()), id: \.offset) { Text($1.name).tag($0) }
                }.pickerStyle(.segmented)
                TafsirAttributionView(entry: book)
            }
            .sunnahRowChrome()
            Section {
                ForEach(idx.surahs, id: \.id) { s in
                    SunnahNavigationLink {
                        TafsirSurahView(book: book, surahId: s.id, surahName: s.name)
                    } label: {
                        SunnahListRow(title: "\(s.id). \(s.name)", subtitle: "\(s.ayahs) آية")
                    }
                }
            }
            .sunnahRowChrome()
        }
        .listStyle(.plain).scrollContentBackground(.hidden).background(Sunnah.Colors.bg)
    }

    private func load() async {
        phase = .loading
        guard let repo = MushafRepository(bundle: .main) else { phase = .unavailable; return }
        do {
            let idx = try repo.index()
            let reg = try await loader.load(TafsirRegistry.self, from: TafsirData.registry)
            let books = TafsirAdapters.available(reg)
            phase = books.isEmpty ? .unavailable : .ready(idx, books)
        } catch ContentError.missingBundledFile { phase = .unavailable }
        catch { phase = .failed }
    }
}

struct TafsirAttributionView: View {
    let entry: TafsirEntry
    var body: some View {
        VStack(alignment: .leading, spacing: Sunnah.Spacing.s2) {
            Text(entry.name).font(Sunnah.Typography.cardTitle).foregroundStyle(Sunnah.Colors.textPrimary)
            Text("المؤلف: \(entry.author)").font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.textSecondary)
            if let s = entry.source {
                Text("المصدر: \(s.name)").font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.textSecondary)
                if let p = s.permission { Text(p).font(Sunnah.Typography.tag).foregroundStyle(Sunnah.Colors.textSecondary) }
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .accessibilityElement(children: .combine)
    }
}

/// تفسير سورة: الآية ثم تفسيرها، والنسبة في الأعلى.
struct TafsirSurahView: View {
    let book: TafsirEntry
    let surahId: Int
    let surahName: String
    @Environment(\.contentLoader) private var loader
    @State private var phase: Phase = .loading

    private enum Phase { case loading, failed, unavailable, ready([TafsirAyahRow]) }

    var body: some View {
        Group {
            switch phase {
            case .loading: LoadingStateView()
            case .failed: ErrorStateView { Task { await load() } }
            case .unavailable: EmptyStateView(title: QuranSection.pendingTitle)
            case .ready(let rows):
                List {
                    TafsirAttributionView(entry: book).listRowBackground(Sunnah.Colors.surface2)
                    ForEach(rows) { r in
                        VStack(alignment: .leading, spacing: Sunnah.Spacing.s2) {
                            Text("\(r.ayah) ﴿\(r.number)﴾").font(Sunnah.Typography.quran)
                                .foregroundStyle(Sunnah.Colors.textPrimary)
                            if let t = r.tafsir {
                                SunnahSectionedMarkdown(t, key: "tafsir-\(book.id)-\(surahId)-\(r.number)", style: .body).foregroundStyle(Sunnah.Colors.textSecondary)
                            }
                        }
                        .padding(.vertical, Sunnah.Spacing.s2)
                        .sunnahRowChrome()
                    }
                    SunnahContentFooter(title: surahName, id: "tafsir-\(book.id)-\(surahId)", section: "التفسير", source: book.source.map { "المصدر: \($0.name)" } ?? book.name, inset: false)
                        .listRowSeparator(.hidden).listRowBackground(Color.clear)
                }
                .listStyle(.plain).scrollContentBackground(.hidden)
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Sunnah.Colors.bg)
        .quranTitle(surahName)
        .environment(\.layoutDirection, .rightToLeft)
        .task(id: "\(book.id)-\(surahId)") { await load() }
    }

    private func load() async {
        phase = .loading
        do {
            async let q = loader.load(TafsirQuranFile.self, from: TafsirData.quran(surah: surahId))
            async let t = loader.load(TafsirSurahFile.self, from: TafsirData.surah(tafsir: book.id, surah: surahId))
            phase = .ready(TafsirAdapters.rows(quran: try await q, tafsir: try await t))
        } catch ContentError.missingBundledFile { phase = .unavailable }
        catch { phase = .failed }
    }
}
