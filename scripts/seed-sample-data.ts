/**
 * Script to seed Supabase with sample data from the application
 * 
 * Run this script to populate your database with initial data:
 * npx tsx scripts/seed-sample-data.ts
 */

import { createClient } from '@supabase/supabase-js'

// Load environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Sample notes data from the application
const sampleNotes = [
  {
    subject_name: "Advanced Mathematics",
    subject_code: "MATH12",
    scheme: "2025",
    class: "12",
    uploaded_by: "System",
    comments: [
      {
        text: "Excellent calculus examples! Very helpful for board exams.",
        author: "Math Student",
      }
    ]
  },
  {
    subject_name: "Organic Chemistry",
    subject_code: "CHEM11",
    scheme: "2025",
    class: "11",
    uploaded_by: "System",
    comments: []
  },
  {
    subject_name: "Physics - Mechanics",
    subject_code: "PHYS11",
    scheme: "2025",
    class: "11",
    uploaded_by: "System",
    comments: [
      {
        text: "Could you add more solved problems on kinematics?",
        author: "Physics Student",
      },
      {
        text: "Great explanation of Newton's laws!",
        author: "Science Student",
      }
    ]
  },
  {
    subject_name: "Biology - Genetics",
    subject_code: "BIOL12",
    scheme: "2024",
    class: "12",
    uploaded_by: "System",
    comments: [
      {
        text: "The heredity diagrams are crystal clear!",
        author: "Bio Student",
      }
    ]
  },
  {
    subject_name: "Computer Science",
    subject_code: "CS12",
    scheme: "2025",
    class: "12",
    uploaded_by: "System",
    comments: [
      {
        text: "Python programming examples are perfect!",
        author: "CS Student",
      },
      {
        text: "Need more examples on data structures.",
        author: "Tech Student",
      }
    ]
  },
  {
    subject_name: "English Literature",
    subject_code: "ENG10",
    scheme: "2024",
    class: "10",
    uploaded_by: "System",
    comments: [
      {
        text: "Shakespeare analysis is well explained!",
        author: "Literature Student",
      }
    ]
  }
];

// Sample question papers
const sampleQuestionPapers = [
  {
    subject_name: "Mathematics",
    subject_code: "MATH12",
    year: 2024,
    semester: 1,
    branch: "Science",
    uploaded_by: "System",
    comments: []
  },
  {
    subject_name: "Physics",
    subject_code: "PHYS11",
    year: 2024,
    semester: 2,
    branch: "Science",
    uploaded_by: "System",
    comments: []
  },
  {
    subject_name: "Chemistry",
    subject_code: "CHEM11",
    year: 2024,
    semester: 1,
    branch: "Science",
    uploaded_by: "System",
    comments: []
  }
];

// Sample lab programs
const sampleLabPrograms = [
  {
    lab_title: "Python Basics",
    program_number: 1,
    description: "Introduction to Python programming with basic syntax and data types",
    code: "print('Hello, World!')\n# Basic Python program",
    expected_output: "Hello, World!",
    semester: 1
  },
  {
    lab_title: "Data Structures - Arrays",
    program_number: 2,
    description: "Implementation of array operations",
    code: "arr = [1, 2, 3, 4, 5]\nprint(arr)",
    expected_output: "[1, 2, 3, 4, 5]",
    semester: 1
  }
];

// Sample projects
const sampleProjects = [
  {
    title: "Student Management System",
    description: "A comprehensive system to manage student records, attendance, and grades",
    domain: "Education",
    github_url: "https://github.com/example/student-management",
    tags: ["Python", "Django", "PostgreSQL"],
    difficulty: "Intermediate"
  },
  {
    title: "E-Commerce Platform",
    description: "Full-stack e-commerce application with payment integration",
    domain: "Web Development",
    github_url: "https://github.com/example/ecommerce",
    tags: ["React", "Node.js", "MongoDB"],
    difficulty: "Advanced"
  },
  {
    title: "Weather App",
    description: "Simple weather application using public API",
    domain: "Mobile Development",
    github_url: "https://github.com/example/weather-app",
    tags: ["React Native", "API"],
    difficulty: "Beginner"
  }
];

async function seedNotes() {
  console.log('\n📝 Seeding notes...')
  
  for (const note of sampleNotes) {
    const { comments, ...noteData } = note
    
    // Insert note
    const { data: insertedNote, error: noteError } = await supabase
      .from('notes')
      .insert(noteData)
      .select()
      .single()

    if (noteError) {
      console.error(`Error inserting note ${note.subject_name}:`, noteError)
      continue
    }

    console.log(`✓ Added note: ${note.subject_name}`)

    // Insert comments
    if (comments && comments.length > 0) {
      for (const comment of comments) {
        const { error: commentError } = await supabase
          .from('notes_comments')
          .insert({
            note_id: insertedNote.id,
            ...comment
          })

        if (commentError) {
          console.error(`Error inserting comment:`, commentError)
        }
      }
      console.log(`  ✓ Added ${comments.length} comment(s)`)
    }
  }

  console.log('✅ Notes seeding complete')
}

async function seedQuestionPapers() {
  console.log('\n📄 Seeding question papers...')
  
  for (const paper of sampleQuestionPapers) {
    const { error } = await supabase
      .from('question_papers')
      .insert(paper)

    if (error) {
      console.error(`Error inserting paper ${paper.subject_name}:`, error)
      continue
    }

    console.log(`✓ Added paper: ${paper.subject_name} (${paper.year})`)
  }

  console.log('✅ Question papers seeding complete')
}

async function seedLabPrograms() {
  console.log('\n💻 Seeding lab programs...')
  
  for (const program of sampleLabPrograms) {
    const { error } = await supabase
      .from('lab_programs')
      .insert(program)

    if (error) {
      console.error(`Error inserting program ${program.lab_title}:`, error)
      continue
    }

    console.log(`✓ Added program: ${program.lab_title}`)
  }

  console.log('✅ Lab programs seeding complete')
}

async function seedProjects() {
  console.log('\n🚀 Seeding projects...')
  
  for (const project of sampleProjects) {
    const { error } = await supabase
      .from('projects')
      .insert(project)

    if (error) {
      console.error(`Error inserting project ${project.title}:`, error)
      continue
    }

    console.log(`✓ Added project: ${project.title}`)
  }

  console.log('✅ Projects seeding complete')
}

async function seed() {
  console.log('🌱 Starting database seeding...')
  console.log('Make sure you have run the supabase-content-setup.sql script first!')
  
  try {
    await seedNotes()
    await seedQuestionPapers()
    await seedLabPrograms()
    await seedProjects()
    
    console.log('\n✅ Database seeding completed successfully!')
    console.log('\n📝 Next steps:')
    console.log('1. Verify the data in your Supabase dashboard')
    console.log('2. Update your application code to use lib/supabase-database.ts')
    console.log('3. Test the application')
  } catch (error) {
    console.error('\n❌ Seeding failed:', error)
    process.exit(1)
  }
}

// Run seeding
seed()
