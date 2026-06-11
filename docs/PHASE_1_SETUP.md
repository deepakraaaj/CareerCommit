# Phase 1: Foundation - Resume Version Control Setup

## ✅ What Was Implemented

### 1. Database Schema Extension
**Files Modified:**
- `supabase/schema.sql` — Updated resume_versions table definition
- `supabase/migrations/001_add_version_content.sql` — Migration file for the changes

**Changes:**
```sql
ALTER TABLE public.resume_versions ADD COLUMN (
  content_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
  change_notes TEXT,
  section_changes JSONB NOT NULL DEFAULT '{}'::jsonb
);
```

**What each column does:**
- `content_snapshot` — Stores the full EditorContent JSON snapshot for this version
- `change_notes` — User-provided description of what changed (captured in SaveVersionModal)
- `section_changes` — System-detected changes like `{experience: 'modified', skills: 'added'}`

**Indexes Created:**
```sql
CREATE INDEX idx_resume_versions_resume_created ON resume_versions(resume_id, created_at DESC);
CREATE INDEX idx_resume_versions_sections ON resume_versions USING GIN(section_changes);
```

### 2. TypeScript Interface Updates
**File Modified:** `lib/supabase-placeholder.ts`

```typescript
export interface DbResumeVersion {
  id: string
  resume_id: string
  user_id: string
  title: string
  version_number: number
  saved_by: 'Manual' | 'AI Assist' | 'JD Matcher' | 'Upload Parser'
  fit_score: number
  content_snapshot?: Record<string, unknown>    // ✨ NEW
  change_notes?: string                          // ✨ NEW
  section_changes?: Record<string, 'added' | 'modified' | 'removed' | 'unchanged'> // ✨ NEW
  created_at: string
}
```

### 3. New API Endpoint
**File Created:** `app/api/resumes/versions/save/route.ts`

**Purpose:** Saves a new version with full content snapshot and change detection

**Endpoint:** `POST /api/resumes/versions/save`

**Request Body:**
```typescript
{
  resume_id: string
  user_id: string
  title: string
  content_snapshot: EditorContent  // Full structured JSON
  change_notes?: string
  saved_by?: 'Manual' | 'AI Assist' | 'JD Matcher' | 'Upload Parser'
  fit_score?: number
}
```

**Features:**
- Automatically detects which sections changed by comparing current vs previous version
- Populates `section_changes` JSONB with added/modified/removed/unchanged for each section
- Returns created version with all metadata

**Example Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid-123",
    "resume_id": "uuid-456",
    "title": "Version 3",
    "content_snapshot": { /* full editor content */ },
    "change_notes": "Updated Experience section, added AWS cert",
    "section_changes": {
      "experience": "modified",
      "skills": "added",
      "education": "unchanged"
    },
    "saved_by": "Manual",
    "fit_score": 72,
    "created_at": "2026-01-15T10:30:00Z"
  }
}
```

### 4. Enhanced SaveVersionModal
**File Modified:** `components/versions/save-version-modal.tsx`

**Changes:**
- Added export of `SaveVersionData` type for better type safety
- Added `isSaving` prop to show loading state during save
- Added validation to prevent empty titles
- Improved form reset after successful save

### 5. Editor Integration
**File Modified:** `app/editor/page.tsx`

**Changes to `handleSaveVersionConfirm`:**
- Now actually saves to database via `/api/resumes/versions/save`
- Passes full `editorContent` as content_snapshot
- Tracks `isSaving` state to disable UI during request
- Shows success/error feedback
- Updates lastSaved timestamp on success
- Passes `isSaving` state to SaveVersionModal for loading indicator

**New Version Save Flow:**
```
User clicks "Save Version" button
    ↓
SaveVersionModal opens
    ↓
User enters title + change notes + source
    ↓
Modal calls handleSaveVersionConfirm
    ↓
POST /api/resumes/versions/save with:
  - Full editorContent (all fields, customization)
  - User-provided change notes
  - Version title
  - Source (Manual/AI/JD/Upload)
  - Fit score (calculated from form completeness)
    ↓
API endpoint:
  - Compares current content with previous version
  - Detects section changes
  - Inserts complete version record
    ↓
Success → UI updates, version appears in history
```

### 6. Migration & Backfill Scripts
**Files Created:**
- `supabase/migrations/001_add_version_content.sql` — Forward migration
- `supabase/backfill_version_content.sql` — One-time backfill for existing versions

**Backfill Notes:**
- Fills `content_snapshot` for versions that were created before this migration
- Uses current resume content as best-effort snapshot (not historically accurate)
- Only runs if snapshot is empty/null
- Safe to run multiple times (idempotent)

---

## 📋 Setup Instructions

### Option A: Fresh Deploy (Recommended)

1. **Run the migration in Supabase:**
   - Go to Supabase Dashboard → SQL Editor
   - Copy contents of `supabase/migrations/001_add_version_content.sql`
   - Run it

2. **No backfill needed** (starting fresh)

3. **Deploy the updated code:**
   ```bash
   git add .
   git commit -m "feat: phase 1 - add version content snapshots"
   git push
   ```

### Option B: Existing Database with Data

1. **Backup your database** (important!)

2. **Run the migration:**
   - Copy `supabase/migrations/001_add_version_content.sql` to Supabase SQL Editor
   - Execute it

3. **Backfill existing versions:**
   - Copy `supabase/backfill_version_content.sql` to Supabase SQL Editor
   - Execute it
   - Check the result count to confirm backfill worked

4. **Deploy the code:**
   ```bash
   git add .
   git commit -m "feat: phase 1 - add version content snapshots"
   git push
   ```

---

## ✨ What You Can Do Now

### With Phase 1 Complete:

✅ **Save versions with full content** — Every version now has a complete snapshot
✅ **Track what changed** — `section_changes` shows which sections were modified
✅ **Capture change notes** — User descriptions are persisted to database
✅ **Version history with context** — Database now has all data needed for restore/compare
✅ **Audit trail** — Know what changed, when, and by whom for each version

### Coming in Phase 2:

🔮 **Restore functionality** — Load old versions, optionally cherry-pick sections
🔮 **Compare versions** — Show field-level diffs between versions
🔮 **Version details UI** — Display change notes and section changes in version cards

---

## 🧪 Testing Your Setup

### 1. Create a Test Version

1. Go to the Editor (`/editor`)
2. Make some edits (add a skill, modify a bullet, etc.)
3. Click "Save" (saves draft)
4. Click "Save Version"
5. Fill in the modal:
   - Title: "Test Version 1"
   - Change Note: "Added AWS certification"
   - Source: "Manual"
6. Click "Save Version"

### 2. Check the Database

Open Supabase SQL Editor and run:

```sql
SELECT
  id,
  title,
  change_notes,
  section_changes,
  created_at
