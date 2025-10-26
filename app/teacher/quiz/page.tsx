'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Users, Copy, Settings, Trophy, ArrowLeft, Trash2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { DeleteConfirmationModal } from '@/components/delete-confirmation-modal'
import { ToastNotification } from '@/components/toast-notification'

export default function TeacherQuizPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [rooms, setRooms] = useState<any[]>([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [deletingRoomId, setDeletingRoomId] = useState<string | null>(null)
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; roomId: string; roomName: string }>({
    isOpen: false,
    roomId: '',
    roomName: ''
  })
  const [toast, setToast] = useState<{ isOpen: boolean; type: 'success' | 'error' | 'warning' | 'info'; title: string; message?: string }>({
    isOpen: false,
    type: 'success',
    title: '',
    message: ''
  })
  const [formData, setFormData] = useState({
    room_name: '',
    category: 'mathematics',
    difficulty: 'medium',
    question_count: 10,
    time_limit: 30,
    max_players: 30
  })
  const router = useRouter()

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/teacher/login')
    } else {
      setUser(user)
      fetchRooms(user.id)
    }
    setLoading(false)
  }

  const fetchRooms = async (teacherId: string) => {
    const { data } = await supabase
      .from('quiz_rooms')
      .select('*, quiz_participants(count)')
      .eq('teacher_id', teacherId)
      .order('created_at', { ascending: false })
    
    if (data) {
      setRooms(data)
    }
  }

  const generateRoomCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase()
  }

  const handleCreateRoom = () => {
    // Navigate to question creation page
    router.push('/teacher/quiz/create')
  }

  const openDeleteModal = (roomId: string, roomName: string) => {
    setDeleteModal({ isOpen: true, roomId, roomName })
  }

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, roomId: '', roomName: '' })
  }

  const showToast = (type: 'success' | 'error' | 'warning' | 'info', title: string, message?: string) => {
    setToast({ isOpen: true, type, title, message })
  }

  const handleDeleteRoom = async () => {
    const { roomId, roomName } = deleteModal
    setDeletingRoomId(roomId)

    try {
      // First, try to delete associated images from storage
      try {
        const { data: questions } = await supabase
          .from('quiz_questions')
          .select('image_url')
          .eq('room_id', roomId)
        
        if (questions && questions.length > 0) {
          const imagePaths = questions
            .filter(q => q.image_url)
            .map(q => {
              const url = new URL(q.image_url)
              return url.pathname.split('/').slice(-2).join('/')
            })
          
          if (imagePaths.length > 0) {
            await supabase.storage
              .from('quiz-images')
              .remove(imagePaths)
          }
        }
      } catch (storageError) {
        console.error('Error deleting images:', storageError)
      }

      // Delete the room (cascade will delete questions and participants)
      const { error } = await supabase
        .from('quiz_rooms')
        .delete()
        .eq('id', roomId)

      if (error) {
        console.error('Delete error:', error)
        throw error
      }

      // Refresh the rooms list
      if (user) {
        await fetchRooms(user.id)
      }

      closeDeleteModal()
      showToast('success', 'Quiz Deleted!', `"${roomName}" has been permanently deleted.`)
    } catch (error: any) {
      console.error('Error deleting room:', error)
      showToast('error', 'Delete Failed', error.message || 'Please make sure you have permission to delete this quiz.')
    } finally {
      setDeletingRoomId(null)
    }
  }

  const handleCopyCode = (roomCode: string) => {
    navigator.clipboard.writeText(roomCode)
    showToast('success', 'Code Copied!', `Room code "${roomCode}" copied to clipboard.`)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 opacity-30 dark:opacity-10">
          <div className="h-full w-full bg-[linear-gradient(rgba(59,130,246,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.3)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(59,130,246,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.1)_1px,transparent_1px)] bg-[size:20px_20px] animate-pulse" />
        </div>
      </div>

      <div className="relative z-10 pt-24 pb-12 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Back Button */}
          <Button
            variant="outline"
            onClick={() => router.push('/teacher/dashboard')}
            className="mb-6 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>

          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-black dark:text-white flex items-center gap-3">
                <Trophy className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                Quiz Rooms
              </h1>
              <p className="text-zinc-600 dark:text-zinc-400 mt-1">
                Create quiz rooms for your students
              </p>
            </div>
            <Button 
              className="bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200"
              onClick={() => setShowCreateForm(!showCreateForm)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Room
            </Button>
          </div>

          {/* Create Room Form */}
          {showCreateForm && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <Card className="border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-black/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-black dark:text-white">Create New Quiz Room</CardTitle>
                  <CardDescription className="text-zinc-600 dark:text-zinc-400">
                    Set up a quiz for your students
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="room_name">Room Name</Label>
                    <Input
                      id="room_name"
                      placeholder="e.g., Grade 6 Math Quiz"
                      value={formData.room_name}
                      onChange={(e) => setFormData({...formData, room_name: e.target.value})}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
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
                      <Label htmlFor="difficulty">Difficulty</Label>
                      <Select value={formData.difficulty} onValueChange={(value) => setFormData({...formData, difficulty: value})}>
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

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="question_count">Questions</Label>
                      <Input
                        id="question_count"
                        type="number"
                        min="5"
                        max="50"
                        value={formData.question_count}
                        onChange={(e) => setFormData({...formData, question_count: parseInt(e.target.value)})}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="time_limit">Time (sec)</Label>
                      <Input
                        id="time_limit"
                        type="number"
                        min="10"
                        max="120"
                        value={formData.time_limit}
                        onChange={(e) => setFormData({...formData, time_limit: parseInt(e.target.value)})}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="max_players">Max Players</Label>
                      <Input
                        id="max_players"
                        type="number"
                        min="2"
                        max="50"
                        value={formData.max_players}
                        onChange={(e) => setFormData({...formData, max_players: parseInt(e.target.value)})}
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      className="flex-1 bg-black dark:bg-white text-white dark:text-black"
                      onClick={handleCreateRoom}
                    >
                      Create Room
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => setShowCreateForm(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Active Rooms */}
          <Card className="border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-black/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-black dark:text-white">Your Quiz Rooms</CardTitle>
              <CardDescription className="text-zinc-600 dark:text-zinc-400">
                Active and past quiz rooms
              </CardDescription>
            </CardHeader>
            <CardContent>
              {rooms.length === 0 ? (
                <div className="text-center py-12">
                  <Trophy className="h-12 w-12 text-zinc-400 mx-auto mb-4" />
                  <p className="text-zinc-600 dark:text-zinc-400">No quiz rooms yet</p>
                  <p className="text-sm text-zinc-500 dark:text-zinc-500 mt-2">
                    Create your first quiz room to get started
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {rooms.map((room) => (
                    <div key={room.id} className="p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-black dark:text-white">{room.room_name}</h3>
                          <p className="text-sm text-zinc-600 dark:text-zinc-400">
                            Code: {room.room_code} • {room.question_count} questions • {room.status}
                          </p>
                          <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">
                            Created: {new Date(room.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleCopyCode(room.room_code)}
                          >
                            <Copy className="h-4 w-4 mr-2" />
                            Copy Code
                          </Button>
                          {room.status === 'waiting' && (
                            <Button 
                              size="sm"
                              onClick={() => router.push(`/teacher/quiz/lobby/${room.id}`)}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              Start Quiz
                            </Button>
                          )}
                          <Button 
                            size="sm"
                            variant="destructive"
                            onClick={() => openDeleteModal(room.id, room.room_name)}
                            disabled={deletingRoomId === room.id}
                            className="bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
                          >
                            {deletingRoomId === room.id ? (
                              <span className="animate-spin">⏳</span>
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteRoom}
        title="Delete Quiz Room?"
        itemName={deleteModal.roomName}
        isDeleting={deletingRoomId === deleteModal.roomId}
      />

      {/* Toast Notification */}
      <ToastNotification
        isOpen={toast.isOpen}
        onClose={() => setToast({ ...toast, isOpen: false })}
        type={toast.type}
        title={toast.title}
        message={toast.message}
      />
    </div>
  )
}
