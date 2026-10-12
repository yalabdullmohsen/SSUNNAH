## 2) يُجلب من الشبكة (متغيّر أو كبير)

| المجموعة | المصدر | الشكل | الحجم | سبب الشبكة |
|---|---|---|---|---|
| الدروس | `public/data/lessons/{chunk-000,feed,manifest}.json` + `archive/YYYY-MM.json`؛ Supabase `lessons` (~325) | `[{id,external_key,title,speaker_name,sheikh_image_url,poster_image_url,category,city,region,mosque,day_of_week,lesson_time,schedule,description}]`؛ archive `{month,items:[{id,type,title_ar,summary_ar,sheikh,place,audience,starts_at,time_text,register_url,schedule_kind,women_attendance,…}]}` | 0.25 MB | يتغيّر يوميًا |
| الأسئلة الشرعية (QA) | `qa/*.json` (32) + `categories.json` `[{id,name,slug}]`؛ Supabase `qa_questions` (~370) | `{id,documentation_status,question,answer,category_id,ruling_type,evidence,reference,status,review_status,created_at,trust_level,editorial_review_status,last_updated_at}` | 2.7 MB | محتوى حي يُراجع؛ لم يُدقَّق للتحزيم |
| القصص | `stories/<تصنيف>-NNN.json` + `manifest.json`؛ Supabase `islamic_stories` (62), `prophet_stories` (25) | `{id:int,slug,title,category,era,icon,summary,full_content,key_lessons,related_figures,sources,tags,is_approved:bool,trust_level,editorial_review_status,last_updated_at}` | 1.9 MB | بانتظار توثيق المصادر |
| المعرفة | `knowledge/{manifest,nations/*,prophets/*,quiz/*,quran-people,tafsir/*,discover-islam,history,intro-islam}` | عنصر `{id,title,body,evidences:[{type,ref,text,grade,graded_by}],sources:[{book,author,locator}],tags,related,review_status,updated_at,section,meta}` | 8.4 MB | `review_status` يحدد الصلاحية؛ يُحزم `verified` فقط عند اعتماده |
| البحث | `search/index.json` `{version,count:4639,docs:[{id,kind,titleAr,href,norm,meta}]}` | | 1.8 MB | روابط الويب؛ التطبيق يبني فهرسه الخاص |
| المصادر/الحسابات | `sources/*` | `{version,updated_at,accounts:[{id,platform,handle,url,name_ar,kind,topics,…}]}` | 41 KB | تشغيلي للأتمتة فقط |
| الفقه | `fiqh/manifest.json` | `{version,contentType,checksum,files:[],offlineEligible}` | فارغ | لا محتوى بعد |
| علَم تشغيل | `{adhan-audio,quran-audio,tafsir-audio}-remote.json`, `tasmee-{flags,model}.json`, `tafsir-audio-{catalog,map}.json` | أعلام تعطيل/إعداد `{updatedAt,disabled*:[],notes}` | <2 KB | تحكم عن بُعد؛ التسميع معطّل افتراضيًا |
