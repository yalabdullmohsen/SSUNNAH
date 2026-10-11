import XCTest
@testable import SunnahNative

/// تخزين وهمي في الذاكرة بنفس عقد OfflineAudioProviding.
private final class MemoryAudioStore: OfflineAudioProviding, @unchecked Sendable {
    private let lock = NSLock()
    private var files: [String: [Int: Data]] = [:]
    func localURL(reciterId: String, surah: Int) -> URL? {
        lock.withLock { files[reciterId]?[surah] == nil ? nil : URL(fileURLWithPath: "/offline/\(reciterId)/\(String(format: "%03d", surah)).mp3") }
    }
    func downloadedSurahs(reciterId: String) -> [Int] { lock.withLock { (files[reciterId] ?? [:]).keys.sorted() } }
    func save(_ data: Data, reciterId: String, surah: Int) throws { lock.withLock { files[reciterId, default: [:]][surah] = data } }
    func remove(reciterId: String, surah: Int) throws { lock.withLock { _ = files[reciterId]?.removeValue(forKey: surah) } }
    func removeAll(reciterId: String) throws { lock.withLock { _ = files.removeValue(forKey: reciterId) } }
    func totalBytes() -> Int { lock.withLock { files.values.flatMap(\.values).reduce(0) { $0 + $1.count } } }
}

private let afs = SurahReciter(id: "alafasy", nameAr: "العفاسي", surahBaseUrl: URL(string: "https://server8.mp3quran.net/afs")!)
private let husr = SurahReciter(id: "husary", nameAr: "الحصري", surahBaseUrl: URL(string: "https://server13.mp3quran.net/husr")!)
private let basit = SurahReciter(id: "abdulsamad", nameAr: "عبد الباسط", surahBaseUrl: URL(string: "https://server7.mp3quran.net/basit")!)

final class OfflineRecitationTests: XCTestCase {
    func testDecodesExportedContract() throws {
        let json = #"[{"id":"alafasy","nameAr":"مشاري راشد العفاسي","surahBaseUrl":"https://server8.mp3quran.net/afs"}]"#
        let rows = try JSONDecoder().decode([SurahReciter].self, from: Data(json.utf8))
        XCTAssertEqual(rows[0].surahURL(2).absoluteString, "https://server8.mp3quran.net/afs/002.mp3")
    }

    func testMatchesOnlyKnownFullSurahURLs() {
        XCTAssertEqual(OfflineAudioKey.match(afs.surahURL(114), in: [husr, afs]), OfflineAudioKey(reciterId: "alafasy", surah: 114))
        XCTAssertNil(OfflineAudioKey.match(URL(string: "https://everyayah.com/data/Alafasy_128kbps/001001.mp3")!, in: [afs]))
        XCTAssertNil(OfflineAudioKey.match(URL(string: "https://server8.mp3quran.net/afs/115.mp3")!, in: [afs]))
        XCTAssertNil(OfflineAudioKey.match(URL(string: "https://server9.mp3quran.net/afs/001.mp3")!, in: [afs]))
    }

    func testPlayableURLPrefersDownloadedFile() throws {
        let store = MemoryAudioStore()
        let remote = afs.surahURL(1)
        XCTAssertEqual(store.playableURL(for: remote, reciters: [afs]), remote)
        try store.save(Data([1]), reciterId: "alafasy", surah: 1)
        XCTAssertTrue(store.playableURL(for: remote, reciters: [afs]).isFileURL)
    }

    @MainActor
    func testDownloadsMissingSurahsAndResumes() async throws {
        let store = MemoryAudioStore()
        try store.save(Data([9]), reciterId: "alafasy", surah: 1)
        let fetched = LockedCounter()
        let downloader = RecitationDownloader(store: store) { _ in fetched.increment(); return (Data([1, 2]), 200) }
        downloader.start(afs, among: [afs])
        await downloader.waitUntilIdle()
        XCTAssertEqual(store.downloadedSurahs(reciterId: "alafasy").count, 114)
        XCTAssertEqual(fetched.value, 113)
        XCTAssertNil(downloader.activeReciterId)
        XCTAssertNil(downloader.lastError)
    }

    @MainActor
    func testRefusesThirdCompleteReciter() async throws {
        let store = MemoryAudioStore()
        for r in [afs, husr] { for s in 1...114 { try store.save(Data([1]), reciterId: r.id, surah: s) } }
        let downloader = RecitationDownloader(store: store) { _ in (Data([1]), 200) }
        downloader.start(basit, among: [afs, husr, basit])
        await downloader.waitUntilIdle()
        XCTAssertEqual(downloader.lastError, .reciterQuota)
        XCTAssertTrue(store.downloadedSurahs(reciterId: "abdulsamad").isEmpty)
    }

    @MainActor
    func testStopsOnHTTPErrorKeepingDownloaded() async {
        let store = MemoryAudioStore()
        let downloader = RecitationDownloader(store: store) { url in
            url.lastPathComponent == "003.mp3" ? (Data(), 404) : (Data([1]), 200)
        }
        downloader.start(afs, among: [afs])
        await downloader.waitUntilIdle()
        XCTAssertEqual(downloader.lastError, .http(404))
        XCTAssertEqual(store.downloadedSurahs(reciterId: "alafasy"), [1, 2])
    }
}

private final class LockedCounter: @unchecked Sendable {
    private let lock = NSLock()
    private var n = 0
    func increment() { lock.withLock { n += 1 } }
    var value: Int { lock.withLock { n } }
}
