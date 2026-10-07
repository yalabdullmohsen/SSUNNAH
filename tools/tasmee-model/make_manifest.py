#!/usr/bin/env python3
"""manifest للنموذج المحوَّل: كل ملف بحجمه وSHA-256 — يعتمد عليه منزِّل النموذج (استكمال عند الانقطاع + تحقق)."""
import hashlib, json, os, sys

folder, model_id, upstream, license_id, out = sys.argv[1:6]
files = []
for root, _, names in os.walk(folder):
    for n in sorted(names):
        if n.endswith(".mlcomputeplan.json") or n == ".DS_Store":
            continue
        p = os.path.join(root, n)
        h = hashlib.sha256()
        with open(p, "rb") as f:
            for chunk in iter(lambda: f.read(1 << 20), b""):
                h.update(chunk)
        files.append({"path": os.path.relpath(p, folder), "size": os.path.getsize(p), "sha256": h.hexdigest()})
files.sort(key=lambda x: x["path"])
manifest = {
    "modelId": model_id,
    "format": "whisperkit-coreml",
    "upstream": upstream,
    "license": license_id,
    "totalBytes": sum(f["size"] for f in files),
    "baseUrl": None,  # يُحدَّد عند اختيار الاستضافة (GitHub Releases / Supabase Storage / CDN)
    "files": files,
}
json.dump(manifest, open(out, "w"), ensure_ascii=False, indent=1)
print(model_id, len(files), "files", round(manifest["totalBytes"] / 1e6, 1), "MB")
