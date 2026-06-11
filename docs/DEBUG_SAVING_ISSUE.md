# Debug: Saving is Stuck / Hanging

## What I Fixed

✅ Removed redundant profile save call  
✅ Added 15-second timeout (will now fail instead of hanging forever)  
✅ Simplified API endpoint error handling  

Now it should either:
- Save successfully ✅
- Timeout after 15 seconds and show an error message 🔴

## Check These First

### 1. Open Browser Console (F12)

Look for error messages after clicking [Version]:
- Any red errors?
- Any timeout messages?
- What's the exact error?

### 2. Check Supabase Status

Go to Supabase dashboard:
1. Check your project status (green = healthy)
2. Check for any database errors
3. Try running a simple query in SQL Editor:
   ```sql
   SELECT * FROM profiles LIMIT 1;
   ```

### 3. Check Your Auth Status

In browser console, check:
```javascript
// See if user is authenticated
localStorage.getItem('sb-yourprojectid-auth-token')
```

Should show a JSON token if logged in.

---

## Troubleshooting Steps

### Issue 1: Timeout after 15 seconds
**Means:** API endpoint is not responding

**Solution:**
1. Check Supabase is online
2. Check `.env.local` has correct credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJx...
   SUPABASE_SERVICE_ROLE_KEY=eyJx...
   ```
3. Restart dev server: `npm run dev`

### Issue 2: Foreign key constraint error
**Means:** User profile still doesn't exist

**Solution:**
1. Go to Supabase SQL Editor
2. Run:
   ```sql
   -- Check if your profile exists
   SELECT * FROM profiles WHERE email = 'your@email.com';
   
   -- If not, manually create it
   INSERT INTO profiles (id, email, name, created_at, updated_at)
   VALUES (
     'YOUR_USER_ID',
     'your@email.com',
     'Your Name',
     NOW(),
     NOW()
   );
   ```

### Issue 3: Permission denied / RLS error
**Means:** RLS policy is blocking the insert

**Solution:**
1. Check RLS policies in Supabase:
   - Go to Authentication → Policies
   - Resume_versions table should have:
     - "Public write resume_versions" policy ✓
     - "insert with check (true)" ✓

---

## What to Report

If still stuck, check console and tell me:

1. **Do you see any error messages?** (red text in console)
2. **What does it say?** (exact error message)
3. **Timeout after 15 seconds?** (or hangs longer?)
4. **Can you see the Supabase project is online?**

---

## Quick Test

1. **Open developer tools** (F12)
2. **Go to Console tab**
3. **Make edits** in resume
4. **Click [✨ Version]**
5. **Watch the console** for messages:
   ```
   [Save Version] Creating version with content snapshot...
   ```
6. **Wait up to 15 seconds**
7. **Check what happens:**
   - Success message? ✅
   - Error message? 🔴 (tell me what it says)
   - Timeout? ⏱️ (database probably offline)

---

## Possible Causes

| Cause | Signs | Fix |
|-------|-------|-----|
| Supabase offline | Timeout after 15s | Check Supabase status |
| Auth not set up | "user is null" error | Sign in first |
| Bad credentials | 401/403 error | Check `.env.local` |
| RLS blocking | "permission denied" | Check Supabase policies |
| Profile missing | Foreign key error | Create profile manually |
| Network issue | Timeout/no response | Check internet connection |

---

## Advanced Debugging

### Check API Endpoint
In browser Network tab (F12 → Network):
1. Click [✨ Version]
2. Look for `versions/save` request
3. Check:
   - **Status**: 200 = success, 4xx = client error, 5xx = server error
   - **Response**: See actual error message
   - **Time**: How long did it take?

### Check Server Logs
In terminal where `npm run dev` is running:
1. Look for `[API]` messages
2. Should see:
   ```
   [API] POST /api/resumes/versions/save
   [API] Checking if user profile exists...
   [API] Version saved successfully
   ```

---

## Temporary Workaround

If you need to test without the foreign key issue:

**Option 1: Make user_id nullable**
```sql
ALTER TABLE resume_versions
ALTER COLUMN user_id DROP NOT NULL;
```

But this loses user association (bad idea).

**Option 2: Drop the constraint**
```sql
ALTER TABLE resume_versions
DROP CONSTRAINT resume_versions_user_id_fkey;
```

Then manually create the profile:
```sql
INSERT INTO profiles (id, email, name, created_at, updated_at)
VALUES ('YOUR_USER_ID', 'your@email.com', 'Your Name', NOW(), NOW());
```

---

## Next Steps

**Try the fix:**
1. Hard refresh browser (Ctrl+Shift+R)
2. Make edits in resume
3. Click [✨ Version]
4. Check console for errors

**Report back with:**
- Any error messages you see
- Timeout or success?
- Browser console logs

This will help me debug what's happening!

---

**The 15-second timeout should help us see what the actual error is instead of hanging forever.** 🚀
