import Foundation

public enum DataStoreError: Error, Equatable {
    /// لا اتصال ولا نسخة محفوظة.
    case unavailable(String)
}

/// مخزن offline-first: يعرض المحفوظ فورًا ثم يحدّثه من الشبكة.
/// عند فشل الشبكة تبقى النسخة المحفوظة (ولو قديمة) بدل شاشة خطأ.
public final class DataStore: Sendable {
    private let transport: DataTransport
    private let cache: DiskCache
    private let now: @Sendable () -> Date

    public init(transport: DataTransport, cache: DiskCache = .standard(), now: @escaping @Sendable () -> Date = { Date() }) {
        self.transport = transport
        self.cache = cache
        self.now = now
    }

    /// النسخة المحفوظة فقط (بلا شبكة)، أو nil إن لم توجد أو تعذّر فكّها.
    public func cached<Value>(_ resource: Resource<Value>) async -> Loaded<Value>? {
        guard let entry = await cache.read(resource.cacheKey),
              let value = try? resource.decode(entry.data) else { return nil }
        return Loaded(value: value, source: .cache, savedAt: entry.savedAt, isStale: isStale(entry.savedAt, resource))
    }

    /// يجلب من الشبكة ويحفظ؛ عند الفشل يرجع للمحفوظ، وإلا يرمي.
    /// لا يُحفظ ردٌّ لا يُفكّ، كي لا يُستبدل محتوى صالح بتالف.
    public func refresh<Value>(_ resource: Resource<Value>) async throws -> Loaded<Value> {
        do {
            let data = try await transport.fetch(path: resource.path, requireAuth: resource.requireAuth)
            let value = try resource.decode(data)
            try? await cache.write(data, for: resource.cacheKey)
            return Loaded(value: value, source: .remote, savedAt: now(), isStale: false)
        } catch {
            if let fallback = await cached(resource) { return fallback }
            throw DataStoreError.unavailable(String(describing: error))
        }
    }

    /// المحفوظ إن كان صالحًا، وإلا تحديث من الشبكة.
    public func load<Value>(_ resource: Resource<Value>) async throws -> Loaded<Value> {
        if let hit = await cached(resource), !hit.isStale { return hit }
        return try await refresh(resource)
    }

    /// للواجهات: المحفوظ أولًا (إن وُجد) ثم الحديث.
    public func stream<Value>(_ resource: Resource<Value>) -> AsyncThrowingStream<Loaded<Value>, Error> {
        AsyncThrowingStream { continuation in
            let task = Task {
                let first = await cached(resource)
                if let first { continuation.yield(first) }
                if let first, !first.isStale { continuation.finish(); return }
                do {
                    let fresh = try await refresh(resource)
                    if fresh.source == .remote || first == nil { continuation.yield(fresh) }
                    continuation.finish()
                } catch {
                    continuation.finish(throwing: first == nil ? error : nil)
                }
            }
            continuation.onTermination = { _ in task.cancel() }
        }
    }

    public func invalidate<Value>(_ resource: Resource<Value>) async {
        await cache.remove(resource.cacheKey)
    }

    private func isStale<Value>(_ savedAt: Date, _ resource: Resource<Value>) -> Bool {
        now().timeIntervalSince(savedAt) > resource.maxAge
    }
}
