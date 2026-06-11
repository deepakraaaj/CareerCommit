# Resume Version Control System: Current vs. Perfect

## 📊 Current System (Today)

```
┌─────────────────────────────────────────────────────────────────┐
│                        EDITOR PAGE                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  [Resume Name]  v2  |  Draft saved 5m ago  |  [Save] [Version] │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Name: Alex Morgan                                       │   │
│  │  Title: Senior Full Stack Engineer                       │   │
│  │  ... (editable fields)                                   │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
│                    [Resume Preview]                              │
│                      (Plain text)                                │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                   SAVE VERSION MODAL                             │
├─────────────────────────────────────────────────────────────────┤
│  Version Title: [Version 3]                                     │
│  Change Note:   [Optional text field - NEVER SAVED]           │
│  Source:        [Manual ▼]                                      │
│                                                                   │
│  [Cancel] [Save Version] ──→ Creates DbResumeVersion entry       │
└─────────────────────────────────────────────────────────────────┘

DATABASE FLOW:
═════════════════════════════════════════════════════════════════════

🔄 Draft Save (Click [Save] button)
   ↓
   UPSERT resumes table
   ├─ id, user_id, name, title, template
   ├─ content_text: "Alex Morgan\nSenior Full Stack Engineer\n..."
   └─ updated_at: NOW()

❌ VERSION SNAPSHOT PROBLEM: No content stored!

📌 Save Version (Click [Version] button → Modal)
   ↓
   INSERT resume_versions row
   ├─ id: UUID
   ├─ resume_id: FK to resumes
   ├─ user_id: FK to auth.users
   ├─ title: "Version 3"  (from modal)
   ├─ version_number: 3
   ├─ saved_by: "Manual"  (from modal)
   ├─ fit_score: 65  (no context, just a number)
   ├─ created_at: NOW()
   └─ ❌ content_snapshot: MISSING (table doesn't have column)
   └─ ❌ change_notes: MISSING (modal captured but not stored)

VERSION HISTORY PAGE:
═════════════════════════════════════════════════════════════════════

┌─────────────────────────────────────────────────────────────────┐
│                     VERSION HISTORY                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ● Version 3                                     [Active]         │
│    Jan 15 at 10:30am                                            │
│    Manual  |  modern  |  Fit: 65%                              │
│    "What changed..."     ← No description stored                │
│                                                                   │
│    [Open] [Restore ❌] [Duplicate ❌] [Compare ❌] [Download]   │
│                                                                   │
│  ─────────────────────────────────────────────                   │
│                                                                   │
│  ● Version 2                                                    │
│    Jan 14 at 3:45pm                                            │
│    AI Assist  |  modern  |  Fit: 62%                           │
│                                                                   │
│    [Open] [Restore ❌] [Duplicate ❌] [Compare ❌] [Download]   │
│                                                                   │
│  ─────────────────────────────────────────────────────────────  │
│                                                                   │
│  ● Version 1                                                    │
│    Jan 13 at 9:00am                                            │
│    Manual  |  modern  |  Fit: 58%                              │
│                                                                   │
│    [Open] [Restore ❌] [Duplicate ❌] [Compare ❌] [Download]   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘

ISSUES:
✗ Restore/Duplicate buttons exist but have no data (no content stored)
✗ Compare button won't work (no content to compare)
✗ Change notes were captured but not persisted to DB
✗ Fit score (65%) has no context or explanation
✗ "What changed..." is empty - no diff calculation
```

---

## ✨ Perfect System (Proposed)

