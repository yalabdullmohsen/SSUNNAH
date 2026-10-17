#if DEBUG
import SwiftUI
import UIKit

/// لقطات التدقيق فقط (Debug): `-snapshotScroll end` يمرّر أكبر شاشة تمرير ظاهرة إلى نهايتها، فتخدم كل الشاشات الطويلة
/// (زر الإبلاغ والذيل أسفل الصفحة عند XXXL مثلًا) دون خطاف في كل شاشة. يعيد المحاولة نحو ثلاثين ثانية لأن المحتوى يكبر بعد التحميل.
/// يُستدعى بعد `-snapshotRoute` من RootTabView؛ لا وجود له في Release (يفحصه native-debug-hooks-guard.sh).
enum SnapshotScroll {
    @MainActor static func startIfRequested() {
        guard fraction() != nil else { return }
        Task { @MainActor in
            for _ in 0..<25 {
                try? await Task.sleep(nanoseconds: 1_200_000_000)
                scrollLargestToEnd()
            }
        }
    }

    /// `end` ⇒ 1، أو كسر 0…1 (مثل `0.5` للمنتصف) لإظهار صفوف القوائم الطويلة الوسطى.
    private static func fraction() -> CGFloat? {
        guard let v = UserDefaults.standard.string(forKey: "snapshotScroll") else { return nil }
        if v == "end" { return 1 }
        guard let d = Double(v), d >= 0, d <= 1 else { return nil }
        return CGFloat(d)
    }

    @MainActor private static func scrollLargestToEnd() {
        guard let window = UIApplication.shared.connectedScenes.compactMap({ ($0 as? UIWindowScene)?.keyWindow }).first else { return }
        var best: (UIScrollView, CGFloat)?
        func visit(_ v: UIView) {
            if let s = v as? UIScrollView, !s.isHidden, s.alpha > 0.01, s.window != nil,
               s.contentSize.height > s.bounds.height + 1 {
                let area = s.bounds.width * s.bounds.height
                if best == nil || area > best!.1 { best = (s, area) }
            }
            v.subviews.forEach(visit)
        }
        visit(window)
        guard let s = best?.0 else { return }
        let f = fraction() ?? 1
        let maxY = s.contentSize.height - s.bounds.height + s.adjustedContentInset.bottom
        let y = maxY * f
        if f == 1 ? y > s.contentOffset.y : abs(y - s.contentOffset.y) > 1 { s.setContentOffset(CGPoint(x: s.contentOffset.x, y: y), animated: false) }
    }
}
#endif
