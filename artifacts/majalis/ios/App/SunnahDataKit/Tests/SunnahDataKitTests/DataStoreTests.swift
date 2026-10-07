import XCTest
@testable import SunnahDataKit

private struct Item: Codable, Equatable, Sendable { let id: Int }

private final class Counter: @unchecked Sendable {
    private let lock = NSLock()
    private var value = 0
    func next() -> Int { lock.lock(); defer { lock.unlock() }; value += 1; return value }
    var count: Int { lock.lock(); defer { lock.unlock() }; return value }
}

private struct Offline: Error {}

final class DataStoreTests: XCTestCase {
    private var dir: URL!

    override func setUp() {
        dir = FileManager.default.temporaryDirectory.appendingPathComponent(UUID().uuidString)
    }

    override func tearDown() {
        try? FileManager.default.removeItem(at: dir)
    }

    private func store(_ transport: DataTransport, now: Date = Date()) -> DataStore {
        DataStore(transport: transport, cache: DiskCache(directory: dir), now: { now })
    }

    private func json(_ id: Int) -> Data { try! JSONEncoder().encode(Item(id: id)) }

    func testRefreshStoresAndLoadServesFreshCacheWithoutNetwork() async throws {
        let calls = Counter()
        let s = store(ClosureTransport { _, _ in _ = calls.next(); return self.json(1) })
        let r = Resource<Item>(path: "/api/x")

        let first = try await s.load(r)
        XCTAssertEqual(first.source, .remote)
        let second = try await s.load(r)
        XCTAssertEqual(second.source, .cache)
        XCTAssertEqual(second.value, Item(id: 1))
        XCTAssertEqual(calls.count, 1)
    }

    func testOfflineFallsBackToStaleCache() async throws {
        _ = try await store(ClosureTransport { _, _ in self.json(7) }).refresh(Resource<Item>(path: "/p"))

        let later = store(ClosureTransport { _, _ in throw Offline() }, now: Date().addingTimeInterval(10_000))
        let loaded = try await later.load(Resource<Item>(path: "/p", maxAge: 60))
        XCTAssertEqual(loaded.value, Item(id: 7))
        XCTAssertEqual(loaded.source, .cache)
        XCTAssertTrue(loaded.isStale)
    }

    func testOfflineWithoutCacheThrows() async {
        let s = store(ClosureTransport { _, _ in throw Offline() })
        do {
            _ = try await s.load(Resource<Item>(path: "/none"))
            XCTFail("expected error")
        } catch {
            XCTAssertTrue(error is DataStoreError)
        }
    }

    func testUndecodableResponseDoesNotOverwriteCache() async throws {
        _ = try await store(ClosureTransport { _, _ in self.json(3) }).refresh(Resource<Item>(path: "/p"))

        let broken = store(ClosureTransport { _, _ in Data("<html>".utf8) })
        let loaded = try await broken.refresh(Resource<Item>(path: "/p"))
        XCTAssertEqual(loaded.value, Item(id: 3))
        XCTAssertEqual(loaded.source, .cache)
    }

    func testStreamYieldsCacheThenRemote() async throws {
        _ = try await store(ClosureTransport { _, _ in self.json(1) }).refresh(Resource<Item>(path: "/p"))

        let s = store(ClosureTransport { _, _ in self.json(2) }, now: Date().addingTimeInterval(10_000))
        var ids: [Int] = []
        for try await loaded in s.stream(Resource<Item>(path: "/p", maxAge: 60)) { ids.append(loaded.value.id) }
        XCTAssertEqual(ids, [1, 2])
    }

    func testAuthFlagReachesTransport() async throws {
        let sawAuth = Counter()
        let s = store(ClosureTransport { _, auth in if auth { _ = sawAuth.next() }; return self.json(1) })
        _ = try await s.refresh(Resource<Item>(path: "/me", requireAuth: true))
        XCTAssertEqual(sawAuth.count, 1)
    }

    func testFileNamesAreSafeAndDistinct() {
        let a = DiskCache.fileName(for: "/api/lessons?page=1")
        let b = DiskCache.fileName(for: "/api/lessons?page=2")
        XCTAssertNotEqual(a, b)
        XCTAssertFalse(a.contains("/"))
        XCTAssertFalse(DiskCache.fileName(for: "دروس/١").contains("/"))
    }
}
