# usage: cd artifacts/majalis && python3 <this> <out.json>  (قراءةٌ فقط) — يمسح كل مجلدات المحتوى لا knowledge فقط
import json,os,re,sys,collections
GROUPS={'quiz':['public/data/quiz'],'tafsir':['public/data/tafsir'],'stories':['public/data/stories'],'lessons':['public/data/lessons'],'qa':['public/data/qa'],
 'fiqh':['public/data/fiqh'],'history':['public/data/knowledge/history'],'content':['content'],'docs-content':['../../docs/content']}
SKIP_KEYS={'text_uthmani','uthmani','arabic','ayah','text','aya','verse'}  # نصّ القرآن محميّ
def norm(s):
    s=re.sub(r'[ً-ْـ]','',s);return re.sub(r'\s+',' ',s).strip()
def walk(o,path,out):
    if isinstance(o,str):
        if len(o)>=50 and re.search(r'[؀-ۿ]',o):
            for p in o.split('\n'):
                n=norm(p)
                if len(n)>=50:out.append((path,n))
    elif isinstance(o,list):
        for x in o:walk(x,path,out)
    elif isinstance(o,dict):
        for k,v in o.items():
            if k in SKIP_KEYS:continue
            walk(v,k,out)
res={};allp=[]
for g,dirs in GROUPS.items():
    paras=[];nf=0
    for d in dirs:
        for r,_,fs in os.walk(d):
            for f in fs:
                p=os.path.join(r,f)
                if f.endswith('.json'):
                    try:j=json.load(open(p))
                    except:continue
                    o=[];walk(j,'',o)
                    paras+=[(p,k,n) for k,n in o];nf+=1
                elif f.endswith('.md'):
                    nf+=1
                    for l in open(p,encoding='utf-8'):
                        n=norm(l.lstrip('#-*> '))
                        if len(n)>=50:paras.append((p,'md',n))
    ex=collections.defaultdict(list)
    for p,k,n in paras:ex[n].append((p,k))
    dup={n:v for n,v in ex.items() if len({x[0] for x in v})>1}
    res[g]={'files':nf,'paras':len(paras),'exact_dup_texts':len(dup),'occurrences':sum(len(v) for v in dup.values()),
     'top':[{'text':n[:110],'count':len(v),'files':len({x[0] for x in v}),'keys':sorted({x[1] for x in v})[:3],'sample':sorted({x[0] for x in v})[:4]} for n,v in sorted(dup.items(),key=lambda kv:-len(kv[1]))[:25]]}
    for n,v in dup.items():allp.append((len(v),n,g))
    print(g,nf,len(paras),len(dup),sum(len(v) for v in dup.values()))
phr=['كما في العرض المعتمد','ملاحظة منهجية','خاتمة منهجية','العرض المعتمد','قيد التوثيق','قيد المراجعة']
cnt=collections.Counter();cf=collections.defaultdict(set)
for g,dirs in GROUPS.items():
    for d in dirs:
        for r,_,fs in os.walk(d):
            for f in fs:
                if f.endswith(('.json','.md')):
                    t=open(os.path.join(r,f),encoding='utf-8',errors='ignore').read()
                    for k in phr:
                        c=t.count(k)
                        if c:cnt[(g,k)]+=c;cf[(g,k)].add(os.path.join(r,f))
res['phrases']={f'{g}|{k}':{'count':c,'files':len(cf[(g,k)]),'sample':sorted(cf[(g,k)])[:3]} for (g,k),c in cnt.items()}
res['priority']=[{'count':c,'group':g,'text':n[:110]} for c,n,g in sorted(allp,reverse=True)[:40]]
json.dump(res,open(sys.argv[1],'w'),ensure_ascii=False,indent=1)
print({k:v['count'] for k,v in res['phrases'].items()})
