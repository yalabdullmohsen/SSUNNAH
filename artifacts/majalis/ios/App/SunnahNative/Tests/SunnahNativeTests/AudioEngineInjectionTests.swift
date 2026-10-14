import XCTest
@testable import SunnahNative

@MainActor
final class AudioEngineInjectionTests: XCTestCase {
    func testLiveFactoryBuildsEngine() {
        let e = AudioEngines.live(URL(string: "https://example.com/004.mp3")!)
        XCTAssertFalse(e.isPlaying)
        XCTAssertEqual(e.progress, 0)
    }

    func testSurahWithURLHasAudioAndAppRootInjectsFactory() throws {
        let r = SurahReciter(id: "t", nameAr: "ت", surahBaseUrl: URL(string: "https://example.com/r")!)
        XCTAssertEqual(r.surahURL(4).lastPathComponent, "004.mp3")
        XCTAssertNotNil(ContentItem(id: "t-4", title: "النساء", subtitle: "ت", audioURL: r.surahURL(4)).audioURL)
        let root = URL(fileURLWithPath: #filePath)
        var dir = root
        for _ in 0..<8 { dir.deleteLastPathComponent() }   // → جذر المستودع
        let app = try String(contentsOf: dir.appendingPathComponent("ios-native/SunnahApp/SunnahApp.swift"), encoding: .utf8)
        XCTAssertTrue(app.contains(".audioEngineFactory, AudioEngines.live"), "جذر التطبيق لا يحقن محرك الصوت")
    }
}