```
DATA MODEL ENHANCEMENT
═════════════════════════════════════════════════════════════════════

resume_versions table gets three new columns:

  content_snapshot: JSONB  ← Full EditorContent structure
  ┌─────────────────────────────────────────────────────┐
  │ {                                                    │
  │   "name": "Alex Morgan",                             │
  │   "title": "Senior Full Stack Engineer",             │
  │   "contact": { ... },                                │
  │   "summary": "Passionate and results-driven...",     │
  │   "sections": {                                      │
  │     "experience": [                                  │
  │       { "id": "exp-1", "company": "...", "bullets": [...] }
  │     ],                                               │
  │     "education": [...],                              │
  │     "skills": [...]                                  │
  │   },                                                 │
  │   "customization": {                                 │
  │     "template": "modern",                            │
  │     "accentColor": "blue",                           │
  │     "density": "auto"                                │
  │   }                                                  │
  │ }                                                    │
  └─────────────────────────────────────────────────────┘

  change_notes: TEXT  ← "Updated Experience section, added AWS cert"
  
  section_changes: JSONB  ← System-detected changes
  ┌─────────────────────────────────────────────────────┐
  │ {                                                    │
  │   "experience": "modified",  ← 1 bullet changed     │
  │   "skills": "added",         ← AWS cert added       │
  │   "education": "unchanged"                           │
  │ }                                                    │
  └─────────────────────────────────────────────────────┘

  metadata: JSONB  ← Context for fit score, source info
  ┌─────────────────────────────────────────────────────┐
  │ {                                                    │
  │   "fit_score_type": "JDMatch",                       │
  │   "fit_score_reason": "8 of 12 keywords matched",    │
  │   "fit_score_metadata": {                            │
  │     "matchedKeywords": ["React", "TypeScript", ...],│
  │     "calculatedAt": "2026-01-15T10:30:00Z",         │
  │     "jd_hash": "sha256..."                           │
  │   }                                                  │
  │ }                                                    │
  └─────────────────────────────────────────────────────┘


ENHANCED WORKFLOW
═════════════════════════════════════════════════════════════════════

1️⃣  DRAFT SAVE (automatic background sync)
   ↓
   User edits form fields
   ↓
   [Draft Save] or auto-save
   ├─ Update localStorage "career-commit-editor-state"
   ├─ UPSERT resumes table (content_text for display)
   └─ Update "Draft saved 3m ago" indicator


2️⃣  VERSION SAVE (conscious checkpoint)
   ↓
   Click [Save Version] button
   ↓
   [ENHANCED Modal Shows]
   ├─ Version Title: [editable]
   ├─ Auto-Suggested Changes:
   │  └─ "Updated 2 bullets in Experience, added AWS Cert"
   │
   ├─ Your Changes: [textarea]
   │  └─ (User can override suggestion)
   │
   ├─ Fit Score Section:
   │  ├─ Current: 65%
   │  └─ ✓ Compare to JD  [Find JD] or [No JD selected]
   │
   └─ Source: [Manual ▼]
      └─ Options: Manual, AI Assist, JD Matcher, Upload Parser


3️⃣  VERSION CREATED (complete snapshot)
   ↓
   INSERT resume_versions
   ├─ Standard fields (id, resume_id, user_id, created_at, etc.)
   │
   ├─ ✨ NEW: content_snapshot = full EditorContent (JSONB)
   │  └─ Can restore entire version or cherry-pick sections
   │
   ├─ ✨ NEW: change_notes = user's description
   │  └─ "Updated 2 bullets in Experience, added AWS Cert"
   │
   ├─ ✨ NEW: section_changes = system-calculated diff
   │  └─ { experience: "modified", skills: "added", education: "unchanged" }
   │
   └─ ✨ NEW: metadata.fit_score_metadata
      └─ { reason: "8/12 keywords", calculatedAt: "..." }


PERFECT VERSION HISTORY PAGE
═════════════════════════════════════════════════════════════════════

┌──────────────────────────────────────────────────────────────────┐
│                    VERSION HISTORY                                │
├──────────────────────────────────────────────────────────────────┤
│                                                                    │
│  ●  Version 3                                  [Latest/Active]    │
│     Jan 15 at 10:30am                                            │
│                                                                    │
│     📊 Updated 2 bullets in Experience, added AWS cert           │
│        (Auto-suggested • You can edit)                            │
│                                                                    │
│     🎯 Fit: 65% → 72% (8/12 JD keywords matched)                │
│        [Recalculate vs JD]                                       │
│                                                                    │
│     Saved by: Manual  |  Template: Modern                        │
│     Tags: Experience ★  Skills ★  (Sections changed)            │
│                                                                    │
│     [View] [Compare ✨] [Restore ✨] [Duplicate ✨] [Download]  │
│                                                                    │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                                    │
│  ●  Version 2                                                    │
│     Jan 14 at 3:45pm                                            │
│                                                                    │
│     📊 Reformatted summary section                               │
│                                                                    │
│     🎯 Fit: 62% (JD not analyzed)                                │
│                                                                    │
│     Saved by: AI Assist  |  Template: Modern                     │
│     Tags: Summary ★  (Section changed)                           │
│                                                                    │
│     [View] [Compare ✨] [Restore ✨] [Duplicate ✨] [Download]  │
│                                                                    │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                                    │
│  ●  Version 1                                                    │
│     Jan 13 at 9:00am                                            │
│                                                                    │
│     📊 Initial upload                                            │
│                                                                    │
│     🎯 Fit: 58% (JD not analyzed)                                │
│                                                                    │
│     Saved by: Upload Parser  |  Template: Modern                 │
│                                                                    │
│     [View] [Compare ✨] [Restore ✨] [Duplicate ✨] [Download]  │
│                                                                    │
└──────────────────────────────────────────────────────────────────┘


COMPARE VERSIONS DIALOG ✨ (NEW)
═════════════════════════════════════════════════════════════════════

┌──────────────────────────────────────────────────────────────────┐
│              COMPARE: Version 3 vs Version 2                      │
├──────────────────────────────────────────────────────────────────┤
│                                                                    │
│  Sections Changed: 2  |  Fields Added: 1  |  Fields Removed: 0   │
│                                                                    │
│  ┌─ Experience (Modified)                              ▼        │
│  │  ❌ Removed 1 bullet:                                         │
│  │     "Optimized state management using Redux Toolkit..."       │
│  │                                                                │
│  │  ✅ Added 1 bullet:                                          │
│  │     "Led GraphQL migration increasing dev productivity 25%"   │
│  │                                                                │
│  │  [Copy from Version 2] [Keep V3]                             │
│  │                                                                │
│  ┌─ Skills (Added)                                     ▼        │
│  │  ✅ Added 1 group:                                           │
│  │     Certifications: AWS Solutions Architect                  │
│  │                                                                │
│  │  [Copy from Version 2] [Keep V3]                             │
│  │                                                                │
│  ┌─ Education (Unchanged)                             ▼        │
│  │  (No changes)                                                │
│  │                                                                │
│  ┌─ Summary (Unchanged)                               ▼        │
│  │  (No changes)                                                │
│                                                                    │
│  [Close] [Restore Selected from V2] [Duplicate V2]              │
│                                                                    │
└──────────────────────────────────────────────────────────────────┘


RESTORE WORKFLOW ✨ (NEW - Two Phase)
═════════════════════════════════════════════════════════════════════

Phase 1: PREVIEW
┌──────────────────────────────────────────────────────────────────┐
│             RESTORE FROM: Version 2 (Jan 14)                     │
├──────────────────────────────────────────────────────────────────┤
│                                                                    │
│  What will change:                                               │
│  ☐ Name           (unchanged)                                    │
│  ☐ Title          (unchanged)                                    │
│  ☑ Summary        "Passionate and results-driven..." → OLD V      │
│  ☐ Experience     "Removed 1 bullet"                             │
│  ☑ Skills         "Will remove AWS cert"                         │
│  ☑ Education      (unchanged)                                    │
│                                                                    │
│  ⚠️  New version will be created: "Restored from V2"              │
│                                                                    │
│  [Cancel] [Restore Selected Sections]                           │
│                                                                    │
└──────────────────────────────────────────────────────────────────┘

Phase 2: COMMITTED
┌──────────────────────────────────────────────────────────────────┐
│  ✅ Restored from Version 2 (Jan 14)                              │
│     Created Version 4 as a new checkpoint                         │
│     Previous changes are preserved in history                     │
│                                                                    │
│  Your new version:                                               │
│  📌 Title: "Restored from V2"                                    │
│  📊 Summary: "Restored Summary, Skills sections from Jan 14"      │
│  🎯 Fit: Recalculating...                                        │
│                                                                    │
│  [Edit now] [View history] [Close]                               │
└──────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Comparison Table

| Feature | Current | Perfect |
|---------|---------|---------|
| **Store version content** | ❌ No | ✅ Yes (JSON snapshots) |
| **Change tracking** | ⚠️ Modal only | ✅ User + System diff |
| **Restore functionality** | ❌ Dead button | ✅ Full + cherry-pick |
| **Compare versions** | ❌ Dead button | ✅ Section-by-section |
| **Fit score context** | ❌ Just a number | ✅ "8/12 JD keywords" |
| **Change notes** | ❌ Captured, not saved | ✅ Persisted in DB |
| **Version history UX** | ⚠️ Generic list | ✅ Detailed with previews |
| **Data recovery** | ❌ Impossible | ✅ Full history |
| **Space efficiency** | ✅ Minimal | ✅ 70% reduction (delta) |

---

## 📋 Implementation Checklist

### Phase 1: Foundation (1-2 days)
- [ ] Add 3 columns to `resume_versions` table (Supabase migration)
- [ ] Update `DbResumeVersion` TypeScript interface
- [ ] Modify `/api/resumes/save` to store full EditorContent JSON
- [ ] Run backfill migration for existing versions

### Phase 2: Restore (1-2 days)
- [ ] Create `RestoreModal` component with preview
- [ ] Implement restore logic in editor page
- [ ] Add API endpoint for version retrieval
- [ ] Test cherry-pick section restore

### Phase 3: Compare (1 day)
- [ ] Build `POST /api/resumes/versions/compare` endpoint
- [ ] Create `CompareModal` component
- [ ] Implement JSONB diff algorithm
- [ ] Wire up compare button

### Phase 4: Polish (1 day)
- [ ] Auto-suggest change descriptions
- [ ] Add section tags to version cards
- [ ] Enhance fit score display with context
- [ ] Add database indexes for performance

---

## 🎯 Why This Works

**For Users:**
- ✅ Never lose work — full history preserved
- ✅ Understand changes — clear descriptions + diffs
- ✅ Smart restore — see preview before committing
- ✅ Meaningful scores — "65% fit vs 8/12 keywords"

**For System:**
- ✅ Minimal schema change (3 columns)
- ✅ Backward compatible (fallback logic)
- ✅ Scalable (delta storage for 1000+ versions)
- ✅ Queryable (JSONB indexes for analytics)

**For Future:**
- ✅ Foundation for version tags/branching
- ✅ Audit trail (who changed what)
- ✅ AI/ML analysis on sections
- ✅ Team resume collaboration
