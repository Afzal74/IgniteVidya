"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { useState } from "react"
import { useSoundEffects } from "@/hooks/useSoundEffects"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Search,
  Filter,
  Eye,
  Download,
  MessageSquare,
} from "lucide-react"

// Sample data for notes
const sampleNotes = [
  {
    id: "1",
    subject_name: "Advanced Mathematics",
    subject_code: "MATH12",
    scheme: "2025",
    class: "12",
    created_at: "Jan 15, 2025",
    comments: [
      {
        id: "c1",
        text: "Excellent calculus examples! Very helpful for board exams.",
        author: "Math Student",
        created_at: "2025-01-10T10:30:00Z"
      }
    ]
  },
  {
    id: "2",
    subject_name: "Organic Chemistry",
    subject_code: "CHEM11",
    scheme: "2025",
    class: "11",
    created_at: "Jan 12, 2025",
    comments: []
  },
  {
    id: "3",
    subject_name: "Physics - Mechanics",
    subject_code: "PHYS11",
    scheme: "2025",
    class: "11",
    created_at: "Jan 10, 2025",
    comments: [
      {
        id: "c2",
        text: "Could you add more solved problems on kinematics?",
        author: "Physics Student",
        created_at: "2025-01-08T14:20:00Z"
      },
      {
        id: "c3",
        text: "Great explanation of Newton's laws!",
        author: "Science Student",
        created_at: "2025-01-09T09:15:00Z"
      }
    ]
  },
  {
    id: "4",
    subject_name: "Biology - Genetics",
    subject_code: "BIOL12",
    scheme: "2024",
    class: "12",
    created_at: "Jan 8, 2025",
    comments: [
      {
        id: "c4",
        text: "The heredity diagrams are crystal clear!",
        author: "Bio Student",
        created_at: "2025-01-05T16:45:00Z"
      }
    ]
  },
  {
    id: "5",
    subject_name: "Computer Science",
    subject_code: "CS12",
    scheme: "2025",
    class: "12",
    created_at: "Jan 7, 2025",
    comments: [
      {
        id: "c5",
        text: "Python programming examples are perfect!",
        author: "CS Student",
        created_at: "2025-01-04T11:20:00Z"
      },
      {
        id: "c6",
        text: "Need more examples on data structures.",
        author: "Tech Student",
        created_at: "2025-01-06T14:30:00Z"
      }
    ]
  },
  {
    id: "6",
    subject_name: "English Literature",
    subject_code: "ENG10",
    scheme: "2024",
    class: "10",
    created_at: "Jan 5, 2025",
    comments: [
      {
        id: "c7",
        text: "Shakespeare analysis is well explained!",
        author: "Literature Student",
        created_at: "2025-01-02T09:15:00Z"
      }
    ]
  }
];

export default function NotesPage() {
  const { playHoverSound, playClickSound, playSearchSound, playTypingSound } = useSoundEffects()
  
  // State for search and filters
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [classFilter, setClassFilter] = useState("all");
  const [schemeFilter, setSchemeFilter] = useState("all");
  
  // State for comments
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [newComment, setNewComment] = useState("");
  
  // Filter notes based on search and filters
  const filteredNotes = sampleNotes.filter(note => {
    const matchesSearch = 
      note.subject_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.subject_code.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesClass = classFilter === "all" || note.class === classFilter;
    const matchesScheme = schemeFilter === "all" || note.scheme === schemeFilter;
    
    return matchesSearch && matchesClass && matchesScheme;
  });
  
  // Add comment function
  const addComment = (noteId: string) => {
    if (newComment.trim()) {
      console.log(`Adding comment to note ${noteId}:`, newComment);
      setNewComment("");
    }
  };

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
              <h1 className="text-4xl font-bold text-black dark:text-white mb-2">Student Library</h1>
              <p className="text-zinc-600 dark:text-zinc-400">Access study materials for all subjects</p>
            </div>
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
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  if (e.target.value.length > 0) {
                    playTypingSound()
                  }
                }}
                onFocus={() => playSearchSound()}
                className="pl-12 rounded-xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950"
              />
            </div>

            <Button
              variant="outline"
              onClick={() => {
                playClickSound('secondary')
                setShowFilters(!showFilters)
              }}
              onMouseEnter={() => playHoverSound('button')}
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
              <Select value={classFilter} onValueChange={setClassFilter}>
                <SelectTrigger className="rounded-xl border-zinc-200 dark:border-zinc-800">
                  <SelectValue placeholder="All Classes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  {[6, 7, 8, 9, 10, 11, 12].map((cls) => (
                    <SelectItem key={cls} value={cls.toString()}>
                      Class {cls}
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
                  <SelectItem value="2025">2025 Scheme</SelectItem>
                  <SelectItem value="2024">2024 Scheme</SelectItem>
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
              <Card 
                className="group border-zinc-200 dark:border-zinc-800 hover:border-black dark:hover:border-white transition-all duration-300 overflow-hidden"
                onMouseEnter={() => playHoverSound('card')}
              >
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
                    <span>Class {note.class}</span>
                    <span>{note.created_at}</span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="flex-1 bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 rounded-lg"
                        onClick={() => playClickSound('primary')}
                        onMouseEnter={() => playHoverSound('button')}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 rounded-lg border-zinc-200 dark:border-zinc-800 bg-transparent"
                        onClick={() => playClickSound('secondary')}
                        onMouseEnter={() => playHoverSound('button')}
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
              © 2025 IgniteVidya. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </div>
  )
}
