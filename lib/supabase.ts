import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://your-project.supabase.co"
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "your-anon-key"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database schema types
export interface Note {
  id: string
  subject_name: string
  subject_code: string
  scheme: string
  semester: number
  file_url: string
  uploaded_by: string
  created_at: string
}

export interface Comment {
  id: string
  note_id: string
  text: string
  author: string
  created_at: string
}

export interface QuestionPaper {
  id: string
  subject_code: string
  subject_name: string
  year: number
  semester: number
  branch: string
  file_url: string
  created_at: string
}

export interface LabProgram {
  id: string
  lab_title: string
  program_number: number
  description: string
  code: string
  expected_output: string
  semester: number
  created_at: string
}
