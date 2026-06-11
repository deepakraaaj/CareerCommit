-- Backfill Script: Populate existing versions with content from resumes table
-- This script fills the content_snapshot column for versions created before the migration
-- Run this ONCE after running the migration 001_add_version_content.sql

-- For versions that don't have content_snapshot yet, fill with the current resume content
-- Note: This is a best-effort approach since we don't have historical resume data
-- The content_snapshot will represent the resume state at the time of backfill, not the exact state at version creation

UPDATE public.resume_versions rv
SET content_snapshot = COALESCE(
  -- Try to parse the resume's content_text as JSON if it exists
  CASE
    WHEN r.content_text IS NOT NULL AND r.content_text != '' THEN
      jsonb_build_object(
        'name', '',
        'title', '',
        'email', '',
        'phone', '',
        'linkedin', '',
        'github', '',
        'summary', r.content_text,
        'experiences', '[]'::jsonb,
        'educationEntries', '[]'::jsonb,
        'skills', '[]'::jsonb,
        'customFields', '[]'::jsonb,
        'accentColor', 'blue',
        'density', 'auto',
        'fontFamily', 'sans'
      )
    ELSE jsonb_build_object(
      'name', '',
      'title', '',
      'email', '',
      'phone', '',
      'linkedin', '',
      'github', '',
      'summary', '',
      'experiences', '[]'::jsonb,
      'educationEntries', '[]'::jsonb,
      'skills', '[]'::jsonb,
      'customFields', '[]'::jsonb,
      'accentColor', 'blue',
      'density', 'auto',
      'fontFamily', 'sans'
    )
  END,
  '{}'::jsonb
)
FROM public.resumes r
WHERE rv.resume_id = r.id
  AND (rv.content_snapshot IS NULL OR rv.content_snapshot = '{}'::jsonb)
  AND r.id IS NOT NULL;

-- Log the result
SELECT
  COUNT(*) as versions_backfilled,
  MAX(updated_at) as last_updated
FROM public.resume_versions
WHERE content_snapshot IS NOT NULL AND content_snapshot != '{}'::jsonb;

-- Note: This backfill creates a best-guess snapshot based on the current resume content.
-- Ideally, you would have a proper data migration that maps historical resume states to versions.
-- For now, at least the structure is in place so new versions will have full snapshots.
