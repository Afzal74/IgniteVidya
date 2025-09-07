"use client"

import type React from "react"

import { useState } from "react"
import { Search, ExternalLink, Info, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"

export default function ResultsPage() {
  const [usn, setUsn] = useState("")
  const [isChecking, setIsChecking] = useState(false)

  const handleCheckResult = async () => {
    if (!usn.trim()) return

    setIsChecking(true)
    // Simulate API call
    setTimeout(() => {
      setIsChecking(false)
      // This would redirect to VTU results page or show results
      alert("This would redirect to the official VTU results page or display results here.")
    }, 2000)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleCheckResult()
    }
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">VTU Results</h1>
          <p className="text-muted-foreground">Check your VTU examination results</p>
        </div>

        {/* Result Checker */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Check Your Result
            </CardTitle>
            <CardDescription>Enter your University Seat Number (USN) to check results</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-4">
                <Input
                  placeholder="Enter your USN (e.g., 1XX21CS001)"
                  value={usn}
                  onChange={(e) => setUsn(e.target.value.toUpperCase())}
                  onKeyPress={handleKeyPress}
                  className="flex-1 font-mono"
                  maxLength={10}
                />
                <Button onClick={handleCheckResult} disabled={!usn.trim() || isChecking} className="min-w-32">
                  {isChecking ? "Checking..." : "Check Result"}
                </Button>
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Make sure to enter your complete USN including the year and branch code.
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>

        {/* Official VTU Results Links */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Official VTU Results</CardTitle>
            <CardDescription>Access official VTU results portal for the most up-to-date information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button variant="outline" className="h-auto p-4 justify-start bg-transparent" asChild>
                <Link href="https://results.vtu.ac.in" target="_blank">
                  <div className="text-left">
                    <div className="font-semibold flex items-center gap-2">
                      VTU Results Portal
                      <ExternalLink className="h-4 w-4" />
                    </div>
                    <div className="text-sm text-muted-foreground">Official results website</div>
                  </div>
                </Link>
              </Button>

              <Button variant="outline" className="h-auto p-4 justify-start bg-transparent" asChild>
                <Link href="https://vtu.ac.in" target="_blank">
                  <div className="text-left">
                    <div className="font-semibold flex items-center gap-2">
                      VTU Main Website
                      <ExternalLink className="h-4 w-4" />
                    </div>
                    <div className="text-sm text-muted-foreground">University homepage</div>
                  </div>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* How to Check Results Guide */}
        <Card>
          <CardHeader>
            <CardTitle>How to Check VTU Results</CardTitle>
            <CardDescription>Step-by-step guide to check your examination results</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Online Method</h4>
                  <ol className="space-y-2 text-sm">
                    <li className="flex gap-2">
                      <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs">
                        1
                      </span>
                      Visit the official VTU results portal
                    </li>
                    <li className="flex gap-2">
                      <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs">
                        2
                      </span>
                      Select your examination type
                    </li>
                    <li className="flex gap-2">
                      <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs">
                        3
                      </span>
                      Enter your USN correctly
                    </li>
                    <li className="flex gap-2">
                      <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs">
                        4
                      </span>
                      Click on "Get Result" button
                    </li>
                    <li className="flex gap-2">
                      <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs">
                        5
                      </span>
                      Download or print your result
                    </li>
                  </ol>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">SMS Method</h4>
                  <div className="space-y-2 text-sm">
                    <p>Send SMS in the following format:</p>
                    <div className="bg-muted p-3 rounded font-mono text-sm">VTU USN SEMESTER</div>
                    <p>
                      Example: <code className="bg-muted px-1 rounded">VTU 1XX21CS001 4</code>
                    </p>
                    <p>
                      Send to: <strong>56263</strong>
                    </p>
                  </div>
                </div>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Important:</strong> Results are typically published within 45-60 days after the examination.
                  Keep checking the official website for updates and announcements.
                </AlertDescription>
              </Alert>

              <div>
                <h4 className="font-semibold mb-3">Common Issues & Solutions</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex gap-2">
                    <span className="text-red-500">•</span>
                    <div>
                      <strong>Result not found:</strong> Check if you've entered the correct USN and if results are
                      published for your semester.
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-red-500">•</span>
                    <div>
                      <strong>Website not loading:</strong> Try refreshing the page or accessing during off-peak hours.
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-red-500">•</span>
                    <div>
                      <strong>Discrepancy in marks:</strong> Contact your college examination cell immediately.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Copyright Footer */}
        <footer className="py-3 md:py-6 px-2 md:px-4 border-t border-zinc-200 dark:border-zinc-800 mt-12">
          <div className="max-w-6xl mx-auto text-center">
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              © 2024 VTU Vault. Created by <span className="font-semibold text-black dark:text-white">Afzal</span>. All
              rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </div>
  )
}
