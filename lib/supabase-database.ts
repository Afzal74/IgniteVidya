import { supabase } from './supabase'

// Types
export interface Note {
  id: string
  subject_name: string
  subject_code: string
  scheme: string
  semester?: number
  class?: string // e.g., "10", "11", "12"
  file_url?: string
  thumbnail_url?: string
  cover_image_url?: string
  uploaded_by?: string
  description?: string
  tags?: string[]
  download_count?: number
  view_count?: number
  file_size?: string
  page_count?: number
  created_at: string
  updated_at?: string
  comments?: Comment[]
}

export interface Comment {
  id: string
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
  exam_type?: string
  file_url: string
  thumbnail_url?: string
  uploaded_by?: string
  description?: string
  tags?: string[]
  download_count?: number
  view_count?: number
  file_size?: string
  created_at: string
  updated_at?: string
  comments?: Comment[]
}

export interface LabProgram {
  id: string
  lab_title: string
  program_number: number
  description: string
  code: string
  expected_output: string
  semester: number
  language?: string
  difficulty?: string
  thumbnail_url?: string
  tags?: string[]
  view_count?: number
  created_at: string
  updated_at?: string
}

export interface Project {
  id: string
  title: string
  description: string
  domain: string
  github_url: string
  source_url?: string
  thumbnail_url?: string
  cover_image_url?: string
  tags?: string[]
  difficulty?: string
  tech_stack?: string[]
  features?: string[]
  view_count?: number
  star_count?: number
  created_at: string
  updated_at?: string
}

// Notes operations
export async function getNotes(): Promise<Note[]> {
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching notes:', error)
    return []
  }

  return data || []
}

export async function getNotesWithComments(): Promise<Note[]> {
  const { data, error } = await supabase
    .from('notes')
    .select(`
      *,
      comments:notes_comments(*)
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching notes with comments:', error)
    return []
  }

  return data || []
}

export async function addNote(note: Omit<Note, 'id' | 'created_at' | 'updated_at'>): Promise<Note | null> {
  const { data, error } = await supabase
    .from('notes')
    .insert(note)
    .select()
    .single()

  if (error) {
    console.error('Error adding note:', error)
    return null
  }

  return data
}

export async function addNoteComment(noteId: string, comment: Omit<Comment, 'id' | 'created_at'>): Promise<Comment | null> {
  const { data, error } = await supabase
    .from('notes_comments')
    .insert({
      note_id: noteId,
      ...comment
    })
    .select()
    .single()

  if (error) {
    console.error('Error adding comment:', error)
    return null
  }

  return data
}

// Question Papers operations
export async function getQuestionPapers(): Promise<QuestionPaper[]> {
  const { data, error } = await supabase
    .from('question_papers')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching question papers:', error)
    return []
  }

  return data || []
}

export async function getQuestionPapersWithComments(): Promise<QuestionPaper[]> {
  const { data, error } = await supabase
    .from('question_papers')
    .select(`
      *,
      comments:question_papers_comments(*)
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching question papers with comments:', error)
    return []
  }

  return data || []
}

export async function addQuestionPaper(paper: Omit<QuestionPaper, 'id' | 'created_at' | 'updated_at'>): Promise<QuestionPaper | null> {
  const { data, error } = await supabase
    .from('question_papers')
    .insert(paper)
    .select()
    .single()

  if (error) {
    console.error('Error adding question paper:', error)
    return null
  }

  return data
}

export async function addQuestionPaperComment(paperId: string, comment: Omit<Comment, 'id' | 'created_at'>): Promise<Comment | null> {
  const { data, error } = await supabase
    .from('question_papers_comments')
    .insert({
      paper_id: paperId,
      ...comment
    })
    .select()
    .single()

  if (error) {
    console.error('Error adding comment:', error)
    return null
  }

  return data
}

// Lab Programs operations
export async function getLabPrograms(): Promise<LabProgram[]> {
  const { data, error } = await supabase
    .from('lab_programs')
    .select('*')
    .order('program_number', { ascending: true })

  if (error) {
    console.error('Error fetching lab programs:', error)
    return []
  }

  return data || []
}

export async function addLabProgram(program: Omit<LabProgram, 'id' | 'created_at' | 'updated_at'>): Promise<LabProgram | null> {
  const { data, error } = await supabase
    .from('lab_programs')
    .insert(program)
    .select()
    .single()

  if (error) {
    console.error('Error adding lab program:', error)
    return null
  }

  return data
}

// Projects operations
export async function getProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching projects:', error)
    return []
  }

  return data || []
}

export async function addProject(project: Omit<Project, 'id' | 'created_at' | 'updated_at'>): Promise<Project | null> {
  const { data, error } = await supabase
    .from('projects')
    .insert(project)
    .select()
    .single()

  if (error) {
    console.error('Error adding project:', error)
    return null
  }

  return data
}

// Search functionality
export async function searchNotes(query: string): Promise<Note[]> {
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .or(`subject_name.ilike.%${query}%,subject_code.ilike.%${query}%`)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error searching notes:', error)
    return []
  }

  return data || []
}

export async function searchQuestionPapers(query: string): Promise<QuestionPaper[]> {
  const { data, error } = await supabase
    .from('question_papers')
    .select('*')
    .or(`subject_name.ilike.%${query}%,subject_code.ilike.%${query}%`)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error searching question papers:', error)
    return []
  }

  return data || []
}

export async function searchLabPrograms(query: string): Promise<LabProgram[]> {
  const { data, error } = await supabase
    .from('lab_programs')
    .select('*')
    .or(`lab_title.ilike.%${query}%,description.ilike.%${query}%`)
    .order('program_number', { ascending: true })

  if (error) {
    console.error('Error searching lab programs:', error)
    return []
  }

  return data || []
}

export async function searchProjects(query: string): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .or(`title.ilike.%${query}%,description.ilike.%${query}%,tags.cs.{${query}}`)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error searching projects:', error)
    return []
  }

  return data || []
}

// Filter operations
export async function getNotesByClass(classNumber: string): Promise<Note[]> {
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('class', classNumber)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching notes by class:', error)
    return []
  }

  return data || []
}

export async function getNotesByScheme(scheme: string): Promise<Note[]> {
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('scheme', scheme)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching notes by scheme:', error)
    return []
  }

  return data || []
}

export async function getQuestionPapersBySemester(semester: number): Promise<QuestionPaper[]> {
  const { data, error } = await supabase
    .from('question_papers')
    .select('*')
    .eq('semester', semester)
    .order('year', { ascending: false })

  if (error) {
    console.error('Error fetching question papers by semester:', error)
    return []
  }

  return data || []
}

export async function getLabProgramsBySemester(semester: number): Promise<LabProgram[]> {
  const { data, error } = await supabase
    .from('lab_programs')
    .select('*')
    .eq('semester', semester)
    .order('program_number', { ascending: true })

  if (error) {
    console.error('Error fetching lab programs by semester:', error)
    return []
  }

  return data || []
}

export async function getProjectsByDomain(domain: string): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('domain', domain)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching projects by domain:', error)
    return []
  }

  return data || []
}
