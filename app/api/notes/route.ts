import { type NextRequest, NextResponse } from "next/server"
import { getNotes, addNote, addComment } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const semester = searchParams.get("semester")
    const scheme = searchParams.get("scheme")
    const search = searchParams.get("search")

    let notes = getNotes()

    // Apply filters
    if (semester && semester !== "all") {
      notes = notes.filter((note) => note.semester.toString() === semester)
    }

    if (scheme && scheme !== "all") {
      notes = notes.filter((note) => note.scheme === scheme)
    }

    if (search) {
      notes = notes.filter(
        (note) =>
          note.subject_name.toLowerCase().includes(search.toLowerCase()) ||
          note.subject_code.toLowerCase().includes(search.toLowerCase()),
      )
    }

    // Sort by creation date (newest first)
    notes.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    return NextResponse.json({
      success: true,
      notes,
      total: notes.length,
      message: "Notes fetched successfully",
    })
  } catch (error) {
    console.error("Notes API error:", error)
    return NextResponse.json(
      {
        success: false,
        notes: [],
        total: 0,
        message: "Failed to fetch notes",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { subject_name, subject_code, scheme, semester, file_url, uploaded_by } = body

    // Validate required fields
    if (!subject_name || !subject_code || !scheme || !semester || !file_url || !uploaded_by) {
      return NextResponse.json(
        {
          success: false,
          message: "All fields are required",
        },
        { status: 400 },
      )
    }

    const newNote = addNote({
      subject_name,
      subject_code,
      scheme,
      semester: parseInt(semester),
      file_url,
      uploaded_by,
      comments: [],
    })

    return NextResponse.json({
      success: true,
      note: newNote,
      message: "Note added successfully",
    })
  } catch (error) {
    console.error("Add note API error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to add note",
      },
      { status: 500 },
    )
  }
} 