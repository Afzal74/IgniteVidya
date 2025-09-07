import { type NextRequest, NextResponse } from "next/server"
import { getVTUPapers } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const semester = searchParams.get("semester")
    const branch = searchParams.get("branch")
    const year = searchParams.get("year")
    const month = searchParams.get("month")
    const search = searchParams.get("search")

    let filteredPapers = getVTUPapers()

    // Apply filters
    if (semester && semester !== "all") {
      filteredPapers = filteredPapers.filter((paper) => paper.semester.toString() === semester)
    }

    if (branch && branch !== "all") {
      filteredPapers = filteredPapers.filter((paper) => paper.branch === branch || paper.branch === "All Branches")
    }

    if (year && year !== "all") {
      filteredPapers = filteredPapers.filter((paper) => paper.year.toString() === year)
    }

    if (month && month !== "all") {
      filteredPapers = filteredPapers.filter((paper) => paper.month === month)
    }

    if (search) {
      filteredPapers = filteredPapers.filter(
        (paper) =>
          paper.subject_name.toLowerCase().includes(search.toLowerCase()) ||
          paper.subject_code.toLowerCase().includes(search.toLowerCase()),
      )
    }

    // Sort by exam date (newest first)
    filteredPapers.sort((a, b) => new Date(b.exam_date).getTime() - new Date(a.exam_date).getTime())

    return NextResponse.json({
      success: true,
      papers: filteredPapers,
      total: filteredPapers.length,
      message: "VTU question papers fetched successfully",
    })
  } catch (error) {
    console.error("VTU Papers API error:", error)
    return NextResponse.json(
      {
        success: false,
        papers: [],
        total: 0,
        message: "Failed to fetch VTU question papers",
      },
      { status: 500 },
    )
  }
}
