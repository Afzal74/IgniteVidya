'use client'

import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react'
import { useEffect } from 'react'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

interface ToastNotificationProps {
  isOpen: boolean
  onClose: () => void
  type: ToastType
  title: string
  message?: string
  duration?: number
}

export function ToastNotification({
  isOpen,
  onClose,
  type,
  title,
  message,
  duration = 4000
}: ToastNotificationProps) {
  useEffect(() => {
    if (isOpen && duration > 0) {
      const timer = setTimeout(onClose, duration)
      return () => clearTimeout(timer)
    }
  }, [isOpen, duration, onClose])

  const config = {
    success: {
      icon: CheckCircle,
      bgColor: 'from-green-500 via-emerald-500 to-teal-500',
      borderColor: 'border-black dark:border-white',
      iconBg: 'from-green-500 to-emerald-500',
      textColor: 'text-green-600 dark:text-green-400'
    },
    error: {
      icon: XCircle,
      bgColor: 'from-red-500 via-pink-500 to-rose-500',
      borderColor: 'border-black dark:border-white',
      iconBg: 'from-red-500 to-pink-500',
      textColor: 'text-red-600 dark:text-red-400'
    },
    warning: {
      icon: AlertCircle,
      bgColor: 'from-yellow-500 via-orange-500 to-amber-500',
      borderColor: 'border-black dark:border-white',
      iconBg: 'from-yellow-500 to-orange-500',
      textColor: 'text-yellow-600 dark:text-yellow-400'
    },
    info: {
      icon: Info,
      bgColor: 'from-blue-500 via-cyan-500 to-sky-500',
      borderColor: 'border-black dark:border-white',
      iconBg: 'from-blue-500 to-cyan-500',
      textColor: 'text-blue-600 dark:text-blue-400'
    }
  }

  const { icon: Icon, bgColor, borderColor, iconBg, textColor } = config[type]

  return (
    <>
      {isOpen && (
        <div className="fixed top-4 right-4 z-[100] max-w-md">
          <div className={`bg-white dark:bg-black rounded-2xl shadow-2xl border-4 ${borderColor} overflow-hidden`}>
            {/* Colored top bar with gradient */}
            <div className={`h-3 bg-gradient-to-r ${bgColor}`} />
            
            <div className="p-4 flex items-start gap-4">
              {/* Icon with gradient background */}
              <div className={`flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br ${iconBg} flex items-center justify-center shadow-lg`}>
                <Icon className="h-6 w-6 text-white" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-black dark:text-white mb-1 text-lg">
                  {title}
                </h3>
                {message && (
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    {message}
                  </p>
                )}
              </div>

              {/* Close button */}
              <button
                onClick={onClose}
                className="flex-shrink-0 text-zinc-400 hover:text-black dark:hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Progress bar */}
            {duration > 0 && (
              <div className="h-2 bg-zinc-200 dark:bg-zinc-800">
                <div
                  className={`h-full bg-gradient-to-r ${bgColor} shadow-lg transition-all`}
                  style={{
                    width: '100%',
                    animation: `shrink ${duration}ms linear forwards`
                  }}
                />
              </div>
            )}
          </div>
        </div>
      )}
      <style jsx>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </>
  )
}
