"use client"

import { useParams } from "next/navigation"
import { BookOpen, FileText, Code, Calculator } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export default function SemesterPage() {
  const params = useParams()
  const semesterId = params.id as string

  const semesterData = {
    "1": {
      name: "1st Semester",
      subjects: [
        { code: "21MAT11", name: "Engineering Mathematics I", credits: 4 },
        { code: "21PHY12", name: "Physics for Engineers", credits: 4 },
        { code: "21CHE12", name: "Engineering Chemistry", credits: 4 },
        { code: "21CSL15", name: "Programming in C", credits: 2 },
        { code: "21CIV14", name: "Elements of Civil Engineering", credits: 3 },
      ],
    },
    "2": {
      name: "2nd Semester",
      subjects: [
        { code: "21MAT21", name: "Engineering Mathematics II", credits: 4 },
        { code: "21CSL25", name: "Data Structures", credits: 3 },
        { code: "21CS22", name: "Digital Design", credits: 4 },
      ],
    },
  }

  const semester = semesterData[semesterId as keyof typeof semesterData]

  if (!semester) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold mb-4">Semester Not Found</h1>
          <p className="text-muted-foreground">The requested semester information is not available.</p>
        </div>
      </div>
    )
  }

  const quickLinks = [
    { title: "Notes", icon: BookOpen, href: "/notes", description: "Study materials" },
    { title: "Question Papers", icon: FileText, href: "/question-papers", description: "Previous papers" },
    { title: "Lab Programs", icon: Code, href: "/lab-programs", description: "Programming solutions" },
    { title: "Calculator", icon: Calculator, href: "/calculator", description: "SGPA/CGPA tools" },
  ]

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{semester.name}</h1>
          <p className="text-muted-foreground">Complete resources for {semester.name} subjects</p>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {quickLinks.map((link) => (
            <Link key={link.title} href={link.href}>
              <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer">
                <CardContent className="p-4 text-center">
                  <link.icon className="h-8 w-8 text-primary mx-auto mb-2" />
                  <h3 className="font-semibold text-sm">{link.title}</h3>
                  <p className="text-xs text-muted-foreground">{link.description}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Subjects */}
        <Card>
          <CardHeader>
            <CardTitle>Subjects</CardTitle>
            <CardDescription>All subjects for {semester.name}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {semester.subjects.map((subject) => (
                <div key={subject.code} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-semibold">{subject.name}</h3>
                    <p className="text-sm text-muted-foreground font-mono">{subject.code}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary">{subject.credits} Credits</Badge>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        Notes
                      </Button>
                      <Button size="sm" variant="outline">
                        Papers
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
