#!/usr/bin/env python3
"""
manifest للنموذج المحوَّل: الأرشيف (zip بلا ضغط) بحجمه وSHA-256 ورابطه المثبَّت بوسم الإصدار، وكل ملف داخله بحجمه وSHA-256.
الاستعمال: make_manifest.py <folder> <zipPath> <modelId> <upstream> <license> <out.json> --url <assetUrl> [--tag <releaseTag>]
يعتمد عليه منزِّل النموذج في التطبيق (استكمال عند الانقطاع + تحقق).
"""
import hashlib, json, os, sys

folder, zip_path, model_id, upstream, license_id, out = sys.argv[1:7]
args = sys.argv[7:]
url = args[args.index("--url") + 1]
tag = args[args.index("--tag") + 1] if "--tag" in args else None


def sha256(path):
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


files = []
for root, _, names in os.walk(folder):
    for n in sorted(names):
        if n.endswith(".mlcomputeplan.json") or n == ".DS_Store":
            continue
        p = os.path.join(root, n)
        files.append({"path": os.path.relpath(p, folder), "size": os.path.getsize(p), "sha256": sha256(p)})
files.sort(key=lambda x: x["path"])
manifest = {
    "modelId": model_id,
    "format": "whisperkit-coreml",
    "upstream": upstream,
    "license": license_id,
    "releaseTag": tag,
    "totalBytes": sum(f["size"] for f in files),
    "archive": {"name": os.path.basename(zip_path), "size": os.path.getsize(zip_path), "sha256": sha256(zip_path), "url": url},
    "files": files,
}
json.dump(manifest, open(out, "w"), ensure_ascii=False, indent=1)
print(model_id, len(files), "files", round(manifest["totalBytes"] / 1e6, 1), "MB; archive", round(manifest["archive"]["size"] / 1e6, 1), "MB")
