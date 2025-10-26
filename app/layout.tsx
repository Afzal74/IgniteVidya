import type React from "react"
import type { Metadata } from "next"
import { Inter, Press_Start_2P } from "next/font/google"
import "./globals.css"
import ClientLayout from "./client-layout"

const inter = Inter({ subsets: ["latin"] })
const pressStart2P = Press_Start_2P({ 
  weight: '400',
  subsets: ["latin"],
  variable: '--font-press-start'
})

export const metadata: Metadata = {
  title: "IgniteVidya - STEM Learning Platform",
  description: "Equal learning for all. Interactive STEM education for grades 6-12 with gamification, AI tutoring, and personalized learning paths.",
  generator: 'IgniteVidya',
  keywords: ['STEM', 'Education', 'Learning', 'Science', 'Technology', 'Engineering', 'Mathematics', 'Students', 'Grades 6-12'],
  authors: [{ name: 'IgniteVidya Team' }],
  openGraph: {
    title: 'IgniteVidya - STEM Learning Platform',
    description: 'Equal learning for all. Interactive STEM education for grades 6-12.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} ${pressStart2P.variable}`} suppressHydrationWarning>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  )
}
