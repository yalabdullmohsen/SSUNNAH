import SwiftUI

/// تفسير آية واحدة محدّدة (من قائمة المصحف): نصها العثماني ثم تفسيرها، والنسبة ظاهرة دائمًا.
struct TafsirAyahView: View {
    let surah: Int
    let ayah: Int
    @Environment(\.contentLoader) private var loader
    @State private var phase: Phase = .loading
    @State private var selected = 0

    private enum Phase { case loading, failed, unavailable, ready([TafsirEntry], TafsirQuranFile, [String: TafsirSurahFile]) }

    var body: some View {
        Group {
            switch phase {
            case .loading: LoadingStateView()
            case .failed: ErrorStateView { Task { await load() } }
            case .unavailable: EmptyStateView(title: QuranSection.pendingTitle)
            case .ready(let books, let quran, let files): content(books, quran, files)
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Sunnah.Colors.bg)
        .quranTitle("تفسير الآية \(surah):\(ayah)")
        .environment(\.layoutDirection, .rightToLeft)
        .task { await load() }
    }

    private func content(_ books: [TafsirEntry], _ quran: TafsirQuranFile, _ files: [String: TafsirSurahFile]) -> some View {
        let book = books[min(selected, books.count - 1)]
        let row = files[book.id].flatMap { f in TafsirAdapters.rows(quran: quran, tafsir: f).first { $0.number == ayah } }
        return ScrollView {
            VStack(alignment: .leading, spacing: Sunnah.Spacing.s3) {
                if books.count > 1 {
                    SunnahSegmented(Array(books.enumerated()).map { ($0.offset, $0.element.name) }, selection: $selected)
                }
                TafsirAttributionView(entry: book)
                if let row {
                    VStack(alignment: .leading, spacing: Sunnah.Spacing.s2) {
                        Text("\(row.ayah) ﴿\(row.number.arabicDigits)﴾").font(Sunnah.Typography.quran).foregroundStyle(Sunnah.Colors.textPrimary)
                        if let t = row.tafsir { Text(t).font(Sunnah.Typography.body).foregroundStyle(Sunnah.Colors.textSecondary) }
                        else { Text(QuranSection.pendingTitle).font(Sunnah.Typography.body).foregroundStyle(Sunnah.Colors.textSecondary) }
                    }
                    .padding(.vertical, Sunnah.Spacing.s2)
                } else {
                    Text(QuranSection.pendingTitle).font(Sunnah.Typography.body).foregroundStyle(Sunnah.Colors.textSecondary)
                }
            }
            .padding(Sunnah.Spacing.s4)
            .frame(maxWidth: .infinity, alignment: .leading)
        }
        .background(Sunnah.Colors.bg)
    }

    private func load() async {
        phase = .loading
        do {
            let reg = try await loader.load(TafsirRegistry.self, from: TafsirData.registry)
            let books = TafsirAdapters.available(reg)
            guard !books.isEmpty else { phase = .unavailable; return }
            let quran = try await loader.load(TafsirQuranFile.self, from: TafsirData.quran(surah: surah))
            var files: [String: TafsirSurahFile] = [:]
            for b in books { files[b.id] = try? await loader.load(TafsirSurahFile.self, from: TafsirData.surah(tafsir: b.id, surah: surah)) }
            phase = .ready(books, quran, files)
        } catch ContentError.missingBundledFile { phase = .unavailable }
        catch { phase = .failed }
    }
}
