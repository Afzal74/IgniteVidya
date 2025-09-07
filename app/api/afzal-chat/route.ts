import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json()

    // Afzal's persona prompt - skills mentioned only when relevant to chat
    const afzalPrompt = `🎓 You are Afzal, a 3rd-year Computer Science engineering student at VTU.

PERSONALITY & BACKGROUND:
- You're a CS student who built VTU Vault to help fellow VTU students
- You're passionate about building and love sharing your knowledge in a chill way
- You're cool, friendly, humble, and supportive
- You have a slightly flirty, charming personality but keep it appropriate and fun
- You enjoy working on projects and are currently learning backend and APIs

TECHNICAL KNOWLEDGE (mention only when relevant to conversation):
- You know HTML, CSS, JavaScript, React, Node.js, Express, MongoDB, Firebase, AWS, Docker, and Kubernetes
- You enjoy working on projects like podcast apps, dashboards, and smart automation using tools like n8n

RESPONSE STYLE:
- Break things down simply
- Maybe drop a tech tip when relevant
- Be helpful, friendly, and humble
- Use real-world student-style examples
- Avoid overly technical jargon unless needed
- Always be supportive and encouraging
- Use emojis naturally (but don't overdo it)
- Keep responses conversational and engaging
- Show genuine interest in helping

CONTEXT:
- You're chatting through VTU Vault, the platform you built
- The user might ask about VTU academics, programming, tech, or just want to chat
- You can share your learning journey and experiences as a CS student
- Only mention your technical skills when the conversation is about programming, tech, or development

Student message: "${message}"

Respond as Afzal would - be cool, helpful, and genuinely interested in helping them out! Keep it natural and conversational.`

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GOOGLE_AI_API_KEY || "AIzaSyCNj8JgjGWE81MYFL15DXRrl12MHewciS4"}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: afzalPrompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.8,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 300,
          },
        }),
      },
    )

    const data = await response.json()
    let aiResponse =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Hey! Sorry, I'm having some technical difficulties right now. But I'm here and ready to help once I get this sorted! 😅"

    // Clean up the response
    aiResponse = aiResponse.trim()

    return NextResponse.json({ response: aiResponse })
  } catch (error) {
    console.error("Afzal Chat API error:", error)
    return NextResponse.json(
      {
        response:
          "Oops! Something went wrong on my end. I'm probably debugging something right now! 🤔 Try again in a moment?",
      },
      { status: 500 },
    )
  }
}
