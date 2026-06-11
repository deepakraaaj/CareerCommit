# Phase 1 Quick Start Checklist

## 🚀 Get Running in 5 Minutes

### Step 1: Run the Database Migration (2 min)

1. Open [Supabase Dashboard](https://supabase.com)
2. Go to your project → **SQL Editor**
3. **Create new query** and paste:

```sql
-- Add new columns to resume_versions table
alter table public.resume_versions
add column if not exists content_snapshot jsonb default '{}'::jsonb,
add column if not exists change_notes text,
add column if not exists section_changes jsonb default '{}'::jsonb;

-- Create indexes
create index if not exists idx_resume_versions_resume_created
on public.resume_versions(resume_id, created_at desc);

create index if not exists idx_resume_versions_sections
on public.resume_versions using gin(section_changes);
```

4. Click **Run** ✓

### Step 2: Deploy Code Changes (1 min)

```bash
cd /home/deepakrajb/Downloads/career-commit-frontend-build

git add .
git commit -m "feat: phase 1 - add version content snapshots with change tracking"
git push origin main
```

### Step 3: Test It (2 min)

1. Open `/editor` in your browser
2. Make a small change (add a skill, modify a bullet)
3. Click **[Save]** button → confirm draft saves
4. Click **[Save Version]** button
5. Fill the modal:
   - Title: `Test V1`
   - Change Note: `Testing version saves`
   - Source: `Manual`
6. Click **Save Version** ✓

### Step 4: Verify in Database (1 min)

Open Supabase SQL Editor:

```sql
SELECT 
  title,
  change_notes,
  section_changes,
  jsonb_pretty(content_snapshot->>'name' as name) as name
FROM public.resume_versions
ORDER BY created_at DESC
LIMIT 1;
```

You should see your test version with all fields populated! ✓

---

## ✅ Phase 1 Complete!

**What works now:**
- ✅ Versions capture full content snapshots
- ✅ Change notes are stored in database
- ✅ System automatically detects section changes
- ✅ All data ready for Phase 2 (restore/compare)

**Next:** Proceed to [Phase 2 Setup](PHASE_2_SETUP.md) for restore functionality (coming soon)

---

## 📊 What Gets Stored

Each version now includes:

```
✅ content_snapshot: Full resume data (all fields, customization)
✅ change_notes: User's description ("Updated Experience section...")
✅ section_changes: What changed ({experience: 'modified', skills: 'added'})
✅ saved_by: How it was created (Manual, AI Assist, JD Matcher, Upload)
✅ fit_score: Quality score (calculated from form completeness)
```

---

## 🆘 Stuck?

**Issue:** "Relation resume_versions does not exist" or column errors
- → Make sure migration ran successfully in Supabase
- → Check the SQL Editor shows no errors

**Issue:** Can't create versions or getting 500 error
- → Check browser console for error messages
- → Verify Supabase credentials in `.env.local`

**Issue:** Change notes not appearing
- → Make sure SaveVersionModal value is passed to handleSaveVersionConfirm
- → Check the console logs show the request was sent

**Still stuck?** See full troubleshooting in [PHASE_1_SETUP.md](PHASE_1_SETUP.md#-troubleshooting)

---

## 📝 Files Modified

Core changes (7 files):
- ✏️ `supabase/schema.sql` — Schema definition
- ✏️ `lib/supabase-placeholder.ts` — TypeScript types
- ✏️ `app/editor/page.tsx` — Version save logic
- ✏️ `components/versions/save-version-modal.tsx` — Enhanced modal
- ✨ `app/api/resumes/versions/save/route.ts` — New API endpoint
- ✨ `supabase/migrations/001_add_version_content.sql` — DB migration
- ✨ `supabase/backfill_version_content.sql` — Optional backfill

---

## 🎯 Phase Roadmap

| Phase | Feature | Status |
|-------|---------|--------|
| **Phase 1** | Content snapshots + change tracking | ✅ **COMPLETE** |
| **Phase 2** | Restore versions with cherry-pick | ⏳ Next |
| **Phase 3** | Compare versions side-by-side | 🔮 Later |
| **Phase 4** | UI polish + performance optimization | 🔮 Future |

---

That's it! You now have a **production-ready version control foundation** for resumes. 🎉
