'use client'

import { useEffect, useState } from 'react'
import { Wifi, WifiOff } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface RealtimeStatusIndicatorProps {
  status: 'SUBSCRIBED' | 'CHANNEL_ERROR' | 'TIMED_OUT' | 'CLOSED' | 'CONNECTING'
}

export function RealtimeStatusIndicator({ status }: RealtimeStatusIndicatorProps) {
  const [show, setShow] = useState(true)

  useEffect(() => {
    // Auto-hide after 5 seconds if connected
    if (status === 'SUBSCRIBED') {
      const timer = setTimeout(() => setShow(false), 5000)
      return () => clearTimeout(timer)
    } else {
      setShow(true)
    }
  }, [status])

  const getStatusConfig = () => {
    switch (status) {
      case 'SUBSCRIBED':
        return {
          icon: Wifi,
          text: 'Live Updates Active',
          color: 'bg-green-500',
          textColor: 'text-green-700 dark:text-green-300',
          bgColor: 'bg-green-50 dark:bg-green-950'
        }
      case 'CONNECTING':
        return {
          icon: Wifi,
          text: 'Connecting...',
          color: 'bg-yellow-500',
          textColor: 'text-yellow-700 dark:text-yellow-300',
          bgColor: 'bg-yellow-50 dark:bg-yellow-950'
        }
      default:
        return {
          icon: WifiOff,
          text: 'Connection Lost',
          color: 'bg-red-500',
          textColor: 'text-red-700 dark:text-red-300',
          bgColor: 'bg-red-50 dark:bg-red-950'
        }
    }
  }

  const config = getStatusConfig()
  const Icon = config.icon

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-4 right-4 z-50"
        >
          <div className={`${config.bgColor} ${config.textColor} px-4 py-2 rounded-full shadow-lg flex items-center gap-2 border border-current/20`}>
            <motion.div
              animate={status === 'SUBSCRIBED' ? { scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Icon className="h-4 w-4" />
            </motion.div>
            <span className="text-sm font-medium">{config.text}</span>
            {status === 'SUBSCRIBED' && (
              <motion.div
                className={`w-2 h-2 ${config.color} rounded-full`}
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
