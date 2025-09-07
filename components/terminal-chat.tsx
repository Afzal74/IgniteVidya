"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Terminal, X, Minimize2, Maximize2, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { motion, AnimatePresence } from "framer-motion"

interface Message {
  id: string
  text: string
  isUser: boolean
  timestamp: Date
}

interface TerminalChatProps {
  isVTUCompanionOpen: boolean
  onOpen: () => void
}

export default function TerminalChat({ isVTUCompanionOpen, onOpen }: TerminalChatProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "VTU Vault Terminal v1.0 initialized\nType 'help' for available commands",
      isUser: false,
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [commandHistory, setCommandHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
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

  // Close terminal when VTU Companion opens
  useEffect(() => {
    if (isVTUCompanionOpen && isOpen) {
      setIsOpen(false)
    }
  }, [isVTUCompanionOpen, isOpen])

  const handleOpen = () => {
    onOpen() // This will close VTU Companion
    setIsOpen(true)
  }

  const processCommand = async (command: string) => {
    const cmd = command.toLowerCase().trim()

    // Built-in commands
    if (cmd === "help") {
      return `Available commands:
• help - Show this help message
• clear - Clear terminal
• about - About VTU Vault
• notes - Access study notes
• papers - View question papers
• labs - Browse lab programs
• calc - Open CGPA calculator
• projects - Explore project ideas
• syllabus - View syllabus
• results - Check VTU results
• grades - VTU grading system info
• contact - Contact information
• version - Show version info`
    }

    if (cmd === "clear") {
      setMessages([
        {
          id: Date.now().toString(),
          text: "VTU Vault Terminal v1.0 initialized\nType 'help' for available commands",
          isUser: false,
          timestamp: new Date(),
        },
      ])
      return ""
    }

    if (cmd === "about") {
      return `VTU Vault - Your Academic Companion
Version: 1.0.0
Built for: VTU students
Features: Notes, Papers, Labs, Calculator, Projects
Developer: VTU Vault Team
License: MIT`
    }

    if (cmd === "version") {
      return "VTU Vault Terminal v1.0.0\nBuilt with Next.js, React, and TypeScript"
    }

    if (cmd === "contact") {
      return `Contact Information:
Email: support@vtuvault.com
GitHub: github.com/vtuvault
Website: vtuvault.com
Support: Available 24/7`
    }

    if (cmd === "grades") {
      return `VTU Grading System:
O: 10 points (90-100 marks) - Outstanding
A+: 9 points (80-89 marks) - Excellent  
A: 8 points (70-79 marks) - Very Good
B+: 7 points (60-69 marks) - Good
B: 6 points (55-59 marks) - Above Average
C+: 5 points (50-54 marks) - Average
C: 4 points (45-49 marks) - Satisfactory
P: 4 points (40-44 marks) - Pass
F: 0 points (0-39 marks) - Fail

Use 'calc' command to calculate your SGPA/CGPA`
    }

    if (["notes", "papers", "labs", "calc", "projects", "syllabus", "results"].includes(cmd)) {
      const routes = {
        notes: "/notes",
        papers: "/question-papers",
        labs: "/lab-programs",
        calc: "/calculator",
        projects: "/projects",
        syllabus: "/syllabus",
        results: "/results",
      }
      setTimeout(() => {
        window.location.href = routes[cmd as keyof typeof routes]
      }, 1000)
      return `Opening ${cmd}... Redirecting to ${routes[cmd as keyof typeof routes]}`
    }

    // AI-powered responses for other queries
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: command }),
      })
      const data = await response.json()
      return data.response || "Command not recognized. Type 'help' for available commands."
    } catch (error) {
      return "Error: Unable to process command. Please try again.\nType 'help' for available commands."
    }
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
    setCommandHistory((prev) => [inputValue, ...prev.slice(0, 49)]) // Keep last 50 commands
    setHistoryIndex(-1)

    const command = inputValue
    setInputValue("")
    setIsLoading(true)

    const response = await processCommand(command)

    if (response) {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        isUser: false,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, botMessage])
    }

    setIsLoading(false)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      sendMessage()
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      if (historyIndex < commandHistory.length - 1) {
        const newIndex = historyIndex + 1
        setHistoryIndex(newIndex)
        setInputValue(commandHistory[newIndex])
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault()
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1
        setHistoryIndex(newIndex)
        setInputValue(commandHistory[newIndex])
      } else if (historyIndex === 0) {
        setHistoryIndex(-1)
        setInputValue("")
      }
    }
  }

  if (!isOpen) {
    return (
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="fixed bottom-6 right-6 z-40">
        <Button
          onClick={handleOpen}
          className="h-14 w-14 rounded-2xl bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 shadow-2xl font-mono"
          size="icon"
        >
          <Terminal className="h-6 w-6" />
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
        className={`fixed bottom-6 right-6 w-80 md:w-96 shadow-2xl z-50 transition-all duration-300 ${
          isMinimized ? "h-12 md:h-14" : "h-96 md:h-[500px]"
        }`}
      >
        <div className="bg-zinc-900 text-green-400 rounded-2xl overflow-hidden h-full flex flex-col font-mono text-sm border border-zinc-700">
          {/* Terminal Header */}
          <div className="flex items-center justify-between p-4 bg-zinc-800 border-b border-zinc-700">
            <div className="flex items-center space-x-2">
              <div className="flex space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <span className="text-zinc-300 text-xs ml-4">vtu-vault-terminal</span>
            </div>
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMinimized(!isMinimized)}
                className="h-6 w-6 text-zinc-400 hover:text-white hover:bg-zinc-700"
              >
                {isMinimized ? <Maximize2 className="h-3 w-3" /> : <Minimize2 className="h-3 w-3" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="h-6 w-6 text-zinc-400 hover:text-white hover:bg-zinc-700"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Terminal Content */}
              <div className="flex-1 p-4 overflow-y-auto">
                <div className="space-y-2">
                  {messages.map((message) => (
                    <div key={message.id}>
                      {message.isUser ? (
                        <div className="flex items-start space-x-2">
                          <span className="text-blue-400">$</span>
                          <span className="text-white">{message.text}</span>
                        </div>
                      ) : (
                        <div className="whitespace-pre-line text-green-400 pl-4">{message.text}</div>
                      )}
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex items-center space-x-2 pl-4">
                      <div className="flex space-x-1">
                        <div className="w-1 h-1 bg-green-400 rounded-full animate-bounce"></div>
                        <div
                          className="w-1 h-1 bg-green-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                          className="w-1 h-1 bg-green-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Terminal Input */}
              <div className="p-4 border-t border-zinc-700">
                <div className="flex items-center space-x-2">
                  <span className="text-blue-400">$</span>
                  <Input
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Type a command..."
                    className="flex-1 bg-transparent border-none text-white placeholder-zinc-500 focus:ring-0 focus:outline-none p-0"
                    disabled={isLoading}
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={isLoading || !inputValue.trim()}
                    size="icon"
                    className="h-6 w-6 bg-green-600 hover:bg-green-700 text-black"
                  >
                    <Send className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
