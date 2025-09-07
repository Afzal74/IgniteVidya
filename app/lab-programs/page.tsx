"use client"

import { useState, useEffect } from "react"
import { ChevronDown, ChevronRight, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { ScrollArea } from "@/components/ui/scroll-area"

interface LabProgram {
  id: string
  lab_title: string
  program_number: number
  description: string
  code: string
  expected_output: string
  semester: number
}

export default function LabProgramsPage() {
  const [programs, setPrograms] = useState<LabProgram[]>([])
  const [filteredPrograms, setFilteredPrograms] = useState<LabProgram[]>([])
  const [semesterFilter, setSemesterFilter] = useState("all")
  const [openPrograms, setOpenPrograms] = useState<Set<string>>(new Set())
  const { toast } = useToast()

  // Fetch lab programs from API
  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const response = await fetch('/api/lab-programs')
        const data = await response.json()
        if (data.success) {
          setPrograms(data.programs)
          setFilteredPrograms(data.programs)
        }
      } catch (error) {
        console.error('Error fetching lab programs:', error)
        toast({
          title: "Error",
          description: "Failed to load lab programs",
          variant: "destructive",
        })
      }
    }
    
    fetchPrograms()
  }, [toast])

  useEffect(() => {
    let filtered = programs

    if (semesterFilter !== "all") {
      filtered = filtered.filter((program) => program.semester.toString() === semesterFilter)
    }

    setFilteredPrograms(filtered)
  }, [semesterFilter, programs])

  const toggleProgram = (programId: string) => {
    const newOpenPrograms = new Set(openPrograms)
    if (newOpenPrograms.has(programId)) {
      newOpenPrograms.delete(programId)
    } else {
      newOpenPrograms.add(programId)
    }
    setOpenPrograms(newOpenPrograms)
  }

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    toast({
      title: "Copied!",
      description: "Code copied to clipboard",
    })
  }

  // Group programs by lab title
  const groupedPrograms = filteredPrograms.reduce(
    (acc, program) => {
      if (!acc[program.lab_title]) {
        acc[program.lab_title] = []
      }
      acc[program.lab_title].push(program)
      return acc
    },
    {} as Record<string, LabProgram[]>,
  )

  return (
    <div className="min-h-screen bg-background py-8 pt-20">
    <div className="max-w-7xl mx-auto px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Lab Programs</h1>
          <p className="text-muted-foreground">
            Complete solutions for laboratory programming exercises
          </p>
        </div>
  
        <Select value={semesterFilter} onValueChange={setSemesterFilter}>
          <SelectTrigger className="w-full md:w-48 mt-4 md:mt-0">
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
      </div>
  
      <div className="space-y-6">
        {Object.entries(groupedPrograms).map(([labTitle, labPrograms]) => (
          <Card key={labTitle}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {labTitle}
                <Badge variant="secondary">
                  Semester {labPrograms[0].semester}
                </Badge>
              </CardTitle>
              <CardDescription>
                {labPrograms.length} programs available
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {labPrograms.map((program) => (
                  <Collapsible
                    key={program.id}
                    open={openPrograms.has(program.id)}
                    onOpenChange={() => toggleProgram(program.id)}
                  >
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="ghost"
                        className="w-full justify-between p-4 h-auto text-left whitespace-normal break-words"
                      >
                        <div>
                          <div className="font-medium">
                            Program {program.program_number}: {program.description}
                          </div>
                        </div>
                        {openPrograms.has(program.id) ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="px-4 pb-4">
                      <div className="space-y-4 max-h-96 overflow-y-auto">
                        <div>
                          <h4 className="font-medium mb-2 text-black dark:text-white">
                            Code:
                          </h4>
                          <div className="relative">
                            <ScrollArea className="h-64 w-full rounded-lg border border-zinc-200 dark:border-zinc-800">
                              <pre className="bg-zinc-50 dark:bg-zinc-950 p-4 text-sm">
                                <code className="text-black dark:text-white break-words whitespace-pre-wrap">
                                  {program.code}
                                </code>
                              </pre>
                            </ScrollArea>
                            <Button
                              size="sm"
                              variant="outline"
                              className="absolute top-2 right-2 bg-white dark:bg-black"
                              onClick={() => copyCode(program.code)}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
  
                        <div>
                          <h4 className="font-medium mb-2 text-black dark:text-white">
                            Expected Output:
                          </h4>
                          <ScrollArea className="h-32 w-full rounded-lg border border-green-200 dark:border-green-800">
                            <pre className="bg-green-50 dark:bg-green-950/20 p-4 text-sm">
                              <code className="text-green-800 dark:text-green-200 break-words whitespace-pre-wrap">
                                {program.expected_output}
                              </code>
                            </pre>
                          </ScrollArea>
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
  
      {Object.keys(groupedPrograms).length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No lab programs found for the selected semester.
          </p>
        </div>
      )}
    </div>
  
    {/* Copyright Footer */}
    <footer className="py-3 md:py-6 px-2 md:px-4 border-t border-zinc-200 dark:border-zinc-800 mt-12">
      <div className="max-w-6xl mx-auto text-center">
        <p className="text-xs text-zinc-600 dark:text-zinc-400">
          © 2024 VTU Vault. Created by{" "}
          <span className="font-semibold text-black dark:text-white">Afzal</span>. All
          rights reserved.
        </p>
      </div>
    </footer>
  </div>
  

  )
}
