"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ClassData, ClassLevel } from "@/lib/types/games"
import { Users, Clock, Target, BookOpen } from "lucide-react"

interface ClassSelectionProps {
  classData: ClassData[]
  selectedClass?: ClassLevel
  onClassSelect: (classId: ClassLevel) => void
  className?: string
}

export function ClassSelection({ 
  classData, 
  selectedClass, 
  onClassSelect, 
  className 
}: ClassSelectionProps) {
  return (
    <div className={cn("space-y-6", className)}>
      <div className="text-center space-y-3">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
        >
          Choose Your Learning Journey
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-muted-foreground text-lg max-w-2xl mx-auto"
        >
          Select your class level to start your gamified STEM learning adventure with Odisha's rich cultural context
        </motion.p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classData.map((classLevel, index) => (
          <motion.div
            key={classLevel.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 + 0.2 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card 
              className={cn(
                "h-full cursor-pointer transition-all duration-300 hover:shadow-lg border-2",
                selectedClass === classLevel.id 
                  ? "border-primary shadow-lg ring-2 ring-primary/20" 
                  : "border-muted hover:border-primary/50"
              )}
              onClick={() => onClassSelect(classLevel.id)}
            >
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between mb-2">
                  <Badge 
                    variant="secondary" 
                    className="text-xs font-medium"
                  >
                    {classLevel.ageRange}
                  </Badge>
                  <div className="flex gap-1">
                    {classLevel.grades.map((grade, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {grade}
                      </Badge>
                    ))}
                  </div>
                </div>
                <CardTitle className="text-xl">{classLevel.name}</CardTitle>
                <CardDescription className="text-sm font-medium text-primary">
                  {classLevel.subtitle}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {classLevel.description}
                </p>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Subjects:</span>
                    <span className="font-medium">
                      {classLevel.subjects.length} available
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <Target className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Games:</span>
                    <span className="font-medium">
                      {classLevel.subjects.reduce((total, subject) => total + subject.games.length, 0)} interactive
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Est. Time:</span>
                    <span className="font-medium">
                      {Math.round(classLevel.subjects.reduce((total, subject) => 
                        total + subject.games.reduce((sum, game) => sum + game.estimatedTime, 0), 0) / 60)} hrs
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 pt-2">
                  {classLevel.subjects.map((subject) => (
                    <Badge 
                      key={subject.id} 
                      variant="secondary"
                      className="text-xs"
                    >
                      {subject.emoji} {subject.name}
                    </Badge>
                  ))}
                </div>

                <Button 
                  className="w-full mt-4" 
                  variant={selectedClass === classLevel.id ? "default" : "outline"}
                >
                  {selectedClass === classLevel.id ? "Selected" : "Select Class"}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {selectedClass && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center pt-6"
        >
          <Button size="lg" className="px-8">
            Continue to Subjects
          </Button>
        </motion.div>
      )}
    </div>
  )
}
