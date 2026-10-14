import SwiftUI

/// حالة الشاشة المعلنة للتدقيق الآلي: معرّفات `accessibilityIdentifier` ثابتة (لا مطابقة نصوص).
/// `screen.error` / `screen.empty` على حالات الشاشة الكاملة المشتركة، و`screen.ready` يعلنه التطبيق بعد اكتمال التحميل.
public enum ScreenState: String, Sendable {
    case error = "screen.error", empty = "screen.empty", loading = "screen.loading"
    public static let ready = "screen.ready"
}

/// عدّاد حالات الشاشة الظاهرة حاليًا (يُحدَّث من onAppear/onDisappear للمكونات المشتركة).
@MainActor
public final class ScreenProbe: ObservableObject {
    public static let shared = ScreenProbe()
    @Published public private(set) var counts: [ScreenState: Int] = [:]
    /// يزيد عند أي تغيّر؛ يستعمله المنتظر لاكتشاف الاستقرار.
    @Published public private(set) var revision = 0
    func enter(_ s: ScreenState) { counts[s, default: 0] += 1; revision += 1 }
    func leave(_ s: ScreenState) { counts[s] = max(0, (counts[s] ?? 0) - 1); revision += 1 }
    public var isLoading: Bool { (counts[.loading] ?? 0) > 0 }
    /// الحالة النهائية: خطأ > فارغ > سليم.
    public var outcome: String { (counts[.error] ?? 0) > 0 ? "error" : (counts[.empty] ?? 0) > 0 ? "empty" : "ok" }
}

extension View {
    /// يعلن هذه الواجهة حالةً للشاشة (معرّف ثابت + تسجيل في ScreenProbe).
    func screenState(_ s: ScreenState) -> some View {
        accessibilityIdentifier(s.rawValue)
            .onAppear { ScreenProbe.shared.enter(s) }
            .onDisappear { ScreenProbe.shared.leave(s) }
    }
}

#if DEBUG
/// لقطات native-loop/route-audit: بعد فتح المسار ينتظر زوال التحميل واستقرار الشاشة ثم يكتب علامة الجاهزية
/// (ملف `snapshot-ready.json` في tmp الحاوية، ومعرّف `screen.ready` للـXCUITest). السكربت ينتظر الملف بمهلة.
@MainActor
public final class SnapshotReadiness: ObservableObject {
    @Published public private(set) var isReady = false
    public init() {}
    public static var fileURL: URL { URL(fileURLWithPath: NSTemporaryDirectory()).appendingPathComponent("snapshot-ready.json") }

    /// quiet: مدة استقرار بلا تغيّر في الحالات؛ timeout: سقف الانتظار (يُكتب ready=false/timeout عند تجاوزه).
    public func begin(route: String, quiet: Duration = .milliseconds(900), timeout: Duration = .seconds(15)) {
        Task { @MainActor in _ = await settle(route: route, quiet: quiet, timeout: timeout) }
    }

    /// كـ begin لكن ينتظر النتيجة ويعيد الحالة (ok/empty/error/timeout…)؛ يستعمله وضع -snapshotRoutes.
    public func settle(route: String, quiet: Duration = .milliseconds(900), timeout: Duration = .seconds(15)) async -> String {
        try? FileManager.default.removeItem(at: Self.fileURL)
        isReady = false
        let probe = ScreenProbe.shared
        let clock = ContinuousClock(); let start = clock.now
        var last = probe.revision; var stableSince = clock.now
        while clock.now - start < timeout {
            try? await Task.sleep(for: .milliseconds(100))
            if probe.revision != last || probe.isLoading { last = probe.revision; stableSince = clock.now }
            else if clock.now - stableSince >= quiet { break }
        }
        let timedOut = probe.isLoading || clock.now - start >= timeout
        let state = timedOut ? "timeout" : probe.outcome
        let json = "{\"route\":\"\(route)\",\"ready\":\(!timedOut),\"state\":\"\(state)\"}"
        try? json.write(to: Self.fileURL, atomically: true, encoding: .utf8)
        isReady = !timedOut
        return state
    }
}

/// وضع القياس داخل التطبيق (Debug فقط): `-snapshotRoutes <ملف>` (سطر لكل مسار؛ مسار نسبي = داخل tmp الحاوية).
/// لكل مسار: يفتحه عبر AppRouter، ينتظر الاستقرار، يكتب `audit-ready.json` {i,route,state}، ثم ينتظر ظهور ملف `audit-next`
/// (يكتبه السكربت بعد `simctl io screenshot`). لا openurl ولا إعادة إطلاق. عند الانتهاء يكتب `audit-done`.
@MainActor
public enum SnapshotRoutesRunner {
    public static func run(file: String, router: AppRouter, readiness: SnapshotReadiness) {
        Task { @MainActor in
            let tmp = URL(fileURLWithPath: NSTemporaryDirectory())
            let list = file.hasPrefix("/") ? URL(fileURLWithPath: file) : tmp.appendingPathComponent(file)
            let routes = ((try? String(contentsOf: list, encoding: .utf8)) ?? "").split(separator: "\n").map { String($0).trimmingCharacters(in: .whitespaces) }.filter { !$0.isEmpty }
            let ready = tmp.appendingPathComponent("audit-ready.json"), next = tmp.appendingPathComponent("audit-next")
            let fm = FileManager.default
            try? fm.removeItem(at: tmp.appendingPathComponent("audit-done"))
            for (i, r) in routes.enumerated() {
                try? fm.removeItem(at: next); try? fm.removeItem(at: ready)
                router.stack = []
                try? await Task.sleep(for: .milliseconds(150))
                if r != "/" { router.open(path: r) }
                let state = await readiness.settle(route: r)
                try? "{\"i\":\(i),\"route\":\"\(r)\",\"state\":\"\(state)\"}".write(to: ready, atomically: true, encoding: .utf8)
                for _ in 0..<400 where !fm.fileExists(atPath: next.path) { try? await Task.sleep(for: .milliseconds(50)) }
            }
            try? "done".write(to: tmp.appendingPathComponent("audit-done"), atomically: true, encoding: .utf8)
        }
    }
}
#endif
