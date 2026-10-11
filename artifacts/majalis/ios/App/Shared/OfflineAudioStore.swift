import Foundation

/// تخزين تلاوات دون اتصال في Application Support — مُستثنى من iCloud backup.
/// نواة بلا Capacitor يستعملها المشغّل الأصلي، ويفوّض إليها MajlisOfflineAudioPlugin.
public struct OfflineAudioStore: Sendable {
    public struct Entry: Equatable {
        public let surah: Int
        public let bytes: Int
    }

    public enum StoreError: Error { case unavailable, invalidSurah, invalidReciter }

    private let folderName = "MajlisOfflineAudio"
    private let baseOverride: URL?

    public init(baseDirectory: URL? = nil) { baseOverride = baseDirectory }

    public func rootDir() throws -> URL {
        guard let base = baseOverride
            ?? FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask).first
        else { throw StoreError.unavailable }
        let dir = base.appendingPathComponent(folderName, isDirectory: true)
        if !FileManager.default.fileExists(atPath: dir.path) {
            try FileManager.default.createDirectory(at: dir, withIntermediateDirectories: true)
        }
        var values = URLResourceValues()
        values.isExcludedFromBackup = true
        var mutable = dir
        try mutable.setResourceValues(values)
        return dir
    }

    private func reciterDir(_ reciterId: String) throws -> URL {
        guard !reciterId.isEmpty else { throw StoreError.invalidReciter }
        return try rootDir().appendingPathComponent(reciterId.replacingOccurrences(of: "/", with: "_"), isDirectory: true)
    }

    public func fileURL(reciterId: String, surah: Int) throws -> URL {
        guard (1...114).contains(surah) else { throw StoreError.invalidSurah }
        let dir = try reciterDir(reciterId)
        if !FileManager.default.fileExists(atPath: dir.path) {
            try FileManager.default.createDirectory(at: dir, withIntermediateDirectories: true)
        }
        return dir.appendingPathComponent(String(format: "%03d.mp3", surah))
    }

    @discardableResult
    public func write(_ data: Data, reciterId: String, surah: Int) throws -> URL {
        let url = try fileURL(reciterId: reciterId, surah: surah)
        try data.write(to: url, options: .atomic)
        return url
    }

    public func delete(reciterId: String, surah: Int) throws {
        let url = try fileURL(reciterId: reciterId, surah: surah)
        if FileManager.default.fileExists(atPath: url.path) { try FileManager.default.removeItem(at: url) }
    }

    public func deleteReciter(_ reciterId: String) throws {
        let dir = try reciterDir(reciterId)
        if FileManager.default.fileExists(atPath: dir.path) { try FileManager.default.removeItem(at: dir) }
    }

    public func list(reciterId: String) throws -> [Entry] {
        let dir = try reciterDir(reciterId)
        guard FileManager.default.fileExists(atPath: dir.path) else { return [] }
        let items = try FileManager.default.contentsOfDirectory(at: dir, includingPropertiesForKeys: [.fileSizeKey])
        var out: [Entry] = []
        for url in items where url.pathExtension.lowercased() == "mp3" {
            guard let num = Int(url.deletingPathExtension().lastPathComponent), (1...114).contains(num) else { continue }
            out.append(Entry(surah: num, bytes: (try? url.resourceValues(forKeys: [.fileSizeKey]).fileSize) ?? 0))
        }
        return out.sorted { $0.surah < $1.surah }
    }

    /// الرابط المحلي إن كانت السورة محمّلة، وإلا nil.
    public func playbackURL(reciterId: String, surah: Int) throws -> URL? {
        let url = try fileURL(reciterId: reciterId, surah: surah)
        return FileManager.default.fileExists(atPath: url.path) ? url : nil
    }

    public func totalBytes() throws -> Int {
        let root = try rootDir()
        var total = 0
        if let e = FileManager.default.enumerator(at: root, includingPropertiesForKeys: [.fileSizeKey]) {
            for case let url as URL in e { total += (try? url.resourceValues(forKeys: [.fileSizeKey]).fileSize) ?? 0 }
        }
        return total
    }
}
