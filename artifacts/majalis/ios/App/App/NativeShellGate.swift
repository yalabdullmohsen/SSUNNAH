import Foundation
import SunnahDataKit
import SunnahNative
import SunnahPrayer
import SunnahWeb

/// مفتاح تشغيل الصدفة الأصلية (SwiftUI). مطفأ افتراضيًا: لا يتغيّر سلوك التطبيق ما لم يُفعَّل صراحةً.
/// يُفعَّل من إعدادات داخلية أو علَم تشغيل لاحق؛ الحزم الأربع مربوطة بالتطبيق لكنها غير مستعملة بعد.
enum NativeShellGate {
    static let defaultsKey = "native_shell_enabled"

    static var isEnabled: Bool {
        UserDefaults.standard.bool(forKey: defaultsKey)
    }
}
