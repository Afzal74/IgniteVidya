'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Trash2, ArrowLeft, Save, CheckCircle, Image as ImageIcon, X } from 'lucide-react'
import { motion } from 'framer-motion'
import Image from 'next/image'

interface Question {
  id: string
  question_text: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  correct_answer: 'A' | 'B' | 'C' | 'D'
  points: number
  image_url?: string
  image_file?: File
}

export default function CreateQuizPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [roomData, setRoomData] = useState({
    room_name: '',
    category: 'mathematics',
    difficulty: 'medium',
    time_limit: 30,
    max_players: 30
  })
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: '1',
      question_text: '',
      option_a: '',
      option_b: '',
      option_c: '',
      option_d: '',
      correct_answer: 'A',
      points: 10
    }
  ])

  const addQuestion = () => {
    setQuestions([...questions, {
      id: Date.now().toString(),
      question_text: '',
      option_a: '',
      option_b: '',
      option_c: '',
      option_d: '',
      correct_answer: 'A',
      points: 10
    }])
  }

  const removeQuestion = (id: string) => {
    if (questions.length > 1) {
      setQuestions(questions.filter(q => q.id !== id))
    }
  }

  const updateQuestion = (id: string, field: keyof Question, value: any) => {
    setQuestions(questions.map(q => 
      q.id === id ? { ...q, [field]: value } : q
    ))
  }

  const generateRoomCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase()
  }

  const handleImageUpload = (questionId: string, file: File) => {
    // Validate file
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file')
      return
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      alert('Image size must be less than 5MB')
      return
    }

    // Create preview URL
    const previewUrl = URL.createObjectURL(file)
    
    setQuestions(questions.map(q => 
      q.id === questionId ? { ...q, image_file: file, image_url: previewUrl } : q
    ))
  }

  const removeImage = (questionId: string) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId && q.image_url) {
        URL.revokeObjectURL(q.image_url)
        return { ...q, image_file: undefined, image_url: undefined }
      }
      return q
    }))
  }

  const uploadImage = async (file: File, roomId: string, questionIndex: number): Promise<string> => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${roomId}/question-${questionIndex}.${fileExt}`
    
    const { error: uploadError } = await supabase.storage
      .from('quiz-images')
      .upload(fileName, file, { upsert: true })

    if (uploadError) throw uploadError

    const { data } = supabase.storage
      .from('quiz-images')
      .getPublicUrl(fileName)

    return data.publicUrl
  }

  const handleSaveQuiz = async () => {
    // Validate
    if (!roomData.room_name) {
      alert('Please enter a room name')
      return
    }

    const invalidQuestions = questions.filter(q => 
      !q.question_text || !q.option_a || !q.option_b || !q.option_c || !q.option_d
    )

    if (invalidQuestions.length > 0) {
      alert('Please fill in all question fields')
      return
    }

    setSaving(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/teacher/login')
        return
      }

      const roomCode = generateRoomCode()

      // Create quiz room
      const { data: room, error: roomError } = await supabase
        .from('quiz_rooms')
        .insert({
          teacher_id: user.id,
          room_code: roomCode,
          room_name: roomData.room_name,
          category: roomData.category,
          difficulty: roomData.difficulty,
          question_count: questions.length,
          time_limit: roomData.time_limit,
          max_players: roomData.max_players
        })
        .select()
        .single()

      if (roomError) throw roomError

      // Upload images and create questions
      const questionsToInsert = await Promise.all(
        questions.map(async (q, index) => {
          let imageUrl = null
          
          // Upload image if exists
          if (q.image_file) {
            try {
              imageUrl = await uploadImage(q.image_file, room.id, index + 1)
            } catch (error) {
              console.error('Error uploading image:', error)
            }
          }

          return {
            room_id: room.id,
            question_text: q.question_text,
            option_a: q.option_a,
            option_b: q.option_b,
            option_c: q.option_c,
            option_d: q.option_d,
            correct_answer: q.correct_answer,
            points: q.points,
            order_number: index + 1,
            image_url: imageUrl
          }
        })
      )

      const { error: questionsError } = await supabase
        .from('quiz_questions')
        .insert(questionsToInsert)

      if (questionsError) throw questionsError

      alert(`Quiz created successfully!\n\nRoom Code: ${roomCode}\n\nShare this code with your students.`)
      router.push(`/teacher/quiz/lobby/${room.id}`)
    } catch (error: any) {
      alert('Error creating quiz: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 opacity-30 dark:opacity-10">
          <div className="h-full w-full bg-[linear-gradient(rgba(59,130,246,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.3)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(59,130,246,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.1)_1px,transparent_1px)] bg-[size:20px_20px] animate-pulse" />
        </div>
      </div>

      <div className="relative z-10 pt-24 pb-12 px-4 md:px-8">
        <div className="max-w-5xl mx-auto">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-black dark:text-white">Create Quiz</h1>
            <p className="text-zinc-600 dark:text-zinc-400 mt-1">
              Add custom questions for your students
            </p>
          </div>

          {/* Quiz Settings */}
          <Card className="border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-black/80 backdrop-blur-sm mb-6">
            <CardHeader>
              <CardTitle className="text-black dark:text-white">Quiz Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Room Name</Label>
                <Input
                  placeholder="e.g., Grade 6 Math Quiz"
                  value={roomData.room_name}
                  onChange={(e) => setRoomData({...roomData, room_name: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={roomData.category} onValueChange={(value) => setRoomData({...roomData, category: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mathematics">Mathematics</SelectItem>
                      <SelectItem value="science">Science</SelectItem>
                      <SelectItem value="technology">Technology</SelectItem>
                      <SelectItem value="engineering">Engineering</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Difficulty</Label>
                  <Select value={roomData.difficulty} onValueChange={(value) => setRoomData({...roomData, difficulty: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Time per Question (seconds)</Label>
                  <Input
                    type="number"
                    min="10"
                    max="120"
                    value={roomData.time_limit}
                    onChange={(e) => setRoomData({...roomData, time_limit: parseInt(e.target.value)})}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Max Players</Label>
                  <Input
                    type="number"
                    min="2"
                    max="50"
                    value={roomData.max_players}
                    onChange={(e) => setRoomData({...roomData, max_players: parseInt(e.target.value)})}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Questions */}
          <div className="space-y-4 mb-6">
            {questions.map((question, index) => (
              <motion.div
                key={question.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-black/80 backdrop-blur-sm">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-black dark:text-white">Question {index + 1}</CardTitle>
                      {questions.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeQuestion(question.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Question</Label>
                      <Textarea
                        placeholder="Enter your question here..."
                        value={question.question_text}
                        onChange={(e) => updateQuestion(question.id, 'question_text', e.target.value)}
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Option A</Label>
                        <Input
                          placeholder="Option A"
                          value={question.option_a}
                          onChange={(e) => updateQuestion(question.id, 'option_a', e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Option B</Label>
                        <Input
                          placeholder="Option B"
                          value={question.option_b}
                          onChange={(e) => updateQuestion(question.id, 'option_b', e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Option C</Label>
                        <Input
                          placeholder="Option C"
                          value={question.option_c}
                          onChange={(e) => updateQuestion(question.id, 'option_c', e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Option D</Label>
                        <Input
                          placeholder="Option D"
                          value={question.option_d}
                          onChange={(e) => updateQuestion(question.id, 'option_d', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Correct Answer</Label>
                        <Select 
                          value={question.correct_answer} 
                          onValueChange={(value: any) => updateQuestion(question.id, 'correct_answer', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="A">A</SelectItem>
                            <SelectItem value="B">B</SelectItem>
                            <SelectItem value="C">C</SelectItem>
                            <SelectItem value="D">D</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Points</Label>
                        <Input
                          type="number"
                          min="1"
                          max="100"
                          value={question.points}
                          onChange={(e) => updateQuestion(question.id, 'points', parseInt(e.target.value))}
                        />
                      </div>
                    </div>

                    {/* Image Upload */}
                    <div className="space-y-2">
                      <Label>Question Image (Optional)</Label>
                      {question.image_url ? (
                        <div className="relative">
                          <div className="relative w-full h-48 rounded-lg overflow-hidden border-2 border-zinc-200 dark:border-zinc-800">
                            <Image
                              src={question.image_url}
                              alt="Question image"
                              fill
                              className="object-contain"
                            />
                          </div>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => removeImage(question.id)}
                            className="absolute top-2 right-2"
                          >
                            <X className="h-4 w-4 mr-1" />
                            Remove
                          </Button>
                        </div>
                      ) : (
                        <div className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              if (file) handleImageUpload(question.id, file)
                            }}
                            className="hidden"
                            id={`image-upload-${question.id}`}
                          />
                          <label
                            htmlFor={`image-upload-${question.id}`}
                            className="cursor-pointer flex flex-col items-center"
                          >
                            <ImageIcon className="h-12 w-12 text-zinc-400 mb-2" />
                            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">
                              Click to upload an image
                            </p>
                            <p className="text-xs text-zinc-500">
                              PNG, JPG, GIF up to 5MB
                            </p>
                          </label>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={addQuestion}
              className="flex-1"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Question
            </Button>

            <Button
              onClick={handleSaveQuiz}
              disabled={saving}
              className="flex-1 bg-black dark:bg-white text-white dark:text-black"
            >
              {saving ? (
                'Creating...'
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Create Quiz
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
