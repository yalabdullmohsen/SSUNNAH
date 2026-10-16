#if os(iOS)
import SwiftUI
import UIKit

/// مُقلِّب صفحات المصحف الواحد لكل المسارات (فهرس، بحث، علامات، استماع): UICollectionView أفقي بعدد ثابت (604) لا تتغيّر
/// عناصره أثناء التمرير، مع التقاط دقيق: حركة واحدة = صفحة واحدة مهما كانت سرعة السحب، وRTL أصيل (الصفحة 1 يمينًا).
/// بديل TabView(.page) الذي كان يعيد بناء نافذة الصفحات أثناء التمرير فتبقى صفحتان نصف ظاهرتين.
struct MushafPager<Content: View>: UIViewRepresentable {
    @Binding var current: Int
    let count: Int
    /// مفتاح يُعاد به رسم الخلايا الظاهرة عند تغيّر حالة المحتوى (تحديد آية…).
    let renderKey: AnyHashable
    let content: (Int) -> Content

    func makeCoordinator() -> Coordinator { Coordinator(self) }

    func makeUIView(context: Context) -> UICollectionView {
        let layout = UICollectionViewFlowLayout()
        layout.scrollDirection = .horizontal
        layout.minimumLineSpacing = 0; layout.minimumInteritemSpacing = 0
        let cv = UICollectionView(frame: .zero, collectionViewLayout: layout)
        cv.semanticContentAttribute = .forceRightToLeft
        cv.backgroundColor = .clear
        cv.isPagingEnabled = true
        cv.showsHorizontalScrollIndicator = false
        cv.bounces = true
        cv.contentInsetAdjustmentBehavior = .never
        cv.decelerationRate = .fast
        cv.dataSource = context.coordinator
        cv.delegate = context.coordinator
        cv.register(UICollectionViewCell.self, forCellWithReuseIdentifier: "p")
        return cv
    }

    func updateUIView(_ cv: UICollectionView, context: Context) {
        let c = context.coordinator
        c.parent = self
        cv.semanticContentAttribute = .forceRightToLeft   // SwiftUI يعيد ضبطه من البيئة؛ حساب الإزاحة أعلاه يفترض RTL دائمًا
        let size = cv.bounds.size
        if let layout = cv.collectionViewLayout as? UICollectionViewFlowLayout, size.width > 0, layout.itemSize != size {
            layout.itemSize = size; layout.invalidateLayout()
            c.pendingScroll = true
        }
        if size.width > 0, c.pendingScroll || (!c.userScrolling && c.shown != current) {
            let animated = !c.pendingScroll && abs(c.shown - current) == 1
            c.pendingScroll = false
            cv.scrollToItem(at: IndexPath(item: current - 1, section: 0), at: .centeredHorizontally, animated: animated)
            c.shown = current
        }
        if c.lastKey != renderKey {
            c.lastKey = renderKey
            cv.reconfigureItems(at: cv.indexPathsForVisibleItems)
        }
    }

    /// هندسة التقليب (نقية، تُختبر على 604 صفحة × كل الأحجام): RTL — الصفحة n عند x = (count − n)·w.
    static func offsetX(page n: Int, width w: CGFloat, count: Int) -> CGFloat { CGFloat(count - min(max(n, 1), count)) * w }
    static func page(atOffsetX x: CGFloat, width w: CGFloat, count: Int) -> Int {
        min(max(count - Int((x / max(w, 1)).rounded()), 1), count)
    }
    /// حركة واحدة = صفحة واحدة: الهدف نفسها أو المجاورة بحسب الاتجاه/المسافة (v.x > 0 = سحب نحو الصفحة السابقة) لا بسرعة الإفلات.
    static func targetPage(start: Int, offsetX x: CGFloat, velocityX v: CGFloat, width w: CGFloat, count: Int) -> Int {
        let moved = x - offsetX(page: start, width: w, count: count)
        var target = start
        if abs(v) > 0.2 { target += v > 0 ? -1 : 1 } else if abs(moved) > max(w, 1) * 0.35 { target += moved > 0 ? -1 : 1 }
        return min(max(target, 1), count)
    }

    final class Coordinator: NSObject, UICollectionViewDataSource, UICollectionViewDelegate {
        var parent: MushafPager
        var shown = 0, lastKey: AnyHashable?, pendingScroll = true, userScrolling = false
        private var dragStartPage = 1

        init(_ p: MushafPager) { parent = p }

        func collectionView(_ cv: UICollectionView, numberOfItemsInSection s: Int) -> Int { parent.count }

        func collectionView(_ cv: UICollectionView, cellForItemAt ip: IndexPath) -> UICollectionViewCell {
            let cell = cv.dequeueReusableCell(withReuseIdentifier: "p", for: ip)
            let n = ip.item + 1
            cell.contentConfiguration = UIHostingConfiguration { self.parent.content(n) }.margins(.all, 0)
            cell.backgroundColor = .clear
            return cell
        }

        private func page(of cv: UIScrollView) -> Int {
            // RTL: الصفحة 1 عند أقصى اليمين، وcontentOffset.x يُحسب من اليسار.
            MushafPager.page(atOffsetX: cv.contentOffset.x, width: cv.bounds.width, count: parent.count)
        }

        func scrollViewWillBeginDragging(_ sv: UIScrollView) { userScrolling = true; dragStartPage = page(of: sv) }

        /// حركة واحدة = صفحة واحدة: الهدف دائمًا الصفحة المجاورة (أو نفسها) بحسب الاتجاه/المسافة لا بسرعة الإفلات.
        func scrollViewWillEndDragging(_ sv: UIScrollView, withVelocity v: CGPoint, targetContentOffset t: UnsafeMutablePointer<CGPoint>) {
            let w = max(sv.bounds.width, 1)
            let target = MushafPager.targetPage(start: dragStartPage, offsetX: sv.contentOffset.x, velocityX: v.x, width: w, count: parent.count)
            t.pointee.x = MushafPager.offsetX(page: target, width: w, count: parent.count)
        }

        func scrollViewDidScroll(_ sv: UIScrollView) {
            guard sv.bounds.width > 0, sv.isTracking || sv.isDecelerating else { return }
            let p = page(of: sv)
            if p != shown { shown = p; DispatchQueue.main.async { self.parent.current = p } }
        }

        func scrollViewDidEndDecelerating(_ sv: UIScrollView) { userScrolling = false }
        func scrollViewDidEndDragging(_ sv: UIScrollView, willDecelerate d: Bool) { if !d { userScrolling = false } }
    }
}
#endif