FROM public.resume_versions
ORDER BY created_at DESC
LIMIT 5;
```

You should see:
- `change_notes` is populated with your entry
- `section_changes` shows which sections changed
- `content_snapshot` contains the full JSON (select it separately to view)

### 3. View Content Snapshot

```sql
SELECT
  title,
  content_snapshot->>'name' as name,
  content_snapshot->>'title' as job_title,
  content_snapshot->>'summary' as summary_preview
FROM public.resume_versions
ORDER BY created_at DESC
LIMIT 1;
```

### 4. Test Multiple Versions

Create 2-3 more versions with different changes to see `section_changes` vary:
- Version 2: Only update summary (experience/education/skills unchanged)
- Version 3: Add a skill and modify experience

Then query:
```sql
SELECT title, section_changes FROM resume_versions ORDER BY created_at;
```

You should see different section_changes patterns.

---

## 📊 Data Model Now Looks Like

```
resume_versions (after Phase 1)
┌──────────────────────────────────────┐
│ id: uuid                              │
│ resume_id: uuid                       │
│ user_id: uuid                         │
│ title: text              (e.g., "V 3")│
│ version_number: int                   │
│ saved_by: text           (Manual/AI)  │
│ fit_score: int                    (72)│
│ ✨ content_snapshot: jsonb         │
│ ✨ change_notes: text                │
│ ✨ section_changes: jsonb         │
│ created_at: timestamp                │
└──────────────────────────────────────┘
```

### content_snapshot Structure
```json
{
  "name": "Alex Morgan",
  "title": "Senior Engineer",
  "email": "...",
  "phone": "...",
  "linkedin": "...",
  "github": "...",
  "summary": "...",
  "experiences": [
    {
      "id": "exp-1",
      "company": "...",
      "position": "...",
      "duration": "...",
      "bullets": [...]
    }
  ],
  "educationEntries": [...],
  "skills": [...],
  "customFields": [...],
  "accentColor": "blue",
  "density": "auto",
  "fontFamily": "sans"
}
```

### section_changes Structure
```json
{
  "name": "unchanged",
  "title": "modified",
  "summary": "modified",
  "experiences": "modified",
  "education": "unchanged",
  "skills": "added",
  "customFields": "unchanged",
  "accentColor": "unchanged",
  "density": "unchanged",
  "fontFamily": "unchanged"
}
```

---

## 🔗 Files Changed Summary

| File | Change | Impact |
|------|--------|--------|
| `supabase/schema.sql` | Added 3 columns to resume_versions | Schema documentation |
| `supabase/migrations/001_add_version_content.sql` | Migration script | Must run in Supabase |
| `supabase/backfill_version_content.sql` | Backfill script | One-time optional cleanup |
| `lib/supabase-placeholder.ts` | Updated DbResumeVersion interface | TypeScript types |
| `app/api/resumes/versions/save/route.ts` | New endpoint | Version saving with content |
| `components/versions/save-version-modal.tsx` | Enhanced modal | UI improvements |
| `app/editor/page.tsx` | Integrated version save | Actually saves versions now |

---

## 🎯 Next Steps

### After verifying Phase 1 works:

1. **Proceed to Phase 2** — Implement restore functionality
   - Create RestoreModal component
   - Add version content retrieval
   - Implement cherry-pick restore

2. **Monitor performance** — Check if indexes help with large version lists

3. **Plan Phase 3** — Compare functionality
   - Build diff algorithm
   - Create CompareModal component
   - Test with multiple versions

---

## 🚨 Troubleshooting

### Issue: "missing column" error when saving version

**Solution:** 
- Make sure you ran the migration in Supabase
- Check `Resume_versions` table has the new columns
- Clear browser cache/localStorage if needed

### Issue: Change notes not appearing in database

**Verify:**
```sql
SELECT change_notes FROM resume_versions ORDER BY created_at DESC LIMIT 1;
```

If NULL, check that SaveVersionModal is properly passing `changeNote` value.

### Issue: section_changes is empty `{}`

**Expected behavior:** 
- For first version ever created → all sections marked "added"
- For subsequent versions → compares to previous version

**Debug:**
```sql
SELECT 
  title,
  section_changes,
  created_at
FROM resume_versions 
ORDER BY version_number DESC
LIMIT 5;
```

---

## 📚 Related Documentation

- See [VERSION_CONTROL_GUIDE.md](VERSION_CONTROL_GUIDE.md) for the complete system design
- See [memory/resume-versioning.md](.claude/projects/-home-deepakrajb-Downloads-career-commit-frontend-build/memory/resume-versioning.md) for architectural notes
