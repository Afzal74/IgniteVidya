/**
 * Migration script to move data from JSON files to Supabase
 * 
 * Run this script once to migrate your existing data:
 * npx tsx scripts/migrate-to-supabase.ts
 */

import fs from 'fs'
import path from 'path'
import { createClient } from '@supabase/supabase-js'

// Load environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role key for migration

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// File paths
const DATA_DIR = path.join(process.cwd(), 'data')
const NOTES_FILE = path.join(DATA_DIR, 'notes.json')
const PAPERS_FILE = path.join(DATA_DIR, 'question-papers.json')
const LAB_PROGRAMS_FILE = path.join(DATA_DIR, 'lab-programs.json')
const PROJECTS_FILE = path.join(DATA_DIR, 'projects.json')

// Read JSON file
function readJsonFile<T>(filePath: string): T | null {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`File not found: ${filePath}`)
      return null
    }
    const data = fs.readFileSync(filePath, 'utf8')
    return JSON.parse(data) as T
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error)
    return null
  }
}

// Migrate notes
async function migrateNotes() {
  console.log('\n📝 Migrating notes...')
  
  const data = readJsonFile<{ notes: any[] }>(NOTES_FILE)
  if (!data || !data.notes || data.notes.length === 0) {
    console.log('No notes to migrate')
    return
  }

  console.log(`Found ${data.notes.length} notes`)

  for (const note of data.notes) {
    // Insert note
    const { data: insertedNote, error: noteError } = await supabase
      .from('notes')
      .insert({
        subject_name: note.subject_name,
        subject_code: note.subject_code,
        scheme: note.scheme,
        semester: note.semester,
        file_url: note.file_url,
        uploaded_by: note.uploaded_by,
        created_at: note.created_at
      })
      .select()
      .single()

    if (noteError) {
      console.error(`Error inserting note ${note.subject_name}:`, noteError)
      continue
    }

    console.log(`✓ Migrated note: ${note.subject_name}`)

    // Insert comments if any
    if (note.comments && note.comments.length > 0) {
      for (const comment of note.comments) {
        const { error: commentError } = await supabase
          .from('notes_comments')
          .insert({
            note_id: insertedNote.id,
            text: comment.text,
            author: comment.author,
            created_at: comment.created_at
          })

        if (commentError) {
          console.error(`Error inserting comment:`, commentError)
        }
      }
      console.log(`  ✓ Migrated ${note.comments.length} comments`)
    }
  }

  console.log('✅ Notes migration complete')
}

// Migrate question papers
async function migrateQuestionPapers() {
  console.log('\n📄 Migrating question papers...')
  
  const data = readJsonFile<{ papers: any[] }>(PAPERS_FILE)
  if (!data || !data.papers || data.papers.length === 0) {
    console.log('No question papers to migrate')
    return
  }

  console.log(`Found ${data.papers.length} question papers`)

  for (const paper of data.papers) {
    // Insert paper
    const { data: insertedPaper, error: paperError } = await supabase
      .from('question_papers')
      .insert({
        subject_code: paper.subject_code,
        subject_name: paper.subject_name,
        year: paper.year,
        semester: paper.semester,
        branch: paper.branch,
        file_url: paper.file_url,
        uploaded_by: paper.uploaded_by,
        created_at: paper.created_at
      })
      .select()
      .single()

    if (paperError) {
      console.error(`Error inserting paper ${paper.subject_name}:`, paperError)
      continue
    }

    console.log(`✓ Migrated paper: ${paper.subject_name} (${paper.year})`)

    // Insert comments if any
    if (paper.comments && paper.comments.length > 0) {
      for (const comment of paper.comments) {
        const { error: commentError } = await supabase
          .from('question_papers_comments')
          .insert({
            paper_id: insertedPaper.id,
            text: comment.text,
            author: comment.author,
            created_at: comment.created_at
          })

        if (commentError) {
          console.error(`Error inserting comment:`, commentError)
        }
      }
      console.log(`  ✓ Migrated ${paper.comments.length} comments`)
    }
  }

  console.log('✅ Question papers migration complete')
}

// Migrate lab programs
async function migrateLabPrograms() {
  console.log('\n💻 Migrating lab programs...')
  
  const data = readJsonFile<{ programs: any[] }>(LAB_PROGRAMS_FILE)
  if (!data || !data.programs || data.programs.length === 0) {
    console.log('No lab programs to migrate')
    return
  }

  console.log(`Found ${data.programs.length} lab programs`)

  for (const program of data.programs) {
    const { error } = await supabase
      .from('lab_programs')
      .insert({
        lab_title: program.lab_title,
        program_number: program.program_number,
        description: program.description,
        code: program.code,
        expected_output: program.expected_output,
        semester: program.semester,
        created_at: program.created_at
      })

    if (error) {
      console.error(`Error inserting program ${program.lab_title}:`, error)
      continue
    }

    console.log(`✓ Migrated program: ${program.lab_title}`)
  }

  console.log('✅ Lab programs migration complete')
}

// Migrate projects
async function migrateProjects() {
  console.log('\n🚀 Migrating projects...')
  
  const data = readJsonFile<{ projects: any[] }>(PROJECTS_FILE)
  if (!data || !data.projects || data.projects.length === 0) {
    console.log('No projects to migrate')
    return
  }

  console.log(`Found ${data.projects.length} projects`)

  for (const project of data.projects) {
    const { error } = await supabase
      .from('projects')
      .insert({
        title: project.title,
        description: project.description,
        domain: project.domain,
        github_url: project.github_url,
        source_url: project.source_url,
        tags: project.tags || [],
        difficulty: project.difficulty,
        created_at: project.created_at
      })

    if (error) {
      console.error(`Error inserting project ${project.title}:`, error)
      continue
    }

    console.log(`✓ Migrated project: ${project.title}`)
  }

  console.log('✅ Projects migration complete')
}

// Main migration function
async function migrate() {
  console.log('🚀 Starting migration to Supabase...')
  console.log('Make sure you have run the supabase-content-setup.sql script first!')
  
  try {
    await migrateNotes()
    await migrateQuestionPapers()
    await migrateLabPrograms()
    await migrateProjects()
    
    console.log('\n✅ Migration completed successfully!')
    console.log('\n📝 Next steps:')
    console.log('1. Verify the data in your Supabase dashboard')
    console.log('2. Update your application code to use lib/supabase-database.ts')
    console.log('3. Backup and remove the old JSON files from the data/ directory')
  } catch (error) {
    console.error('\n❌ Migration failed:', error)
    process.exit(1)
  }
}

// Run migration
migrate()
