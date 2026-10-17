# usage: cd artifacts/majalis/public/data/knowledge && python3 <this> <out.json>  (قراءةٌ فقط)
import json,glob,re,collections,difflib,sys
files=sorted(glob.glob('*/*.json'))
paras=[];heads=collections.defaultdict(list);ph=collections.Counter();phf=collections.defaultdict(set)
PH=['كما في العرض المعتمد','ملاحظة منهجية','العرض المعتمد','المعجزات والآيات البينات','أصل الدعوة']
nfile=0
for f in files:
    if f.endswith('manifest.json'):continue
    try:j=json.load(open(f))
    except:continue
    items=j if isinstance(j,list) else [j]
    for it in items:
        if not isinstance(it,dict):continue
        b=it.get('body')
        if not isinstance(b,str):continue
        nfile+=1
        sec=None
        for p in b.split('\n'):
            p=p.strip()
            if not p:continue
            if p.startswith('#'):
                sec=p.lstrip('# ').strip();heads[sec].append(f);continue
            n=re.sub(r'[ً-ْـ]','',p);n=re.sub(r'\s+',' ',n)
            if len(n)>=40:paras.append((f,ssec if False else sec,n))
        for k in PH:
            c=b.count(k)
            if c:ph[k]+=c;phf[k].add(f)
print('entries',nfile,'paras',len(paras))
ex=collections.defaultdict(list)
for f,s,n in paras:ex[n].append((f,s))
exd={n:v for n,v in ex.items() if len({x[0] for x in v})>1}
print('exact-dup paragraphs across files',len(exd),'occurrences',sum(len(v) for v in exd.values()))
# near: normalize by removing the proper names? use token-set jaccard on 5-shingles
def sh(n):
    w=n.split();return {' '.join(w[i:i+4]) for i in range(max(1,len(w)-3))}
S=[(f,s,n,sh(n)) for f,s,n in paras if n not in exd]
inv=collections.defaultdict(list)
for i,(_,_,_,x) in enumerate(S):
    for g in x:inv[g].append(i)
near=set()
for i,(f,s,n,x) in enumerate(S):
    c=collections.Counter()
    for g in x:
        if len(inv[g])<30:
            for j in inv[g]:
                if j>i:c[j]+=1
    for j,k in c.items():
        if S[j][0]!=f and k/ max(1,min(len(x),len(S[j][3])))>=0.6:near.add((i,j))
print('near-dup pairs (>=0.6 4-gram overlap) across files',len(near))
json.dump({'exact':[{'text':n[:140],'where':v} for n,v in sorted(exd.items(),key=lambda kv:-len(kv[1]))[:40]],
 'near':[{'a':[S[i][0],S[i][1],S[i][2][:100]],'b':[S[j][0],S[j][1]]} for i,j in sorted(near)[:60]],
 'phrases':{k:{'count':ph[k],'files':sorted(phf[k])} for k in PH},
 'heads':{h:len(v) for h,v in heads.items() if len(set(v))>=3}},open(sys.argv[1] if len(sys.argv)>1 else 'content-duplication.json','w'),ensure_ascii=False,indent=1)
print({k:(ph[k],len(phf[k])) for k in PH})
print(sorted(((len(set(v)),h) for h,v in heads.items()),reverse=True)[:12])
