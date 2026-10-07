#!/usr/bin/env python3
"""
يتحقق من إصدار GitHub منشور وفق manifest: يعيد تنزيل كل أرشيف من رابطه المثبَّت بالوسم ويطابق الحجم وSHA-256،
يجرّب الاستكمال (Range) فعليًا، ويفك الأرشيف ويطابق حجم وSHA-256 كل ملف داخله.
الاستعمال: verify_release.py <manifest.json> [...]   — يخرج برمز ≠ 0 عند أي فشل.
"""
import hashlib, io, json, sys, urllib.request, zipfile

def get(url, headers=None):
    return urllib.request.urlopen(urllib.request.Request(url, headers=headers or {}))

def verify(path):
    m = json.load(open(path))
    a = m["archive"]
    ok = True
    def check(cond, msg):
        nonlocal ok
        print(("OK  " if cond else "BAD ") + msg)
        ok = ok and cond
    check("/releases/download/" in a["url"] and "/latest/" not in a["url"] and m.get("releaseTag") in a["url"], f"رابط مثبَّت بالوسم: {a['url']}")
    h = hashlib.sha256(); buf = io.BytesIO()
    with get(a["url"]) as r:
        for chunk in iter(lambda: r.read(1 << 20), b""):
            h.update(chunk); buf.write(chunk)
    check(buf.tell() == a["size"], f"حجم الأرشيف {buf.tell()} == {a['size']}")
    check(h.hexdigest() == a["sha256"], f"SHA-256 للأرشيف {a['name']}")
    # استكمال حقيقي: اطلب النصف الثاني بترويسة Range وقارنه
    half = a["size"] // 2
    with get(a["url"], {"Range": f"bytes={half}-"}) as r:
        tail = r.read()
        check(r.status == 206, f"Range يرجع 206 (الحالة {r.status})")
    check(tail == buf.getvalue()[half:], "بايتات الاستكمال تطابق الأصل")
    z = zipfile.ZipFile(buf)
    check(all(i.compress_type == zipfile.ZIP_STORED for i in z.infolist() if not i.is_dir()), "الأرشيف بلا ضغط (stored)")
    for f in m["files"]:
        data = z.read(f["path"])
        check(len(data) == f["size"] and hashlib.sha256(data).hexdigest() == f["sha256"], f"ملف {f['path']}")
    return ok

sys.exit(0 if all([verify(p) for p in sys.argv[1:]]) else 1)
