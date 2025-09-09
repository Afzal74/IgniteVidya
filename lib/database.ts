import fs from 'fs'
import path from 'path'

// Database file paths
const DATA_DIR = path.join(process.cwd(), 'data')
const NOTES_FILE = path.join(DATA_DIR, 'notes.json')
const PAPERS_FILE = path.join(DATA_DIR, 'question-papers.json')
const LAB_PROGRAMS_FILE = path.join(DATA_DIR, 'lab-programs.json')
const PROJECTS_FILE = path.join(DATA_DIR, 'projects.json')

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true })
}

// Generic function to read JSON file
function readJsonFile<T>(filePath: string): T {
  try {
    if (!fs.existsSync(filePath)) {
      return {} as T
    }
    const data = fs.readFileSync(filePath, 'utf8')
    return JSON.parse(data) as T
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error)
    return {} as T
  }
}

// Generic function to write JSON file
function writeJsonFile<T>(filePath: string, data: T): void {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8')
  } catch (error) {
    console.error(`Error writing file ${filePath}:`, error)
    throw error
  }
}

// Notes database operations
export interface Note {
  id: string
  subject_name: string
  subject_code: string
  scheme: string
  semester: number
  file_url: string
  uploaded_by: string
  created_at: string
  comments: Comment[]
}

export interface Comment {
  id: string
  text: string
  author: string
  created_at: string
}

export function getNotes(): Note[] {
  const data = readJsonFile<{ notes: Note[] }>(NOTES_FILE)
  return data.notes || []
}

export function addNote(note: Omit<Note, 'id' | 'created_at'>): Note {
  const notes = getNotes()
  const newNote: Note = {
    ...note,
    id: Date.now().toString(),
    created_at: new Date().toISOString().split('T')[0]
  }
  notes.push(newNote)
  writeJsonFile(NOTES_FILE, { notes })
  return newNote
}

export function addComment(noteId: string, comment: Omit<Comment, 'id' | 'created_at'>): Comment {
  const notes = getNotes()
  const noteIndex = notes.findIndex(note => note.id === noteId)
  if (noteIndex === -1) {
    throw new Error('Note not found')
  }
  
  const newComment: Comment = {
    ...comment,
    id: `c${Date.now()}`,
    created_at: new Date().toISOString().split('T')[0]
  }
  
  notes[noteIndex].comments.push(newComment)
  writeJsonFile(NOTES_FILE, { notes })
  return newComment
}

// Question Papers database operations
export interface QuestionPaper {
  id: string
  subject_code: string
  subject_name: string
  year: number
  semester: number
  branch: string
  file_url: string
  created_at: string
  uploaded_by?: string
  comments?: Comment[]
}

export interface IgniteVidyaPaper {
  id: string
  subject_code: string
  subject_name: string
  semester: number
  branch: string
  exam_type: string
  exam_date: string
  year: number
  month: string
  scheme: string
  file_url: string
  file_size: string
  download_count: number
  is_official: boolean
  uploaded_date: string
}

export function getQuestionPapers(): QuestionPaper[] {
  const data = readJsonFile<{ papers: QuestionPaper[] }>(PAPERS_FILE)
  return data.papers || []
}

export function getIgniteVidyaPapers(): IgniteVidyaPaper[] {
  const data = readJsonFile<{ vtu_papers: IgniteVidyaPaper[] }>(PAPERS_FILE)
  return data.vtu_papers || []
}

export function addQuestionPaper(paper: Omit<QuestionPaper, 'id' | 'created_at'>): QuestionPaper {
  const papers = getQuestionPapers()
  const newPaper: QuestionPaper = {
    ...paper,
    id: Date.now().toString(),
    created_at: new Date().toISOString().split('T')[0]
  }
  papers.push(newPaper)
  writeJsonFile(PAPERS_FILE, { papers, vtu_papers: getIgniteVidyaPapers() })
  return newPaper
}

// Lab Programs database operations
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

export function getLabPrograms(): LabProgram[] {
  const data = readJsonFile<{ programs: LabProgram[] }>(LAB_PROGRAMS_FILE)
  return data.programs || []
}

export function addLabProgram(program: Omit<LabProgram, 'id' | 'created_at'>): LabProgram {
  const programs = getLabPrograms()
  const newProgram: LabProgram = {
    ...program,
    id: Date.now().toString(),
    created_at: new Date().toISOString().split('T')[0]
  }
  programs.push(newProgram)
  writeJsonFile(LAB_PROGRAMS_FILE, { programs })
  return newProgram
}

// Projects database operations
export interface Project {
  id: string
  title: string
  description: string
  domain: string
  github_url: string
  source_url?: string
  tags: string[]
  difficulty?: string
  created_at: string
}

export function getProjects(): Project[] {
  const data = readJsonFile<{ projects: Project[] }>(PROJECTS_FILE)
  return data.projects || []
}

export function addProject(project: Omit<Project, 'id' | 'created_at'>): Project {
  const projects = getProjects()
  const newProject: Project = {
    ...project,
    id: Date.now().toString(),
    created_at: new Date().toISOString().split('T')[0]
  }
  projects.push(newProject)
  writeJsonFile(PROJECTS_FILE, { projects })
  return newProject
}

// Search functionality
export function searchNotes(query: string): Note[] {
  const notes = getNotes()
  return notes.filter(note => 
    note.subject_name.toLowerCase().includes(query.toLowerCase()) ||
    note.subject_code.toLowerCase().includes(query.toLowerCase())
  )
}

export function searchQuestionPapers(query: string): QuestionPaper[] {
  const papers = getQuestionPapers()
  return papers.filter(paper => 
    paper.subject_name.toLowerCase().includes(query.toLowerCase()) ||
    paper.subject_code.toLowerCase().includes(query.toLowerCase())
  )
}

export function searchLabPrograms(query: string): LabProgram[] {
  const programs = getLabPrograms()
  return programs.filter(program => 
    program.lab_title.toLowerCase().includes(query.toLowerCase()) ||
    program.description.toLowerCase().includes(query.toLowerCase())
  )
}

export function searchProjects(query: string): Project[] {
  const projects = getProjects()
  return projects.filter(project => 
    project.title.toLowerCase().includes(query.toLowerCase()) ||
    project.description.toLowerCase().includes(query.toLowerCase()) ||
    project.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
  )
} 