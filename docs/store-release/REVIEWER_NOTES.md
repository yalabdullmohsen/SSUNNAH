# Reviewer Notes — سُنّة 1.0.0 (draft)

Canonical paste pack: `artifacts/majalis/store/app-store/review-notes.md` · `ASC_REVIEW_NOTES_PASTE.txt`.

- App name: سُنّة — Islamic learning (Qur’an mushaf, lessons, prayer times).
- Prayer notifications: **local + optional remote** (`UIBackgroundModes` includes `remote-notification`). Default alert sound for Store RC = **system-default** (see T-047 audio allowlist). Not marketing push.
- Web may differ: browsers do not schedule the same OS local notifications.
- No user-generated social feed; content is curated/published.
- Login may require email confirmation before session (Supabase) — demo/local review path documented in `review-notes.md`.
- ASC paste of demo credentials = **OWNER_ACTION** (confirm still valid before each submission).
