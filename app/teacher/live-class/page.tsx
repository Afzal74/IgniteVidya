'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Users, Copy, Video, ArrowLeft, Trash2, Play } from 'lucide-react'
import { motion } from 'framer-motion'
import { DeleteConfirmationModal } from '@/components/delete-confirmation-modal'
import { ToastNotification } from '@/components/toast-notification'

export default function TeacherLiveClassPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [rooms, setRooms] = useState<any[]>([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [creating, setCreating] = useState(false)
  const [deletingRoomId, setDeletingRoomId] = useState<string | null>(null)
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; roomId: string; roomName: string }>({
    isOpen: false, roomId: '', roomName: ''
  })
  const [toast, setToast] = useState<{ isOpen: boolean; type: 'success' | 'error' | 'warning' | 'info'; title: string; message?: string }>({
    isOpen: false, type: 'success', title: '', message: ''
  })
  const [formData, setFormData] = useState({
    room_name: '',
    subject: 'mathematics',
    description: '',
    max_participants: 50
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
      .from('live_class_rooms')
      .select('*, live_class_participants(count)')
      .eq('teacher_id', teacherId)
      .order('created_at', { ascending: false })
    
    if (data) setRooms(data)
  }

  const generateRoomCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase()
  }

  const handleCreateRoom = async () => {
    if (!formData.room_name.trim()) {
      showToast('error', 'Error', 'Please enter a class name')
      return
    }

    setCreating(true)
    try {
      const roomCode = generateRoomCode()
      
      const { data, error } = await supabase
        .from('live_class_rooms')
        .insert({
          teacher_id: user.id,
          room_code: roomCode,
          room_name: formData.room_name,
          subject: formData.subject,
          description: formData.description,
          max_participants: formData.max_participants,
          status: 'waiting'
        })
        .select()
        .single()

      if (error) throw error

      showToast('success', 'Class Created!', `Room code: ${roomCode}`)
      setShowCreateForm(false)
      setFormData({ room_name: '', subject: 'mathematics', description: '', max_participants: 50 })
      fetchRooms(user.id)
    } catch (error: any) {
      showToast('error', 'Error', error.message || 'Failed to create class')
    } finally {
      setCreating(false)
    }
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
      const { error } = await supabase
        .from('live_class_rooms')
        .delete()
        .eq('id', roomId)

      if (error) throw error

      if (user) await fetchRooms(user.id)
      closeDeleteModal()
      showToast('success', 'Class Deleted!', `"${roomName}" has been deleted.`)
    } catch (error: any) {
      showToast('error', 'Delete Failed', error.message)
    } finally {
      setDeletingRoomId(null)
    }
  }

  const handleCopyCode = (roomCode: string) => {
    navigator.clipboard.writeText(roomCode)
    showToast('success', 'Code Copied!', `Room code "${roomCode}" copied to clipboard.`)
  }

  const startClass = async (roomId: string) => {
    // Go to lobby first to see students waiting
    router.push(`/teacher/live-class/lobby/${roomId}`)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'waiting':
        return <span className="px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-xs">Waiting</span>
      case 'live':
        return <span className="px-2 py-1 rounded-full bg-red-500/20 text-red-400 text-xs animate-pulse">● Live</span>
      case 'ended':
        return <span className="px-2 py-1 rounded-full bg-gray-500/20 text-gray-400 text-xs">Ended</span>
      default:
        return null
    }
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
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 opacity-30 dark:opacity-10">
          <div className="h-full w-full bg-[linear-gradient(rgba(59,130,246,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.3)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(59,130,246,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.1)_1px,transparent_1px)] bg-[size:20px_20px]" />
        </div>
      </div>

      <div className="relative z-10 pt-24 pb-12 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
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
                <Video className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                Live Classes
              </h1>
              <p className="text-zinc-600 dark:text-zinc-400 mt-1">
                Create live video classes for your students
              </p>
            </div>
            <Button 
              className="bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200"
              onClick={() => setShowCreateForm(!showCreateForm)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Class
            </Button>
          </div>

          {/* Create Form */}
          {showCreateForm && (
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
              <Card className="border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-black/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-black dark:text-white">Create New Live Class</CardTitle>
                  <CardDescription className="text-zinc-600 dark:text-zinc-400">
                    Set up a live video class for your students
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="room_name">Class Name</Label>
                    <Input
                      id="room_name"
                      placeholder="e.g., Grade 6 Math - Fractions"
                      value={formData.room_name}
                      onChange={(e) => setFormData({...formData, room_name: e.target.value})}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject</Label>
                      <Select value={formData.subject} onValueChange={(value) => setFormData({...formData, subject: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mathematics">Mathematics</SelectItem>
                          <SelectItem value="science">Science</SelectItem>
                          <SelectItem value="english">English</SelectItem>
                          <SelectItem value="social">Social Studies</SelectItem>
                          <SelectItem value="computer">Computer Science</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="max_participants">Max Students</Label>
                      <Input
                        id="max_participants"
                        type="number"
                        min="5"
                        max="100"
                        value={formData.max_participants}
                        onChange={(e) => setFormData({...formData, max_participants: parseInt(e.target.value)})}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Textarea
                      id="description"
                      placeholder="What will you cover in this class?"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      className="flex-1 bg-black dark:bg-white text-white dark:text-black"
                      onClick={handleCreateRoom}
                      disabled={creating}
                    >
                      {creating ? 'Creating...' : 'Create Class'}
                    </Button>
                    <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Classes List */}
          <Card className="border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-black/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-black dark:text-white">Your Live Classes</CardTitle>
              <CardDescription className="text-zinc-600 dark:text-zinc-400">
                Manage your live class sessions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {rooms.length === 0 ? (
                <div className="text-center py-12">
                  <Video className="h-12 w-12 text-zinc-400 mx-auto mb-4" />
                  <p className="text-zinc-600 dark:text-zinc-400">No live classes yet</p>
                  <p className="text-sm text-zinc-500 mt-2">Create your first live class to get started</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {rooms.map((room) => (
                    <div key={room.id} className="p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-black dark:text-white">{room.room_name}</h3>
                            {getStatusBadge(room.status)}
                          </div>
                          <p className="text-sm text-zinc-600 dark:text-zinc-400">
                            Code: <span className="font-mono font-bold">{room.room_code}</span> • {room.subject} • Max {room.max_participants} students
                          </p>
                          <p className="text-xs text-zinc-500 mt-1">
                            Created: {new Date(room.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleCopyCode(room.room_code)}>
                            <Copy className="h-4 w-4 mr-2" />
                            Copy Code
                          </Button>
                          {room.status === 'waiting' && (
                            <Button 
                              size="sm"
                              onClick={() => startClass(room.id)}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              <Play className="h-4 w-4 mr-2" />
                              Start Class
                            </Button>
                          )}
                          {room.status === 'live' && (
                            <Button 
                              size="sm"
                              onClick={() => router.push(`/teacher/live-class/room/${room.id}`)}
                              className="bg-red-600 hover:bg-red-700 text-white"
                            >
                              <Video className="h-4 w-4 mr-2" />
                              Join
                            </Button>
                          )}
                          <Button 
                            size="sm"
                            variant="destructive"
                            onClick={() => openDeleteModal(room.id, room.room_name)}
                            disabled={deletingRoomId === room.id}
                          >
                            {deletingRoomId === room.id ? '⏳' : <Trash2 className="h-4 w-4" />}
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

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteRoom}
        title="Delete Live Class?"
        itemName={deleteModal.roomName}
        isDeleting={deletingRoomId === deleteModal.roomId}
      />

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
