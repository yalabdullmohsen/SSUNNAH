#!/usr/bin/env python3
"""
ينشر نسخ CoreML كإصدار GitHub ثابت: zip بلا ضغط لكل نسخة + README/LICENSE/NOTICE + manifests بروابط releases/download/<الوسم>/…
لا يعدّل إصدارًا منشورًا: يرفض إن كان الوسم موجودًا (أي تحديث = وسم جديد).
الاستعمال: publish_release.py <owner/repo> <tag> <workDir> --variant name=<folder> [--variant ...] [--dry-run]
يستعمل gh المسجَّل دخوله (لا توكنات في أي ملف).
"""
import hashlib, json, os, shutil, subprocess, sys

repo, tag, work = sys.argv[1:4]
args = sys.argv[4:]
dry = "--dry-run" in args
variants = {}
for i, a in enumerate(args):
    if a == "--variant":
        k, v = args[i + 1].split("=", 1)
        variants[k] = v
assert variants, "حدّد --variant name=folder"
here = os.path.dirname(os.path.abspath(__file__))
docs = os.path.join(here, "..", "..", "docs", "tasmee")
out = os.path.join(work, "release", tag)
shutil.rmtree(out, ignore_errors=True)
os.makedirs(out)

if not dry and subprocess.run(["gh", "release", "view", tag, "--repo", repo], capture_output=True).returncode == 0:
    sys.exit(f"الإصدار {tag} موجود — الإصدارات المنشورة لا تُعدَّل. استعمل وسمًا جديدًا.")

# حارس: tokenizer.json وtokenizer_config.json في كل نسخة = الرسميان (يمنع تكرار عطل tokenizer المولَّد الناقص رموز الزمن)
fp = json.load(open(os.path.join(here, "tokenizer", "FINGERPRINT.json")))
def _sha(path):
    return hashlib.sha256(open(path, "rb").read()).hexdigest()
for name, folder in variants.items():
    if _sha(os.path.join(folder, "tokenizer.json")) != fp["tokenizerJsonSha256"] or _sha(os.path.join(folder, "tokenizer_config.json")) != fp["tokenizerConfigSha256"]:
        sys.exit(f"{name}: tokenizer ليس الرسمي — انسخ tools/tasmee-model/tokenizer/tokenizer*.json إلى المجلد")
    if not os.path.exists(os.path.join(folder, "generation_config.json")):
        sys.exit(f"{name}: generation_config.json مفقود (suppress_tokens)")

assets = []
for name, folder in variants.items():
    zname = f"sunnah-whisper-{name}-ar-quran-coreml.zip"
    zpath = os.path.join(out, zname)
    subprocess.run(["zip", "-0", "-r", "-X", "-q", zpath, ".", "-x", "*.mlcomputeplan.json", "-x", ".DS_Store"], cwd=folder, check=True)
    base = name.split("-")[0]
    manifest = os.path.join(docs, f"model-manifest-{name}.json")
    subprocess.run([sys.executable, os.path.join(here, "make_manifest.py"), folder, zpath, f"tasmee-whisper-{name}-ar-quran-coreml",
                    f"tarteel-ai/whisper-{base}-ar-quran", "Apache-2.0", manifest,
                    "--url", f"https://github.com/{repo}/releases/download/{tag}/{zname}", "--tag", tag], check=True)
    shutil.copy(manifest, out)
    assets += [zpath, os.path.join(out, os.path.basename(manifest))]
for n in ("README.md", "LICENSE", "NOTICE"):
    shutil.copy(os.path.join(here, "release", n), out)
    assets.append(os.path.join(out, n))

notes = os.path.join(out, "RELEASE_NOTES.md")
open(notes, "w", encoding="utf-8").write(
    "نسخ CoreML لنموذج Tarteel (تلاوة القرآن) لوضع «تسميع» على الجهاز.\n\n"
    "**مشتق ومحوَّل من `tarteel-ai/whisper-base-ar-quran` (Apache-2.0). التعديل الوحيد هو التحويل إلى CoreML وإرفاق `tokenizer.json` الرسمي من OpenAI Whisper كما هو، بلا تدريب.**\n\n"
    "الترخيص: Apache-2.0 (LICENSE) + NOTICE. بيانات تدريب النموذج الأصلي غير موثّقة في بطاقته.\n\n"
    "هذا الإصدار ثابت: لا يُعدَّل بعد نشره؛ التحديث إصدار جديد بوسم جديد. التطبيق يتحقق من SHA-256 في model-manifest-*.json.\n")
print("assets:", *[os.path.basename(a) for a in assets], sep="\n  ")
if dry:
    print("dry-run: لم يُنشر شيء"); sys.exit(0)
subprocess.run(["gh", "release", "create", tag, "--repo", repo, "--title", f"Whisper Quran CoreML ({tag})", "--notes-file", notes, "--latest=false", *assets], check=True)
print(f"https://github.com/{repo}/releases/tag/{tag}")
