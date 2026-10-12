import SwiftUI

/// MANIFEST.json الذي يكتبه scripts/native/export-ios-data.mjs داخل Data/ (العدّادات والملفات).
struct AccountDataManifest: Decodable, Sendable {
    struct Counts: Decodable, Sendable {
        var quranAyahs: Int?
        var tafsir: [String: Int]?
        var hadith: [String: Int]?
        var adhkar: Int?
        var quiz: Int?
    }
    struct File: Decodable, Sendable { let path: String; let bytes: Int }

    let version: Int
    let counts: Counts
    let files: [File]

    static let source = ContentSource.bundled(name: "MANIFEST", subdirectory: "Data")

    /// حزمة محلية واحدة كما تُعرض في المركز.
    struct Pack: Identifiable, Hashable { let id: String; let label: String; let records: Int; let bytes: Int }

    var packs: [Pack] {
        func bytes(_ prefix: String) -> Int { files.filter { $0.path.hasPrefix(prefix) }.reduce(0) { $0 + $1.bytes } }
        var out: [Pack] = []
        if let n = counts.quranAyahs { out.append(Pack(id: "quran", label: "القرآن الكريم (آيات)", records: n, bytes: bytes("quran/"))) }
        let tafsir = counts.tafsir?.values.reduce(0, +) ?? 0
        if tafsir > 0 { out.append(Pack(id: "tafsir", label: "التفسير", records: tafsir, bytes: bytes("tafsir/"))) }
        let hadith = counts.hadith?.values.reduce(0, +) ?? 0
        if hadith > 0 { out.append(Pack(id: "hadith", label: "الأحاديث", records: hadith, bytes: bytes("hadith/"))) }
        out.append(Pack(id: "adhkar", label: "الأذكار", records: counts.adhkar ?? 0, bytes: bytes("adhkar/")))
        if let q = counts.quiz { out.append(Pack(id: "quiz", label: "الأسئلة", records: q, bytes: bytes("quiz/"))) }
        return out
    }

    var totalBytes: Int { files.reduce(0) { $0 + $1.bytes } }
}

/// /offline — جرد ما يعمل دون شبكة: البيانات المحزومة في التطبيق والتلاوات المحمّلة. لا تنزيل من هنا.
struct AccountOfflineCenterScreen: View {
    @Environment(\.contentLoader) private var loader
    @Environment(\.platform) private var platform
    @State private var manifest: AccountDataManifest?
    @State private var loaded = false

    private static let shortcuts = [
        SectionLink(id: "mushaf", title: "المصحف", route: "/mushaf"),
        SectionLink(id: "offline-player", title: "مشغّل القرآن دون اتصال", route: "/quran/offline-player"),
        SectionLink(id: "vault", title: "المخزن", route: "/vault"),
        SectionLink(id: "settings", title: "الإعدادات", route: "/settings"),
        SectionLink(id: "progress", title: "مركز التقدّم", route: "/progress")
    ]

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: Sunnah.Spacing.s4) {
                AccountHeader(eyebrow: nil, title: "مركز دون اتصال",
                              subtitle: "جرد للحزم المحلية. لا تنزيل تلقائي من هذه الصفحة — استخدم إعدادات المصحف أو المخزن للتنزيل.")

                Text(hint).font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.textSecondary)

                AccountSectionCard(title: "المخازن المحلية") {
                    if !loaded {
                        LoadingStateView()
                    } else if let packs = manifest?.packs, !packs.isEmpty {
                        ForEach(packs) { pack in
                            HStack {
                                Text(pack.label).font(Sunnah.Typography.cardTitle).foregroundStyle(Sunnah.Colors.textPrimary)
                                Spacer(minLength: Sunnah.Spacing.s2)
                                Text(pack.records > 0 ? "\(pack.records) سجل" : "فارغ")
                                    .font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.textSecondary).monospacedDigit()
                            }
                            .frame(minHeight: Sunnah.Spacing.touch)
                            .accessibilityElement(children: .combine)
                        }
                    } else {
                        EmptyStateView(title: "لا حزم محلية")
                        Text("لم تُعثر على مخازن محلية بعد. يمكنك تنزيل المحتوى من المصحف أو المخزن.")
                            .font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.textSecondary)
                    }
                    HStack {
                        Text("التلاوات المحمّلة").font(Sunnah.Typography.cardTitle).foregroundStyle(Sunnah.Colors.textPrimary)
                        Spacer(minLength: Sunnah.Spacing.s2)
                        Text(audioBytes > 0 ? Self.size(audioBytes) : "فارغ")
                            .font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.textSecondary)
                    }
                    .frame(minHeight: Sunnah.Spacing.touch)
                }

                AccountSectionCard(title: "اختصارات") {
                    ForEach(Self.shortcuts.filter { ReleaseGate.isVisible($0.route) }) { AccountLinkRow(title: $0.title, path: $0.route) }
                }
            }
            .padding(Sunnah.Spacing.pageX)
        }
        .background(Sunnah.Colors.bg)
        .navigationTitle("مركز دون اتصال")
        .task { await load() }
    }

    private var audioBytes: Int { platform.offlineAudio.totalBytes() }

    /// تقدير المساحة (مقابل estimateOfflineFootprintHint).
    private var hint: String {
        let total = (manifest?.totalBytes ?? 0) + audioBytes
        return total > 0 ? "المساحة المستخدمة محليًا: نحو \(Self.size(total))." : "…"
    }

    static func size(_ bytes: Int) -> String {
        let f = ByteCountFormatter()
        f.allowedUnits = [.useKB, .useMB, .useGB]
        f.countStyle = .file
        return f.string(fromByteCount: Int64(bytes))
    }

    @MainActor private func load() async {
        manifest = try? await loader.load(AccountDataManifest.self, from: AccountDataManifest.source)
        loaded = true
    }
}
