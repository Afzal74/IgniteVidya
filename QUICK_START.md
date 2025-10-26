# Quick Start - Supabase Setup

## What We Just Created

✅ **7 SQL Setup Files** - Complete database schema with images support
✅ **Storage Utility** - Upload/manage images in Supabase Storage
✅ **Migration Script** - Move JSON data to Supabase  
✅ **New Database Utility** - Type-safe Supabase operations
✅ **Sample Data Script** - Test data with images
✅ **Complete Documentation** - Step-by-step guides

## What's Missing in Your Supabase

### 1. Quiz Answers Table (CRITICAL)
**File**: `supabase-quiz-answers-setup.sql`
**Why**: Track individual student answers during quizzes
**Status**: ⏳ Not yet added

### 2. Content Tables (RECOMMENDED)
**File**: `supabase-content-setup.sql`
**Why**: Move notes, papers, programs, projects from JSON to database
**Status**: ⏳ Not yet added

## Quick Setup (5 Minutes)

### Step 1: Add Quiz Answers Table
```bash
# 1. Open Supabase Dashboard → SQL Editor
# 2. Copy contents of: supabase-quiz-answers-setup.sql
# 3. Click "Run"
```

### Step 2: Add Content Tables (Optional but Recommended)
```bash
# If tables already exist, run UPDATE script:
# 1. Open Supabase Dashboard → SQL Editor
# 2. Copy contents of: supabase-content-update.sql
# 3. Click "Run"

# If tables DON'T exist, run SETUP script:
# 1. Open Supabase Dashboard → SQL Editor
# 2. Copy contents of: supabase-content-setup.sql
# 3. Click "Run"

# 4. (Optional) Add sample data with images:
# Copy contents of: scripts/seed-sample-data.sql
# Click "Run"
```

### Step 3: Set Up Image Storage (Recommended)
```bash
# 1. Go to Supabase Dashboard → Storage
# 2. Create these buckets (all public):
#    - thumbnails
#    - covers
#    - notes
#    - papers
#    - projects

# 3. Use the storage utility in your code:
import { uploadImage, BUCKETS } from '@/lib/supabase-storage'

# See SUPABASE_STORAGE_SETUP.md for detailed guide
```

### Step 3: Migrate Existing Data (If you have JSON files)
```bash
# 1. Add service role key to .env.local:
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# 2. Run migration:
npx tsx scripts/migrate-to-supabase.ts

# 3. Verify in Supabase dashboard
```

### Step 4: Update Your Code
```typescript
// In files that use notes, papers, programs, projects:

// OLD:
import { getNotes } from '@/lib/database'

// NEW:
import { getNotes } from '@/lib/supabase-database'
```

## Files You Need to Update

If you migrate content to Supabase:
- `app/notes/page.tsx`
- `app/question-papers/page.tsx`
- `app/lab-programs/page.tsx`
- `app/projects/page.tsx`
- Any API routes using these

## What You Get

### Quiz Answers Table
- ✅ Track every student answer
- ✅ Auto-calculate scores
- ✅ Time tracking per question
- ✅ Prevent duplicate answers
- ✅ Quiz analytics view

### Content Tables
- ✅ Better performance than JSON files
- ✅ Real-time updates
- ✅ Proper relationships
- ✅ Search capabilities
- ✅ Multi-user support
- ✅ Automatic backups
- ✅ Image/thumbnail support
- ✅ Download & view tracking
- ✅ Tags and categorization
- ✅ File metadata (size, pages)

## Priority

### Must Do Now:
1. ⚠️ Add `quiz_answers` table - Needed for quiz functionality

### Should Do Soon:
2. 📝 Migrate content to Supabase - Better scalability

### Can Do Later:
3. 🎨 Add new features (ratings, favorites, etc.)

## Need Help?

Check these files:
- `SUPABASE_COMPLETE_SETUP.md` - Full overview
- `SUPABASE_MIGRATION_GUIDE.md` - Detailed migration steps
- `SUPABASE_CONTENT_TABLES_SUMMARY.md` - Content tables details

## Quick Test

After setup, test:
```bash
# 1. Start dev server
npm run dev

# 2. Test quiz flow:
- Create quiz as teacher
- Join as student
- Answer questions
- Check scores update automatically

# 3. Test content (if migrated):
- View notes
- Add comment
- Search functionality
```

## Summary

**What's done**: ✅ All setup files created
**What's needed**: ⏳ Run SQL scripts in Supabase
**Time required**: ~5 minutes
**Difficulty**: Easy (copy & paste SQL)

Ready to go! 🚀
