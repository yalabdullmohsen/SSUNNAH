#!/usr/bin/env bash
# حارس يتامى ios-native/Data: كل ملف في المجلد (عدا MANIFEST.json و.input-hash) يجب أن يكون في files من MANIFEST.json
# (يكتبه native-export-data.sh). ملف خارجها = يتيم بقي من تصدير قديم ويدخل الحزمة بلا مصدر. يفشل (1) عند وجود يتيم.
# DATA=<مجلد> يتجاوز المسار (للاختبار).
set -uo pipefail
DATA=${DATA:-ios-native/Data}
[ -f "$DATA/MANIFEST.json" ] || { echo "✗ لا MANIFEST.json في $DATA — شغّل scripts/native-export-data.sh أولًا" >&2; exit 1; }
orph=$(DATA="$DATA" node -e '
const fs=require("fs"),p=require("path"),d=process.env.DATA;
const m=new Set(JSON.parse(fs.readFileSync(p.join(d,"MANIFEST.json"),"utf8")).files.map(f=>f.path));
const out=[];(function w(r){for(const e of fs.readdirSync(p.join(d,r),{withFileTypes:true})){
 const q=r?r+"/"+e.name:e.name; if(e.isDirectory()) w(q);
 else if(q!=="MANIFEST.json"&&q!==".input-hash"&&!m.has(q)) out.push(q);}})("");
console.log(out.join("\n"))') || exit 1
if [ -n "$orph" ]; then echo "✗ ملفات يتيمة في $DATA (ليست في MANIFEST.json): $(echo "$orph" | head -10 | tr '\n' ' ')" >&2; exit 1; fi
echo "✓ لا ملفات يتيمة في $DATA"
