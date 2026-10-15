import XCTest
@testable import SunnahNative

/// عميل مصادقة وهمي يسجّل ترتيب الاستدعاءات؛ لا شبكة ولا حساب حقيقي.
private final class MockAuth: AuthServicing, @unchecked Sendable {
    private let lock = NSLock()
    private(set) var calls: [String] = []
    var failure: Error?
    var isConfigured: Bool { true }
    var currentEmail: String? { "mock@example.test" }
    private func log(_ s: String) { lock.withLock { calls.append(s) } }
    func signIn(email: String, password: String) async throws { log("signIn") }
    func signUp(email: String, password: String) async throws -> Bool { log("signUp"); return false }
    func resetPassword(email: String) async throws { log("reset") }
    func signOut() async { log("signOut") }
    func deleteAccount() async throws { log("deleteAccount"); if let failure { throw failure } }
    func updatePassword(_ newPassword: String) async throws { log("updatePassword") }
    func handleCallback(_ url: URL) -> Bool { false }
}

final class AccountDeletionFlowTests: XCTestCase {
    func testButtonEnabledOnlyForExactPhrase() {
        for wrong in ["", "حذ", "حذف ", " حذف", "حذفف", "delete", "حَذف"] {
            XCTAssertFalse(AccountDeletionFlow.canDelete(confirm: wrong, busy: false), "«\(wrong)» لا يجب أن يُفعّل الزر")
        }
        XCTAssertTrue(AccountDeletionFlow.canDelete(confirm: "حذف", busy: false))
        XCTAssertFalse(AccountDeletionFlow.canDelete(confirm: "حذف", busy: true), "لا تفعيل أثناء التنفيذ")
    }

    func testSuccessDeletesOnceThenSignsOutThenErases() async {
        let auth = MockAuth(); var erased = 0
        let result = await AccountDeletionFlow.run(auth: auth) { erased += 1 }
        XCTAssertNil(result)
        XCTAssertEqual(auth.calls, ["deleteAccount", "signOut"], "حذف مرة واحدة ثم تسجيل خروج")
        XCTAssertEqual(erased, 1, "مسح البيانات المحلية بعد النجاح")
    }

    func testFailureShowsMessageAndKeepsEverything() async {
        let auth = MockAuth(); auth.failure = AuthServiceError.server("تعذّر حذف الحساب، حاول لاحقًا.")
        var erased = 0
        let result = await AccountDeletionFlow.run(auth: auth) { erased += 1 }
        XCTAssertEqual(result, "تعذّر حذف الحساب، حاول لاحقًا.")
        XCTAssertEqual(auth.calls, ["deleteAccount"], "لا signOut عند الفشل")
        XCTAssertEqual(erased, 0, "لا مسح محلي عند الفشل")
    }

    func testRequestCarriesNoUserIdentifier() throws {
        let src = try String(contentsOf: URL(fileURLWithPath: #filePath)
            .deletingLastPathComponent().deletingLastPathComponent().deletingLastPathComponent()
            .appendingPathComponent("Sources/SunnahNative/Platform/AccountDeletion.swift"), encoding: .utf8)
        XCTAssertTrue(src.contains(#"req.httpBody = Data("{}".utf8)"#), "جسم الطلب فارغ: لا معرّف من العميل")
        XCTAssertFalse(src.contains("user_id") || src.contains("userId"), "لا معرّف مستخدم في طلب الحذف")
    }
}

#if canImport(AppKit)
import SwiftUI
import AppKit

/// لقطات حالات الشاشة (عرض macOS عبر ImageRenderer لا محاكي ولا جهاز): قبل الكتابة، بعد كتابة «حذف»، حالة الخطأ. تُكتب عند ضبط DELETE_SHOTS_DIR.
@MainActor
final class AccountDeletionShotsTests: XCTestCase {
    func testRenderStates() throws {
        guard let dir = ProcessInfo.processInfo.environment["DELETE_SHOTS_DIR"] else { throw XCTSkip("DELETE_SHOTS_DIR غير مضبوط") }
        try FileManager.default.createDirectory(atPath: dir, withIntermediateDirectories: true)
        let states: [(String, AccountDeletionView)] = [
            ("a-before-typing", AccountDeletionView()),
            ("b-after-typing", AccountDeletionView(confirm: "حذف")),
            ("c-error", AccountDeletionView(confirm: "حذف", error: "تعذّر حذف الحساب، حاول لاحقًا.")),
        ]
        for (name, view) in states {
            let r = ImageRenderer(content: view.environment(\.layoutDirection, .rightToLeft).frame(width: 390, height: 300).background(Color.white))
            r.scale = 2
            let rep = NSBitmapImageRep(cgImage: try XCTUnwrap(r.cgImage))
            try XCTUnwrap(rep.representation(using: .png, properties: [:])).write(to: URL(fileURLWithPath: "\(dir)/\(name).png"))
        }
    }
}
#endif
