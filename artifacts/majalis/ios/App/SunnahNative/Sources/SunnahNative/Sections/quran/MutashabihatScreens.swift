import SwiftUI

struct MutashabihatRef: Decodable, Hashable, Sendable { let surah: Int; let surahName: String; let ayah: Int }
struct MutashabihatPair: Decodable, Identifiable, Hashable, Sendable {
    let id: String
    let title: String
    let description: String
    let category: String
    let hint: String?
    let refs: [MutashabihatRef]
}

/// نص الآية من ملفات المصحف المحزومة (Tanzil) بلا تعديل؛ يُحمَّل ملف السورة عند الحاجة فقط.
enum QuranAyahText {
    private struct SurahFile: Decodable { struct A: Decodable { let numberInSurah: Int; let text: String }; let ayahs: [A] }
    nonisolated(unsafe) private static var cache: [Int: [Int: String]] = [:]
    private static let lock = NSLock()

    static func text(surah: Int, ayah: Int, directory: URL? = Bundle.main.url(forResource: "quran", withExtension: nil, subdirectory: "Data")) -> String? {
        lock.lock(); defer { lock.unlock() }
        if let m = cache[surah] { return m[ayah] }
        guard let dir = directory,
              let d = try? Data(contentsOf: dir.appendingPathComponent(String(format: "surah-%03d.json", surah))),
              let f = try? JSONDecoder().decode(SurahFile.self, from: d) else { return nil }
        let m = Dictionary(f.ayahs.map { ($0.numberInSurah, $0.text.replacingOccurrences(of: "\u{FEFF}", with: "")) }, uniquingKeysWith: { a, _ in a })
        cache[surah] = m
        return m[ayah]
    }
}

/// /mutashabihat — الآيات المتشابهة لفظًا مجمّعة بالموضوع؛ المصدر: درة التنزيل للإسكافي، والبرهان للسخاوي، وملاك التأويل للغرناطي.
struct MutashabihatListView: View {
    let pairs: [MutashabihatPair]
    private var categories: [String] { var seen = Set<String>(); return pairs.map(\.category).filter { seen.insert($0).inserted } }

    var body: some View {
        List {
            ForEach(categories, id: \.self) { c in
                Section(c) {
                    ForEach(pairs.filter { $0.category == c }) { p in
                        SunnahNavigationLink { MutashabihatDetailView(pair: p) } label: {
                            SunnahListRow(title: p.title, subtitle: p.refs.map { "\($0.surahName) \($0.ayah)" }.joined(separator: " · "))
                        }
                        .listRowBackground(Sunnah.Colors.surface)
                    }
                }
            }
            Section("المصدر") {
                Text("درة التنزيل وغرة التأويل للخطيب الإسكافي، والبرهان في متشابه القرآن للسخاوي، وملاك التأويل لأبي جعفر الغرناطي. نص الآيات من مصحف التطبيق.")
                    .font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.textSecondary)
            }
        }
        .listStyle(.plain).scrollContentBackground(.hidden).background(Sunnah.Colors.bg)
        .environment(\.layoutDirection, .rightToLeft)
    }
}

struct MutashabihatDetailView: View {
    let pair: MutashabihatPair

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: Sunnah.Spacing.s4) {
                Text(pair.title).font(Sunnah.Typography.pageTitle).foregroundStyle(Sunnah.Colors.textPrimary)
                Text(pair.description).font(Sunnah.Typography.body).foregroundStyle(Sunnah.Colors.textPrimary)
                if let h = pair.hint {
                    Text(h).font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.textSecondary)
                }
                ForEach(pair.refs, id: \.self) { r in
                    VStack(alignment: .leading, spacing: Sunnah.Spacing.s2) {
                        Text("\(r.surahName): \(r.ayah)").font(Sunnah.Typography.tag).foregroundStyle(Sunnah.Colors.textSecondary)
                        Text(QuranAyahText.text(surah: r.surah, ayah: r.ayah) ?? "").font(Sunnah.Typography.quran).foregroundStyle(Sunnah.Colors.textPrimary)
                    }
                    .padding(Sunnah.Spacing.s3).frame(maxWidth: .infinity, alignment: .leading)
                    .background(Sunnah.Colors.surface, in: RoundedRectangle(cornerRadius: 12))
                }
            }
            .padding(Sunnah.Spacing.s4).frame(maxWidth: .infinity, alignment: .leading)
        }
        .background(Sunnah.Colors.bg)
        .environment(\.layoutDirection, .rightToLeft)
        .navigationTitle(pair.title)
    }
}
