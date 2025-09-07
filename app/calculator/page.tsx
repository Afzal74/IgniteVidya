"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calculator, Plus, Trash2, TrendingUp, Award, Target } from "lucide-react"

interface Subject {
  id: string
  name: string
  marks: string
  totalMarks: string
  percentage: number
}

export default function PercentageCalculator() {
  const [subjects, setSubjects] = useState<Subject[]>([
    { id: "1", name: "Mathematics", marks: "", totalMarks: "100", percentage: 0 },
    { id: "2", name: "Science", marks: "", totalMarks: "100", percentage: 0 },
    { id: "3", name: "English", marks: "", totalMarks: "100", percentage: 0 },
  ])
  const [grade, setGrade] = useState("")
  const [overallPercentage, setOverallPercentage] = useState(0)
  const [gradePoint, setGradePoint] = useState("")

  const grades = [
    { value: "6", label: "Grade 6" },
    { value: "7", label: "Grade 7" },
    { value: "8", label: "Grade 8" },
    { value: "9", label: "Grade 9" },
    { value: "10", label: "Grade 10" },
    { value: "11", label: "Grade 11" },
    { value: "12", label: "Grade 12" },
  ]

  const addSubject = () => {
    const newSubject: Subject = {
      id: Date.now().toString(),
      name: "",
      marks: "",
      totalMarks: "100",
      percentage: 0,
    }
    setSubjects([...subjects, newSubject])
  }

  const removeSubject = (id: string) => {
    if (subjects.length > 1) {
      setSubjects(subjects.filter((subject) => subject.id !== id))
    }
  }

  const updateSubject = (id: string, field: keyof Subject, value: string) => {
    setSubjects(
      subjects.map((subject) => {
        if (subject.id === id) {
          const updatedSubject = { ...subject, [field]: value }
          
          if (field === "marks" || field === "totalMarks") {
            const marks = parseFloat(updatedSubject.marks) || 0
            const totalMarks = parseFloat(updatedSubject.totalMarks) || 100
            updatedSubject.percentage = totalMarks > 0 ? (marks / totalMarks) * 100 : 0
          }
          
          return updatedSubject
        }
        return subject
      })
    )
  }

  const calculateOverall = () => {
    const validSubjects = subjects.filter(
      (subject) => subject.marks && subject.totalMarks && subject.name
    )
    
    if (validSubjects.length === 0) return

    const totalMarks = validSubjects.reduce((sum, subject) => sum + (parseFloat(subject.marks) || 0), 0)
    const totalMaxMarks = validSubjects.reduce((sum, subject) => sum + (parseFloat(subject.totalMarks) || 100), 0)
    
    const percentage = totalMaxMarks > 0 ? (totalMarks / totalMaxMarks) * 100 : 0
    setOverallPercentage(percentage)

    // Calculate grade point based on percentage
    let gradePointValue = ""
    if (percentage >= 90) gradePointValue = "A+ (Outstanding)"
    else if (percentage >= 80) gradePointValue = "A (Excellent)"
    else if (percentage >= 70) gradePointValue = "B+ (Very Good)"
    else if (percentage >= 60) gradePointValue = "B (Good)"
    else if (percentage >= 50) gradePointValue = "C+ (Satisfactory)"
    else if (percentage >= 40) gradePointValue = "C (Pass)"
    else gradePointValue = "F (Fail)"
    
    setGradePoint(gradePointValue)
  }

  const getGradeColor = (percentage: number) => {
    if (percentage >= 90) return "text-green-600 dark:text-green-400"
    if (percentage >= 80) return "text-blue-600 dark:text-blue-400"
    if (percentage >= 70) return "text-purple-600 dark:text-purple-400"
    if (percentage >= 60) return "text-yellow-600 dark:text-yellow-400"
    if (percentage >= 50) return "text-orange-600 dark:text-orange-400"
    return "text-red-600 dark:text-red-400"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-black dark:to-purple-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Calculator className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Percentage Calculator</h1>
          <p className="text-gray-600 dark:text-gray-400">Calculate your academic performance with ease</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calculator Form */}
          <div className="lg:col-span-2">
            <Card className="p-6 shadow-xl border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Subject Details</h2>
                <Select value={grade} onValueChange={setGrade}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Select Grade" />
                  </SelectTrigger>
                  <SelectContent>
                    {grades.map((grade) => (
                      <SelectItem key={grade.value} value={grade.value}>
                        {grade.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                {subjects.map((subject, index) => (
                  <motion.div
                    key={subject.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <div className="md:col-span-2">
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Subject Name
                      </Label>
                      <Input
                        value={subject.name}
                        onChange={(e) => updateSubject(subject.id, "name", e.target.value)}
                        placeholder="Enter subject name"
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Marks Obtained
                      </Label>
                      <Input
                        type="number"
                        value={subject.marks}
                        onChange={(e) => updateSubject(subject.id, "marks", e.target.value)}
                        placeholder="0"
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Total Marks
                      </Label>
                      <Input
                        type="number"
                        value={subject.totalMarks}
                        onChange={(e) => updateSubject(subject.id, "totalMarks", e.target.value)}
                        placeholder="100"
                        className="mt-1"
                      />
                    </div>
                    
                    <div className="flex items-end gap-2">
                      <div className="flex-1">
                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Percentage
                        </Label>
                        <div className="mt-1 p-2 text-center font-bold">
                          {subject.percentage.toFixed(1)}%
                        </div>
                      </div>
                      
                      {subjects.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => removeSubject(subject.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </motion.div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  onClick={addSubject}
                  className="w-full border-dashed border-2 border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Subject
                </Button>

                <Button
                  onClick={calculateOverall}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium py-3 rounded-lg"
                >
                  Calculate Overall Percentage
                </Button>
              </div>
            </Card>
          </div>

          {/* Results Panel */}
          <div className="space-y-6">
            {/* Overall Results */}
            <Card className="p-6 shadow-xl border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Overall Results
              </h3>
              
              <div className="space-y-4">
                <div className="text-center">
                  <div className={`text-4xl font-bold ${getGradeColor(overallPercentage)}`}>
                    {overallPercentage.toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Overall Percentage</div>
                </div>
                
                {gradePoint && (
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">
                      {gradePoint}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Grade Point</div>
                  </div>
                )}
              </div>
            </Card>

            {/* Performance Insights */}
            <Card className="p-6 shadow-xl border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Award className="h-5 w-5" />
                Performance Insights
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Subjects</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {subjects.filter(s => s.name).length}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Average Score</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {subjects.filter(s => s.percentage > 0).length > 0 
                      ? (subjects.reduce((sum, s) => sum + s.percentage, 0) / subjects.filter(s => s.percentage > 0).length).toFixed(1) + '%'
                      : '0%'
                    }
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Status</span>
                  <span className={`font-semibold ${
                    overallPercentage >= 50 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  }`}>
                    {overallPercentage >= 50 ? 'Pass' : 'Needs Improvement'}
                  </span>
                </div>
              </div>
            </Card>

            {/* Tips */}
            <Card className="p-6 shadow-xl border-0 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <Target className="h-5 w-5" />
                Study Tips
              </h3>
              
              <div className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
                {overallPercentage >= 80 ? (
                  <p> Excellent work! Keep up the great performance!</p>
                ) : overallPercentage >= 60 ? (
                  <p> Good progress! Focus on weaker subjects to improve further.</p>
                ) : (
                  <p> Don't worry! Create a study plan and practice regularly to improve your scores.</p>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
