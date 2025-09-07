"use client"

import type React from "react"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import Navigation from "@/components/navigation"
import TerminalChat from "@/components/terminal-chat"
import VTUCompanion from "@/components/afzal-chat"
import SplashScreen from "@/components/splash-screen"
import GuidedTour from "@/components/guided-tour"
import { useState, useEffect } from "react"

const inter = Inter({ subsets: ["latin"] })

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [showSplash, setShowSplash] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [isTerminalOpen, setIsTerminalOpen] = useState(false)
  const [isVTUCompanionOpen, setIsVTUCompanionOpen] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleTerminalOpen = () => {
    setIsVTUCompanionOpen(false)
    setIsTerminalOpen(true)
  }

  const handleVTUCompanionOpen = () => {
    setIsTerminalOpen(false)
    setIsVTUCompanionOpen(true)
  }

  if (!mounted) {
    return (
      <html lang="en" suppressHydrationWarning>
        <body className={inter.className}>
          <div className="min-h-screen bg-black" />
        </body>
      </html>
    )
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {showSplash ? (
            <SplashScreen onComplete={() => setShowSplash(false)} />
          ) : (
            <>
              <Navigation />
              <main>{children}</main>
              <TerminalChat isVTUCompanionOpen={isVTUCompanionOpen} onOpen={handleTerminalOpen} />
              <VTUCompanion isTerminalOpen={isTerminalOpen} onOpen={handleVTUCompanionOpen} />
              <Toaster />
              <GuidedTour />
            </>
          )}
        </ThemeProvider>
      </body>
    </html>
  )
}
