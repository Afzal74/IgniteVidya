'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'

export default function TestRealtimePage() {
  const [status, setStatus] = useState<'testing' | 'connected' | 'error'>('testing')
  const [logs, setLogs] = useState<string[]>([])
  const [participants, setParticipants] = useState<any[]>([])
  const [realtimeEnabled, setRealtimeEnabled] = useState<boolean | null>(null)

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs(prev => [`[${timestamp}] ${message}`, ...prev].slice(0, 20))
    console.log(message)
  }

  useEffect(() => {
    testRealtimeConnection()
  }, [])

  const testRealtimeConnection = async () => {
    addLog('🔍 Testing Supabase connection...')
    
    // Test basic query
    const { data, error } = await supabase
      .from('quiz_participants')
      .select('*')
      .limit(5)
    
    if (error) {
      addLog(`❌ Database query failed: ${error.message}`)
      setStatus('error')
      return
    }
    
    addLog(`✅ Database query successful (${data?.length || 0} records)`)
    setParticipants(data || [])
    
    // Test realtime subscription
    addLog('🔌 Setting up realtime subscription...')
    
    const channel = supabase
      .channel('test-realtime-channel', {
        config: {
          broadcast: { self: true },
        }
      })
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'quiz_participants',
        },
        (payload) => {
          addLog(`📡 Realtime event received: ${payload.eventType}`)
          addLog(`   Data: ${JSON.stringify(payload.new || payload.old).substring(0, 100)}`)
          
          // Refresh data
          refreshParticipants()
        }
      )
      .subscribe((status) => {
        addLog(`📊 Subscription status: ${status}`)
        
        if (status === 'SUBSCRIBED') {
          addLog('✅ Successfully subscribed to realtime updates!')
          setStatus('connected')
          setRealtimeEnabled(true)
        } else if (status === 'CHANNEL_ERROR') {
          addLog('❌ Realtime subscription failed!')
          setStatus('error')
          setRealtimeEnabled(false)
        } else if (status === 'TIMED_OUT') {
          addLog('⏱️ Subscription timed out')
          setStatus('error')
          setRealtimeEnabled(false)
        }
      })

    return () => {
      addLog('🔌 Cleaning up subscription...')
      supabase.removeChannel(channel)
    }
  }

  const refreshParticipants = async () => {
    const { data } = await supabase
      .from('quiz_participants')
      .select('*')
      .limit(5)
    
    if (data) {
      setParticipants(data)
      addLog(`🔄 Refreshed participants (${data.length} total)`)
    }
  }

  const testInsert = async () => {
    addLog('➕ Testing INSERT operation...')
    
    const { data, error } = await supabase
      .from('quiz_participants')
      .insert({
        room_id: '00000000-0000-0000-0000-000000000000', // Test room ID
        student_name: `Test User ${Date.now()}`,
        score: 0,
        answers_submitted: 0
      })
      .select()
    
    if (error) {
      addLog(`❌ Insert failed: ${error.message}`)
    } else {
      addLog(`✅ Insert successful! ID: ${data[0]?.id}`)
      addLog('   You should see a realtime event above if realtime is working')
    }
  }

  const checkRealtimeStatus = async () => {
    addLog('🔍 Checking realtime publication status...')
    
    const { data, error } = await supabase
      .rpc('check_realtime_enabled')
      .select()
    
    if (error) {
      addLog(`ℹ️ Cannot check realtime status (RPC not available)`)
      addLog(`   Run this query in Supabase SQL Editor:`)
      addLog(`   SELECT tablename FROM pg_publication_tables WHERE pubname = 'supabase_realtime';`)
    } else {
      addLog(`✅ Realtime status: ${JSON.stringify(data)}`)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-black dark:text-white mb-8">
          Quiz Realtime Test Page
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Status Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {status === 'testing' && <Loader2 className="h-5 w-5 animate-spin" />}
                {status === 'connected' && <CheckCircle className="h-5 w-5 text-green-600" />}
                {status === 'error' && <XCircle className="h-5 w-5 text-red-600" />}
                Connection Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Database:</span>
                  <span className={status !== 'error' ? 'text-green-600' : 'text-red-600'}>
                    {status !== 'error' ? '✅ Connected' : '❌ Error'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Realtime:</span>
                  <span className={realtimeEnabled ? 'text-green-600' : realtimeEnabled === false ? 'text-red-600' : 'text-yellow-600'}>
                    {realtimeEnabled ? '✅ Enabled' : realtimeEnabled === false ? '❌ Disabled' : '⏳ Testing...'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions Card */}
          <Card>
            <CardHeader>
              <CardTitle>Test Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button onClick={testInsert} className="w-full">
                Test Insert (Watch for Realtime Event)
              </Button>
              <Button onClick={refreshParticipants} variant="outline" className="w-full">
                Refresh Participants
              </Button>
              <Button onClick={checkRealtimeStatus} variant="outline" className="w-full">
                Check Realtime Status
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Logs Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Event Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-sm h-96 overflow-y-auto">
              {logs.length === 0 ? (
                <div className="text-gray-500">Waiting for events...</div>
              ) : (
                logs.map((log, i) => (
                  <div key={i} className="mb-1">{log}</div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Participants Card */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Participants ({participants.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {participants.length === 0 ? (
              <p className="text-gray-500">No participants found</p>
            ) : (
              <div className="space-y-2">
                {participants.map((p) => (
                  <div key={p.id} className="p-3 bg-gray-100 dark:bg-gray-800 rounded">
                    <div className="font-semibold">{p.student_name}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Score: {p.score} | Joined: {new Date(p.joined_at).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="mt-8 border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="text-blue-600 dark:text-blue-400">
              How to Use This Test Page
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">1. Check Connection Status</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                The page automatically tests the connection when loaded. Check if both Database and Realtime show ✅.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">2. Test Realtime Updates</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Click "Test Insert" to add a test participant. If realtime is working, you'll see a "📡 Realtime event received" message in the logs.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">3. Open Multiple Windows</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Open this page in 2 browser windows. Click "Test Insert" in one window and watch the other window's logs for realtime events.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">4. If Realtime is Disabled</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Run the SQL script in <code className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">supabase-realtime-fix.sql</code> in your Supabase SQL Editor, then refresh this page.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
