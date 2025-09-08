"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Bot, X, Minimize2, Maximize2, Send, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { motion, AnimatePresence } from "framer-motion"

interface Message {
  id: string
  text: string
  isUser: boolean
  timestamp: Date
}

interface IgniteVidyaCompanionProps {
  isTerminalOpen: boolean
  onOpen: () => void
}

export default function IgniteVidyaCompanion({ isTerminalOpen, onOpen }: IgniteVidyaCompanionProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hello! I'm your IgniteVidya Companion 🌟 I'm here to motivate you in your STEM learning journey, help you excel in your studies, and support you through grades 6-12 subjects! Let's achieve academic greatness together! 💪 What can I help you with today?",
      isUser: false,
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [onlineCount, setOnlineCount] = useState(847)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus()
    }
  }, [isOpen, isMinimized])

  // Close IgniteVidya Companion when Terminal opens
  useEffect(() => {
    if (isTerminalOpen && isOpen) {
      setIsOpen(false)
    }
  }, [isTerminalOpen, isOpen])

  // Simulate online count changes
  useEffect(() => {
    const interval = setInterval(() => {
      setOnlineCount((prev) => prev + Math.floor(Math.random() * 20) - 10)
    }, 8000)
    return () => clearInterval(interval)
  }, [])

  const handleOpen = () => {
    onOpen() // This will close Terminal
    setIsOpen(true)
  }

  const sendMessage = async () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      isUser: true,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    const message = inputValue
    setInputValue("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/ignitevidya-companion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      })

      const data = await response.json()

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.response || "I'm here to help! Please try asking your question again.",
        isUser: false,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, botMessage])
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm experiencing some technical difficulties. Please try again in a moment!",
        isUser: false,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      sendMessage()
    }
  }

  if (!isOpen) {
    return (
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="fixed bottom-6 left-6 z-40">
        <Button
          onClick={handleOpen}
          className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 shadow-2xl"
          size="icon"
        >
          <Bot className="h-4 w-4 md:h-5 md:w-5" />
        </Button>
      </motion.div>
    )
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className={`fixed bottom-6 left-6 w-80 md:w-96 shadow-2xl z-50 transition-all duration-300 ${
          isMinimized ? "h-12 md:h-14" : "h-96 md:h-[500px]"
        }`}
      >
        <div className="bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden h-full flex flex-col">
          {/* Chat Header */}
          <div className="flex items-center justify-between p-3 md:p-4 bg-black dark:bg-white text-white dark:text-black">
            <div className="flex items-center space-x-2 md:space-x-3">
              <div className="w-6 h-6 md:w-8 md:h-8 bg-white/20 dark:bg-black/20 rounded-full flex items-center justify-center">
                <Bot className="h-3 w-3 md:h-4 md:w-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm md:text-base">IgniteVidya Companion</h3>
                <div className="flex items-center gap-1 md:gap-2">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                  <p className="text-xs opacity-90">{onlineCount} students online</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMinimized(!isMinimized)}
                className="h-6 w-6 md:h-8 md:w-8 text-white dark:text-black hover:bg-white/20 dark:hover:bg-black/20"
              >
                {isMinimized ? (
                  <Maximize2 className="h-3 w-3 md:h-4 md:w-4" />
                ) : (
                  <Minimize2 className="h-3 w-3 md:h-4 md:w-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="h-6 w-6 md:h-8 md:w-8 text-white dark:text-black hover:bg-white/20 dark:hover:bg-black/20"
              >
                <X className="h-3 w-3 md:h-4 md:w-4" />
              </Button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Chat Messages */}
              <div className="flex-1 p-2 md:p-4 overflow-y-auto bg-zinc-50 dark:bg-zinc-950">
                <div className="space-y-2 md:space-y-3">
                  {messages.map((message) => (
                    <div key={message.id} className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[85%] p-2 md:p-3 rounded-lg text-xs md:text-sm ${
                          message.isUser
                            ? "bg-black dark:bg-white text-white dark:text-black"
                            : "bg-white dark:bg-zinc-900 text-black dark:text-white border border-zinc-200 dark:border-zinc-800"
                        }`}
                      >
                        <p className="leading-relaxed">{message.text}</p>
                        <p
                          className={`text-xs mt-1 ${message.isUser ? "text-white/70 dark:text-black/70" : "text-zinc-500"}`}
                        >
                          {message.timestamp.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-2 md:p-3 rounded-lg">
                        <div className="flex space-x-1">
                          <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-black dark:bg-white rounded-full animate-bounce"></div>
                          <div
                            className="w-1.5 h-1.5 md:w-2 md:h-2 bg-black dark:bg-white rounded-full animate-bounce"
                            style={{ animationDelay: "0.1s" }}
                          ></div>
                          <div
                            className="w-1.5 h-1.5 md:w-2 md:h-2 bg-black dark:bg-white rounded-full animate-bounce"
                            style={{ animationDelay: "0.2s" }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Chat Input */}
              <div className="p-2 md:p-4 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black">
                <div className="flex items-center space-x-1 md:space-x-2">
                  <Input
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask about STEM learning..."
                    className="flex-1 rounded-lg border-zinc-200 dark:border-zinc-800 text-xs md:text-sm"
                    disabled={isLoading}
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={isLoading || !inputValue.trim()}
                    size="icon"
                    className="rounded-lg bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 h-8 w-8 md:h-10 md:w-10"
                  >
                    <Send className="h-3 w-3 md:h-4 md:w-4" />
                  </Button>
                </div>
                <div className="flex items-center justify-between mt-1 md:mt-2">
                  <p className="text-xs text-zinc-500">Powered by AI • IgniteVidya</p>
                  <Badge variant="secondary" className="text-xs">
                    <Sparkles className="h-2 w-2 mr-1" />
                    Smart
                  </Badge>
                </div>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
