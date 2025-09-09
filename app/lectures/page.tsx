"use client"

import { motion } from "framer-motion"
import { Play, Clock, BookOpen, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export default function LecturesPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-black pt-20 pb-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Play className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Video Lectures
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Interactive video lessons and tutorials for all STEM subjects
          </p>
        </motion.div>

        {/* Work in Progress Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-center"
        >
          <Card className="border-2 border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 p-8 md:p-12">
            <div className="max-w-md mx-auto">
              {/* Work in Progress Image */}
              <div className="mb-6">
                <img
                  src="/workinprogress.png"
                  alt="Work in Progress"
                  className="w-full h-auto max-w-xs mx-auto rounded-lg shadow-lg"
                  style={{
                    filter: 'drop-shadow(0 10px 20px rgba(0, 0, 0, 0.1))'
                  }}
                />
              </div>

              {/* Content */}
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Clock className="h-5 w-5 text-orange-500" />
                  <span className="text-orange-500 font-semibold text-sm uppercase tracking-wide">
                    Coming Soon
                  </span>
                </div>

                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                  Video Lectures Are Coming Soon!
                </h2>
                
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                  We're working hard to bring you high-quality video lectures covering all STEM subjects. 
                  Our team is preparing engaging content that will make learning interactive and fun.
                </p>

                <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                    What to Expect:
                  </h3>
                  <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 text-left">
                    <li>• Interactive video lessons for grades 6-12</li>
                    <li>• Step-by-step problem solving</li>
                    <li>• Visual demonstrations and experiments</li>
                    <li>• Downloadable resources and notes</li>
                  </ul>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link href="/">
                    <Button variant="outline" className="w-full sm:w-auto">
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back to Home
                    </Button>
                  </Link>
                  <Link href="/notes">
                    <Button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700">
                      <BookOpen className="h-4 w-4 mr-2" />
                      Explore Notes Instead
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-8 text-center"
        >
          <div className="bg-gradient-to-r from-purple-100 via-blue-100 to-green-100 dark:from-purple-900/20 dark:via-blue-900/20 dark:to-green-900/20 rounded-2xl p-6 border border-gray-200 dark:border-gray-800">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              Stay Updated
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Follow our progress and be the first to know when video lectures are available!
            </p>
            <div className="flex justify-center">
              <div className="bg-white dark:bg-gray-800 rounded-full px-4 py-2 shadow-sm border border-gray-200 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  🚀 Launch Expected: Q1 2025
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
