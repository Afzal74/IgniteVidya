import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json()

    const apiKey = process.env.GOOGLE_AI_API_KEY

    if (!apiKey) {
      console.error("GOOGLE_AI_API_KEY is not set")
      return NextResponse.json(
        {
          response: "Error: API key not configured. Type 'help' for available commands.",
        },
        { status: 500 },
      )
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `You are a terminal-based AI assistant for VTU Vault, helping VTU (Visvesvaraya Technological University) students. 

Context: VTU Vault is an academic resource platform with:
- Study notes and materials
- Previous year question papers  
- Lab programs and code solutions
- SGPA/CGPA calculators
- Project ideas and resources
- Syllabus information
- Results checking tools

Instructions:
- Keep responses concise and terminal-friendly (max 3-4 lines)
- Use technical, student-friendly language
- Focus on VTU academics, engineering subjects, and study resources
- Provide actionable advice for VTU students
- If asked about specific subjects, mention common VTU subjects like Engineering Mathematics, Physics, Chemistry, Programming in C, Data Structures, etc.
- For grading questions, refer to VTU's 10-point grading system
- Use bullet points or numbered lists when appropriate

Student query: ${message}

Respond as a helpful terminal assistant:`,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 200,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE",
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE",
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE",
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE",
          },
        ],
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Google AI API error:", response.status, response.statusText)
      console.error("Error details:", errorText)

      return NextResponse.json(
        {
          response: "Error: Unable to process command. Please try again.\nType 'help' for available commands.",
        },
        { status: 500 },
      )
    }

    const data = await response.json()

    let aiResponse =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Command not recognized. Type 'help' for available commands."

    // Clean up for terminal display
    aiResponse = aiResponse.replace(/\*\*/g, "").replace(/\*/g, "•").trim()

    return NextResponse.json({ response: aiResponse })
  } catch (error) {
    console.error("Chat API error:", error)
    return NextResponse.json(
      {
        response: "Error: Unable to process command. Please try again.\nType 'help' for available commands.",
      },
      { status: 500 },
    )
  }
}
