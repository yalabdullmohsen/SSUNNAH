-- ====================================================================
-- ROLLBACK — ARABIC_SEARCH_HADITHS_SOURCES (v3)
-- v3 is a superseded NO-OP (see migrations/20261003110000_...v3.sql), so
-- there is nothing to undo. normalize_ar is restored by the v4 rollback
-- and again by the v2 rollback (both idempotent).
-- Reverse order: v5_rollback -> v4_rollback -> v3_rollback -> v2_rollback.
-- ====================================================================
SELECT 1;
