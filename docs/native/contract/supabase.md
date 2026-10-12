## 4) جداول Supabase ذات الصلة (عامة؛ ≈300 جدولًا، كثير منها فارغ)
| الجدول | الصفوف | أعمدة رئيسية | التحزيم |
|---|---|---|---|
| `quiz_questions` | ~958 | id uuid, section, category, level, question, answer, is_published, source_book/author/reference, explanation, verified, tags[], hint | شبكة؛ المُحزَّم من ملفات quiz |
| `qa_questions` | ~370 | id uuid, question, answer, category_id, ruling_type, evidence, reference, status, review_status, verification_status, slug | شبكة |
| `verified_hadith_items` | 342 (6 محذوف) | id text, collection, hadith_number text, title, text, narrator, scholar, source_name, source_url, grade, chapter, keywords[], explanation, verification_status, authenticity_class (sahih 269 / daif 13 / mawdu 19 / بلا 26) | شبكة؛ المُحزَّم من ملفات hadith-verified |
| `verified_adhkar_items` / `_categories` | 51 / — | انظر §1 | `needs_review` كلها ⇒ لا تحزيم |
| `lessons` | ~325 | id uuid, title, sheikh_id, mosque, city, category, schedule, lesson_time, day/start_time/end_time, live_url, audio_url, video_url, verification_status, trust_level, … (~80 عمودًا) | شبكة |
| `prayer_times` | ~19 | id, city, governorate, date, fajr, sunrise, dhuhr, asr, maghrib, isha | **لا يُحزم**: الحساب داخل التطبيق |
| `prophet_stories` | 25 | id, slug, arabic_name, citations jsonb, content, is_approved | شبكة |
| `islamic_stories` | 62 | id, slug, title, category, era, summary, full_content, key_lessons, related_figures, sources, tags, is_approved | شبكة |
| `dawah_questions` | ~85 | — | شبكة (قيد التدقيق) |
