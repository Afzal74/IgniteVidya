# Complete Supabase Setup Guide

## Overview

This document provides a complete overview of all Supabase tables and setup required for your application.

## All Supabase Setup Files

### 1. Teacher & Student Management
- **File**: `supabase-setup.sql`
- **Tables**: `teacher_profiles`
- **Purpose**: Teacher authentication and profiles

### 2. Student Records
- **File**: `supabase-students-setup.sql`
- **Tables**: `students`
- **Purpose**: Student information managed by teachers

### 3. Attendance Tracking
- **File**: `supabase-attendance-setup.sql`
- **Tables**: `attendance`
- **Purpose**: Daily attendance records for students

### 4. Quiz System
- **File**: `supabase-quiz-setup.sql`
- **Tables**: `quiz_rooms`, `quiz_questions`, `quiz_participants`
- **Purpose**: Interactive quiz rooms for students

### 5. Quiz Answers (NEW)
- **File**: `supabase-quiz-answers-setup.sql`
- **Tables**: `quiz_answers`
- **Purpose**: Track individual student answers and auto-calculate scores

### 6. Content Management (NEW)
- **File**: `supabase-content-setup.sql`
- **Tables**: `notes`, `notes_comments`, `question_papers`, `question_papers_comments`, `lab_programs`, `projects`
- **Purpose**: Educational content (migrated from JSON files)

## Complete Database Schema

### Teacher & Authentication
```
teacher_profiles
├── user_id (UUID, FK to auth.users)
├── first_name
├── last_name
├── school_name
├── role
├── phone_number
└── email
```

### Student Management
```
students
├── id (UUID)
├── teacher_id (UUID, FK to teacher_profiles)
├── first_name
├── last_name
├── roll_number
├── grade
├── email
├── parent_contact
└── timestamps
```

### Attendance
```
attendance
├── id (UUID)
├── teacher_id (UUID, FK to teacher_profiles)
├── student_id (UUID, FK to students)
├── date
├── status (present/absent/late/excused)
├── notes
└── timestamps
```

### Quiz System
```
quiz_rooms
├── id (UUID)
├── teacher_id (UUID, FK to teacher_profiles)
├── room_code (unique 6-char code)
├── room_name
├── category
├── difficulty
├── question_count
├── time_limit
├── max_players
├── status (waiting/active/completed)
└── timestamps

quiz_questions
├── id (UUID)
├── room_id (UUID, FK to quiz_rooms)
├── question_text
├── option_a, option_b, option_c, option_d
├── correct_answer (A/B/C/D)
├── points
└── order_number

quiz_participants
├── id (UUID)
├── room_id (UUID, FK to quiz_rooms)
├── student_id (UUID, FK to students, optional)
├── student_name
├── score
├── answers_submitted
└── joined_at

quiz_answers (NEW)
├── id (UUID)
├── participant_id (UUID, FK to quiz_participants)
├── question_id (UUID, FK to quiz_questions)
├── selected_answer (A/B/C/D)
├── is_correct
├── time_taken
└── answered_at
```

### Content Management
```
notes
├── id (UUID)
├── subject_name
├── subject_code
├── scheme
├── semester
├── file_url
├── uploaded_by
└── timestamps

notes_comments
├── id (UUID)
├── note_id (UUID, FK to notes)
├── text
├── author
└── created_at

question_papers
├── id (UUID)
├── subject_code
├── subject_name
├── year
├── semester
├── branch
├── file_url
├── uploaded_by
└── timestamps

question_papers_comments
├── id (UUID)
├── paper_id (UUID, FK to question_papers)
├── text
├── author
└── created_at

lab_programs
├── id (UUID)
├── lab_title
├── program_number
├── description
├── code
├── expected_output
├── semester
└── timestamps

projects
├── id (UUID)
├── title
├── description
├── domain
├── github_url
├── source_url
├── tags (array)
├── difficulty
└── timestamps
```

## Setup Order

Run these SQL files in your Supabase SQL Editor in this order:

1. ✅ `supabase-setup.sql` - Teacher profiles
2. ✅ `supabase-students-setup.sql` - Student records
3. ✅ `supabase-attendance-setup.sql` - Attendance tracking
4. ✅ `supabase-quiz-setup.sql` - Quiz system base
5. 🆕 `supabase-quiz-answers-setup.sql` - Quiz answers tracking
6. 🆕 `supabase-content-setup.sql` - Content management

