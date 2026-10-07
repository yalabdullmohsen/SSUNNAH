import Foundation

/// كاش قرصي بسيط: ملف لكل مفتاح، وتاريخ التعديل هو عمر النسخة.
public actor DiskCache {
    public struct Entry: Sendable {
        public let data: Data
        public let savedAt: Date
    }

    private let directory: URL
    private let fileManager = FileManager.default

    public init(directory: URL) {
        self.directory = directory
    }

    /// المجلد الافتراضي داخل Caches (يمسحه النظام عند ضيق المساحة فقط).
    public static func standard(named name: String = "sunnah-data") -> DiskCache {
        let base = FileManager.default.urls(for: .cachesDirectory, in: .userDomainMask).first
            ?? FileManager.default.temporaryDirectory
        return DiskCache(directory: base.appendingPathComponent(name, isDirectory: true))
    }

    public func read(_ key: String) -> Entry? {
        let url = fileURL(for: key)
        guard let data = try? Data(contentsOf: url) else { return nil }
        let attributes = try? fileManager.attributesOfItem(atPath: url.path)
        let savedAt = attributes?[.modificationDate] as? Date ?? .distantPast
        return Entry(data: data, savedAt: savedAt)
    }

    public func write(_ data: Data, for key: String) throws {
        try fileManager.createDirectory(at: directory, withIntermediateDirectories: true)
        try data.write(to: fileURL(for: key), options: .atomic)
    }

    public func remove(_ key: String) {
        try? fileManager.removeItem(at: fileURL(for: key))
    }

    public func removeAll() {
        try? fileManager.removeItem(at: directory)
    }

    func fileURL(for key: String) -> URL {
        directory.appendingPathComponent(Self.fileName(for: key))
    }

    /// اسم ملف آمن ثابت لأي مفتاح (مسار API بمعاملاته).
    static func fileName(for key: String) -> String {
        let allowed = CharacterSet.alphanumerics.union(CharacterSet(charactersIn: "-_."))
        let safe = key.unicodeScalars.map { allowed.contains($0) ? String($0) : "_" }.joined()
        return "\(safe.prefix(120))-\(stableHash(key)).json"
    }

    /// FNV-1a: ثابت بين التشغيلات بخلاف `hashValue`.
    private static func stableHash(_ string: String) -> String {
        var hash: UInt64 = 0xcbf29ce484222325
        for byte in string.utf8 {
            hash ^= UInt64(byte)
            hash = hash &* 0x100000001b3
        }
        return String(hash, radix: 16)
    }
}
