#!/usr/bin/env python3
"""
نسخة مضغوطة (palettization بـnbits، kmeans) من نموذج CoreML محوَّل: AudioEncoder وTextDecoder فقط (Mel صغير يبقى كما هو).
الاستعمال: quantize.py <converted_mlpackage_dir> <out_dir> <nbits>
المدخل: مجلد فيه AudioEncoder.mlpackage وTextDecoder.mlpackage (يُنتَج بـconvert.sh مع KEEP_MLPACKAGE=1).
الخرج: <out_dir>/{AudioEncoder,TextDecoder}.mlmodelc (مُجمَّعة بـxcrun coremlcompiler).
"""
import os, shutil, subprocess, sys
import coremltools as ct
import coremltools.optimize.coreml as cto

src, out, nbits = sys.argv[1], sys.argv[2], int(sys.argv[3])
os.makedirs(out, exist_ok=True)
cfg = cto.OptimizationConfig(global_config=cto.OpPalettizerConfig(mode="kmeans", nbits=nbits))
for name in ("AudioEncoder", "TextDecoder"):
    model = ct.models.MLModel(os.path.join(src, f"{name}.mlpackage"))
    pal = cto.palettize_weights(model, cfg)
    pkg = os.path.join(out, f"{name}.mlpackage")
    shutil.rmtree(pkg, ignore_errors=True)
    pal.save(pkg)
    subprocess.run(["xcrun", "coremlcompiler", "compile", pkg, out], check=True)
    shutil.rmtree(pkg)
    print(name, f"{nbits}-bit palettized ->", os.path.join(out, f"{name}.mlmodelc"))
