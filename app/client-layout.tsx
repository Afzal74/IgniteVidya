"use client"

import type React from "react"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import Navigation from "@/components/navigation"
import TerminalChat from "@/components/terminal-chat"
import IgniteVidyaCompanion from "@/components/afzal-chat"
import SplashScreen from "@/components/splash-screen"
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
  const [isIgniteVidyaCompanionOpen, setIsIgniteVidyaCompanionOpen] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleTerminalOpen = () => {
    setIsIgniteVidyaCompanionOpen(false)
    setIsTerminalOpen(true)
  }

  const handleIgniteVidyaCompanionOpen = () => {
    setIsTerminalOpen(false)
    setIsIgniteVidyaCompanionOpen(true)
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
              <TerminalChat isIgniteVidyaCompanionOpen={isIgniteVidyaCompanionOpen} onOpen={handleTerminalOpen} />
              <IgniteVidyaCompanion isTerminalOpen={isTerminalOpen} onOpen={handleIgniteVidyaCompanionOpen} />
              <Toaster />
            </>
          )}
        </ThemeProvider>
      </body>
    </html>
  )
}
