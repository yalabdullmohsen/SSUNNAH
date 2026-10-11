import Foundation
import SunnahNative

/// ينفّذ OfflineAudioProviding فوق OfflineAudioStore (Shared/) كما هو.
struct OfflineAudioAdapter: OfflineAudioProviding {
    private let store = OfflineAudioStore()

    func localURL(reciterId: String, surah: Int) -> URL? { try? store.playbackURL(reciterId: reciterId, surah: surah) }
    func downloadedSurahs(reciterId: String) -> [Int] { ((try? store.list(reciterId: reciterId)) ?? []).map(\.surah) }
    func save(_ data: Data, reciterId: String, surah: Int) throws { try store.write(data, reciterId: reciterId, surah: surah) }
    func remove(reciterId: String, surah: Int) throws { try store.delete(reciterId: reciterId, surah: surah) }
    func removeAll(reciterId: String) throws { try store.deleteReciter(reciterId) }
    func totalBytes() -> Int { (try? store.totalBytes()) ?? 0 }
}
