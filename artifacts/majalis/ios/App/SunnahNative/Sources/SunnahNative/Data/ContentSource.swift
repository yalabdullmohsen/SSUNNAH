import Foundation
import SunnahDataKit

/// مصدر محتوى شاشة: ملف JSON محزوم في التطبيق كما هو، أو مورد بعيد بكاش محلي.
/// افتراض (لحين DATA_CONTRACT من ن1): الملفات المحزومة في `Bundle.main` تحت مجلد فرعي اختياري، بنفس بنية `public/data`.
public enum ContentSource: Sendable {
    case bundled(name: String, subdirectory: String? = nil)
    case remote(path: String, maxAge: TimeInterval = 3600, requireAuth: Bool = false)
}

public enum ContentError: Error, Equatable {
    case missingBundledFile(String)
    case noStore
}

/// يحمّل ويفكّ أي `Decodable` من `ContentSource`.
/// المحزوم يُقرأ بلا شبكة؛ البعيد يمرّ عبر DataStore (offline-first).
public struct ContentLoader: Sendable {
    private let bundle: Bundle
    private let store: DataStore?
    private let decoder: @Sendable () -> JSONDecoder

    public init(bundle: Bundle = .main, store: DataStore? = nil, decoder: @escaping @Sendable () -> JSONDecoder = { JSONDecoder() }) {
        self.bundle = bundle
        self.store = store
        self.decoder = decoder
    }

    public func load<Value: Decodable & Sendable>(_ type: Value.Type = Value.self, from source: ContentSource) async throws -> Value {
        switch source {
        case let .bundled(name, subdirectory):
            guard let url = bundle.url(forResource: name, withExtension: "json", subdirectory: subdirectory)
                    ?? (subdirectory == nil ? BundledDataIndex.url(named: name, in: bundle) : nil) else {
                throw ContentError.missingBundledFile([subdirectory, name].compactMap { $0 }.joined(separator: "/"))
            }
            let raw = try Data(contentsOf: url)
            // المصحف خارج هذا المسار؛ كل محتوى معروض آخر بأرقام لاتينية.
            return try decoder().decode(Value.self, from: url.path.contains("/mushaf/") ? raw : raw.asLatinDigitsJSON)
        case let .remote(path, maxAge, requireAuth):
            do {
                guard let store else { throw ContentError.noStore }
                let resource = Resource<Value>(path: path, maxAge: maxAge, requireAuth: requireAuth, decoder: decoder())
                return try await store.load(resource).value
            } catch {
                // لا شبكة ولا كاش: البذرة المحزومة (إن وُجدت) بدل الخطأ.
                if let seed = RemoteSeeds.data(forPath: path, bundle: bundle), let value = try? decoder().decode(Value.self, from: seed.asLatinDigitsJSON) {
                    return value
                }
                throw error
            }
        }
    }
}

/// الشاشات المولَّدة تسمّي الملف بلا مجلد، والحزمة تحفظه تحت `Data/<قسم>/`؛ فيُبحث عنه هناك (الأقرب جذرًا، ثم غير `embedded`، ثم أبجديًا).
enum BundledDataIndex {
    private static let lock = NSLock()
    nonisolated(unsafe) private static var cache: [String: [String: URL]] = [:]

    static func url(named name: String, in bundle: Bundle) -> URL? {
        lock.lock(); defer { lock.unlock() }
        let key = bundle.bundlePath
        if cache[key] == nil { cache[key] = build(bundle) }
        return cache[key]?[name]
    }

    private static func build(_ bundle: Bundle) -> [String: URL] {
        guard let root = bundle.resourceURL?.appendingPathComponent("Data"),
              let walker = FileManager.default.enumerator(at: root, includingPropertiesForKeys: nil) else { return [:] }
        var best: [String: (rank: [Int], url: URL)] = [:]
        for case let url as URL in walker where url.pathExtension == "json" {
            let parts = url.pathComponents.dropFirst(root.pathComponents.count).dropLast()
            let rank = [parts.count, parts.contains("embedded") ? 1 : 0]
            let name = url.deletingPathExtension().lastPathComponent
            if let cur = best[name], !(rank.lexicographicallyPrecedes(cur.rank) || (rank == cur.rank && url.path < cur.url.path)) { continue }
            best[name] = (rank, url)
        }
        return best.mapValues(\.url)
    }
}
