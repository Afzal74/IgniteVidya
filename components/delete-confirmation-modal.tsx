'use client'

import { AlertTriangle, X } from 'lucide-react'
import { Button } from './ui/button'

interface DeleteConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description?: string
  itemName: string
  isDeleting?: boolean
}

export function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  itemName,
  isDeleting = false
}: DeleteConfirmationModalProps) {
  return (
    <>
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-zinc-950 rounded-2xl shadow-2xl max-w-md w-full border-4 border-black dark:border-white overflow-hidden">

              {/* Header */}
              <div className="bg-black dark:bg-white p-6 relative">
                <div className="w-20 h-20 bg-gradient-to-br from-red-500 via-pink-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-2xl">
                  <AlertTriangle className="h-10 w-10 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white dark:text-black text-center">
                  {title}
                </h2>
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 text-white/60 dark:text-black/60 hover:text-white dark:hover:text-black transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-black">
                <div className="bg-gradient-to-r from-red-500 to-pink-500 p-[2px] rounded-xl mb-6">
                  <div className="bg-white dark:bg-black rounded-xl p-4">
                    <p className="text-center text-xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent mb-2">
                      "{itemName}"
                    </p>
                    {description && (
                      <p className="text-sm text-zinc-600 dark:text-zinc-400 text-center">
                        {description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-gradient-to-r from-red-500 to-pink-500 rounded-full mt-2 shadow-lg shadow-red-500/50" />
                    <p className="text-sm text-black dark:text-white font-medium">
                      The quiz room will be permanently deleted
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-full mt-2 shadow-lg shadow-orange-500/50" />
                    <p className="text-sm text-black dark:text-white font-medium">
                      All questions will be removed
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mt-2 shadow-lg shadow-purple-500/50" />
                    <p className="text-sm text-black dark:text-white font-medium">
                      All participant data will be lost
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-gradient-to-r from-pink-500 to-red-500 rounded-full mt-2 shadow-lg shadow-pink-500/50" />
                    <p className="text-sm text-black dark:text-white font-medium">
                      Any uploaded images will be deleted
                    </p>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-yellow-400 to-orange-400 p-[2px] rounded-xl mb-6">
                  <div className="bg-white dark:bg-black rounded-xl p-4">
                    <p className="text-sm font-bold text-center bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                      ⚠️ This action cannot be undone!
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <Button
                    onClick={onClose}
                    variant="outline"
                    className="flex-1 border-2 border-black dark:border-white text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black font-bold"
                    disabled={isDeleting}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={onConfirm}
                    disabled={isDeleting}
                    className="flex-1 bg-gradient-to-r from-red-600 via-pink-600 to-purple-600 hover:from-red-700 hover:via-pink-700 hover:to-purple-700 text-white font-bold shadow-lg shadow-red-500/50"
                  >
                    {isDeleting ? (
                      <>
                        <span className="animate-spin mr-2">⏳</span>
                        Deleting...
                      </>
                    ) : (
                      'Delete Forever'
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}
