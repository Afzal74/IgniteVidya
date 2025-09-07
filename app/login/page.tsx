"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Brain, User, GraduationCap, Shield, Settings, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function LoginPage() {
  const [userType, setUserType] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const userTypes = [
    { value: "student", label: "Student", icon: User, description: "Access learning materials and track progress" },
    { value: "teacher", label: "Teacher", icon: GraduationCap, description: "Create quizzes and monitor student performance" },
    { value: "school-admin", label: "School Admin", icon: Shield, description: "Manage school accounts and oversee operations" },
    { value: "system-admin", label: "System Admin", icon: Settings, description: "Full system access and configuration" },
  ]

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    // Simulate login process
    setTimeout(() => {
      setIsLoading(false)
      // Redirect based on user type
      window.location.href = "/dashboard"
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-black dark:to-purple-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-20 h-20 rounded-2xl bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center">
              <img 
                src="/vtu-logo.png" 
                alt="VTU Logo" 
                className="w-16 h-16 object-contain"
                onError={(e) => {
                  // Fallback to icon if image fails to load
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
              />
              <Brain className="h-10 w-10 text-blue-600 dark:text-blue-400 hidden" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">IgniteVidya</h1>
          <p className="text-gray-600 dark:text-gray-400">Equal learning for all</p>
        </div>

        {/* Login Form */}
        <Card className="p-8 shadow-2xl border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <Label htmlFor="userType" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                I am a
              </Label>
              <Select value={userType} onValueChange={setUserType}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  {userTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-3">
                        <type.icon className="h-4 w-4" />
                        <div>
                          <div className="font-medium">{type.label}</div>
                          <div className="text-xs text-gray-500">{type.description}</div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2"
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2"
                placeholder="Enter your password"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium py-3 rounded-lg transition-all duration-200"
              disabled={isLoading || !userType}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Signing in...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  Sign In
                  <ArrowRight className="h-4 w-4" />
                </div>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Don't have an account?{" "}
              <Link href="/register" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
                Register here
              </Link>
            </p>
          </div>
        </Card>

        {/* Demo Credentials */}
        <Card className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
          <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-2">Demo Credentials</h3>
          <div className="text-xs text-yellow-700 dark:text-yellow-300 space-y-1">
            <div><strong>Student:</strong> student@ignitevidya.com / password123</div>
            <div><strong>Teacher:</strong> teacher@ignitevidya.com / password123</div>
            <div><strong>School Admin:</strong> admin@school.com / password123</div>
            <div><strong>System Admin:</strong> sysadmin@ignitevidya.com / password123</div>
          </div>
        </Card>
      </motion.div>
    </div>
  )
}
