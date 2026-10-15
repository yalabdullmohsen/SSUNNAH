#!/usr/bin/env python3
"""فحص تباين شريط الحالة وعنوان شريط التنقل في لقطة شاشة (≥ 4.5:1 مقابل خلفية الشريط).
استعمال: native-bar-contrast.py <png>... ؛ يطبع `path<TAB>OK|BAR_CONTRAST:<نسبة>:<منطقة>` ويخرج 1 عند أي فشل.
يُستدعى أيضًا من native-audit-analyze.sh فيحوّل الحكم OK إلى BAR_CONTRAST عند الفشل. سبب الإضافة: عنوان وساعة داكنان على ترويسة خضراء في الوضع الفاتح."""
import sys
from collections import Counter

MIN = 4.5
# مناطق نسبية (من ارتفاع/عرض اللقطة): شريط الحالة كاملًا، وعنوان شريط التنقل في الوسط (بعيدًا عن أزرار الزجاج الجانبية)
BANDS = {"statusbar": (0.018, 0.062, 0.0, 1.0), "navtitle": (0.07, 0.125, 0.44, 0.72)}

def lin(c):
    c /= 255
    return c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4

def lum(p):
    return 0.2126 * lin(p[0]) + 0.7152 * lin(p[1]) + 0.0722 * lin(p[2])

def ratio(a, b):
    la, lb = lum(a), lum(b)
    hi, lo = max(la, lb), min(la, lb)
    return (hi + 0.05) / (lo + 0.05)

def check_band(im, y0, y1, x0, x1):
    w, h = im.size
    px = list(im.crop((int(x0 * w), int(y0 * h), int(x1 * w), int(y1 * h))).getdata())
    bg = Counter((r // 4, g // 4, b // 4) for r, g, b in px).most_common(1)[0][0]
    bg = (bg[0] * 4 + 2, bg[1] * 4 + 2, bg[2] * 4 + 2)
    far = sorted(((ratio(bg, p), p) for p in px), key=lambda t: -t[0])
    ink = [p for r, p in far if r >= 1.5]
    if len(ink) < 60:  # لا حبر في المنطقة (لا عنوان)
        return None
    top = ink[: max(30, len(far) // 20)]
    mean = tuple(sum(c[i] for c in top) // len(top) for i in range(3))
    return ratio(bg, mean)

def check(path):
    from PIL import Image
    im = Image.open(path).convert("RGB")
    worst = None
    for name, box in BANDS.items():
        r = check_band(im, *box)
        if r is not None and r < MIN and (worst is None or r < worst[0]):
            worst = (r, name)
    return worst

if __name__ == "__main__":
    bad = 0
    for p in sys.argv[1:]:
        w = check(p)
        print(f"{p}\t" + ("OK" if w is None else f"BAR_CONTRAST:{w[0]:.1f}:{w[1]}"))
        bad |= w is not None
    sys.exit(1 if bad else 0)
