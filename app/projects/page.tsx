"use client"

import { useState, useEffect } from "react"
import { Search, ExternalLink, Github, Youtube, Facebook, Instagram, Tag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

interface Project {
  id: string
  title: string
  description: string
  domain: string
  github_url?: string
  source_url?: string
  tags: string[]
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [domainFilter, setDomainFilter] = useState("all")
  const { toast } = useToast()

  // Fetch projects from API
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch('/api/projects')
        const data = await response.json()
        if (data.success) {
          setProjects(data.projects)
          setFilteredProjects(data.projects)
        }
      } catch (error) {
        console.error('Error fetching projects:', error)
        toast({
          title: "Error",
          description: "Failed to load projects",
          variant: "destructive",
        })
      }
    }
    
    fetchProjects()
  }, [toast])

  const domains = [
    "Web Development",
    "Mobile Development",
    "Machine Learning",
    "IoT",
    "Blockchain",
    "Artificial Intelligence",
    "Data Analytics",
    "Computer Vision",
  ]

  useEffect(() => {
    let filtered = projects

    if (searchQuery) {
      filtered = filtered.filter(
        (project) =>
          project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          project.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())),
      )
    }

    if (domainFilter !== "all") {
      filtered = filtered.filter((project) => project.domain === domainFilter)
    }

    setFilteredProjects(filtered)
  }, [searchQuery, domainFilter, projects])

  const getDomainColor = (domain: string) => {
    const colors: Record<string, string> = {
      "Web Development": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      "Mobile Development": "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      "Machine Learning": "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
      IoT: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
      Blockchain: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      "Artificial Intelligence": "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    }
    return colors[domain] || "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
  }

  return (
    <div className="min-h-screen bg-background py-8 pt-20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Project Ideas</h1>
          <p className="text-muted-foreground">Explore innovative project concepts across various domains</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search projects, technologies, or domains..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={domainFilter} onValueChange={setDomainFilter}>
            <SelectTrigger className="w-full md:w-64">
              <SelectValue placeholder="All Domains" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Domains</SelectItem>
              {domains.map((domain) => (
                <SelectItem key={domain} value={domain}>
                  {domain}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <Card
              key={project.id}
              className="hover:shadow-lg transition-all duration-300 hover:scale-105 h-full flex flex-col"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg line-clamp-2">{project.title}</CardTitle>
                  <Badge className={getDomainColor(project.domain)}>{project.domain}</Badge>
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <CardDescription className="text-sm mb-4 flex-1">{project.description}</CardDescription>

                <div className="space-y-4">
                  {/* Tags */}
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    {project.github_url && (
                      <Button size="sm" variant="outline" className="flex-1 bg-transparent" asChild>
                        <Link href={project.github_url} target="_blank">
                          <Github className="h-4 w-4 mr-2" />
                          GitHub
                        </Link>
                      </Button>
                    )}
                    {project.source_url && (
                      <Button size="sm" variant="outline" className="flex-1 bg-transparent" asChild>
                        <Link href={project.source_url} target="_blank">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Demo
                        </Link>
                      </Button>
                    )}
                    {!project.github_url && !project.source_url && (
                      <Button size="sm" variant="outline" className="w-full bg-transparent" disabled>
                        Coming Soon
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredProjects.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No projects found matching your criteria.</p>
          </div>
        )}

        {/* Domain Statistics */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6">Projects by Domain</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {domains.map((domain) => {
              const count = projects.filter((p) => p.domain === domain).length
              return (
                <Card key={domain} className="text-center">
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-primary">{count}</div>
                    <div className="text-sm text-muted-foreground">{domain}</div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Social Media Section */}
        <div className="mt-16 py-8 border-t border-zinc-200 dark:border-zinc-800">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold mb-2">Connect with IgniteVidya</h2>
            <p className="text-muted-foreground">Follow us on social media for updates and more content</p>
          </div>
          <div className="flex justify-center gap-4">
            <Button variant="outline" size="sm" asChild>
              <Link href="https://www.youtube.com/@ignitevidya" target="_blank">
                <Youtube className="h-4 w-4 mr-2" />
                YouTube
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="https://www.facebook.com/ignitevidya" target="_blank">
                <Facebook className="h-4 w-4 mr-2" />
                Facebook
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="https://www.instagram.com/ignitevidya" target="_blank">
                <Instagram className="h-4 w-4 mr-2" />
                Instagram
              </Link>
            </Button>
          </div>
        </div>

        {/* Copyright Footer */}
        <footer className="py-3 md:py-6 px-2 md:px-4 border-t border-zinc-200 dark:border-zinc-800">
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
