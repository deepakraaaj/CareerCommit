-- Minimal schema for the frontend loaders in this project.
-- Run this in the Supabase SQL editor or as a migration.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.resumes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid null references public.profiles(id) on delete cascade,
  name text not null,
  title text,
  template text not null default 'Modern',
  content_text text,
  word_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.resume_versions (
  id uuid primary key default gen_random_uuid(),
  resume_id uuid null references public.resumes(id) on delete cascade,
  user_id uuid null references public.profiles(id) on delete cascade,
  title text not null,
  version_number integer not null default 1,
  saved_by text not null default 'Manual',
  fit_score integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.achievements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid null references public.profiles(id) on delete cascade,
  raw_note text not null,
  resume_bullet text,
  project text not null default 'Uncategorized',
  status text not null default 'Draft',
  date date not null default current_date,
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.uploaded_files (
  id uuid primary key default gen_random_uuid(),
  user_id uuid null references public.profiles(id) on delete cascade,
  filename text not null,
  file_type text not null,
  file_size integer not null default 0,
  uploaded_at timestamptz not null default now()
);

create table if not exists public.exports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid null references public.profiles(id) on delete cascade,
  resume_id uuid null references public.resumes(id) on delete cascade,
  format text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.parse_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid null references public.profiles(id) on delete cascade,
  file_id uuid null references public.uploaded_files(id) on delete cascade,
  status text not null default 'Pending',
  extracted_name text,
  extracted_role text,
  created_at timestamptz not null default now()
);

create table if not exists public.jd_analyses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid null references public.profiles(id) on delete cascade,
  resume_id uuid null references public.resumes(id) on delete cascade,
  jd_text text not null,
  fit_score integer not null default 0,
  matched_skills text[] not null default '{}',
  missing_skills text[] not null default '{}',
  created_at timestamptz not null default now()
);

-- Read-only public access for the demo frontend.
-- Remove or tighten these policies once Supabase Auth is wired in.
alter table public.profiles enable row level security;
alter table public.resumes enable row level security;
alter table public.resume_versions enable row level security;
alter table public.achievements enable row level security;
alter table public.uploaded_files enable row level security;
alter table public.exports enable row level security;
alter table public.parse_jobs enable row level security;
alter table public.jd_analyses enable row level security;

do $$
begin
  create policy "Public read profiles" on public.profiles for select using (true);
exception when duplicate_object then null; end $$;
do $$
begin
  create policy "Public write profiles" on public.profiles for insert with check (auth.uid() = id);
exception when duplicate_object then null; end $$;
do $$
begin
  create policy "Public update profiles" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);
exception when duplicate_object then null; end $$;
do $$
begin
  create policy "Public delete profiles" on public.profiles for delete using (auth.uid() = id);
exception when duplicate_object then null; end $$;

do $$
begin
  create policy "Public read resumes" on public.resumes for select using (true);
exception when duplicate_object then null; end $$;
do $$
begin
  create policy "Public write resumes" on public.resumes for insert with check (true);
exception when duplicate_object then null; end $$;
do $$
begin
  create policy "Public update resumes" on public.resumes for update using (true) with check (true);
exception when duplicate_object then null; end $$;
do $$
begin
  create policy "Public delete resumes" on public.resumes for delete using (true);
exception when duplicate_object then null; end $$;

do $$
begin
  create policy "Public read resume_versions" on public.resume_versions for select using (true);
exception when duplicate_object then null; end $$;
do $$
begin
  create policy "Public write resume_versions" on public.resume_versions for insert with check (true);
exception when duplicate_object then null; end $$;
do $$
begin
  create policy "Public update resume_versions" on public.resume_versions for update using (true) with check (true);
exception when duplicate_object then null; end $$;
do $$
begin
  create policy "Public delete resume_versions" on public.resume_versions for delete using (true);
exception when duplicate_object then null; end $$;

do $$
begin
  create policy "Public read achievements" on public.achievements for select using (true);
exception when duplicate_object then null; end $$;
do $$
begin
  create policy "Public write achievements" on public.achievements for insert with check (true);
exception when duplicate_object then null; end $$;
do $$
begin
  create policy "Public update achievements" on public.achievements for update using (true) with check (true);
exception when duplicate_object then null; end $$;
do $$
begin
  create policy "Public delete achievements" on public.achievements for delete using (true);
exception when duplicate_object then null; end $$;

do $$
begin
  create policy "Public read uploaded_files" on public.uploaded_files for select using (true);
exception when duplicate_object then null; end $$;
do $$
begin
  create policy "Public write uploaded_files" on public.uploaded_files for insert with check (true);
exception when duplicate_object then null; end $$;
do $$
begin
  create policy "Public update uploaded_files" on public.uploaded_files for update using (true) with check (true);
exception when duplicate_object then null; end $$;
do $$
begin
  create policy "Public delete uploaded_files" on public.uploaded_files for delete using (true);
exception when duplicate_object then null; end $$;

do $$
begin
  create policy "Public read exports" on public.exports for select using (true);
exception when duplicate_object then null; end $$;
do $$
begin
  create policy "Public write exports" on public.exports for insert with check (true);
exception when duplicate_object then null; end $$;

do $$
begin
  create policy "Public read parse_jobs" on public.parse_jobs for select using (true);
exception when duplicate_object then null; end $$;
do $$
begin
  create policy "Public write parse_jobs" on public.parse_jobs for insert with check (true);
exception when duplicate_object then null; end $$;
do $$
begin
  create policy "Public update parse_jobs" on public.parse_jobs for update using (true) with check (true);
exception when duplicate_object then null; end $$;

do $$
begin
  create policy "Public read jd_analyses" on public.jd_analyses for select using (true);
exception when duplicate_object then null; end $$;
do $$
begin
  create policy "Public write jd_analyses" on public.jd_analyses for insert with check (true);
exception when duplicate_object then null; end $$;
