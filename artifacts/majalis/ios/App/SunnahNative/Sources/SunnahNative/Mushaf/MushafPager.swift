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
        let layout = MushafPagerLayout()
        layout.scrollDirection = .horizontal
        layout.minimumLineSpacing = 0; layout.minimumInteritemSpacing = 0
        let cv = MushafPagerCollectionView(frame: .zero, collectionViewLayout: layout)
        cv.onValidSizeChange = { [weak c = context.coordinator] cv in c?.sizeChanged(cv) }
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
        if MushafPager.isValidSize(size), !c.userScrolling, c.shown != current {
            let animated = abs(c.shown - current) == 1 && c.shown != 0
            cv.scrollToItem(at: IndexPath(item: current - 1, section: 0), at: .centeredHorizontally, animated: animated)
            c.shown = current
        }
        if c.lastKey != renderKey, MushafPager.isValidSize(size) {
            c.lastKey = renderKey
            cv.reconfigureItems(at: cv.indexPathsForVisibleItems)
        }
    }

    /// حجم صالح للحساب: موجب ومنتهٍ. لا يُحسب تخطيط ولا يُرسم عنصر بغير ذلك (عند الفتح من التبويب تكون الحدود صفرًا قبل أول layout).
    static func isValidSize(_ s: CGSize) -> Bool { s.width.isFinite && s.height.isFinite && s.width > 0 && s.height > 0 }
    /// أقصى عدد صفحات تُرسم معًا: صفحتان أثناء الانتقال + هامش تقريب واحد. أكثر من ذلك = عطل حجم (شبكة مصغّرة).
    static var maxVisiblePages: Int { 3 }

    /// هندسة التقليب (نقية، تُختبر على 604 صفحة × كل الأحجام): RTL — الصفحة n عند x = (count − n)·w.
    static func offsetX(page n: Int, width w: CGFloat, count: Int) -> CGFloat { CGFloat(count - min(max(n, 1), count)) * w }
    static func page(atOffsetX x: CGFloat, width w: CGFloat, count: Int) -> Int {
        min(max(count - Int((x / max(w, 1)).rounded()), 1), count)
    }
    /// الصفحات التي يتقاطع حيّزها مع نافذة العرض عند إزاحة معيّنة (أكثر من صفحتين = خلل). حيّز الصفحة n = [X(n), X(n)+w).
    static func visiblePages(atOffsetX x: CGFloat, width w: CGFloat, count: Int) -> [Int] {
        (1...count).filter { n in let lo = offsetX(page: n, width: w, count: count); return lo < x + w - 0.001 && lo + w > x + 0.001 }
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

        /// لا عناصر قبل أن تكون الحدود صالحة: لا خلية تُهيّأ ولا إطار يُرسم بحجم خاطئ.
        func collectionView(_ cv: UICollectionView, numberOfItemsInSection s: Int) -> Int { MushafPager.isValidSize(cv.bounds.size) ? parent.count : 0 }

        /// يُستدعى من layoutSubviews عند أول حدود صالحة أو تغيّرها (دوران/safe area/الشريط العائم): يعيد البناء ويبقي الصفحة الحالية.
        func sizeChanged(_ cv: UICollectionView) {
            cv.collectionViewLayout.invalidateLayout()
            cv.reloadData()
            cv.layoutIfNeeded()
            let target = shown > 0 ? shown : parent.current
            cv.scrollToItem(at: IndexPath(item: target - 1, section: 0), at: .centeredHorizontally, animated: false)
            shown = target; pendingScroll = false
        }

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

/// تخطيط المُقلِّب: حجم العنصر يُشتق دائمًا من حدود الـcollectionView الفعلية (لا القيمة الافتراضية 50×50 لـFlowLayout التي كانت تُظهر 604 صفحة مصغّرة في شبكة)،
/// ولا يُنتج أي عنصر عند حجم صفري/سالب، ويقصّ النتيجة عند `maxVisiblePages`.
final class MushafPagerLayout: UICollectionViewFlowLayout {
    private var valid = false

    override func prepare() {
        let size = collectionView?.bounds.size ?? .zero
        valid = MushafPager<EmptyView>.isValidSize(size)
        if valid, itemSize != size { itemSize = size }
        if valid { super.prepare() }
    }

    override var collectionViewContentSize: CGSize { valid ? super.collectionViewContentSize : .zero }

    override func shouldInvalidateLayout(forBoundsChange newBounds: CGRect) -> Bool { newBounds.size != collectionView?.bounds.size }

    override func layoutAttributesForElements(in rect: CGRect) -> [UICollectionViewLayoutAttributes]? {
        guard valid else { return [] }
        let all = super.layoutAttributesForElements(in: rect) ?? []
        guard all.count > MushafPager<EmptyView>.maxVisiblePages else { return all }
        let mid = rect.midX
        return Array(all.sorted { abs($0.frame.midX - mid) < abs($1.frame.midX - mid) }.prefix(MushafPager<EmptyView>.maxVisiblePages))
    }

    override func layoutAttributesForItem(at ip: IndexPath) -> UICollectionViewLayoutAttributes? { valid ? super.layoutAttributesForItem(at: ip) : nil }
}

/// يبلّغ المنسّق عند أول حدود صالحة وعند أي تغيّر لاحق في الحجم (دوران، safe area، شريط عائم).
final class MushafPagerCollectionView: UICollectionView {
    var onValidSizeChange: ((UICollectionView) -> Void)?
    private var lastSize: CGSize = .zero

    override func layoutSubviews() {
        let size = bounds.size
        if size != lastSize {
            lastSize = size
            if MushafPager<EmptyView>.isValidSize(size) { onValidSizeChange?(self) }
        }
        super.layoutSubviews()
    }
}
#endif
