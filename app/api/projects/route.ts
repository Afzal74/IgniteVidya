import { type NextRequest, NextResponse } from "next/server"
import { getProjects, addProject } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const domain = searchParams.get("domain")
    const search = searchParams.get("search")

    let projects = getProjects()

    // Apply filters
    if (domain && domain !== "all") {
      projects = projects.filter((project) => project.domain === domain)
    }

    if (search) {
      projects = projects.filter(
        (project) =>
          project.title.toLowerCase().includes(search.toLowerCase()) ||
          project.description.toLowerCase().includes(search.toLowerCase()) ||
          project.tags.some((tag) => tag.toLowerCase().includes(search.toLowerCase())),
      )
    }

    // Sort by creation date (newest first)
    projects.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    return NextResponse.json({
      success: true,
      projects,
      total: projects.length,
      message: "Projects fetched successfully",
    })
  } catch (error) {
    console.error("Projects API error:", error)
    return NextResponse.json(
      {
        success: false,
        projects: [],
        total: 0,
        message: "Failed to fetch projects",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, description, domain, github_url, source_url, tags, difficulty } = body

    // Validate required fields
    if (!title || !description || !domain || !github_url || !tags) {
      return NextResponse.json(
        {
          success: false,
          message: "Title, description, domain, github_url, and tags are required",
        },
        { status: 400 },
      )
    }

    const newProject = addProject({
      title,
      description,
      domain,
      github_url,
      source_url,
      tags: Array.isArray(tags) ? tags : [tags],
      difficulty,
    })

    return NextResponse.json({
      success: true,
      project: newProject,
      message: "Project added successfully",
    })
  } catch (error) {
    console.error("Add project API error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to add project",
      },
      { status: 500 },
    )
  }
} 