import { type NextRequest, NextResponse } from "next/server"
import { getLabPrograms, addLabProgram } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const semester = searchParams.get("semester")
    const search = searchParams.get("search")

    let programs = getLabPrograms()

    // Apply filters
    if (semester && semester !== "all") {
      programs = programs.filter((program) => program.semester.toString() === semester)
    }

    if (search) {
      programs = programs.filter(
        (program) =>
          program.lab_title.toLowerCase().includes(search.toLowerCase()) ||
          program.description.toLowerCase().includes(search.toLowerCase()),
      )
    }

    // Sort by semester and program number
    programs.sort((a, b) => {
      if (a.semester !== b.semester) {
        return a.semester - b.semester
      }
      return a.program_number - b.program_number
    })

    return NextResponse.json({
      success: true,
      programs,
      total: programs.length,
      message: "Lab programs fetched successfully",
    })
  } catch (error) {
    console.error("Lab programs API error:", error)
    return NextResponse.json(
      {
        success: false,
        programs: [],
        total: 0,
        message: "Failed to fetch lab programs",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { lab_title, program_number, description, code, expected_output, semester } = body

    // Validate required fields
    if (!lab_title || !program_number || !description || !code || !expected_output || !semester) {
      return NextResponse.json(
        {
          success: false,
          message: "All fields are required",
        },
        { status: 400 },
      )
    }

    const newProgram = addLabProgram({
      lab_title,
      program_number: parseInt(program_number),
      description,
      code,
      expected_output,
      semester: parseInt(semester),
    })

    return NextResponse.json({
      success: true,
      program: newProgram,
      message: "Lab program added successfully",
    })
  } catch (error) {
    console.error("Add lab program API error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to add lab program",
      },
      { status: 500 },
    )
  }
} 