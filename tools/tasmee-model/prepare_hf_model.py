#!/usr/bin/env python3
"""
يجهّز مستودع tarteel-ai/whisper-<size>-ar-quran للتحويل:
1) ينزّل الإعدادات والـtokenizer والأوزان (pytorch_model.bin فقط متوفر في المستودع).
2) يحمّل الأوزان بـtorch.load(weights_only=True) (مُفكّك pickle مقيَّد بالتنسورات — لا تنفيذ شيفرة)
   ويحفظها model.safetensors؛ لأن transformers يرفض pickle مع torch<2.6 وwhisperkittools يثبّت torch==2.5.0.
3) يضيف generation_config.json من openai/whisper-<size> (يحوي alignment_heads المطلوبة للتحويل؛ النموذج مضبوط من الأصل نفسه).
4) يولّد tokenizer.json (WhisperTokenizerFast) من vocab/merges الخاصة بالنموذج ليُشحن مع الحزمة فلا يحتاج WhisperKit شبكة وقت التشغيل.
"""
import os, sys, urllib.request
import torch
from huggingface_hub import snapshot_download
from safetensors.torch import save_file
from transformers import WhisperTokenizerFast

size, root = sys.argv[1], sys.argv[2]
name = f"whisper-{size}-ar-quran"
d = snapshot_download(f"tarteel-ai/{name}", allow_patterns=["*.json", "*.txt", "pytorch_model.bin"], local_dir=f"{root}/{name}")
sd = torch.load(f"{d}/pytorch_model.bin", map_location="cpu", weights_only=True)
sd = {k: v.contiguous().clone() for k, v in sd.items()}
save_file(sd, f"{d}/model.safetensors", metadata={"format": "pt"})
os.remove(f"{d}/pytorch_model.bin")
urllib.request.urlretrieve(f"https://huggingface.co/openai/whisper-{size}/resolve/main/generation_config.json", f"{d}/generation_config.json")
WhisperTokenizerFast.from_pretrained(d).save_pretrained(f"{root}/tok-{size}")
print(name, len(sd), "tensors", round(sum(v.numel() for v in sd.values()) / 1e6, 1), "M params")
