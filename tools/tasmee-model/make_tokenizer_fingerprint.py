#!/usr/bin/env python3
"""يكتب tools/tasmee-model/tokenizer/FINGERPRINT.json من tokenizer.json الرسمي المحفوظ (openai/whisper-base؛ tiny مطابق له بايتًا).
الاستعمال: make_tokenizer_fingerprint.py <openaiRepoCommit>"""
import hashlib, json, os, sys
d = os.path.join(os.path.dirname(os.path.abspath(__file__)), "tokenizer")
t = json.load(open(os.path.join(d, "tokenizer.json")))
at = {x["content"]: x["id"] for x in t["added_tokens"]}
sha = lambda f: hashlib.sha256(open(os.path.join(d, f), "rb").read()).hexdigest()
fp = {
    "source": f"openai/whisper-base@{sys.argv[1]} (tokenizer.json مطابق بايتًا لـopenai/whisper-tiny)",
    "license": "MIT",
    "addedTokensCount": len(at),
    "vocabSize": len(t["model"]["vocab"]),
    "specialTokenIds": {k: at[k] for k in ["<|endoftext|>", "<|startoftranscript|>", "<|ar|>", "<|translate|>", "<|transcribe|>", "<|startofprev|>", "<|nocaptions|>", "<|notimestamps|>", "<|0.00|>", "<|30.00|>"]},
    "tokenizerJsonSha256": sha("tokenizer.json"),
    "tokenizerConfigSha256": sha("tokenizer_config.json"),
}
json.dump(fp, open(os.path.join(d, "FINGERPRINT.json"), "w"), ensure_ascii=False, indent=1)
print(json.dumps(fp, ensure_ascii=False, indent=1))
