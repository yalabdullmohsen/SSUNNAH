import fs from "node:fs"; import { writeJSON } from "./lib.mjs";
const d="../audit-main/artifacts/majalis/public/data/hadith-verified/"; const all=[];
for(const f of fs.readdirSync(d).filter(f=>!f.includes("manifest")).sort()) JSON.parse(fs.readFileSync(d+f)).forEach((h,i)=>all.push({...h,_file:"public/data/hadith-verified/"+f,_idx:i}));
const has=(s,re)=>re.test(s||"");
const out=[]; let collMis=0, numMis=0;
for (const h of all) {
  const s=h.source_name||"";
  const B=has(s,/صحيح البخاري|رواه البخاري|^البخاري|البخاري \(?\d/)&&!has(s,/الأدب المفرد/)||has(s,/متفق عليه/); const M=has(s,/صحيح مسلم|رواه مسلم|^مسلم|مسلم \(?\d/)||has(s,/متفق عليه/);
  const expect = B&&M?"mutafaq":B?"bukhari":M?"muslim":has(s,/الترمذي/)?"tirmidhi":has(s,/أبي داود|أبو داود/)?"abudawud":has(s,/النسائي/)?"nasai":has(s,/ابن ماجه/)?"ibnmajah":"various";
  const c=h.collection;
  const claimsSahihayn=["bukhari","muslim","mutafaq"].includes(c);
  if (claimsSahihayn && !(B||M)) { collMis++; out.push({section:"الأحاديث",file:h._file,ref:`${h.id} (#${h._idx})`,type:"collection يدّعي الصحيحين والمصدر غيرهما",sev:"حرج",fix:`collection=${c} و source_name=«${s}» ← collection=${expect}`}); }
  else if (claimsSahihayn && expect!==c && ["bukhari","muslim","mutafaq"].includes(expect)) { collMis++; out.push({section:"الأحاديث",file:h._file,ref:`${h.id} (#${h._idx})`,type:"collection يخالف source_name",sev:"متوسط",fix:`collection=${c} ← ${expect} («${s}»)`}); }
  const numsInSrc=(s.match(/\((\d+)\)/g)||[]).map(x=>x.replace(/\D/g,""));
  const hn=String(h.hadith_number??"").replace(/[^\d]/g,"");
  if (hn && numsInSrc.length && !numsInSrc.includes(hn)) { numMis++; out.push({section:"الأحاديث",file:h._file,ref:`${h.id} (#${h._idx})`,type:"hadith_number يخالف رقم المصدر",sev:"متوسط",fix:`hadith_number=${h.hadith_number} والمصدر «${s}»`}); }
  if (h.hadith_number!=null && /[a-z]/i.test(String(h.hadith_number)) ) out.push({section:"الأحاديث",file:h._file,ref:`${h.id} (#${h._idx})`,type:"hadith_number رمز داخلي لا رقم",sev:"متوسط",fix:String(h.hadith_number)});
}
writeJSON("b2-coll.json",out); console.log({collMis,numMis,total:out.length}); const t={}; out.forEach(x=>t[x.type+"|"+x.sev]=(t[x.type+"|"+x.sev]||0)+1); console.log(t);
