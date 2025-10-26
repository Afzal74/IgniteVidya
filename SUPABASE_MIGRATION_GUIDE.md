# Supabase Migration Guide

This guide will help you migrate your Notes, Question Papers, Lab Programs, and Projects from JSON files to Supabase.

## Prerequisites

- Supabase project set up
- Environment variables configured in `.env.local`:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY` (for migration script)

## Step 1: Run Database Setup

1. Open your Supabase dashboard
2. Go to the SQL Editor
3. Copy and paste the contents of `supabase-content-setup.sql`
4. Click "Run" to create all tables, indexes, and policies

This will create:
- `notes` table with `notes_comments`
- `question_papers` table with `question_papers_comments`
- `lab_programs` table
- `projects` table

## Step 2: Get Service Role Key

For the migration script, you need the service role key:

1. Go to your Supabase project settings
2. Navigate to API section
3. Copy the `service_role` key (NOT the anon key)
4. Add it to your `.env.local`:
   ```
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   ```

⚠️ **Important**: Never commit the service role key to version control!

## Step 3: Install Dependencies

If you don't have `tsx` installed:

```bash
npm install -D tsx
```

## Step 4: Run Migration Script

```bash
npx tsx scripts/migrate-to-supabase.ts
```

The script will:
- Read data from your JSON files in the `data/` directory
- Insert all records into Supabase
- Preserve comments and relationships
- Show progress for each item migrated

## Step 5: Verify Migration

1. Open your Supabase dashboard
2. Go to Table Editor
3. Check each table to verify data was migrated correctly:
   - `notes` - Check subject names, codes, and file URLs
   - `notes_comments` - Verify comments are linked to notes
   - `question_papers` - Check papers and their details
   - `question_papers_comments` - Verify comments
   - `lab_programs` - Check program code and descriptions
   - `projects` - Verify project details and tags

## Step 6: Update Application Code

Replace imports in your application files:

### Before:
```typescript
import { getNotes, addNote } from '@/lib/database'
```

### After:
```typescript
import { getNotes, addNote } from '@/lib/supabase-database'
```

### Files to Update:

1. **Notes pages**: `app/notes/page.tsx`
2. **Question Papers pages**: `app/question-papers/page.tsx`
3. **Lab Programs pages**: `app/lab-programs/page.tsx`
4. **Projects pages**: `app/projects/page.tsx`
5. **API routes**: Any API routes that use these functions

## Step 7: Test the Application

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Test each section:
   - View notes
   - Add a new note
   - Add comments
   - View question papers
   - View lab programs
   - View projects
   - Search functionality

## Step 8: Backup and Clean Up

Once everything is working:

1. **Backup JSON files**:
   ```bash
   mkdir data-backup
   cp data/*.json data-backup/
   ```

2. **Optional**: Remove old JSON files (keep backups!)
   ```bash
   # Only do this after confirming everything works!
   rm data/notes.json
   rm data/question-papers.json
   rm data/lab-programs.json
   rm data/projects.json
   ```

3. **Optional**: Remove old database utility:
   ```bash
   # Keep as reference or remove
   mv lib/database.ts lib/database.ts.old
   ```

## Benefits of Supabase Migration

✅ **Real-time updates** - Changes sync across all users instantly
✅ **Better performance** - Database queries are faster than file I/O
✅ **Scalability** - Handle thousands of records easily
✅ **Security** - Row Level Security policies protect data
✅ **Relationships** - Proper foreign keys and joins
✅ **Search** - Full-text search capabilities
✅ **Backup** - Automatic backups by Supabase
✅ **Multi-user** - Multiple users can add/edit simultaneously

## New Features Available

With Supabase, you can now add:

1. **User-specific content** - Track who uploaded what
2. **Likes/favorites** - Let users favorite notes or projects
3. **Advanced search** - Full-text search across all fields
4. **Filtering** - Filter by semester, domain, difficulty, etc.
5. **Pagination** - Load data in chunks for better performance
6. **Real-time collaboration** - See updates as they happen

## Troubleshooting

### Migration Script Fails

- Check that `supabase-content-setup.sql` was run successfully
- Verify your service role key is correct
- Check that JSON files exist in the `data/` directory

### Data Not Showing in App

- Verify RLS policies are set correctly
- Check browser console for errors
- Ensure Supabase client is initialized properly

### Comments Not Appearing

- Check that foreign key relationships are correct
- Verify the `notes_comments` and `question_papers_comments` tables exist
- Check that comments were migrated (look in Supabase dashboard)

## Rollback Plan

If you need to rollback:

1. Restore JSON files from backup
2. Change imports back to `@/lib/database`
3. Restart your application

## Support

If you encounter issues:
1. Check Supabase logs in the dashboard
2. Review the migration script output
3. Verify all SQL scripts ran successfully
4. Check that environment variables are set correctly
