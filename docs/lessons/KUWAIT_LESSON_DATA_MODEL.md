# Kuwait Lesson Data Model (Program 4)

| Field | Value |
|---|---|
| Wave | KUWAIT_LESSONS_MODEL_W1 |
| Runtime SSOT | `artifacts/majalis/src/lib/kuwait-lessons.ts` → `KuwaitLessonRecord` |
| Contract helpers | `artifacts/majalis/src/lib/kuwait-lesson-contract.ts` |
| Seed sample | `artifacts/majalis/public/data/lessons/chunk-000.json` |

## Principles

1. **Never fabricate events** — missing fields stay empty/null; AI may structure/validate only.
2. **Expired / cancelled must not appear as upcoming** — `splitKuwaitLessons` + `cancelledAt`.
3. **Schedule changes must be labelable** — `scheduleChangeNote` → public label `changed`.
4. **Provenance is optional until present** — do not invent `lastVerifiedAt`.

## Canonical record (display + contract)

| Domain | Fields |
|---|---|
| Identity | `id`, `title`, `courseId`, `isCourse` |
| People | `sheikhName`, `organizerName`, `sheikhImage` |
| Place | `governorate`, `region`, `mosque`, `mapsUrl` |
| Schedule | `day`, `time`, `startDate`, `endDate`, `recurring`, `cadenceKind`, `nextOccurrenceMs` |
| Classification | `category`, `subject`, `activityType`, `keywords`, `audience` (via women flags) |
| Attendance | `attendanceMode` (`in_person` \| `online` \| `hybrid` \| `unknown`), `hasLiveStream`, `streamUrl` |
| Media | `lessonImage`, `recordingUrl`, `hasRecording`, `siteUrl`, `bookTitle` |
| Provenance | `source` (`seed`\|`supabase`), `sourceId`, `sourceUrl`, `lastVerifiedAt` |
| Lifecycle | `cancelledAt`, `scheduleChangeNote`, `archivedAt`, `pipelineStatus` |
| Quality | `completeness`, `missingFields` |

### Cadence mapping

| Kind | Signal |
|---|---|
| `daily` | activity text يومي |
| `weekly` | `day_of_week` / weekly recurring |
| `monthly` | course / شهري |
| `one_time` | `is_recurring === false` + explicit dates |
| `recurring_other` | recurring without clear day |
| `unknown` | insufficient schedule data |

### Attendance mapping (`delivery`)

| Seed / row | `attendanceMode` |
|---|---|
| حضور فقط | `in_person` |
| كلاهما | `hybrid` |
| أونلاين / عن بعد | `online` |
| else + mosque + live | `hybrid` |
| else + live only | `online` |
| else + mosque | `in_person` |
| else | `unknown` |

## Filters (product contract — UI may lag)

today · tomorrow · this week · this month · daily · weekly · monthly · in person · online · governorate · area · scholar · subject

Existing runtime filters: search, governorate, region, mosque, sheikh, day, category, timeSlot, activityType, hasLiveStream, contentKind.

## Interactions (product contract)

save · calendar · directions · share · reminder · notify on change · follow scholar/mosque/subject

Bookmark/reminder already partial via app learning surfaces; follow-* are follow-up waves.

## Explicit non-goals (this wave)

- Fabricating `lastVerifiedAt` for seed rows that lack it
- Rebuilding the lessons UI filter bar
- Changing prayer / adhan scheduling
