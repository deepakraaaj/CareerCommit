-- Migration: Add version content snapshot and metadata
-- Phase 1: Foundation for resume version control

-- Add new columns to resume_versions table
alter table public.resume_versions
add column if not exists content_snapshot jsonb default '{}'::jsonb,
add column if not exists change_notes text,
add column if not exists section_changes jsonb default '{}'::jsonb;

-- Create index for efficient querying of versions by resume
create index if not exists idx_resume_versions_resume_created
on public.resume_versions(resume_id, created_at desc);

-- Create index for section_changes JSONB queries (future optimization)
create index if not exists idx_resume_versions_sections
on public.resume_versions using gin(section_changes);

-- Add comment to document the new columns
comment on column public.resume_versions.content_snapshot is 'Full EditorContent JSON snapshot for version restoration';
comment on column public.resume_versions.change_notes is 'User-provided description of what changed in this version';
comment on column public.resume_versions.section_changes is 'System-calculated JSON tracking which sections were modified';
