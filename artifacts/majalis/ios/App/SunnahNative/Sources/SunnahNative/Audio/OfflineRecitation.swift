import SwiftUI

/// قارئ سور كاملة من عقد البيانات (`Data/audio/surah-reciters.json`، مصدره RECITERS في الويب).
/// المعرّف هو مفتاح التخزين دون اتصال نفسه في MajlisOfflineAudio، فتبقى تنزيلات النسخة الحالية صالحة.
public struct SurahReciter: Decodable, Identifiable, Hashable, Sendable {
    public let id: String
    public let nameAr: String
    public let surahBaseUrl: URL

    public init(id: String, nameAr: String, surahBaseUrl: URL) {
        self.id = id; self.nameAr = nameAr; self.surahBaseUrl = surahBaseUrl
    }

    public static let source = ContentSource.bundled(name: "surah-reciters", subdirectory: "Data/audio")

    /// `{surahBaseUrl}/{SSS}.mp3` كما في getSurahAudioUrl.
    public func surahURL(_ surah: Int) -> URL {
        surahBaseUrl.appendingPathComponent(String(format: "%03d.mp3", surah))
    }

    /// قراءة متزامنة للقائمة المحزومة (ملف صغير) لتوصيل المشغّل عند الإقلاع؛ الفارغ = لا مطابقة دون اتصال.
    public static func bundled(in bundle: Bundle = .main) -> [SurahReciter] {
        guard let url = bundle.url(forResource: "surah-reciters", withExtension: "json", subdirectory: "Data/audio"),
              let data = try? Data(contentsOf: url) else { return [] }
        return (try? JSONDecoder().decode([SurahReciter].self, from: data)) ?? []
    }
}

public struct OfflineAudioKey: Hashable, Sendable {
    public let reciterId: String
    public let surah: Int

    /// يطابق رابط سورة كاملة بقارئ من القائمة؛ nil لأي رابط آخر (آية بآية، تفسير...).
    public static func match(_ url: URL, in reciters: [SurahReciter]) -> OfflineAudioKey? {
        guard url.pathExtension.lowercased() == "mp3",
              let surah = Int(url.deletingPathExtension().lastPathComponent), (1...114).contains(surah) else { return nil }
        let base = url.deletingLastPathComponent().absoluteString.trimmingCharacters(in: CharacterSet(charactersIn: "/"))
        guard let reciter = reciters.first(where: { $0.surahBaseUrl.absoluteString.trimmingCharacters(in: CharacterSet(charactersIn: "/")) == base })
        else { return nil }
        return OfflineAudioKey(reciterId: reciter.id, surah: surah)
    }
}

public extension OfflineAudioProviding {
    /// المحلي أولًا: الملف المحمّل إن وُجد، وإلا الرابط كما هو (بث).
    func playableURL(for url: URL, reciters: [SurahReciter]) -> URL {
        guard let key = OfflineAudioKey.match(url, in: reciters) else { return url }
        return localURL(reciterId: key.reciterId, surah: key.surah) ?? url
    }
}

public enum RecitationDownloadError: Error, Equatable {
    /// سقف القرّاء الكاملين (اثنان) كما في الويب: يُحذف تنزيل أولًا.
    case reciterQuota
    /// سقف المساحة (1.5 GiB).
    case storageQuota
    case http(Int)
}

/// تنزيل سور قارئ 1…114 تسلسليًا إلى OfflineAudioProviding، يتخطى المحمّل فيُستأنف من حيث توقف.
/// السقوف نفسها في quran-audio-downloads.ts: قارئان كاملان و1.5 GiB.
@MainActor
public final class RecitationDownloader: ObservableObject {
    public static let totalSurahs = 114
    public static let maxCompleteReciters = 2
    public static let maxBytes = 1_610_612_736
    /// نسخة التطبيق المشتركة (تبقى حيّة بين الشاشات).
    public static let shared = RecitationDownloader()

    @Published public private(set) var activeReciterId: String?
    @Published public private(set) var currentSurah: Int?
    @Published public private(set) var lastError: RecitationDownloadError?
    /// يزيد بعد كل حفظ/حذف لتُعيد الواجهة قراءة الحالة من التخزين.
    @Published public private(set) var revision = 0

    public private(set) var store: OfflineAudioProviding
    private let fetch: @Sendable (URL) async throws -> (Data, Int)
    private var task: Task<Void, Never>?

    public init(store: OfflineAudioProviding = NoOfflineAudio(),
                fetch: @escaping @Sendable (URL) async throws -> (Data, Int) = RecitationDownloader.urlSessionFetch) {
        self.store = store; self.fetch = fetch
    }

    /// يوصل التخزين الفعلي بعد الإنشاء (البيئة غير متاحة في init الشاشة).
    public func attach(_ store: OfflineAudioProviding) {
        guard activeReciterId == nil else { return }
        self.store = store
        revision += 1
    }

    public func downloadedCount(_ reciterId: String) -> Int { store.downloadedSurahs(reciterId: reciterId).count }

    public func isComplete(_ reciterId: String) -> Bool { downloadedCount(reciterId) >= Self.totalSurahs }

    /// يبدأ أو يستأنف تنزيل قارئ؛ يوقف أي تنزيل جارٍ آخر.
    public func start(_ reciter: SurahReciter, among reciters: [SurahReciter]) {
        stop()
        lastError = nil
        if !isComplete(reciter.id),
           reciters.filter({ $0.id != reciter.id && isComplete($0.id) }).count >= Self.maxCompleteReciters {
            lastError = .reciterQuota
            return
        }
        activeReciterId = reciter.id
        task = Task { [weak self] in await self?.run(reciter) }
    }

    /// إيقاف (لا يُحذف ما نُزّل؛ البدء مجددًا يستأنف).
    public func stop() {
        task?.cancel(); task = nil
        activeReciterId = nil; currentSurah = nil
    }

    public func remove(_ reciterId: String) {
        if activeReciterId == reciterId { stop() }
        try? store.removeAll(reciterId: reciterId)
        revision += 1
    }

    /// يُنتظر حتى ينتهي التنزيل الجاري (للاختبارات).
    public func waitUntilIdle() async { await task?.value }

    private func run(_ reciter: SurahReciter) async {
        let have = Set(store.downloadedSurahs(reciterId: reciter.id))
        for surah in 1...Self.totalSurahs where !have.contains(surah) {
            if Task.isCancelled { return }
            currentSurah = surah
            do {
                let (data, status) = try await fetch(reciter.surahURL(surah))
                if Task.isCancelled { return }
                guard status == 200, !data.isEmpty else { throw RecitationDownloadError.http(status) }
                guard store.totalBytes() + data.count <= Self.maxBytes else { throw RecitationDownloadError.storageQuota }
                try store.save(data, reciterId: reciter.id, surah: surah)
                revision += 1
            } catch {
                if Task.isCancelled || error is CancellationError || (error as? URLError)?.code == .cancelled { return }
                lastError = error as? RecitationDownloadError ?? .http(-1)
                activeReciterId = nil; currentSurah = nil
                return
            }
        }
        activeReciterId = nil; currentSurah = nil
    }

    public nonisolated static let urlSessionFetch: @Sendable (URL) async throws -> (Data, Int) = { url in
        let (data, response) = try await URLSession.shared.data(from: url)
        return (data, (response as? HTTPURLResponse)?.statusCode ?? 0)
    }
}