## Environment Variables Required

Add these to your `.env.local`:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# For migration script only (DO NOT COMMIT)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Migration Steps for Content

If you have existing JSON data:

1. **Backup existing data**:
   ```bash
   mkdir data-backup
   cp data/*.json data-backup/
   ```

2. **Run content setup**:
   - Execute `supabase-content-setup.sql` in Supabase

3. **Run migration**:
   ```bash
   npx tsx scripts/migrate-to-supabase.ts
   ```

4. **Update code imports**:
   ```typescript
   // Change from:
   import { getNotes } from '@/lib/database'
   
   // To:
   import { getNotes } from '@/lib/supabase-database'
   ```

5. **Test thoroughly**

## Key Features

### Automatic Score Calculation
The `quiz_answers` table includes a trigger that automatically:
- Updates participant score when answer is submitted
- Increments answers_submitted count
- Calculates correct/incorrect answers

### Real-time Capabilities
All tables support Supabase real-time subscriptions:
- Live quiz participant updates
- Real-time attendance changes
- Live comment additions
- Instant content updates

### Security (RLS Policies)
- Teachers can only access their own data
- Students can join quizzes without authentication
- Public read access for educational content
- Authenticated write access for content management

### Performance Optimizations
- Indexes on frequently queried columns
- Foreign key relationships for data integrity
- Automatic timestamp updates
- Efficient query patterns

## Testing Checklist

### Teacher Features
- [ ] Teacher signup/login
- [ ] Add/edit/delete students
- [ ] Mark attendance
- [ ] View attendance analytics
- [ ] Create quiz rooms
- [ ] View quiz results

### Student Features
- [ ] Join quiz with room code
- [ ] Answer quiz questions
- [ ] View quiz results
- [ ] View notes and materials

### Content Features
- [ ] View notes
- [ ] Add comments to notes
- [ ] View question papers
- [ ] View lab programs
- [ ] View projects
- [ ] Search functionality

### Quiz Features
- [ ] Create quiz room
- [ ] Generate room code
- [ ] Students join lobby
- [ ] Start quiz
- [ ] Submit answers
- [ ] Auto-calculate scores
- [ ] View results

## Database Views

### quiz_results_summary
A convenient view for quiz analytics:
```sql
SELECT * FROM quiz_results_summary
WHERE room_id = 'your-room-id';
```

Returns:
- Room details
- Participant names
- Scores
- Answer statistics
- Average time per question

## Backup Strategy

1. **Supabase automatic backups** - Daily backups by Supabase
2. **Manual exports** - Export tables periodically
3. **JSON backups** - Keep old JSON files as backup
4. **Code versioning** - Git for code changes

## Monitoring

Monitor these in Supabase dashboard:
- Table sizes
- Query performance
- RLS policy effectiveness
- Real-time connections
- API usage

## Future Enhancements

Possible additions:
1. **File storage** - Use Supabase Storage for PDFs/images
2. **User profiles** - Student authentication and profiles
3. **Analytics** - Detailed usage and performance analytics
4. **Notifications** - Real-time notifications for events
5. **Leaderboards** - Quiz leaderboards and achievements
6. **Content ratings** - Rating system for notes/projects
7. **Discussion forums** - Comment threads and discussions

## Troubleshooting

### Common Issues

**Migration fails**
- Verify SQL scripts ran successfully
- Check service role key is correct
- Ensure JSON files exist

**Data not showing**
- Check RLS policies
- Verify user authentication
- Check browser console for errors

**Real-time not working**
- Verify Supabase client initialization
- Check real-time is enabled in Supabase
- Verify subscription code

**Slow queries**
- Check indexes are created
- Review query patterns
- Use Supabase query analyzer

## Support Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Discord](https://discord.supabase.com)
- Project-specific docs in this repository

## Summary

You now have a complete Supabase setup with:
- ✅ 6 SQL setup files
- ✅ 13 database tables
- ✅ Row Level Security policies
- ✅ Automatic triggers and functions
- ✅ Migration scripts
- ✅ Type-safe database utilities
- ✅ Comprehensive documentation

All tables are production-ready with proper indexes, relationships, and security policies!
