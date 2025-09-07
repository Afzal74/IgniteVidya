"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Search, Download, Eye, Upload, MessageSquare, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { motion } from "framer-motion"
import { supabase } from "@/lib/supabase"

interface Note {
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

interface Comment {
  id: string
  text: string
  author: string
  created_at: string
}

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([])
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [semesterFilter, setSemesterFilter] = useState("all")
  const [schemeFilter, setSchemeFilter] = useState("all")
  const [isUploading, setIsUploading] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [uploadForm, setUploadForm] = useState({
    subject_name: "",
    subject_code: "",
    scheme: "2021",
    semester: "1",
  })
  const [newComment, setNewComment] = useState("")
  const [selectedNoteId, setSelectedNoteId] = useState("")
  const { toast } = useToast()

  // Fetch notes from API
  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const response = await fetch('/api/notes')
        const data = await response.json()
        if (data.success) {
          setNotes(data.notes)
          setFilteredNotes(data.notes)
        }
      } catch (error) {
        console.error('Error fetching notes:', error)
        toast({
          title: "Error",
          description: "Failed to load notes",
          variant: "destructive",
        })
      }
    }
    
    fetchNotes()
  }, [toast])

  useEffect(() => {
    let filtered = notes

    if (searchQuery) {
      filtered = filtered.filter(
        (note) =>
          note.subject_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          note.subject_code.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    if (semesterFilter !== "all") {
      filtered = filtered.filter((note) => note.semester.toString() === semesterFilter)
    }

    if (schemeFilter !== "all") {
      filtered = filtered.filter((note) => note.scheme === schemeFilter)
    }

    setFilteredNotes(filtered)
  }, [searchQuery, semesterFilter, schemeFilter, notes])

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      // 1. Upload to Supabase Storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("notes")
        .upload(fileName, file)

      if (uploadError) throw uploadError

      // 2. Get the public URL
      const { data: publicUrlData } = supabase.storage
        .from("notes")
        .getPublicUrl(fileName)
      const publicUrl = publicUrlData?.publicUrl

      if (!publicUrl) throw new Error("Failed to get public URL from Supabase.")

      // 3. Save note with Supabase file URL
      const newNote: Note = {
        id: Date.now().toString(),
        ...uploadForm,
        semester: Number.parseInt(uploadForm.semester),
        file_url: publicUrl,
        uploaded_by: "Current User",
        created_at: new Date().toISOString().split("T")[0],
        comments: [],
      }

      setNotes((prev) => [newNote, ...prev])
      setUploadForm({
        subject_name: "",
        subject_code: "",
        scheme: "2021",
        semester: "1",
      })

      toast({
        title: "Success",
        description: "Notes uploaded successfully!",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to upload notes. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const addComment = async (noteId: string) => {
    if (!newComment.trim()) return

    const comment: Comment = {
      id: Date.now().toString(),
      text: newComment,
      author: "Current User",
      created_at: new Date().toISOString(),
    }

    setNotes((prev) =>
      prev.map((note) => (note.id === noteId ? { ...note, comments: [...note.comments, comment] } : note)),
    )

    setNewComment("")
    toast({
      title: "Comment added",
      description: "Your comment has been posted successfully!",
    })
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black pt-20 pb-24">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold text-black dark:text-white mb-2">Study Notes</h1>
              <p className="text-zinc-600 dark:text-zinc-400">Access and share study materials for all subjects</p>
            </div>

            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 rounded-xl">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Notes
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-white dark:bg-black border-zinc-200 dark:border-zinc-800">
                <DialogHeader>
                  <DialogTitle className="text-black dark:text-white">Upload Study Notes</DialogTitle>
                  <DialogDescription className="text-zinc-600 dark:text-zinc-400">
                    Share your notes with fellow students
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    placeholder="Subject Name"
                    value={uploadForm.subject_name}
                    onChange={(e) => setUploadForm((prev) => ({ ...prev, subject_name: e.target.value }))}
                    className="rounded-xl border-zinc-200 dark:border-zinc-800"
                  />
                  <Input
                    placeholder="Subject Code"
                    value={uploadForm.subject_code}
                    onChange={(e) => setUploadForm((prev) => ({ ...prev, subject_code: e.target.value }))}
                    className="rounded-xl border-zinc-200 dark:border-zinc-800"
                  />
                  <Select
                    value={uploadForm.scheme}
                    onValueChange={(value) => setUploadForm((prev) => ({ ...prev, scheme: value }))}
                  >
                    <SelectTrigger className="rounded-xl border-zinc-200 dark:border-zinc-800">
                      <SelectValue placeholder="Select Scheme" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2021">2021 Scheme</SelectItem>
                      <SelectItem value="CBCS">CBCS Scheme</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={uploadForm.semester}
                    onValueChange={(value) => setUploadForm((prev) => ({ ...prev, semester: value }))}
                  >
                    <SelectTrigger className="rounded-xl border-zinc-200 dark:border-zinc-800">
                      <SelectValue placeholder="Select Semester" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                        <SelectItem key={sem} value={sem.toString()}>
                          {sem}st Semester
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileUpload}
                    disabled={isUploading}
                    className="rounded-xl border-zinc-200 dark:border-zinc-800"
                  />
                  {isUploading && <p className="text-sm text-zinc-600 dark:text-zinc-400">Uploading...</p>}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-zinc-400 h-5 w-5" />
              <Input
                placeholder="Search subjects or codes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 rounded-xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950"
              />
            </div>

            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="rounded-xl border-zinc-200 dark:border-zinc-800"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>

          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 flex flex-col md:flex-row gap-4"
            >
              <Select value={semesterFilter} onValueChange={setSemesterFilter}>
                <SelectTrigger className="rounded-xl border-zinc-200 dark:border-zinc-800">
                  <SelectValue placeholder="All Semesters" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Semesters</SelectItem>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                    <SelectItem key={sem} value={sem.toString()}>
                      {sem}st Semester
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={schemeFilter} onValueChange={setSchemeFilter}>
                <SelectTrigger className="rounded-xl border-zinc-200 dark:border-zinc-800">
                  <SelectValue placeholder="All Schemes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Schemes</SelectItem>
                  <SelectItem value="2021">2021 Scheme</SelectItem>
                  <SelectItem value="CBCS">CBCS Scheme</SelectItem>
                </SelectContent>
              </Select>
            </motion.div>
          )}
        </motion.div>

        {/* Notes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNotes.map((note, index) => (
            <motion.div
              key={note.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
            >
              <Card className="group border-zinc-200 dark:border-zinc-800 hover:border-black dark:hover:border-white transition-all duration-300 overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-black dark:text-white mb-1 line-clamp-2">
                        {note.subject_name}
                      </h3>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">{note.subject_code}</p>
                    </div>
                    <Badge
                      variant="secondary"
                      className="ml-2 bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300"
                    >
                      {note.scheme}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                    <span>Semester {note.semester}</span>
                    <span>{note.created_at}</span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="flex-1 bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 rounded-lg"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 rounded-lg border-zinc-200 dark:border-zinc-800 bg-transparent"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900"
                          onClick={() => setSelectedNoteId(note.id)}
                        >
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Comments ({note.comments.length})
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl bg-white dark:bg-black border-zinc-200 dark:border-zinc-800">
                        <DialogHeader>
                          <DialogTitle className="text-black dark:text-white">
                            Comments - {note.subject_name}
                          </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 max-h-96 overflow-y-auto">
                          {note.comments.map((comment) => (
                            <div key={comment.id} className="border-l-2 border-zinc-200 dark:border-zinc-800 pl-4">
                              <p className="text-sm text-black dark:text-white">{comment.text}</p>
                              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                                By {comment.author} • {new Date(comment.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          ))}
                          {note.comments.length === 0 && (
                            <p className="text-zinc-600 dark:text-zinc-400 text-center py-4">No comments yet</p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Textarea
                            placeholder="Add a comment..."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            className="flex-1 rounded-xl border-zinc-200 dark:border-zinc-800"
                          />
                          <Button
                            onClick={() => addComment(note.id)}
                            className="bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 rounded-xl"
                          >
                            Post
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {filteredNotes.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
            <p className="text-zinc-600 dark:text-zinc-400">No notes found matching your criteria.</p>
          </motion.div>
        )}

        {/* Copyright Footer */}
        <footer className="py-3 md:py-6 px-2 md:px-4 border-t border-zinc-200 dark:border-zinc-800 mt-12">
          <div className="max-w-6xl mx-auto text-center">
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              © 2024 VTU Vault. Created by <span className="font-semibold text-black dark:text-white">Afzal</span>. All
              rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </div>
  )
}
