import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json()

    const companionPrompt = `You are the VTU Companion, a flirty and charming AI assistant for VTU students.

PERSONALITY & ROLE:
- You are flirty, playful, and charming while being helpful
- You have a crush on the student and show it subtly
- You're knowledgeable about VTU academics but keep it light and fun
- You use cute emojis and playful language

RESPONSE RULES:
- ALWAYS give EXACTLY 2 sentences maximum
- Be flirty and charming, like you have a crush on the student
- Use cute emojis like 😊, 😉, 💕, 🥰, 😍, 💖, etc.
- Keep it playful and fun, not too serious
- Still be helpful with VTU academic questions

Student query: "${message}"

Respond as the flirty VTU Companion in exactly 2 sentences with cute emojis! 💕`

    // Use the API key from environment variables
    const apiKey = process.env.GOOGLE_AI_API_KEY

    if (!apiKey) {
      console.error("GOOGLE_AI_API_KEY is not set")
      return NextResponse.json(
        {
          response: "I'm experiencing configuration issues. Please make sure the API key is properly set.",
        },
        { status: 500 },
      )
    }

    // Updated API endpoint - using the correct Gemini API URL
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`

    console.log("Making request to:", apiUrl.replace(apiKey, "***API_KEY***"))

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
                text: companionPrompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.8,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 100,
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

    console.log("API Response status:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Google AI API error:", response.status, response.statusText)
      console.error("Error details:", errorText)

      // Handle specific error cases
      if (response.status === 404) {
        return NextResponse.json(
          {
            response:
              "I'm having trouble connecting to my AI service. The API endpoint might be incorrect. Please contact support.",
          },
          { status: 500 },
        )
      } else if (response.status === 403) {
        return NextResponse.json(
          {
            response:
              "I'm having authentication issues. Please check if the API key is valid and has proper permissions.",
          },
          { status: 500 },
        )
      } else if (response.status === 429) {
        return NextResponse.json(
          {
            response: "I'm receiving too many requests right now. Please wait a moment and try again.",
          },
          { status: 429 },
        )
      }

      return NextResponse.json(
        {
          response: "I'm having trouble connecting to my knowledge base right now. Please try again in a moment!",
        },
        { status: 500 },
      )
    }

    const data = await response.json()
    console.log("API Response data:", JSON.stringify(data, null, 2))

    let aiResponse =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "I'm here to help with your VTU academics! Please feel free to ask me anything about your studies, courses, or university procedures."

    // Clean up the response
    aiResponse = aiResponse.trim()

    return NextResponse.json({ response: aiResponse })
  } catch (error) {
    console.error("VTU Companion API error:", error)
    return NextResponse.json(
      {
        response:
          "I'm experiencing some technical difficulties right now. Please try again in a moment, and I'll be happy to help with your VTU academic questions!",
      },
      { status: 500 },
    )
  }
}
