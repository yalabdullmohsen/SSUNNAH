import SwiftUI

/// التلاوات دون اتصال: لكل قارئ عدد السور المحمّلة، وتنزيل/إيقاف/حذف. التشغيل يقرأ المحلي أولًا تلقائيًا.
/// المنزّل مشترك على مستوى التطبيق فيستمر التنزيل عند مغادرة الشاشة.
public struct OfflineAudioScreen: ScreenTemplate {
    public static let id = "offline-audio"
    public static let title = "التلاوات دون اتصال"
    public static let source = SurahReciter.source

    let reciters: [SurahReciter]
    @Environment(\.platform) private var platform

    public init(content: [SurahReciter]) { reciters = content }

    public var body: some View {
        let downloader = RecitationDownloader.shared
        OfflineAudioList(reciters: reciters, downloader: downloader)
            .background(Sunnah.Colors.bg)
            .onAppear { downloader.attach(platform.offlineAudio) }
    }

    static func megabytes(_ bytes: Int) -> String {
        String(format: "%.1f م.ب", Double(bytes) / 1_048_576)
    }

    static func message(_ error: RecitationDownloadError) -> String {
        switch error {
        case .reciterQuota: return "الحد الأقصى \(RecitationDownloader.maxCompleteReciters) قرّاء كاملين دون اتصال. احذف تنزيلًا أولًا."
        case .storageQuota: return "امتلأت المساحة المخصّصة للتلاوات. احذف تنزيلًا أولًا."
        case .http: return "تعذّر التنزيل. تحقّق من الاتصال ثم أعد المحاولة؛ يُستأنف من حيث توقف."
        }
    }
}

private struct OfflineAudioList: View {
    let reciters: [SurahReciter]
    @ObservedObject var downloader: RecitationDownloader

    var body: some View {
        if reciters.isEmpty {
            EmptyStateView(title: "لا قرّاء متاحون للتنزيل")
        } else {
            List {
                Section {
                    ForEach(reciters) { reciter in
                        OfflineReciterRow(reciter: reciter, reciters: reciters, downloader: downloader)
                            .listRowBackground(Sunnah.Colors.surface)
                    }
                } header: {
                    Text("المساحة المستعملة: \(OfflineAudioScreen.megabytes(downloader.store.totalBytes()))")
                        .font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.textSecondary)
                } footer: {
                    if let error = downloader.lastError {
                        Text(OfflineAudioScreen.message(error)).font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.danger)
                    }
                }
            }
            .listStyle(.plain).scrollContentBackground(.hidden)
        }
    }
}

private struct OfflineReciterRow: View {
    let reciter: SurahReciter
    let reciters: [SurahReciter]
    @ObservedObject var downloader: RecitationDownloader

    var body: some View {
        let count = downloader.downloadedCount(reciter.id)
        let active = downloader.activeReciterId == reciter.id
        HStack(spacing: Sunnah.Spacing.s3) {
            VStack(alignment: .leading, spacing: Sunnah.Spacing.s1) {
                Text(reciter.nameAr).font(Sunnah.Typography.cardTitle).foregroundStyle(Sunnah.Colors.textPrimary)
                Text(active ? "جارٍ تنزيل السورة \(downloader.currentSurah ?? count + 1)" : "\(count) / \(RecitationDownloader.totalSurahs) سورة")
                    .font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.textSecondary)
                if active || (count > 0 && count < RecitationDownloader.totalSurahs) {
                    ProgressView(value: Double(count), total: Double(RecitationDownloader.totalSurahs)).tint(Sunnah.Colors.primary)
                }
            }
            Spacer(minLength: Sunnah.Spacing.s2)
            if count < RecitationDownloader.totalSurahs {
                Button {
                    active ? downloader.stop() : downloader.start(reciter, among: reciters)
                } label: {
                    Image(systemName: active ? "pause.circle" : "arrow.down.circle")
                        .font(Sunnah.Typography.sectionTitle).foregroundStyle(Sunnah.Colors.primary)
                        .frame(width: Sunnah.Spacing.touch, height: Sunnah.Spacing.touch)
                }
                .buttonStyle(.plain)
                .accessibilityLabel(active ? "إيقاف التنزيل" : (count > 0 ? "استئناف التنزيل" : "تنزيل"))
            } else {
                Image(systemName: "checkmark.circle.fill").font(Sunnah.Typography.sectionTitle).foregroundStyle(Sunnah.Colors.primary)
                    .accessibilityLabel("محمّل كاملًا")
            }
        }
        .frame(minHeight: Sunnah.Spacing.touch)
        .padding(.vertical, Sunnah.Spacing.s2)
        .swipeActions {
            if count > 0 {
                Button(role: .destructive) { downloader.remove(reciter.id) } label: { Label("حذف", systemImage: "trash") }
            }
        }
    }
}
