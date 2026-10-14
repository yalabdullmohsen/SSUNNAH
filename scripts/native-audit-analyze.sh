#!/usr/bin/env bash
# تحليل لقطات native-audit-fast.sh: الحالة المعلنة (screen.*) + OCR مُجمَّع بالتوازي + DUP؛ يكتب verdicts.tsv وsummary.md
set -uo pipefail
cd "$(cd "$(dirname "$0")/.." && pwd)"; B=$1
BIN=/tmp/native-ocr-bin; [ "$BIN" -nt scripts/native-snapshot-ocr.swift ] || swiftc -O -o "$BIN" scripts/native-snapshot-ocr.swift 2>&1 | head -3
export BIN B AUDIT_TRUNC=${AUDIT_TRUNC:-$([[ "${FONT:-}" == accessibility* || "$B" == *accessibility* ]] && echo 1 || echo 0)}
one() { IFS=$'\t' read -r route eff comp st <<< "$1"; slug=$(echo "${route#/}" | tr '/:' '__'); [ -z "$slug" ] && slug=root; png="$B/shots/$slug.png"
  v=""; case "$st" in error) v="ERROR:screen.error";; empty) if grep -q "\"${route#/}\":" docs/native/data-exemptions.json; then v="EMPTY_OK:exempt"; else v="EMPTY:screen.empty"; fi;; ok) ;; *) v="NOT_READY:$st";; esac
  [ -z "$v" ] && { [ -s "$png" ] && v=$("$BIN" "$png" "$eff" 2>/dev/null) || v=NOSHOT; }
  txt=$("$BIN" "$png" "$eff" --text 2>/dev/null | python3 -c "import sys,hashlib;c={'الرئيسية','القرآن','الدروس','الصلاة','الأقسام','9:41'};t=sorted({l.strip() for l in sys.stdin if len(l.strip())>1 and l.strip() not in c});print(hashlib.sha256('\n'.join(t).encode()).hexdigest()[:16] if len(t)>=3 else 'few')")
  printf '%s\t%s\t%s\t%s\n' "$route" "$comp" "$v" "$txt"; }
export -f one
tr '\n' '\0' < "$B/states.tsv" | xargs -0 -P 4 -S 4096 -I{} bash -c 'one "$1"' _ {} > "$B/verdicts.raw"
python3 - "$B" <<'PY'
import sys,collections
B=sys.argv[1]; rows=[l.rstrip('\n').split('\t') for l in open(B+'/verdicts.raw')]
seen={}; out=[]
for r,c,v,h in sorted(rows):
    if v=='OK' and h!='few':
        if h in seen and seen[h][1]!=c and seen[h][0].rsplit('/',1)[-1]!=r.rsplit('/',1)[-1]: v='DUP_SCREEN'
        else: seen.setdefault(h,(r,c))
    out.append((r,c,v))
open(B+'/verdicts.tsv','w').write(''.join('\t'.join(x)+'\n' for x in out))
cnt=collections.Counter(v.split(':')[0] if v!='OK' else 'OK' for _,_,v in out)
with open(B+'/summary.md','w') as f:
    f.write(f"المسارات: {len(out)} — "+" — ".join(f"{k}: {n}" for k,n in cnt.most_common())+"\n\n| المسار | المكوّن | الحالة |\n|---|---|---|\n")
    for r,c,v in out:
        if v!='OK': f.write(f"| `{r}` | {c} | {v} |\n")
print(open(B+'/summary.md').read().split('\n')[0])
PY
