"use client"

import { useState } from "react"
import { Download, Eye, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

interface SyllabusItem {
  id: string
  subject_name: string
  subject_code: string
  credits: number
  file_url: string
}

export default function SyllabusPage() {
  const [selectedSemester, setSelectedSemester] = useState("")
  const [selectedBranch, setSelectedBranch] = useState("")

  // Sample syllabus data
  const syllabusData: Record<string, Record<string, SyllabusItem[]>> = {
    "1": {
      CSE: [
        {
          id: "1",
          subject_name: "Engineering Mathematics I",
          subject_code: "21MAT11",
          credits: 4,
          file_url: "/syllabus/21MAT11.pdf",
        },
        {
          id: "2",
          subject_name: "Physics for Engineers",
          subject_code: "21PHY12",
          credits: 4,
          file_url: "/syllabus/21PHY12.pdf",
        },
        {
          id: "3",
          subject_name: "Engineering Chemistry",
          subject_code: "21CHE12",
          credits: 4,
          file_url: "/syllabus/21CHE12.pdf",
        },
        {
          id: "4",
          subject_name: "Programming in C",
          subject_code: "21CSL15",
          credits: 2,
          file_url: "/syllabus/21CSL15.pdf",
        },
        {
          id: "5",
          subject_name: "Elements of Civil Engineering",
          subject_code: "21CIV14",
          credits: 3,
          file_url: "/syllabus/21CIV14.pdf",
        },
      ],
    },
    "2": {
      CSE: [
        {
          id: "6",
          subject_name: "Engineering Mathematics II",
          subject_code: "21MAT21",
          credits: 4,
          file_url: "/syllabus/21MAT21.pdf",
        },
        {
          id: "7",
          subject_name: "Data Structures",
          subject_code: "21CSL25",
          credits: 3,
          file_url: "/syllabus/21CSL25.pdf",
        },
        {
          id: "8",
          subject_name: "Digital Design",
          subject_code: "21CS22",
          credits: 4,
          file_url: "/syllabus/21CS22.pdf",
        },
      ],
    },
  }

  const branches = ["CSE", "ECE", "ME", "CE", "EEE", "ISE", "ETE"]
  const semesters = ["1", "2", "3", "4", "5", "6", "7", "8"]

  const getCurrentSyllabus = () => {
    if (!selectedSemester || !selectedBranch) return []
    return syllabusData[selectedSemester]?.[selectedBranch] || []
  }

  const getTotalCredits = () => {
    return getCurrentSyllabus().reduce((total, subject) => total + subject.credits, 0)
  }

  return (
    <div className="min-h-screen bg-background py-8 pt-20">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Syllabus</h1>
          <p className="text-muted-foreground">Access detailed syllabus for all subjects and semesters</p>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Select value={selectedSemester} onValueChange={setSelectedSemester}>
            <SelectTrigger>
              <SelectValue placeholder="Select Semester" />
            </SelectTrigger>
            <SelectContent>
              {semesters.map((sem) => (
                <SelectItem key={sem} value={sem}>
                  {sem}st Semester
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedBranch} onValueChange={setSelectedBranch}>
            <SelectTrigger>
              <SelectValue placeholder="Select Branch" />
            </SelectTrigger>
            <SelectContent>
              {branches.map((branch) => (
                <SelectItem key={branch} value={branch}>
                  {branch}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Syllabus Content */}
        {selectedSemester && selectedBranch ? (
          <div className="space-y-6">
            {/* Summary Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  {selectedSemester}st Semester - {selectedBranch}
                </CardTitle>
                <CardDescription>
                  Total Credits: {getTotalCredits()} | Total Subjects: {getCurrentSyllabus().length}
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Subjects List */}
            <div className="grid gap-4">
              {getCurrentSyllabus().map((subject) => (
                <Card key={subject.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">{subject.subject_name}</h3>
                          <Badge variant="secondary">{subject.credits} Credits</Badge>
                        </div>
                        <p className="text-muted-foreground font-mono text-sm">{subject.subject_code}</p>
                      </div>

                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                        <Button size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {getCurrentSyllabus().length === 0 && (
              <Card>
                <CardContent className="text-center py-12">
                  <p className="text-muted-foreground">
                    No syllabus available for {selectedSemester}st Semester - {selectedBranch}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Please select both semester and branch to view the syllabus</p>
            </CardContent>
          </Card>
        )}

        {/* Information Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>About VTU Syllabus</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">2021 Scheme</h4>
                <p className="text-sm text-muted-foreground">
                  The current syllabus follows the 2021 scheme implemented by VTU. It includes updated curriculum with
                  industry-relevant subjects and practical components.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Credit System</h4>
                <p className="text-sm text-muted-foreground">
                  VTU follows a credit-based system where each subject is assigned credits based on contact hours and
                  importance. Total credits per semester typically range from 20-25.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

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
