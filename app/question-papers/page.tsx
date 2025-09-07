"use client"

import { useState, useEffect } from "react"
import {
  Search,
  Download,
  Filter,
  MessageSquare,
  Calendar,
  FileText,
  Users,
  CheckCircle,
  ExternalLink,
  Clock,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { motion } from "framer-motion"
import { useToast } from "@/hooks/use-toast"

interface QuestionPaper {
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

interface VTUPaper {
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

interface Comment {
  id: string
  text: string
  author: string
  created_at: string
}

export default function QuestionPapersPage() {
  const [papers, setPapers] = useState<QuestionPaper[]>([])
  const [vtuPapers, setVtuPapers] = useState<VTUPaper[]>([])
  const [filteredPapers, setFilteredPapers] = useState<QuestionPaper[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [semesterFilter, setSemesterFilter] = useState("all")
  const [yearFilter, setYearFilter] = useState("all")
  const [branchFilter, setBranchFilter] = useState("all")
  const [monthFilter, setMonthFilter] = useState("all")
  const [showFilters, setShowFilters] = useState(false)
  const [loading, setLoading] = useState(false)
  const [vtuLoading, setVtuLoading] = useState(false)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const [newComment, setNewComment] = useState("")
  const [selectedNoteId, setSelectedNoteId] = useState("")
  const { toast } = useToast()

  // Sample user-uploaded papers data
  const samplePapers: QuestionPaper[] = [
    {
      id: "1",
      subject_code: "21MAT11",
      subject_name: "Engineering Mathematics I",
      year: 2023,
      semester: 1,
      branch: "CSE",
      file_url: "/sample-qp.pdf",
      created_at: "2024-01-15",
      uploaded_by: "Student",
      comments: [],
    },
    {
      id: "2",
      subject_code: "21PHY12",
      subject_name: "Physics for Engineers",
      year: 2023,
      semester: 1,
      branch: "CSE",
      file_url: "/sample-qp.pdf",
      created_at: "2024-01-14",
      uploaded_by: "Student",
      comments: [],
    },
    {
      id: "3",
      subject_code: "21CSL15",
      subject_name: "Programming in C",
      year: 2022,
      semester: 1,
      branch: "CSE",
      file_url: "/sample-qp.pdf",
      created_at: "2024-01-13",
      uploaded_by: "Student",
      comments: [],
    },
    {
      id: "4",
      subject_code: "21MAT21",
      subject_name: "Engineering Mathematics II",
      year: 2023,
      semester: 2,
      branch: "CSE",
      file_url: "/sample-qp.pdf",
      created_at: "2024-01-12",
      uploaded_by: "Student",
      comments: [],
    },
  ]

  const branches = ["All Branches", "CSE", "ECE", "ME", "CE", "EEE", "ISE", "ETE"]
  const years = ["2024", "2023", "2022", "2021", "2020"]
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  useEffect(() => {
    setPapers(samplePapers)
    setFilteredPapers(samplePapers)
    fetchVTUPapers()
  }, [])

  useEffect(() => {
    let filtered = papers

    if (searchQuery) {
      filtered = filtered.filter(
        (paper) =>
          paper.subject_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          paper.subject_code.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    if (semesterFilter !== "all") {
      filtered = filtered.filter((paper) => paper.semester.toString() === semesterFilter)
    }

    if (yearFilter !== "all") {
      filtered = filtered.filter((paper) => paper.year.toString() === yearFilter)
    }

    if (branchFilter !== "all") {
      filtered = filtered.filter((paper) => paper.branch === branchFilter)
    }

    setFilteredPapers(filtered)
  }, [searchQuery, semesterFilter, yearFilter, branchFilter, papers])

  const fetchVTUPapers = async () => {
    setVtuLoading(true)
    try {
      const params = new URLSearchParams()
      if (semesterFilter !== "all") params.append("semester", semesterFilter)
      if (branchFilter !== "all") params.append("branch", branchFilter)
      if (yearFilter !== "all") params.append("year", yearFilter)
      if (monthFilter !== "all") params.append("month", monthFilter)
      if (searchQuery) params.append("search", searchQuery)

      const response = await fetch(`/api/vtu-papers?${params.toString()}`)
      const data = await response.json()

      if (data.success) {
        setVtuPapers(data.papers)
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch VTU question papers",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Network error while fetching VTU papers",
        variant: "destructive",
      })
    } finally {
      setVtuLoading(false)
    }
  }

  useEffect(() => {
    fetchVTUPapers()
  }, [semesterFilter, branchFilter, yearFilter, monthFilter, searchQuery])

  const handleVTUDownload = async (paper: VTUPaper) => {
    setDownloadingId(paper.id)

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000))

      toast({
        title: "Download Started",
        description: `${paper.subject_name} question paper is being downloaded`,
      })

      setVtuPapers((prev) => prev.map((p) => (p.id === paper.id ? { ...p, download_count: p.download_count + 1 } : p)))
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Unable to download the question paper. Please try again.",
        variant: "destructive",
      })
    } finally {
      setDownloadingId(null)
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

    setPapers((prev) =>
      prev.map((paper) => (paper.id === noteId ? { ...paper, comments: [...(paper.comments || []), comment] } : paper)),
    )

    setNewComment("")
    toast({
      title: "Comment added",
      description: "Your comment has been posted successfully!",
    })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  }

  const getExamTypeColor = (examType: string) => {
    switch (examType) {
      case "SEE":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "CIE":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black pt-20 pb-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-black dark:text-white mb-2">Question Papers</h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Access previous year question papers and official VTU papers
          </p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row gap-4">
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
              className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
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

              <Select value={yearFilter} onValueChange={setYearFilter}>
                <SelectTrigger className="rounded-xl border-zinc-200 dark:border-zinc-800">
                  <SelectValue placeholder="All Years" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Years</SelectItem>
                  {years.map((year) => (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={branchFilter} onValueChange={setBranchFilter}>
                <SelectTrigger className="rounded-xl border-zinc-200 dark:border-zinc-800">
                  <SelectValue placeholder="All Branches" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Branches</SelectItem>
                  {branches.map((branch) => (
                    <SelectItem key={branch} value={branch}>
                      {branch}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={monthFilter} onValueChange={setMonthFilter}>
                <SelectTrigger className="rounded-xl border-zinc-200 dark:border-zinc-800">
                  <SelectValue placeholder="All Months" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Months</SelectItem>
                  {months.map((month) => (
                    <SelectItem key={month} value={month}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </motion.div>
          )}
        </motion.div>

        {/* Tabs for different paper types */}
        <Tabs defaultValue="community" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8 bg-zinc-100 dark:bg-zinc-900">
            <TabsTrigger value="community" className="rounded-xl">
              Community Papers ({filteredPapers.length})
            </TabsTrigger>
            <TabsTrigger value="official" className="rounded-xl">
              Official VTU Papers ({vtuPapers.length})
            </TabsTrigger>
          </TabsList>

          {/* Community Papers Tab */}
          <TabsContent value="community">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="border-zinc-200 dark:border-zinc-800 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="border-zinc-200 dark:border-zinc-800">
                      <TableHead className="text-black dark:text-white font-semibold">Subject Code</TableHead>
                      <TableHead className="text-black dark:text-white font-semibold">Subject Name</TableHead>
                      <TableHead className="text-black dark:text-white font-semibold">Year</TableHead>
                      <TableHead className="text-black dark:text-white font-semibold">Semester</TableHead>
                      <TableHead className="text-black dark:text-white font-semibold">Branch</TableHead>
                      <TableHead className="text-black dark:text-white font-semibold">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPapers.map((paper, index) => (
                      <motion.tr
                        key={paper.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 * index }}
                        className="border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-950"
                      >
                        <TableCell className="font-mono text-black dark:text-white">{paper.subject_code}</TableCell>
                        <TableCell className="font-medium text-black dark:text-white">{paper.subject_name}</TableCell>
                        <TableCell className="text-zinc-600 dark:text-zinc-400">{paper.year}</TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className="bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300"
                          >
                            {paper.semester}st Sem
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="border-zinc-200 dark:border-zinc-800">
                            {paper.branch}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 rounded-lg"
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </Button>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="rounded-lg border-zinc-200 dark:border-zinc-800 bg-transparent"
                                  onClick={() => setSelectedNoteId(paper.id)}
                                >
                                  <MessageSquare className="h-4 w-4 mr-2" />
                                  Comments ({paper.comments?.length || 0})
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl bg-white dark:bg-black border-zinc-200 dark:border-zinc-800">
                                <DialogHeader>
                                  <DialogTitle className="text-black dark:text-white">
                                    Comments - {paper.subject_name}
                                  </DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 max-h-96 overflow-y-auto">
                                  {paper.comments?.map((comment) => (
                                    <div
                                      key={comment.id}
                                      className="border-l-2 border-zinc-200 dark:border-zinc-800 pl-4"
                                    >
                                      <p className="text-sm text-black dark:text-white">{comment.text}</p>
                                      <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                                        By {comment.author} • {new Date(comment.created_at).toLocaleDateString()}
                                      </p>
                                    </div>
                                  ))}
                                  {(!paper.comments || paper.comments.length === 0) && (
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
                                    onClick={() => addComment(paper.id)}
                                    className="bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 rounded-xl"
                                  >
                                    Post
                                  </Button>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </TableBody>
                </Table>
              </Card>

              {filteredPapers.length === 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
                  <p className="text-zinc-600 dark:text-zinc-400">No question papers found matching your criteria.</p>
                </motion.div>
              )}
            </motion.div>
          </TabsContent>

          {/* Official VTU Papers Tab */}
          <TabsContent value="official">
            {vtuLoading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="border-zinc-200 dark:border-zinc-800 animate-pulse">
                    <CardContent className="p-6">
                      <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded mb-2"></div>
                      <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded mb-4"></div>
                      <div className="h-8 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {!vtuLoading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {vtuPapers.map((paper, index) => (
                  <motion.div
                    key={paper.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 * index }}
                  >
                    <Card className="group border-zinc-200 dark:border-zinc-800 hover:border-black dark:hover:border-white transition-all duration-300 overflow-hidden h-full flex flex-col">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start mb-2">
                          <Badge className={getExamTypeColor(paper.exam_type)}>{paper.exam_type}</Badge>
                          {paper.is_official && (
                            <Badge
                              variant="secondary"
                              className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300"
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Official
                            </Badge>
                          )}
                        </div>

                        <CardTitle className="text-lg line-clamp-2 text-black dark:text-white">
                          {paper.subject_name}
                        </CardTitle>

                        <CardDescription className="font-mono text-sm">
                          {paper.subject_code} • Semester {paper.semester}
                        </CardDescription>
                      </CardHeader>

                      <CardContent className="flex-1 flex flex-col">
                        <div className="space-y-3 mb-4">
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-1 text-zinc-600 dark:text-zinc-400">
                              <Calendar className="h-4 w-4" />
                              <span>Exam: {formatDate(paper.exam_date)}</span>
                            </div>
                            <Badge variant="outline" className="border-zinc-200 dark:border-zinc-800">
                              {paper.branch}
                            </Badge>
                          </div>

                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-1 text-zinc-600 dark:text-zinc-400">
                              <Clock className="h-4 w-4" />
                              <span>Added: {formatDate(paper.uploaded_date)}</span>
                            </div>
                            <span className="text-zinc-500 dark:text-zinc-400">{paper.file_size}</span>
                          </div>

                          <div className="flex items-center gap-1 text-sm text-zinc-600 dark:text-zinc-400">
                            <Users className="h-4 w-4" />
                            <span>{paper.download_count.toLocaleString()} downloads</span>
                          </div>
                        </div>

                        <div className="mt-auto space-y-2">
                          <Button
                            onClick={() => handleVTUDownload(paper)}
                            disabled={downloadingId === paper.id}
                            className="w-full bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 rounded-lg"
                          >
                            {downloadingId === paper.id ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                                Downloading...
                              </>
                            ) : (
                              <>
                                <Download className="h-4 w-4 mr-2" />
                                Download PDF
                              </>
                            )}
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full rounded-lg border-zinc-200 dark:border-zinc-800 bg-transparent"
                            onClick={() => window.open(paper.file_url, "_blank")}
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            View Online
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}

            {!vtuLoading && vtuPapers.length === 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
                <FileText className="h-12 w-12 text-zinc-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-black dark:text-white mb-2">No Official Papers Found</h3>
                <p className="text-zinc-600 dark:text-zinc-400">
                  Try adjusting your search criteria or filters to find more papers.
                </p>
              </motion.div>
            )}
          </TabsContent>
        </Tabs>

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
