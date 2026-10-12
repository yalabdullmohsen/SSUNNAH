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
            guard let url = bundle.url(forResource: name, withExtension: "json", subdirectory: subdirectory) else {
                throw ContentError.missingBundledFile([subdirectory, name].compactMap { $0 }.joined(separator: "/"))
            }
            return try decoder().decode(Value.self, from: Data(contentsOf: url))
        case let .remote(path, maxAge, requireAuth):
            do {
                guard let store else { throw ContentError.noStore }
                let resource = Resource<Value>(path: path, maxAge: maxAge, requireAuth: requireAuth, decoder: decoder())
                return try await store.load(resource).value
            } catch {
                // لا شبكة ولا كاش: البذرة المحزومة (إن وُجدت) بدل الخطأ.
                if let seed = RemoteSeeds.data(forPath: path, bundle: bundle), let value = try? decoder().decode(Value.self, from: seed) {
                    return value
                }
                throw error
            }
        }
    }
}
